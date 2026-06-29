import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { district: true, category: true },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${placeId} not found.`);
    }

    // Query media library linked directly to this place
    const media = await this.prisma.mediaLibrary.findMany({
      where: { placeId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });

    // Extract tags based on category, district, and attributes
    const tags = [
      place.category?.name || 'Nature',
      place.district?.name || 'Bastar',
      'Chhattisgarh',
      place.priority ? `${place.priority} Priority` : null,
      place.bestSeason ? `Best Season: ${place.bestSeason}` : null,
    ].filter(Boolean);

    return {
      placeName: place.name,
      district: place.district?.name,
      category: place.category?.name,
      media,
      tags,
    };
  }

  async generateAutoDraft(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { district: true, category: true },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${placeId} not found.`);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === 'your_google_gemini_api_key' || apiKey.trim() === '';

    let draft = {
      title: `Unveiling the Magic of ${place.name} 🌿`,
      description: `Located in the scenic district of ${place.district?.name || 'Chhattisgarh'}, ${place.name} is a stunning destination. ${place.shortDescription || 'An amazing spot to explore local culture, history, and natural beauty.'}\n\nHere is a complete travel guide and narrative of what makes this place special.`,
      tags: [place.category?.name || 'Nature', place.district?.name || 'Bastar', 'Chhattisgarh', 'HiddenGem'],
      travelTips: place.bestSeason ? `Best visited in ${place.bestSeason}. Make sure to carry a camera and local guide coordinates.` : 'Carry local navigation aids and emergency helpline contacts.',
    };

    if (!isMock) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
          Generate a travel story draft, suggested title, hashtags/tags, and travel tips for a destination in Chhattisgarh, India:
          Name: ${place.name}
          District: ${place.district?.name}
          Category: ${place.category?.name}
          Short Description: ${place.shortDescription}
          Full Description: ${place.fullDescription}
          Best Season: ${place.bestSeason}

          Return ONLY a valid JSON object matching this structure:
          {
            "title": "string",
            "description": "string",
            "tags": ["string"],
            "travelTips": "string"
          }
        `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          draft = {
            title: parsed.title || draft.title,
            description: parsed.description || draft.description,
            tags: parsed.tags || draft.tags,
            travelTips: parsed.travelTips || draft.travelTips,
          };
        }
      } catch (e: any) {
        console.warn('Gemini AI draft generation failed, using structured template fallback.', e.message);
      }
    }

    // Load available media suggestions
    const media = await this.prisma.mediaLibrary.findMany({
      where: { placeId, status: 'APPROVED' },
    });

    return {
      placeId,
      placeName: place.name,
      draft,
      media,
    };
  }

  // Traverses local directory to index and register available media assets
  async indexLocalFolders() {
    const uploadRoot = path.join(process.cwd(), 'public'); // Serves local static files
    const placesDir = path.join(uploadRoot, 'places');

    let indexedCount = 0;

    // Failure-safe folder traverser
    if (fs.existsSync(placesDir)) {
      try {
        const districts = fs.readdirSync(placesDir);
        for (const districtName of districts) {
          const districtPath = path.join(placesDir, districtName);
          if (!fs.statSync(districtPath).isDirectory()) continue;

          // Find matching District ID in database
          const districtDb = await this.prisma.district.findFirst({
            where: { name: { contains: districtName } },
          });

          const places = fs.readdirSync(districtPath);
          for (const placeName of places) {
            const placePath = path.join(districtPath, placeName);
            if (!fs.statSync(placePath).isDirectory()) continue;

            // Find matching Place ID in database
            const placeDb = await this.prisma.place.findFirst({
              where: { slug: { contains: placeName.toLowerCase() } },
            });

            // Read media files
            const files = fs.readdirSync(placePath);
            for (const file of files) {
              const filePath = path.join(placePath, file);
              if (fs.statSync(filePath).isDirectory()) continue;

              const ext = path.extname(file).toLowerCase();
              const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
              const isVideo = ['.mp4', '.mkv', '.webm'].includes(ext);

              if (isImage || isVideo) {
                const relativePath = `/places/${districtName}/${placeName}/${file}`;
                const title = file
                  .replace(ext, '')
                  .split('-')
                  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');

                // Upsert to MediaLibrary
                await this.prisma.mediaLibrary.upsert({
                  where: { filePath: relativePath },
                  create: {
                    placeId: placeDb?.id || null,
                    districtId: districtDb?.id || placeDb?.districtId || null,
                    mediaType: isImage ? 'image' : 'video',
                    title,
                    filePath: relativePath,
                    caption: `Autodiscovered ${isImage ? 'image' : 'video'} for ${placeDb?.name || placeName}`,
                    status: 'APPROVED',
                  },
                  update: {
                    placeId: placeDb?.id || null,
                  },
                });
                indexedCount++;
              }
            }
          }
        }
      } catch (e: any) {
        throw new BadRequestException(`Folder traversing index error: ${e.message}`);
      }
    }

    return {
      success: true,
      message: `Local folder indexing run completed. Processed ${indexedCount} assets.`,
      indexedCount,
    };
  }

  async getSettings() {
    const settings = await this.prisma.adminSetting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value === 'true' ? true : curr.value === 'false' ? false : curr.value;
      return acc;
    }, {} as any);
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.adminSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
