import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Creator Stories')
@Controller('api/v1/stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CREATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new story' })
  async create(
    @Body(new ValidationPipe()) dto: CreateStoryDto,
    @Req() req: any,
  ) {
    return this.storiesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stories' })
  async findAll() {
    return this.storiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single story by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.storiesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing story' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: Partial<CreateStoryDto>,
  ) {
    return this.storiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a story' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    return this.storiesService.remove(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending story' })
  @ApiParam({ name: 'id', type: String })
  async approve(@Param('id') id: string) {
    return this.storiesService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a pending story' })
  @ApiParam({ name: 'id', type: String })
  async reject(@Param('id') id: string) {
    return this.storiesService.reject(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like state on a story' })
  @ApiParam({ name: 'id', type: String })
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.storiesService.toggleLike(id, req.user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment view counter on a story' })
  @ApiParam({ name: 'id', type: String })
  async incrementViews(@Param('id') id: string) {
    return this.storiesService.incrementViews(id);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a comment on a story' })
  @ApiParam({ name: 'id', type: String })
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    return this.storiesService.addComment(id, req.user.id, content);
  }
}
