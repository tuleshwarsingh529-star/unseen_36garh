import { Controller, Get, Post, Body, Param, Query, ParseFloatPipe, DefaultValuePipe, ValidationPipe, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CREATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new tourism destination (Contributor Upload)' })
  @ApiBody({ type: CreatePlaceDto, description: 'Required place parameters' })
  async create(
    @Body(new ValidationPipe()) dto: CreatePlaceDto,
    @Req() req: any,
  ) {
    return this.placesService.create(dto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CREATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing destination' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreatePlaceDto })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: CreatePlaceDto,
    @Req() req: any,
  ) {
    return this.placesService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a destination record' })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.placesService.delete(id, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all verified tourism destinations' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Category slug (e.g. waterfalls)' })
  @ApiQuery({ name: 'district', type: String, required: false, description: 'District filtering (e.g. Bastar)' })
  @ApiQuery({ name: 'includeUnverified', type: String, required: false, description: 'Include unverified coordinates (e.g. true)' })
  async getAll(
    @Query('category') categorySlug?: string,
    @Query('district') district?: string,
    @Query('includeUnverified') includeUnverified?: string,
  ) {
    return this.placesService.findAll(categorySlug, district, includeUnverified === 'true');
  }

  @Get('categories')
  @ApiOperation({ summary: 'Retrieve all experience categories' })
  async getCategories() {
    return this.placesService.getCategories();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Retrieve all districts and their landmarks' })
  async getDistricts() {
    return this.placesService.getDistricts();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Retrieve destinations within radius of coordinates' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radiusKm', type: Number, required: false })
  @ApiQuery({ name: 'district', type: String, required: false })
  @ApiQuery({ name: 'block', type: String, required: false })
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(50), ParseFloatPipe) radiusKm: number,
    @Query('district') district?: string,
    @Query('block') block?: string,
  ) {
    return this.placesService.findNearby(lat, lng, radiusKm, district, block);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve a single place detailed description' })
  @ApiParam({ name: 'slug', type: String, description: 'Slug representation (e.g. chitrakote-falls)' })
  async getBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }

  @Post('semantic-search')
  @ApiOperation({ summary: 'Semantic search on regional legends and destinations' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'waterfalls in Bastar' },
        limit: { type: 'number', example: 5 }
      },
      required: ['query']
    }
  })
  async semanticSearch(
    @Body('query') query: string,
    @Body('limit', new DefaultValuePipe(5)) limit: number,
  ) {
    return this.placesService.semanticSearch(query, limit);
  }
}

