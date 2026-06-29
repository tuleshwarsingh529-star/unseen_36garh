import { Controller, Get, Post, Body, Param, Query, ParseFloatPipe, DefaultValuePipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new tourism destination (Contributor Upload)' })
  @ApiBody({ type: CreatePlaceDto, description: 'Required place parameters' })
  async create(@Body(new ValidationPipe()) dto: CreatePlaceDto) {
    return this.placesService.create(dto);
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

