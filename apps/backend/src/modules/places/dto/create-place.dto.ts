import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, IsArray, IsBoolean } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @IsNotEmpty({ message: 'Place name is required.' })
  name: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  fullDescription?: string;

  @IsString()
  @IsOptional()
  districtId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  blockId?: string;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  nearestCity?: string;

  @IsNumber()
  @IsOptional()
  distanceFromCity?: number;

  @IsString()
  @IsOptional()
  googleMapUrl?: string;

  @IsString()
  @IsOptional()
  bestSeason?: string;

  @IsString()
  @IsOptional()
  history?: string;

  @IsString()
  @IsOptional()
  significance?: string;

  @IsString()
  @IsOptional()
  openingTime?: string;

  @IsString()
  @IsOptional()
  closingTime?: string;

  @IsNumber()
  @IsOptional()
  entryFee?: number;

  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  foodAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  guideAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  wheelchairAccessible?: boolean;

  @IsBoolean()
  @IsOptional()
  washroomAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @IsBoolean()
  @IsOptional()
  photographyAllowed?: boolean;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @IsString()
  @IsOptional()
  status?: string; // DRAFT | PUBLISHED | FEATURED

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videoUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  panoramaUrls?: string[];
}
