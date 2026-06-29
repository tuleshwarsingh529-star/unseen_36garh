import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreatorsFeedService } from './creators-feed.service';

@ApiTags('Creators Feed')
@Controller('api/v1/creators-feed')
export class CreatorsFeedController {
  constructor(private readonly feedService: CreatorsFeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get global real-time creators feed from YouTube and Instagram' })
  async getGlobalFeed() {
    return this.feedService.getGlobalFeed();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Trigger real-time synchronization with YouTube and Instagram APIs' })
  async syncFeed() {
    return this.feedService.syncFeed();
  }

  @Get(':creatorId')
  @ApiOperation({ summary: 'Get real-time feed for a specific creator' })
  @ApiParam({ name: 'creatorId', type: String })
  async getCreatorFeed(@Param('creatorId') creatorId: string) {
    return this.feedService.getCreatorFeed(creatorId);
  }
}
