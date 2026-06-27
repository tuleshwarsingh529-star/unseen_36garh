import { Module } from '@nestjs/common';
import { CreatorsFeedService } from './creators-feed.service';
import { CreatorsFeedController } from './creators-feed.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CreatorsFeedController],
  providers: [CreatorsFeedService, PrismaService],
})
export class CreatorsFeedModule {}
