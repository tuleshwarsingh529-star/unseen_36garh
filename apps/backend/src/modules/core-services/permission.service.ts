import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserRole(userId: string, allowedRoles: string[]): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied. Insufficient administrative privileges.');
    }
    return true;
  }

  async checkStoryOwnership(storyId: string, userId: string): Promise<boolean> {
    const story = await this.prisma.creatorStory.findUnique({
      where: { id: storyId },
      select: { creator: { select: { userId: true } } },
    });

    if (!story) return false;
    return story.creator.userId === userId;
  }
}
