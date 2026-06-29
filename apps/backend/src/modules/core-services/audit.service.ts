import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(action: string, entityType: string, meta: any) {
    return this.prisma.activityLog.create({
      data: {
        action,
        entityType,
        meta: JSON.stringify(meta),
      },
    });
  }

  async getLogs(take: number = 20) {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
