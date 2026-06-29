import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocketModule } from '../socket/socket.module';

import { PermissionService } from './permission.service';
import { AuditService } from './audit.service';
import { AIService } from './ai.service';
import { NotificationService } from './notification.service';
import { AnalyticsService } from './analytics.service';
import { WorkflowService } from './workflow.service';
import { SearchService } from './search.service';
import { MediaService } from './media.service';
import { SyncService } from './sync.service';

@Module({
  imports: [SocketModule],
  providers: [
    PrismaService,
    PermissionService,
    AuditService,
    AIService,
    NotificationService,
    AnalyticsService,
    WorkflowService,
    SearchService,
    MediaService,
    SyncService,
  ],
  exports: [
    PermissionService,
    AuditService,
    AIService,
    NotificationService,
    AnalyticsService,
    WorkflowService,
    SearchService,
    MediaService,
    SyncService,
  ],
})
export class CoreServicesModule {}
