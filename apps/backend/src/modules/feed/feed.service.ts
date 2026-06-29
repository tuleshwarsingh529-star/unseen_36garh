import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalFeed(categoryId?: string, districtId?: string, search?: string) {
    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (districtId) {
      whereClause.districtId = districtId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return this.prisma.creatorStory.findMany({
      where: whereClause,
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        district: true,
        category: true,
        media: true,
        storyComments: true,
        storyLikes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrendingFeed() {
    return this.prisma.creatorStory.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        district: true,
        category: true,
        media: true,
      },
      orderBy: { likes: 'desc' },
      take: 10,
    });
  }

  async getLatestFeed() {
    return this.prisma.creatorStory.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        district: true,
        category: true,
        media: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getNearbyFeed(lat: number, lng: number, maxDistanceKm: number = 50) {
    // 1. Fetch stories that have places/coords linked
    const stories = await this.prisma.creatorStory.findMany({
      where: {
        status: 'PUBLISHED',
        placeId: { not: null },
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        place: true,
        district: true,
        category: true,
        media: true,
      },
    });

    // 2. Simple Haversine calculation to filter/sort close stories
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return stories
      .map((story) => {
        const distance = story.place
          ? calculateDistance(lat, lng, story.place.latitude, story.place.longitude)
          : 9999;
        return { ...story, distance };
      })
      .filter((story) => story.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);
  }

  async getFollowingFeed(userId: string) {
    // 1. Get list of followed creator IDs
    const follows = await this.prisma.follower.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });

    const followedIds = follows.map((f) => f.followedId);

    // 2. Get stories from those creators
    return this.prisma.creatorStory.findMany({
      where: {
        status: 'PUBLISHED',
        creatorId: { in: followedIds },
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        district: true,
        category: true,
        media: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
