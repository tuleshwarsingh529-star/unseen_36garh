import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { SyncMonitorService } from './sync-monitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/sync-monitor')
export class SyncMonitorController {
  constructor(private readonly syncService: SyncMonitorService) {}

  @Get('health')
  async getHealthStatus() {
    return this.syncService.getHealthStatus();
  }

  @Get('events')
  async getEvents() {
    return this.syncService.getSyncEvents();
  }

  @Post('verify')
  async triggerVerify(@Body('type') type: string) {
    return this.syncService.triggerTargetedVerify(type);
  }

  @Post('rebuild')
  async triggerRebuild(@Body('type') type: string) {
    if (type === 'feed') {
      return this.syncService.rebuildFeed();
    } else if (type === 'search') {
      return this.syncService.rebuildSearchIndex();
    }
    return { success: false, message: 'Invalid index rebuild parameter.' };
  }
}
