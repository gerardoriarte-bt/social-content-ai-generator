import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIParams } from '../models/AIParams';
import { Company } from '../models/Company';
import { BusinessLine } from '../models/BusinessLine';

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
  provider?: AIProvider;
}

export type AIProvider = 'gemini' | 'openai' | 'claude';

export class AIService {
  static async generateContentIdeas(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { provider = 'gemini' } = request;
    
    // Por ahora solo implementamos Gemini
    if (provider === 'gemini') {
      return this.generateWithGemini(request);
    }
    
    throw new Error(`Provider ${provider} not implemented yet`);
  }

  private static async generateWithGemini(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseIdeasFromResponse(text, numberOfIdeas);
  }

  private static buildPrompt(company: Company, businessLine: BusinessLine, aiParams: AIParams, numberOfIdeas: number): string {
    return `Eres un experto en marketing digital y creación de contenido para redes sociales.

CONTEXTO DE LA EMPRESA:
- Nombre: ${company.name}
- Descripción: ${company.description}
- Industria: ${company.industry}

LÍNEA DE NEGOCIO:
- Nombre: ${businessLine.name}
- Descripción: ${businessLine.description}

PARÁMETROS DE IA:
- Tono: ${aiParams.tone}
- Tipo de personaje: ${aiParams.characterType}
- Audiencia objetivo: ${aiParams.targetAudience}
- Tipo de contenido: ${aiParams.contentType}
- Red social: ${aiParams.socialNetwork}
- Formato de contenido: ${aiParams.contentFormat}
- Objetivo: ${aiParams.objective}
- Enfoque: ${aiParams.focus}

TAREA:
Genera ${numberOfIdeas} ideas de contenido creativas y específicas para ${aiParams.socialNetwork} que sean relevantes para la línea de negocio "${businessLine.name}" de la empresa "${company.name}".

FORMATO DE RESPUESTA:
Para cada idea, proporciona:
1. Título: Un título atractivo y específico
2. Descripción: Una descripción detallada del contenido
3. Justificación: Por qué esta idea es efectiva para la audiencia objetivo
4. Hashtags: 5-8 hashtags relevantes
5. Plataforma: La red social específica

Responde en formato JSON válido con un array de objetos:
[
  {
    "title": "Título de la idea",
    "description": "Descripción detallada del contenido",
    "rationale": "Justificación de por qué es efectiva",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "platform": "${aiParams.socialNetwork}"
  }
]`;
  }

  private static parseIdeasFromResponse(responseText: string, expectedCount: number): ContentIdea[] {
    try {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const ideas = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(ideas)) {
        throw new Error('Response is not an array');
      }

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
      console.error('Error parsing AI response:', error);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async testConnection(provider: AIProvider): Promise<boolean> {
    try {
      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent('Test connection');
        await result.response;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`${provider.toUpperCase()} connection test failed:`, error);
      return false;
    }
  }
}
