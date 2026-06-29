import { Controller, Get, Query, ParseFloatPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Public Feed')
@Controller('api/v1/feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get global published creator stories feed' })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'districtId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async getGlobalFeed(
    @Query('categoryId') categoryId?: string,
    @Query('districtId') districtId?: string,
    @Query('search') search?: string,
  ) {
    return this.feedService.getGlobalFeed(categoryId, districtId, search);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending published creator stories feed (by likes)' })
  async getTrendingFeed() {
    return this.feedService.getTrendingFeed();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest published creator stories' })
  async getLatestFeed() {
    return this.feedService.getLatestFeed();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby stories based on lat/lng coordinates' })
  @ApiQuery({ name: 'latitude', type: Number, required: true })
  @ApiQuery({ name: 'longitude', type: Number, required: true })
  @ApiQuery({ name: 'maxDistanceKm', type: Number, required: false })
  async getNearbyFeed(
    @Query('latitude', ParseFloatPipe) lat: number,
    @Query('longitude', ParseFloatPipe) lng: number,
    @Query('maxDistanceKm') maxDistanceKm?: number,
  ) {
    return this.feedService.getNearbyFeed(lat, lng, maxDistanceKm ? Number(maxDistanceKm) : undefined);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stories from creators the authenticated user follows' })
  async getFollowingFeed(@Req() req: any) {
    return this.feedService.getFollowingFeed(req.user.id);
  }
}
