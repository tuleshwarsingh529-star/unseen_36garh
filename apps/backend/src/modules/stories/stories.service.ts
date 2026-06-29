import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { SocketGateway } from '../socket/socket.gateway';
import { SyncMonitorService } from '../sync-monitor/sync-monitor.service';

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
    private readonly syncMonitor: SyncMonitorService,
  ) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 10000);
  }

  async create(dto: CreateStoryDto, userId: string) {
    // 1. Fetch CreatorProfile for this authenticated user
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new BadRequestException('Authenticated user does not possess a registered Creator Profile.');
    }

    const storySlug = this.slugify(dto.title);

    // 2. Create the story
    const story = await this.prisma.creatorStory.create({
      data: {
        title: dto.title,
        slug: storySlug,
        description: dto.description,
        creatorId: profile.id,
        placeId: dto.placeId || null,
        districtId: dto.districtId || null,
        categoryId: dto.categoryId || null,
        language: dto.language || 'en',
        coverImage: dto.coverImage || null,
        videoUrl: dto.videoUrl || null,
        visibility: dto.visibility || 'PUBLIC',
        storyType: dto.videoUrl ? 'video' : (dto.media && dto.media.length > 1 ? 'gallery' : 'image'),
        status: 'PENDING', // All new stories default to PENDING for admin review
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
      },
    });

    // 3. Add media items if provided
    if (dto.media && dto.media.length > 0) {
      await this.prisma.storyMedia.createMany({
        data: dto.media.map((item, index) => ({
          storyId: story.id,
          mediaType: item.type,
          filePath: item.url,
          thumbnail: item.thumbnailUrl || null,
          displayOrder: index,
        })),
      });
    }

    // 4. Initialize location if coords provided
    if (story.placeId) {
      const place = await this.prisma.place.findUnique({ where: { id: story.placeId } });
      if (place) {
        await this.prisma.storyLocation.create({
          data: {
            storyId: story.id,
            latitude: place.latitude,
            longitude: place.longitude,
            nearestPlace: place.name,
          },
        });
      }
    }

    // 5. Initialize statistics
    await this.prisma.storyStatistics.create({
      data: {
        storyId: story.id,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      },
    });

    const fullStory = await this.findOne(story.id);

    // 6. Trigger Sync Monitor Verification Pipeline Audit
    await this.syncMonitor.auditSyncEvent(story.id, 'story.created');

    // 7. Broadcast real-time WebSocket event
    this.socketGateway.broadcast('story.created', fullStory);

    return fullStory;
  }

  async findAll(status?: string) {
    return this.prisma.creatorStory.findMany({
      where: status ? { status } : {},
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
        locations: true,
        statistics: true,
        storyComments: {
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const story = await this.prisma.creatorStory.findUnique({
      where: { id },
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
        locations: true,
        statistics: true,
        storyComments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found.`);
    }

    return story;
  }

  async update(id: string, dto: Partial<CreateStoryDto>) {
    const story = await this.prisma.creatorStory.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found.`);
    }

    const updatedStory = await this.prisma.creatorStory.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
        placeId: dto.placeId !== undefined ? dto.placeId : undefined,
        districtId: dto.districtId !== undefined ? dto.districtId : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        language: dto.language !== undefined ? dto.language : undefined,
        coverImage: dto.coverImage !== undefined ? dto.coverImage : undefined,
        videoUrl: dto.videoUrl !== undefined ? dto.videoUrl : undefined,
        visibility: dto.visibility !== undefined ? dto.visibility : undefined,
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
    });

    this.socketGateway.broadcast('story.updated', updatedStory);
    return updatedStory;
  }

  async remove(id: string) {
    const story = await this.prisma.creatorStory.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found.`);
    }

    await this.prisma.creatorStory.delete({ where: { id } });
    this.socketGateway.broadcast('story.deleted', { id });
    return { success: true, message: 'Story deleted successfully.' };
  }

  async approve(id: string) {
    const story = await this.prisma.creatorStory.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found.`);
    }

    const approvedStory = await this.prisma.creatorStory.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
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
    });

    // Trigger Sync Monitor verification pipeline audit
    await this.syncMonitor.auditSyncEvent(approvedStory.id, 'story.approved');

    this.socketGateway.broadcast('story.approved', approvedStory);
    return approvedStory;
  }

  async reject(id: string) {
    const story = await this.prisma.creatorStory.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found.`);
    }

    const rejectedStory = await this.prisma.creatorStory.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    this.socketGateway.broadcast('story.rejected', { id, status: 'REJECTED' });
    return rejectedStory;
  }

  async toggleLike(storyId: string, userId: string) {
    const story = await this.prisma.creatorStory.findUnique({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found.`);
    }

    const existingLike = await this.prisma.storyLike.findUnique({
      where: {
        storyId_userId: { storyId, userId },
      },
    });

    let liked = false;
    if (existingLike) {
      await this.prisma.storyLike.delete({
        where: {
          storyId_userId: { storyId, userId },
        },
      });
      await this.prisma.creatorStory.update({
        where: { id: storyId },
        data: { likes: { decrement: 1 } },
      });
      await this.prisma.storyStatistics.update({
        where: { storyId },
        data: { likes: { decrement: 1 } },
      });
      liked = false;
    } else {
      await this.prisma.storyLike.create({
        data: { storyId, userId },
      });
      await this.prisma.creatorStory.update({
        where: { id: storyId },
        data: { likes: { increment: 1 } },
      });
      await this.prisma.storyStatistics.update({
        where: { storyId },
        data: { likes: { increment: 1 } },
      });
      liked = true;
    }

    const updatedStory = await this.prisma.creatorStory.findUnique({
      where: { id: storyId },
      select: { id: true, likes: true },
    });

    this.socketGateway.broadcast('story.liked', {
      storyId,
      liked,
      likesCount: updatedStory.likes,
    });

    return { liked, likesCount: updatedStory.likes };
  }

  async incrementViews(id: string) {
    const story = await this.prisma.creatorStory.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { id: true, views: true },
    });

    await this.prisma.storyStatistics.update({
      where: { storyId: id },
      data: { views: { increment: 1 }, lastViewed: new Date() },
    });

    this.socketGateway.broadcast('story.viewed', {
      storyId: id,
      viewsCount: story.views,
    });

    return story;
  }

  async addComment(storyId: string, userId: string, content: string) {
    const comment = await this.prisma.storyComment.create({
      data: {
        storyId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    await this.prisma.creatorStory.update({
      where: { id: storyId },
      data: { comments: { increment: 1 } },
    });

    await this.prisma.storyStatistics.update({
      where: { storyId },
      data: { comments: { increment: 1 } },
    });

    this.socketGateway.broadcast('story.commented', {
      storyId,
      comment,
    });

    return comment;
  }
}
