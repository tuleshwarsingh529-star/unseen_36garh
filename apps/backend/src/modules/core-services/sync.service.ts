import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
    private readonly notification: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async publishEvent(eventType: string, entityId: string, payload: any) {
    // 1. Log event locally in database activity log
    await this.audit.logAction(`DOMAIN_EVENT_${eventType.toUpperCase()}`, 'System', {
      entityId,
      payload,
    });

    // 2. Broadcast via WebSocket Gateway
    this.socketGateway.broadcast(`sync.${eventType}`, {
      entityId,
      payload,
      timestamp: new Date(),
    });

    // 3. Trigger notification flow for key events
    if (eventType === 'story.published') {
      await this.notification.sendSystemAlert(
        'New Destination Story Published!',
        `A verified guide story has been synchronized across all visitor feeds.`,
      );
    }
  }
}
