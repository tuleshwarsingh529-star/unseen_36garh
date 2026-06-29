import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from './audit.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async submitForReview(storyId: string) {
    const story = await this.prisma.creatorStory.update({
      where: { id: storyId },
      data: { status: 'PENDING' },
    });

    await this.audit.logAction('WORKFLOW_STATE_SUBMITTED', 'CreatorStory', {
      storyId,
      newState: 'PENDING',
    });

    return story;
  }

  async approveContent(storyId: string) {
    const story = await this.prisma.creatorStory.update({
      where: { id: storyId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    await this.audit.logAction('WORKFLOW_STATE_APPROVED', 'CreatorStory', {
      storyId,
      newState: 'PUBLISHED',
    });

    return story;
  }

  async rejectContent(storyId: string) {
    const story = await this.prisma.creatorStory.update({
      where: { id: storyId },
      data: { status: 'REJECTED' },
    });

    await this.audit.logAction('WORKFLOW_STATE_REJECTED', 'CreatorStory', {
      storyId,
      newState: 'REJECTED',
    });

    return story;
  }
}
