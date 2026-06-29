import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ItineraryService {
  constructor(private readonly prisma: PrismaService) {}

  async generateItinerary(
    district: string,
    durationDays: number,
    pace: 'slow' | 'moderate' | 'active' = 'moderate',
  ) {
    if (durationDays < 1 || durationDays > 7) {
      throw new BadRequestException('Duration must be between 1 and 7 days.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === 'your_google_gemini_api_key' || apiKey.trim() === '';

    // 1. Fetch verified places in the targeted district
    const places = await this.prisma.place.findMany({
      where: {
        verified: true,
        district: {
          equals: district,
        },
      },
    });

    if (places.length === 0) {
      return [];
    }

    if (isMock) {
      console.warn("GEMINI_API_KEY not configured. Falling back to mock itinerary logic.");
      return [
        {
          day: 1,
          distanceTraveledKm: pace === 'slow' ? 30 : 60,
          stops: places.slice(0, 2).map(p => ({
            name: p.name,
            slug: p.slug,
            coordinates: { lat: p.latitude, lng: p.longitude },
            bestSeasonInfo: p.bestSeason,
            safetyRules: p.rules
          }))
        },
        ...(durationDays > 1 ? [{
          day: 2,
          distanceTraveledKm: pace === 'active' ? 120 : 45,
          stops: places.slice(2, 4).map(p => ({
            name: p.name,
            slug: p.slug,
            coordinates: { lat: p.latitude, lng: p.longitude },
            bestSeasonInfo: p.bestSeason,
            safetyRules: p.rules
          }))
        }] : [])
      ];
    }

    // Prepare context for the AI
    const availablePlacesContext = places.map(p => ({
      name: p.name,
      slug: p.slug,
      coordinates: { lat: p.latitude, lng: p.longitude },
      bestSeason: p.bestSeason,
      safetyRules: p.rules,
      description: p.description
    }));

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `You are an expert AI travel planner for Chhattisgarh Tourism.
Generate a realistic ${durationDays}-day travel itinerary for the district of ${district}.
The traveler's pace is "${pace}" (slow = fewer places with more relaxation, moderate = balanced, active = packed schedule).
Only use the following verified places from our database for the itinerary:
${JSON.stringify(availablePlacesContext, null, 2)}

Requirements:
- Plan logical routes based on coordinates.
- Return the response STRICTLY as a JSON array where each object represents a day.
- Calculate approximate 'distanceTraveledKm' for the day.

Schema:
[
  {
    "day": 1,
    "distanceTraveledKm": 12.5,
    "stops": [
      {
        "name": "Place Name",
        "slug": "place-slug",
        "coordinates": { "lat": 12.3, "lng": 45.6 },
        "bestSeasonInfo": "...",
        "safetyRules": "..."
      }
    ]
  }
]
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedItinerary = JSON.parse(responseText);
      return parsedItinerary;
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      throw new InternalServerErrorException('Failed to generate AI itinerary. Please try again later.');
    }
  }
}
