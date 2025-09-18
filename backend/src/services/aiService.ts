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

        console.log(`${provider.toUpperCase()} success: Generated ${ideas.length} ideas`);
        return ideas;

      } catch (error: any) {
        console.error(`${provider.toUpperCase()} attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === this.MAX_RETRIES - 1) {
          console.log(`All ${provider.toUpperCase()} attempts failed, using fallback`);
          return this.generateFallbackIdeas(request);
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAYS[attempt]));
      }
    }

    return this.generateFallbackIdeas(request);
  }

  private static async generateWithGemini(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas, 'Google Gemini');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseIdeasFromResponse(text, numberOfIdeas, 'Google Gemini');
  }

  private static async generateWithOpenAI(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas, 'OpenAI GPT-4');
    
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
        temperature: 0.3, // Reducido para mayor consistencia
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
    
    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas, 'Anthropic Claude');
    
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
        temperature: 0.3, // Reducido para mayor consistencia
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

  private static buildPrompt(company: Company, businessLine: BusinessLine, aiParams: AIParams, numberOfIdeas: number, providerName: string): string {
    return `Eres un experto en marketing digital y creación de contenido para redes sociales.

IMPORTANTE: Estás usando ${providerName}. DEBES generar contenido que respete ESTRICTAMENTE todos los parámetros proporcionados.

CONTEXTO DE LA EMPRESA:
- Nombre: ${company.name}
- Descripción: ${company.description}
- Industria: ${company.industry}

LÍNEA DE NEGOCIO ESPECÍFICA:
- Nombre: ${businessLine.name}
- Descripción: ${businessLine.description}

PARÁMETROS OBLIGATORIOS (NO PUEDES CAMBIAR NINGUNO):
- TONO OBLIGATORIO: ${aiParams.tone}
- PERSONAJE OBLIGATORIO: ${aiParams.characterType}
- AUDIENCIA OBLIGATORIA: ${aiParams.targetAudience}
- TIPO DE CONTENIDO OBLIGATORIO: ${aiParams.contentType}
- RED SOCIAL OBLIGATORIA: ${aiParams.socialNetwork}
- FORMATO OBLIGATORIO: ${aiParams.contentFormat}
- OBJETIVO OBLIGATORIO: ${aiParams.objective}
- ENFOQUE OBLIGATORIO: ${aiParams.focus}

INSTRUCCIONES CRÍTICAS:
1. Genera EXACTAMENTE ${numberOfIdeas} ideas de contenido
2. TODAS las ideas DEBEN ser específicamente para ${aiParams.socialNetwork}
3. El tono DEBE ser EXACTAMENTE "${aiParams.tone}" - no uses otros tonos
4. El personaje DEBE ser EXACTAMENTE "${aiParams.characterType}" - no cambies el tipo de personaje
5. La audiencia objetivo DEBE ser EXACTAMENTE "${aiParams.targetAudience}" - no uses otras audiencias
6. El tipo de contenido DEBE ser EXACTAMENTE "${aiParams.contentType}" - no cambies el tipo
7. El formato DEBE ser EXACTAMENTE "${aiParams.contentFormat}" - no uses otros formatos
8. El objetivo DEBE ser EXACTAMENTE "${aiParams.objective}" - no cambies el objetivo
9. DEBES incluir el enfoque específico: "${aiParams.focus}"
10. Cada idea DEBE estar relacionada específicamente con "${businessLine.name}" de "${company.name}"

EJEMPLO DE CUMPLIMIENTO:
Si el tono es "Profesional y amigable", NO uses tonos casuales, formales, divertidos, etc.
Si la audiencia es "Empresarios y emprendedores", NO uses contenido para jóvenes, consumidores finales, etc.
Si el formato es "Post", NO generes Stories, Reels, Videos, etc.

TAREA ESPECÍFICA:
Genera ${numberOfIdeas} ideas de contenido que cumplan TODOS estos criterios:
- Para la plataforma: ${aiParams.socialNetwork}
- Con tono: ${aiParams.tone}
- Como personaje: ${aiParams.characterType}
- Para audiencia: ${aiParams.targetAudience}
- Tipo de contenido: ${aiParams.contentType}
- Formato: ${aiParams.contentFormat}
- Objetivo: ${aiParams.objective}
- Enfoque: ${aiParams.focus}
- Relacionado con: ${businessLine.name} de ${company.name}

FORMATO DE RESPUESTA OBLIGATORIO:
Responde ÚNICAMENTE en formato JSON válido. NO incluyas texto adicional.

[
  {
    "title": "Título específico que refleje el tono ${aiParams.tone} y el formato ${aiParams.contentFormat}",
    "description": "Descripción detallada que demuestre claramente el tono ${aiParams.tone}, dirigida a ${aiParams.targetAudience}, sobre ${businessLine.name}, con formato ${aiParams.contentFormat}",
    "rationale": "Explicación específica de por qué esta idea cumple el objetivo ${aiParams.objective} para ${aiParams.targetAudience} con tono ${aiParams.tone} en ${aiParams.socialNetwork}",
    "hashtags": ["#${company.industry.toLowerCase()}", "#${businessLine.name.toLowerCase().replace(/\s+/g, '')}", "#${aiParams.socialNetwork.toLowerCase()}", "#${aiParams.objective.toLowerCase()}", "#contenido"],
    "platform": "${aiParams.socialNetwork}"
  }
]

VALIDACIÓN FINAL:
- Verifica que cada idea respete TODOS los parámetros
- Asegúrate de que el contenido sea específico para ${aiParams.socialNetwork}
- Confirma que el tono sea exactamente "${aiParams.tone}"
- Verifica que la audiencia sea exactamente "${aiParams.targetAudience}"
- Confirma que el formato sea exactamente "${aiParams.contentFormat}"
- Asegúrate de que el objetivo sea exactamente "${aiParams.objective}"
- Verifica que incluya el enfoque "${aiParams.focus}"`;
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

  private static generateFallbackIdeas(request: IdeaGenerationRequest): ContentIdea[] {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;
    
    const fallbackIdeas: ContentIdea[] = [];
    
    for (let i = 1; i <= numberOfIdeas; i++) {
      fallbackIdeas.push({
        title: `[Fallback] Idea ${i} para ${businessLine.name}`,
        description: `Contenido relacionado con ${businessLine.description} para ${company.name}`,
        rationale: `Esta idea es relevante para la audiencia objetivo: ${aiParams.targetAudience}`,
        hashtags: [`#${company.industry.toLowerCase()}`, `#${businessLine.name.toLowerCase().replace(/\s+/g, '')}`, '#contenido', '#marketing', '#redessociales'],
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
