import { Module } from '@nestjs/common';
import { SyncMonitorService } from './sync-monitor.service';
import { SyncMonitorController } from './sync-monitor.controller';
import { PrismaService } from '../../database/prisma.service';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [SyncMonitorController],
  providers: [SyncMonitorService, PrismaService],
  exports: [SyncMonitorService],
})
export class SyncMonitorModule {}
