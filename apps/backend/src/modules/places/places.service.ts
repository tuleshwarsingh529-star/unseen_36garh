import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(dto: CreatePlaceDto, user?: { id: string; role: string }) {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const exists = await this.prisma.place.findUnique({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException(`Destination with a matching slug '${slug}' already exists.`);
    }

    let initialStatus = 'PUBLISHED';
    let verified = true;
    
    if (user) {
      if (user.role === 'CREATOR') {
        initialStatus = dto.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
        verified = dto.status === 'DRAFT' ? false : true;
      } else if (dto.status) {
        initialStatus = dto.status;
        verified = dto.status === 'PUBLISHED';
      }
    }

    const place = await this.prisma.place.create({
      data: {
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription || '',
        fullDescription: dto.fullDescription || '',
        history: dto.history || '',
        significance: dto.significance || '',
        ...(dto.districtId  ? { districtId: dto.districtId }   : {}),
        ...(dto.blockId     ? { blockId: dto.blockId }          : {}),
        ...(dto.categoryId  ? { categoryId: dto.categoryId }    : {}),
        latitude: dto.latitude ?? 0,
        longitude: dto.longitude ?? 0,
        googleMapUrl: dto.googleMapUrl,
        altitude: dto.altitude,
        address: dto.address,
        nearestCity: dto.nearestCity,
        distanceFromCity: dto.distanceFromCity,
        bestSeason: dto.bestSeason || 'All seasons',
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        entryFee: dto.entryFee,
        parkingAvailable: dto.parkingAvailable || false,
        foodAvailable: dto.foodAvailable || false,
        guideAvailable: dto.guideAvailable || false,
        wheelchairAccessible: dto.wheelchairAccessible || false,
        washroomAvailable: dto.washroomAvailable || false,
        petFriendly: dto.petFriendly || false,
        photographyAllowed: dto.photographyAllowed || false,
        contactNumber: dto.contactNumber,
        website: dto.website,
        featuredImage: dto.featuredImage,
        heroImage: dto.featuredImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        panoramaUrls: dto.panoramaUrls ? JSON.stringify(dto.panoramaUrls) : '[]',
        status: initialStatus,
        verified,
        creatorId: user?.id || null,
        ...(dto.imageUrls && dto.imageUrls.length > 0 ? {
          images: {
            create: dto.imageUrls.map(url => ({
              imageUrl: url,
              caption: `Image of ${dto.name}`,
              isFeatured: false
            }))
          }
        } : {}),
        ...(dto.videoUrls && dto.videoUrls.length > 0 ? {
          videos: {
            create: dto.videoUrls.map(url => ({
              videoUrl: url,
              title: `Video of ${dto.name}`
            }))
          }
        } : {})
      },
      include: {
        district: true,
        category: true,
        images: true,
        videos: true,
      }
    });

    // Broadcast the newly created place via WebSockets
    this.socketGateway.broadcast('place.created', place);

    return place;
  }

  async update(id: string, dto: CreatePlaceDto, user: { id: string; role: string }) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID '${id}' not found.`);
    }

    if (user.role === 'CREATOR' && place.creatorId !== user.id) {
      throw new BadRequestException('Forbidden: You can only edit your own submissions.');
    }

    let status = dto.status || place.status;
    let verified = place.verified;

    if (user.role === 'CREATOR') {
      status = dto.status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED';
      verified = false;
    } else if (dto.status) {
      verified = dto.status === 'PUBLISHED';
    }

    return this.prisma.place.update({
      where: { id },
      data: {
        name: dto.name,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        history: dto.history,
        significance: dto.significance,
        districtId: dto.districtId,
        blockId: dto.blockId,
        categoryId: dto.categoryId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        googleMapUrl: dto.googleMapUrl,
        altitude: dto.altitude,
        address: dto.address,
        nearestCity: dto.nearestCity,
        distanceFromCity: dto.distanceFromCity,
        bestSeason: dto.bestSeason,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        entryFee: dto.entryFee,
        parkingAvailable: dto.parkingAvailable,
        foodAvailable: dto.foodAvailable,
        guideAvailable: dto.guideAvailable,
        wheelchairAccessible: dto.wheelchairAccessible,
        washroomAvailable: dto.washroomAvailable,
        petFriendly: dto.petFriendly,
        photographyAllowed: dto.photographyAllowed,
        contactNumber: dto.contactNumber,
        website: dto.website,
        featuredImage: dto.featuredImage,
        heroImage: dto.featuredImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        panoramaUrls: dto.panoramaUrls ? JSON.stringify(dto.panoramaUrls) : undefined,
        status,
        verified,
      },
    });
  }

  async delete(id: string, user: { id: string; role: string }) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID '${id}' not found.`);
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
      throw new BadRequestException('Forbidden: Only administrators can delete records.');
    }

    return this.prisma.place.delete({
      where: { id },
    });
  }

  async findAll(categorySlug?: string, district?: string, includeUnverified?: boolean) {
    return this.prisma.place.findMany({
      where: {
        ...(!includeUnverified ? { verified: true } : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(district ? { district: { name: district } } : {}),
      },
      include: {
        category: true,
        district: true,
        images: true,
        videos: true,
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async getDistricts() {
    return this.prisma.district.findMany({
      include: {
        places: true
      }
    });
  }

  async findBySlug(slug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const place = await this.prisma.place.findUnique({
      where: isUuid ? { id: slug } : { slug },
      include: {
        category: true,
        district: true,
        images: true,
        videos: true,
        reviews: {
          include: {
            user: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Destination with slug or ID '${slug}' not found.`);
    }

    return place;
  }

  async findNearby(lat: number, lng: number, radiusKm: number, district?: string, block?: string) {
    const userDistrict = this.getDistrictFromCoords(lat, lng);
    try {
      const places: any[] = await this.prisma.$queryRaw`
        SELECT 
          p.id, p.name, p.slug, p."shortDescription" as description, p.latitude, p.longitude, p."heroImage",
          d.name as district, b.name as block, c.slug as category,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000 AS distance_km
        FROM "Place" p
        LEFT JOIN "District" d ON p."districtId" = d.id
        LEFT JOIN "Block" b ON p."blockId" = b.id
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p.verified = true
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusKm * 1000}
          )
        ORDER BY 
          CASE WHEN d.name = ${userDistrict} THEN 0 ELSE 1 END ASC,
          distance_km ASC;
      `;
      return places;
    } catch (error) {
      console.warn('PostGIS query execution failed. Falling back to local mathematics calculations...', error.message);
      
      const allPlaces = await this.prisma.place.findMany({
        where: { 
          verified: true,
          ...(district ? { district: { name: district } } : {}),
          ...(block ? { block: { name: block } } : {}) 
        },
        include: { category: true, district: true, block: true, images: true, videos: true }
      });

      return allPlaces
        .map(place => {
          const distance = this.calculateDistance(lat, lng, place.latitude, place.longitude);
          return { 
            id: place.id,
            name: place.name,
            slug: place.slug,
            description: place.shortDescription,
            heroImage: place.heroImage,
            districtId: place.districtId,
            district: place.district?.name,
            block: place.block?.name,
            category: place.category?.slug || place.category?.name,
            latitude: place.latitude,
            longitude: place.longitude,
            distance_km: distance 
          };
        })
        .filter(place => place.distance_km <= radiusKm)
        .sort((a, b) => {
          const aMatch = a.district === userDistrict ? 1 : 0;
          const bMatch = b.district === userDistrict ? 1 : 0;
          if (aMatch !== bMatch) {
            return bMatch - aMatch;
          }
          return a.distance_km - b.distance_km;
        });
    }
  }

  async semanticSearch(query: string, limit: number = 5) {
    if (!query || query.trim() === '') {
      return [];
    }

    const allPlaces = await this.prisma.place.findMany({
      where: { verified: true },
      include: { category: true, images: true, videos: true }
    });

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return allPlaces
        .filter(place => 
          place.name.toLowerCase().includes(query.toLowerCase()) || 
          (place.shortDescription || '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);
    }

    const matchedPlaces = allPlaces.map(place => {
      let score = 0;
      const name = place.name.toLowerCase();
      const shortDesc = (place.shortDescription || '').toLowerCase();
      const fullDesc = (place.fullDescription || '').toLowerCase();
      const bestSeason = (place.bestSeason || '').toLowerCase();

      searchTerms.forEach(term => {
        if (name.includes(term)) score += 5.0;
        if (shortDesc.includes(term)) score += 3.0;
        if (fullDesc.includes(term)) score += 1.5;
        if (bestSeason.includes(term)) score += 1.0;
      });

      return { ...place, similarity_score: score };
    });

    return matchedPlaces
      .filter(place => place.similarity_score > 0)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getDistrictFromCoords(lat: number, lng: number): string {
    // Check if coordinates are in/near Bilaspur bounds: Lat 21.8 to 22.8, Lng 81.5 to 82.6
    if (lat >= 21.8 && lat <= 22.8 && lng >= 81.5 && lng <= 82.6) {
      return "Bilaspur";
    }
    // Raipur: Lat 20.8 to 21.8, Lng 81.2 to 82.2
    if (lat >= 20.8 && lat <= 21.8 && lng >= 81.2 && lng <= 82.2) {
      return "Raipur";
    }
    // Surguja: Lat 22.5 to 24.2, Lng 82.4 to 84.2
    if (lat >= 22.5 && lat <= 24.2 && lng >= 82.4 && lng <= 84.2) {
      return "Surguja";
    }
    // Bastar: Lat 18.8 to 19.8, Lng 81.2 to 82.2
    if (lat >= 18.8 && lat <= 19.8 && lng >= 81.2 && lng <= 82.2) {
      return "Bastar";
    }
    // Kawardha (Kabirdham): Lat 21.8 to 22.5, Lng 80.8 to 81.4
    if (lat >= 21.8 && lat <= 22.5 && lng >= 80.8 && lng <= 81.4) {
      return "Kawardha";
    }
    return "";
  }
}
