import { Controller, Get, Post, Put, Query, Body, Param, UseGuards } from '@nestjs/common';
import { MediaLibraryService } from './media-library.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/media-library')
export class MediaLibraryController {
  constructor(private readonly mediaService: MediaLibraryService) {}

  @Get('suggestions')
  async getSuggestions(@Query('placeId') placeId: string) {
    return this.mediaService.getSuggestions(placeId);
  }

  @Get('auto-draft')
  async getAutoDraft(@Query('placeId') placeId: string) {
    return this.mediaService.generateAutoDraft(placeId);
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async triggerReindex() {
    return this.mediaService.indexLocalFolders();
  }

  @Get('settings')
  async getSettings() {
    return this.mediaService.getSettings();
  }

  @Put('settings/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.mediaService.updateSetting(key, value);
  }
}
