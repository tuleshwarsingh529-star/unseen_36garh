import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { PrismaService } from '../../database/prisma.service';
import { SocketModule } from '../socket/socket.module';
import { SyncMonitorModule } from '../sync-monitor/sync-monitor.module';

@Module({
  imports: [SocketModule, SyncMonitorModule],
  controllers: [StoriesController],
  providers: [StoriesService, PrismaService],
  exports: [StoriesService],
})
export class StoriesModule {}
