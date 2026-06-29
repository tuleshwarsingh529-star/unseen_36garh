import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { extname } from 'path';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async processImage(
    fileName: string,
    filePath: string,
    fileSize: number,
    placeId?: string,
    districtId?: string,
  ) {
    const fileExt = extname(fileName).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

    if (!validExtensions.includes(fileExt)) {
      throw new BadRequestException(`Invalid media format: ${fileExt}`);
    }

    // Process thumbnail metadata parameters (simulated optimization)
    const thumbnailPath = filePath.replace(fileExt, `-thumb.webp`);
    const isVideo = fileExt === '.mp4';

    // Register asset in MediaLibrary
    const mediaAsset = await this.prisma.mediaLibrary.create({
      data: {
        title: fileName.replace(fileExt, ''),
        filePath,
        thumbnail: thumbnailPath,
        mediaType: isVideo ? 'video' : 'image',
        placeId: placeId || null,
        districtId: districtId || null,
        copyrightOwner: 'Chhattisgarh Tourism Board',
        licenseType: 'Creative Commons By-ND',
      },
    });

    return mediaAsset;
  }
}
