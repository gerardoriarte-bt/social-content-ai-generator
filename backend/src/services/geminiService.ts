import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIParams } from '../models/AIParams';
import { Company } from '../models/Company';
import { BusinessLine } from '../models/BusinessLine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDG8SWURNuhDS7I78D7dUAJW92x-K0LYhA';

export interface ContentIdea {
  title: string;
  description: string;
  rationale: string;
  hashtags: string[];
  platform: string;
}

export interface IdeaGenerationRequest {
  company: Company;
  businessLine: BusinessLine;
  aiParams: AIParams;
  numberOfIdeas?: number;
}

export class GeminiService {
  private static genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  private static model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  static async generateContentIdeas(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;

    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseIdeasFromResponse(text, numberOfIdeas);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      throw new Error('Failed to generate content ideas');
    }
  }

  private static buildPrompt(
    company: Company,
    businessLine: BusinessLine,
    aiParams: AIParams,
    numberOfIdeas: number
  ): string {
    return `
Eres un experto en marketing digital y creación de contenido para redes sociales. 
Necesito que generes ${numberOfIdeas} ideas de contenido para la siguiente empresa:

**INFORMACIÓN DE LA EMPRESA:**
- Nombre: ${company.name}
- Descripción: ${company.description}
- Industria: ${company.industry}

**LÍNEA DE NEGOCIO:**
- Nombre: ${businessLine.name}
- Descripción: ${businessLine.description}

**PARÁMETROS DE IA:**
- Tono: ${aiParams.tone}
- Tipo de Personaje: ${aiParams.characterType}
- Audiencia Objetivo: ${aiParams.targetAudience}
- Tipo de Contenido: ${aiParams.contentType}

**INSTRUCCIONES:**
1. Genera ${numberOfIdeas} ideas de contenido únicas y creativas
2. Cada idea debe incluir: título, descripción, justificación, hashtags relevantes y plataforma recomendada
3. El contenido debe ser específico para la audiencia objetivo
4. Usa el tono y tipo de personaje especificados
5. Los hashtags deben ser relevantes y populares en la plataforma sugerida

**FORMATO DE RESPUESTA:**
Responde en formato JSON válido con la siguiente estructura:
[
  {
    "title": "Título de la idea",
    "description": "Descripción detallada del contenido",
    "rationale": "Justificación de por qué esta idea funcionaría",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "platform": "Instagram/LinkedIn/TikTok/Twitter"
  }
]

Asegúrate de que la respuesta sea solo JSON válido, sin texto adicional antes o después.
`;
  }

  private static parseIdeasFromResponse(response: string, expectedCount: number): ContentIdea[] {
    try {
      // Limpiar la respuesta para extraer solo el JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const ideas = JSON.parse(jsonMatch[0]) as ContentIdea[];

      // Validar que cada idea tenga todos los campos requeridos
      const validIdeas = ideas.filter(idea => 
        idea.title && 
        idea.description && 
        idea.rationale && 
        Array.isArray(idea.hashtags) && 
        idea.platform
      );

      if (validIdeas.length === 0) {
        throw new Error('No valid ideas found in response');
      }

      return validIdeas.slice(0, expectedCount);
    } catch (error) {
      console.error('Error parsing ideas from response:', error);
      console.error('Raw response:', response);
      
      // Fallback: generar ideas básicas
      return this.generateFallbackIdeas(expectedCount);
    }
  }

  private static generateFallbackIdeas(count: number): ContentIdea[] {
    const ideas: ContentIdea[] = [];
    
    for (let i = 1; i <= count; i++) {
      ideas.push({
        title: `Idea de Contenido ${i}`,
        description: `Descripción de la idea de contenido ${i}. Este es un contenido de respaldo generado automáticamente.`,
        rationale: `Esta idea está diseñada para generar engagement y conectar con la audiencia objetivo.`,
        hashtags: ['#contenido', '#marketing', '#socialmedia'],
        platform: 'Instagram'
      });
    }

    return ideas;
  }

  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello, this is a test message.');
      const response = await result.response;
      return response.text().length > 0;
    } catch (error) {
      console.error('Gemini AI connection test failed:', error);
      return false;
    }
  }
}
