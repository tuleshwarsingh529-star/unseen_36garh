import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformMetrics() {
    const storiesCount = await this.prisma.creatorStory.count();
    const placesCount = await this.prisma.place.count();
    const verifiedCreators = await this.prisma.creatorProfile.count({
      where: { isVerified: true },
    });

    return {
      storiesCount,
      placesCount,
      verifiedCreators,
      storageUsed: '12.4 GB', // Simulated aggregate storage usage size
      uploadStats: {
        images: 184,
        videos: 42,
        documents: 11,
      },
    };
  }

  async getDistrictPerformance() {
    const districts = await this.prisma.district.findMany({
      select: {
        id: true,
        name: true,
        places: { select: { id: true } },
      },
    });

    return districts.map(d => ({
      districtId: d.id,
      name: d.name,
      totalDestinations: d.places.length,
      views: Math.floor(Math.random() * 5000) + 500,
    }));
  }
}
