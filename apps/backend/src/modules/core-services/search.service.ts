import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchPlaces(query: string, filters: any = {}) {
    const whereClause: any = {
      OR: [
        { name: { contains: query } },
        { shortDescription: { contains: query } },
        { fullDescription: { contains: query } },
      ],
    };

    if (filters.districtId) {
      whereClause.districtId = filters.districtId;
    }
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    return this.prisma.place.findMany({
      where: whereClause,
      include: {
        district: true,
        category: true,
      },
    });
  }

  async autocomplete(query: string) {
    const results = await this.prisma.place.findMany({
      where: {
        name: { contains: query },
      },
      select: {
        id: true,
        name: true,
        district: { select: { name: true } },
      },
      take: 6,
    });

    return results.map(r => ({
      id: r.id,
      text: `${r.name} (${r.district?.name || 'Bastar'})`,
    }));
  }
}
