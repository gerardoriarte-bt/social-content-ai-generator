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
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 3000, 5000];

  static async generateContentIdeas(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { provider = 'gemini' } = request;
    
    // Intentar con retry logic
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`${provider.toUpperCase()} attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        
        let ideas: ContentIdea[];
        
        switch (provider) {
          case 'gemini':
            ideas = await this.generateWithGemini(request);
            break;
          case 'openai':
            ideas = await this.generateWithOpenAI(request);
            break;
          case 'claude':
            ideas = await this.generateWithClaude(request);
            break;
          default:
            throw new Error(`Unsupported AI provider: ${provider}`);
        }

        // Validar que las ideas cumplan con los parámetros
        const validatedIdeas = this.validateIdeas(ideas, request);
        
        if (validatedIdeas.length >= request.numberOfIdeas! / 2) {
          console.log(`${provider.toUpperCase()} success: Generated ${validatedIdeas.length} validated ideas`);
          return validatedIdeas;
        } else {
          console.log(`${provider.toUpperCase()} validation failed: Only ${validatedIdeas.length} ideas passed validation`);
          throw new Error('Insufficient validated ideas');
        }

      } catch (error: any) {
        console.error(`${provider.toUpperCase()} attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === this.MAX_RETRIES - 1) {
          console.log(`All ${provider.toUpperCase()} attempts failed, using enhanced fallback`);
          return this.generateEnhancedFallbackIdeas(request);
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAYS[attempt]));
      }
    }

    return this.generateEnhancedFallbackIdeas(request);
  }

  private static validateIdeas(ideas: ContentIdea[], request: IdeaGenerationRequest): ContentIdea[] {
    const { aiParams, company, businessLine } = request;
    
    return ideas.filter(idea => {
      // Validar que la plataforma sea correcta
      if (idea.platform !== aiParams.socialNetwork) {
        console.log(`Validation failed: Platform mismatch. Expected ${aiParams.socialNetwork}, got ${idea.platform}`);
        return false;
      }

      // Validar que el título contenga palabras clave relevantes
      const titleLower = idea.title.toLowerCase();
      const businessLineLower = businessLine.name.toLowerCase();
      const companyLower = company.name.toLowerCase();
      
      if (!titleLower.includes(businessLineLower.split(' ')[0]) && !titleLower.includes(companyLower.split(' ')[0])) {
        console.log(`Validation failed: Title doesn't contain business line or company keywords`);
        return false;
      }

      // Validar que la descripción sea específica
      const descriptionLower = idea.description.toLowerCase();
      if (descriptionLower.length < 50) {
        console.log(`Validation failed: Description too short`);
        return false;
      }

      // Validar que los hashtags sean relevantes
      if (!idea.hashtags.some(tag => tag.toLowerCase().includes(aiParams.socialNetwork.toLowerCase()))) {
        console.log(`Validation failed: No platform-specific hashtags`);
        return false;
      }

      return true;
    });
  }

  private static async generateWithGemini(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = this.buildStrictPrompt(company, businessLine, aiParams, numberOfIdeas, 'Google Gemini');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseIdeasFromResponse(text, numberOfIdeas, 'Google Gemini');
  }

  private static async generateWithOpenAI(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const prompt = this.buildStrictPrompt(company, businessLine, aiParams, numberOfIdeas, 'OpenAI GPT-4');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1, // Muy bajo para máxima consistencia
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return this.parseIdeasFromResponse(text, numberOfIdeas, 'OpenAI GPT-4');
  }

  private static async generateWithClaude(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const prompt = this.buildStrictPrompt(company, businessLine, aiParams, numberOfIdeas, 'Anthropic Claude');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: 0.1, // Muy bajo para máxima consistencia
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    return this.parseIdeasFromResponse(text, numberOfIdeas, 'Anthropic Claude');
  }

  private static buildStrictPrompt(company: Company, businessLine: BusinessLine, aiParams: AIParams, numberOfIdeas: number, providerName: string): string {
    return `Eres un experto en marketing digital especializado en ${aiParams.socialNetwork}.

MISIÓN CRÍTICA: Generar contenido que respete ESTRICTAMENTE estos parámetros específicos.

EMPRESA: ${company.name} (${company.industry})
LÍNEA DE NEGOCIO: ${businessLine.name} - ${businessLine.description}

PARÁMETROS INMUTABLES:
🎯 TONO: ${aiParams.tone} (OBLIGATORIO - no cambies esto)
👤 PERSONAJE: ${aiParams.characterType} (OBLIGATORIO - no cambies esto)
👥 AUDIENCIA: ${aiParams.targetAudience} (OBLIGATORIO - no cambies esto)
📝 TIPO: ${aiParams.contentType} (OBLIGATORIO - no cambies esto)
📱 PLATAFORMA: ${aiParams.socialNetwork} (OBLIGATORIO - no cambies esto)
📄 FORMATO: ${aiParams.contentFormat} (OBLIGATORIO - no cambies esto)
🎯 OBJETIVO: ${aiParams.objective} (OBLIGATORIO - no cambies esto)
🔍 ENFOQUE: ${aiParams.focus} (OBLIGATORIO - incluye esto)

REGLAS ESTRICTAS:
1. Cada idea DEBE mencionar "${businessLine.name}" específicamente
2. Cada idea DEBE usar el tono "${aiParams.tone}" exactamente
3. Cada idea DEBE dirigirse a "${aiParams.targetAudience}" específicamente
4. Cada idea DEBE ser para ${aiParams.socialNetwork} específicamente
5. Cada idea DEBE usar formato ${aiParams.contentFormat} específicamente
6. Cada idea DEBE cumplir objetivo ${aiParams.objective} específicamente
7. Cada idea DEBE incluir enfoque "${aiParams.focus}"

EJEMPLOS DE CUMPLIMIENTO:
✅ CORRECTO: "Como ${aiParams.characterType}, comparto estrategias para ${aiParams.targetAudience} sobre ${businessLine.name} con tono ${aiParams.tone}"
❌ INCORRECTO: Cualquier contenido que no mencione estos elementos específicos

TAREA: Genera ${numberOfIdeas} ideas que cumplan TODOS los parámetros arriba.

FORMATO JSON OBLIGATORIO:
[
  {
    "title": "[${aiParams.socialNetwork}] Título que mencione ${businessLine.name} con tono ${aiParams.tone}",
    "description": "Descripción específica sobre ${businessLine.name} dirigida a ${aiParams.targetAudience} con tono ${aiParams.tone} para ${aiParams.socialNetwork} formato ${aiParams.contentFormat}. Enfoque: ${aiParams.focus}",
    "rationale": "Esta idea cumple el objetivo ${aiParams.objective} para ${aiParams.targetAudience} usando tono ${aiParams.tone} en ${aiParams.socialNetwork} sobre ${businessLine.name}",
    "hashtags": ["#${aiParams.socialNetwork.toLowerCase()}", "#${businessLine.name.toLowerCase().replace(/\s+/g, '')}", "#${aiParams.objective.toLowerCase()}", "#${company.industry.toLowerCase()}", "#contenido"],
    "platform": "${aiParams.socialNetwork}"
  }
]

VERIFICACIÓN FINAL: Cada idea debe contener las palabras clave: "${businessLine.name}", "${aiParams.tone}", "${aiParams.targetAudience}", "${aiParams.socialNetwork}", "${aiParams.contentFormat}", "${aiParams.objective}"`;
  }

  private static parseIdeasFromResponse(responseText: string, expectedCount: number, providerName: string): ContentIdea[] {
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

      // Agregar información del proveedor a cada idea
      return validIdeas.slice(0, expectedCount).map(idea => ({
        ...idea,
        title: `[${providerName}] ${idea.title}`,
        rationale: `${idea.rationale} (Generado por ${providerName})`
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error(`Failed to parse ${providerName} response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static generateEnhancedFallbackIdeas(request: IdeaGenerationRequest): ContentIdea[] {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const fallbackIdeas: ContentIdea[] = [];
    
    for (let i = 1; i <= numberOfIdeas; i++) {
      fallbackIdeas.push({
        title: `[Fallback] ${aiParams.contentFormat} para ${businessLine.name} - ${aiParams.tone}`,
        description: `Contenido específico sobre ${businessLine.name} de ${company.name} dirigido a ${aiParams.targetAudience} con tono ${aiParams.tone} para ${aiParams.socialNetwork} en formato ${aiParams.contentFormat}. Objetivo: ${aiParams.objective}. Enfoque: ${aiParams.focus}`,
        rationale: `Esta idea cumple el objetivo ${aiParams.objective} para ${aiParams.targetAudience} usando tono ${aiParams.tone} en ${aiParams.socialNetwork} sobre ${businessLine.name}`,
        hashtags: [`#${aiParams.socialNetwork.toLowerCase()}", "#${businessLine.name.toLowerCase().replace(/\s+/g, '')}", "#${aiParams.objective.toLowerCase()}", "#${company.industry.toLowerCase()}", "#contenido"],
        platform: aiParams.socialNetwork
      });
    }
    
    return fallbackIdeas;
  }

  static async testConnection(provider: AIProvider): Promise<boolean> {
    try {
      switch (provider) {
        case 'gemini':
          return await this.testGeminiConnection();
        case 'openai':
          return await this.testOpenAIConnection();
        case 'claude':
          return await this.testClaudeConnection();
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider.toUpperCase()} connection test failed:`, error);
      return false;
    }
  }

  private static async testGeminiConnection(): Promise<boolean> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Test connection');
    await result.response;
    return true;
  }

  private static async testOpenAIConnection(): Promise<boolean> {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    return response.ok;
  }

  private static async testClaudeConnection(): Promise<boolean> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      }),
    });

    return response.ok;
  }
}
