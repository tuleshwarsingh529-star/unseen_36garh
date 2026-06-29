import { Module } from '@nestjs/common';
import { MediaLibraryService } from './media-library.service';
import { MediaLibraryController } from './media-library.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [MediaLibraryController],
  providers: [MediaLibraryService, PrismaService],
  exports: [MediaLibraryService],
})
export class MediaLibraryModule {}
