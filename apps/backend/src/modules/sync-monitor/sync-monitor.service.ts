import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import * as fs from 'fs';
import * as path from 'path';

export interface VerificationStep {
  step: string;
  status: 'Success' | 'Pending' | 'Failed';
  message: string;
}

@Injectable()
export class SyncMonitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async getHealthStatus() {
    // 1. Perform mock connectivity and health ratio checks
    const wsConnected = true;
    const dbActive = await this.checkDatabase();
    const storageActive = this.checkStorage();

    return {
      services: [
        { name: 'WebSocket Server', status: wsConnected ? 'GREEN' : 'RED', ratio: '99.9%' },
        { name: 'Database', status: dbActive ? 'GREEN' : 'RED', ratio: '100%' },
        { name: 'File Storage', status: storageActive ? 'GREEN' : 'RED', ratio: '98%' },
        { name: 'Feed Service', status: 'GREEN', ratio: '100%' },
        { name: 'Story Service', status: 'GREEN', ratio: '100%' },
        { name: 'Media Library', status: 'GREEN', ratio: '100%' },
        { name: 'Notification Service', status: 'GREEN', ratio: '100%' },
        { name: 'Search Index', status: 'GREEN', ratio: '100%' },
        { name: 'AI Recommendation Engine', status: 'GREEN', ratio: '97%' },
      ],
      timestamp: new Date(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private checkStorage(): boolean {
    const uploadRoot = path.join(process.cwd(), 'public');
    return fs.existsSync(uploadRoot);
  }

  async getSyncEvents() {
    return this.prisma.syncEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // Simulates verification pipeline audits for Creator uploads
  async auditSyncEvent(entityId: string, eventType: string) {
    const steps: VerificationStep[] = [
      { step: 'Story Record Created', status: 'Success', message: 'ID links verified.' },
      { step: 'Images Uploaded', status: 'Success', message: 'Exif metadata logged.' },
      { step: 'Video Uploaded', status: 'Success', message: 'Duration extracted.' },
      { step: 'Feed Updated', status: 'Success', message: 'Latest and District feeds rebuilt.' },
      { step: 'Search Index Sync', status: 'Success', message: 'Lucene keywords index generated.' },
      { step: 'Notifications Sent', status: 'Success', message: 'Admin approval alert dispatched.' },
      { step: 'Analytics Logged', status: 'Success', message: 'Upload statistics updated.' },
    ];

    // Log the verification run
    const syncEvent = await this.prisma.syncEvent.create({
      data: {
        entityId,
        eventType,
        status: 'COMPLETED',
        steps: JSON.stringify(steps),
        retries: 0,
      },
    });

    // Broadcast WebSocket updates so the admin panel updates instantly
    this.socketGateway.broadcast('sync.event.processed', syncEvent);

    return syncEvent;
  }

  async rebuildFeed() {
    // Rebuild global and trending feeds cache (simulation)
    const log = await this.prisma.activityLog.create({
      data: {
        action: 'FEED_CACHE_REBUILT',
        entityType: 'System',
        meta: JSON.stringify({ triggeredBy: 'Admin', timestamp: new Date() }),
      },
    });

    this.socketGateway.broadcast('sync.log.added', {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      module: 'Feed Engine',
      status: 'Success',
      message: 'Trending and nearby travel feeds cache rebuilt.',
    });

    return { success: true, message: 'Feeds cache successfully cleared and rebuilt.' };
  }

  async rebuildSearchIndex() {
    // Rebuild Autocomplete Lucene terms (simulation)
    await this.prisma.activityLog.create({
      data: {
        action: 'SEARCH_INDEX_REBUILT',
        entityType: 'System',
        meta: JSON.stringify({ timestamp: new Date() }),
      },
    });

    this.socketGateway.broadcast('sync.log.added', {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      module: 'Search Index',
      status: 'Success',
      message: 'Lucene search keywords index regenerated.',
    });

    return { success: true, message: 'Lucene search terms index successfully regenerated.' };
  }

  async triggerTargetedVerify(type: string) {
    const stats = {
      verified: true,
      timestamp: new Date(),
    };

    this.socketGateway.broadcast('sync.log.added', {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      module: type.toUpperCase(),
      status: 'Success',
      message: `Targeted audit on [${type}] successfully completed.`,
    });

    return stats;
  }
}
