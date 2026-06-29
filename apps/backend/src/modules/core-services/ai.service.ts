import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
  private ai: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateDraft(placeName: string, description: string): Promise<{ title: string; body: string; tags: string[] }> {
    if (this.ai) {
      try {
        const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Create a compelling 3-paragraph travel guide story based on the place: "${placeName}" and description: "${description}". Format your answer as a JSON block with "title", "body", and "tags" keys.`;
        const response = await model.generateContent(prompt);
        const text = response.response.text() || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            title: parsed.title || `Journey to ${placeName}`,
            body: parsed.body || parsed.description || text,
            tags: parsed.tags || ['travel', 'chhattisgarh'],
          };
        }
      } catch (e) {
        console.error('Gemini content generation failed, using templates fallback:', e);
      }
    }

    // Templated fallback
    return {
      title: `Secrets of ${placeName}: A Traveler's Diary`,
      body: `Visiting ${placeName} reveals the raw essence of Chhattisgarh's heritage. ${description || 'It stands as a testament to the region\'s natural grandeur, perfect for eco-travelers seeking offbeat trails.'}`,
      tags: ['heritage', 'nature', 'chhattisgarh', placeName.toLowerCase().replace(/\s+/g, '')],
    };
  }

  async generateTags(content: string): Promise<string[]> {
    const defaultTags = ['chhattisgarh', 'explore', 'tourism'];
    const words = content.toLowerCase().split(/\W+/);
    if (words.includes('waterfall') || words.includes('falls')) defaultTags.push('waterfalls');
    if (words.includes('temple') || words.includes('shrine')) defaultTags.push('heritage');
    if (words.includes('forest') || words.includes('sanctuary') || words.includes('national')) defaultTags.push('wildlife');
    return Array.from(new Set(defaultTags));
  }
}
