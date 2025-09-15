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
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 3000, 5000]; // delays in milliseconds

  static async generateContentIdeas(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
    const { company, businessLine, aiParams, numberOfIdeas = 5 } = request;

    const prompt = this.buildPrompt(company, businessLine, aiParams, numberOfIdeas);

    // Intentar con retry logic
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`Gemini attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const ideas = this.parseIdeasFromResponse(text, numberOfIdeas);
        console.log(`Gemini success: Generated ${ideas.length} ideas`);
        return ideas;

      } catch (error: any) {
        console.error(`Gemini attempt ${attempt + 1} failed:`, error.message);
        
        // Si es el último intento, usar fallback
        if (attempt === this.MAX_RETRIES - 1) {
          console.log('All Gemini attempts failed, using fallback ideas');
          return this.generateFallbackIdeas(numberOfIdeas, company, businessLine, aiParams);
        }

        // Si es error 503 (overloaded) o 429 (rate limit), esperar más tiempo
        if (error.status === 503 || error.status === 429) {
          const delay = this.RETRY_DELAYS[attempt] * (attempt + 1); // delay escalado
          console.log(`Gemini overloaded, waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        } else {
          // Para otros errores, esperar menos tiempo
          await this.sleep(this.RETRY_DELAYS[attempt]);
        }
      }
    }

    // Esto no debería ejecutarse nunca, pero por seguridad
    return this.generateFallbackIdeas(numberOfIdeas, company, businessLine, aiParams);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static buildPrompt(
    company: Company,
    businessLine: BusinessLine,
    aiParams: AIParams,
    numberOfIdeas: number
  ): string {
    return `
Eres un experto en marketing digital y creación de contenido para redes sociales. 
Necesito que generes ${numberOfIdeas} ideas de contenido específicas para la siguiente empresa:

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
- Red Social: ${aiParams.socialNetwork}
- Formato de Contenido: ${aiParams.contentFormat}
- Objetivo: ${aiParams.objective}
- Enfoque: ${aiParams.focus || 'General'}

**INSTRUCCIONES ESPECÍFICAS:**

1. **PLATAFORMA (${aiParams.socialNetwork}):**
   ${this.getPlatformSpecificInstructions(aiParams.socialNetwork)}

2. **FORMATO (${aiParams.contentFormat}):**
   ${this.getFormatSpecificInstructions(aiParams.contentFormat)}

3. **OBJETIVO (${aiParams.objective}):**
   ${this.getObjectiveSpecificInstructions(aiParams.objective)}

4. **ENFOQUE:**
   ${aiParams.focus ? `Todas las ideas deben estar enfocadas en: "${aiParams.focus}"` : 'Enfoque general de la marca'}

**REGLAS GENERALES:**
- Genera ${numberOfIdeas} ideas únicas y creativas
- Cada idea debe ser específica para ${aiParams.socialNetwork} en formato ${aiParams.contentFormat}
- El contenido debe estar orientado al objetivo de ${aiParams.objective}
- Usa el tono ${aiParams.tone} y actúa como ${aiParams.characterType}
- Dirige el contenido a ${aiParams.targetAudience}
- Los hashtags deben ser específicos para ${aiParams.socialNetwork}

**FORMATO DE RESPUESTA:**
Responde en formato JSON válido con la siguiente estructura:
[
  {
    "title": "Título de la idea",
    "description": "Descripción detallada del contenido",
    "rationale": "Justificación de por qué esta idea funcionaría para el objetivo y formato específicos",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "platform": "${aiParams.socialNetwork}"
  }
]

Asegúrate de que la respuesta sea solo JSON válido, sin texto adicional antes o después.
`;
  }

  private static getPlatformSpecificInstructions(platform: string): string {
    switch (platform) {
      case 'Instagram':
        return 'Instagram es visual y estético. Enfócate en contenido visual atractivo, historias que generen engagement, y hashtags populares. El contenido debe ser inspirador y compartible.';
      case 'TikTok':
        return 'TikTok es para contenido corto y entretenido. Enfócate en tendencias, música, efectos visuales, y contenido que invite a la participación. El contenido debe ser viral y divertido.';
      case 'Facebook':
        return 'Facebook es para contenido más largo y detallado. Enfócate en historias, artículos, y contenido que genere conversaciones. El contenido debe ser informativo y social.';
      case 'LinkedIn':
        return 'LinkedIn es profesional y B2B. Enfócate en contenido educativo, casos de estudio, y networking. El contenido debe ser profesional, informativo y orientado a negocios.';
      case 'Twitter':
        return 'Twitter es para contenido corto y conversacional. Enfócate en tweets concisos, hilos informativos, y participación en conversaciones. El contenido debe ser relevante y oportuno.';
      case 'YouTube':
        return 'YouTube es para contenido largo y educativo. Enfócate en tutoriales, reviews, y contenido que proporcione valor duradero. El contenido debe ser detallado y bien estructurado.';
      default:
        return 'Genera contenido apropiado para la plataforma especificada.';
    }
  }

  private static getFormatSpecificInstructions(format: string): string {
    switch (format) {
      case 'Post':
        return 'Posts son imágenes con copy. El copy debe ser conciso (máximo 200 caracteres), atractivo, y complementar la imagen. Incluye un call-to-action claro.';
      case 'Story':
        return 'Stories son temporales y casuales. El copy debe ser muy corto (máximo 100 caracteres), informal, y usar elementos interactivos como encuestas o preguntas.';
      case 'Carrusel':
        return 'Carruseles son múltiples slides. Genera 3-5 slides con copy específico para cada uno. Cada slide debe tener un propósito claro y mantener la atención del usuario.';
      case 'Reels':
        return 'Reels son videos cortos (15-60 segundos). Genera guiones concisos con hook inicial, desarrollo, y call-to-action. Enfócate en tendencias y música popular.';
      case 'Video':
        return 'Videos son contenido largo (1-10 minutos). Genera guiones detallados con introducción, desarrollo, y conclusión. Incluye puntos clave y transiciones.';
      default:
        return 'Genera contenido apropiado para el formato especificado.';
    }
  }

  private static getObjectiveSpecificInstructions(objective: string): string {
    switch (objective) {
      case 'Awareness':
        return 'Awareness: Enfócate en dar a conocer la marca, productos o servicios. Usa contenido educativo, informativo y que genere reconocimiento de marca.';
      case 'Engagement':
        return 'Engagement: Enfócate en generar interacciones, comentarios y participación. Usa contenido interactivo, preguntas, encuestas y que invite a la conversación.';
      case 'Conversion':
        return 'Conversion: Enfócate en generar ventas y leads. Usa contenido promocional, ofertas, testimonios y call-to-actions claros para la compra.';
      case 'Traffic':
        return 'Traffic: Enfócate en dirigir tráfico al sitio web. Usa contenido que genere interés en visitar la página, leer más o descargar recursos.';
      case 'Education':
        return 'Education: Enfócate en educar e informar. Usa contenido tutorial, explicativo, y que proporcione valor educativo a la audiencia.';
      case 'Community':
        return 'Community: Enfócate en construir comunidad. Usa contenido que conecte con la audiencia, genere sentido de pertenencia y fomente la interacción entre miembros.';
      default:
        return 'Genera contenido apropiado para el objetivo especificado.';
    }
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
      
      // Fallback: generar ideas básicas (sin parámetros específicos)
      return this.generateBasicFallbackIdeas(expectedCount);
    }
  }

  private static generateBasicFallbackIdeas(count: number): ContentIdea[] {
    const ideas: ContentIdea[] = [];
    
    for (let i = 1; i <= count; i++) {
      ideas.push({
        title: `Idea de Contenido ${i}`,
        description: `Descripción de la idea de contenido ${i}. Este es un contenido de respaldo generado automáticamente cuando hay problemas con la IA.`,
        rationale: `Esta idea está diseñada para generar engagement y conectar con la audiencia objetivo. Es un contenido de respaldo que mantiene la calidad básica.`,
        hashtags: ['#contenido', '#marketing', '#socialmedia'],
        platform: 'Instagram'
      });
    }

    return ideas;
  }

  private static generateFallbackIdeas(
    count: number, 
    company: Company, 
    businessLine: BusinessLine, 
    aiParams: AIParams
  ): ContentIdea[] {
    const ideas: ContentIdea[] = [];
    
    // Ideas de fallback más específicas basadas en los parámetros
    const fallbackTemplates = [
      {
        title: `Conoce ${businessLine.name} - ${company.name}`,
        description: `Presenta ${businessLine.name} de ${company.name} de manera atractiva. Explica los beneficios principales y por qué es la mejor opción para ${aiParams.targetAudience}.`,
        rationale: `Este contenido genera awareness y educa a la audiencia sobre los servicios/productos de la empresa.`,
        hashtags: this.generateRelevantHashtags(company, businessLine, aiParams)
      },
      {
        title: `¿Sabías que ${company.name} puede ayudarte?`,
        description: `Comparte un dato interesante o estadística relevante sobre ${businessLine.name}. Conecta con el dolor de la audiencia y muestra cómo ${company.name} puede resolverlo.`,
        rationale: `Este contenido genera engagement y posiciona a la empresa como experta en su campo.`,
        hashtags: this.generateRelevantHashtags(company, businessLine, aiParams)
      },
      {
        title: `Testimonio: Cómo ${company.name} cambió mi experiencia`,
        description: `Comparte una historia de éxito o testimonio relacionado con ${businessLine.name}. Incluye resultados específicos y beneficios obtenidos.`,
        rationale: `Los testimonios generan confianza y credibilidad, especialmente efectivos para conversión.`,
        hashtags: this.generateRelevantHashtags(company, businessLine, aiParams)
      },
      {
        title: `Tips profesionales de ${company.name}`,
        description: `Comparte 3-5 consejos prácticos relacionados con ${businessLine.name}. Proporciona valor inmediato a la audiencia.`,
        rationale: `El contenido educativo genera engagement y posiciona a la marca como autoridad.`,
        hashtags: this.generateRelevantHashtags(company, businessLine, aiParams)
      },
      {
        title: `Behind the scenes: ${company.name}`,
        description: `Muestra el proceso interno de ${businessLine.name}. Da una mirada detrás de cámaras de cómo trabaja el equipo.`,
        rationale: `El contenido auténtico genera conexión emocional y humaniza la marca.`,
        hashtags: this.generateRelevantHashtags(company, businessLine, aiParams)
      }
    ];

    // Seleccionar ideas basadas en el objetivo
    const selectedTemplates = this.selectTemplatesByObjective(fallbackTemplates, aiParams.objective);
    
    for (let i = 0; i < count && i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i];
      ideas.push({
        title: template.title,
        description: template.description,
        rationale: template.rationale,
        hashtags: template.hashtags,
        platform: aiParams.socialNetwork
      });
    }

    // Si necesitamos más ideas, generar algunas genéricas
    while (ideas.length < count) {
      const genericIndex = ideas.length % fallbackTemplates.length;
      const template = fallbackTemplates[genericIndex];
      ideas.push({
        title: `${template.title} (${ideas.length + 1})`,
        description: template.description,
        rationale: template.rationale,
        hashtags: template.hashtags,
        platform: aiParams.socialNetwork
      });
    }

    return ideas;
  }

  private static selectTemplatesByObjective(templates: any[], objective: string): any[] {
    // Seleccionar templates más relevantes según el objetivo
    switch (objective) {
      case 'Awareness':
        return [templates[0], templates[4], templates[1]]; // Conoce, Behind scenes, Sabías que
      case 'Engagement':
        return [templates[3], templates[4], templates[1]]; // Tips, Behind scenes, Sabías que
      case 'Conversion':
        return [templates[2], templates[0], templates[3]]; // Testimonio, Conoce, Tips
      case 'Traffic':
        return [templates[3], templates[1], templates[0]]; // Tips, Sabías que, Conoce
      case 'Education':
        return [templates[3], templates[1], templates[0]]; // Tips, Sabías que, Conoce
      case 'Community':
        return [templates[4], templates[3], templates[2]]; // Behind scenes, Tips, Testimonio
      default:
        return templates;
    }
  }

  private static generateRelevantHashtags(company: Company, businessLine: BusinessLine, aiParams: AIParams): string[] {
    const hashtags = [];
    
    // Hashtags específicos de la empresa
    if (company.name) {
      hashtags.push(`#${company.name.replace(/\s+/g, '')}`);
    }
    
    // Hashtags de la industria
    if (company.industry) {
      hashtags.push(`#${company.industry.replace(/\s+/g, '')}`);
    }
    
    // Hashtags de la plataforma
    hashtags.push(`#${aiParams.socialNetwork}`);
    
    // Hashtags genéricos relevantes
    hashtags.push('#marketing', '#contenido', '#socialmedia');
    
    // Hashtags específicos del objetivo
    switch (aiParams.objective) {
      case 'Awareness':
        hashtags.push('#brandawareness', '#conocimiento');
        break;
      case 'Engagement':
        hashtags.push('#engagement', '#interaccion');
        break;
      case 'Conversion':
        hashtags.push('#ventas', '#conversion');
        break;
      case 'Traffic':
        hashtags.push('#trafico', '#visitas');
        break;
      case 'Education':
        hashtags.push('#educacion', '#aprendizaje');
        break;
      case 'Community':
        hashtags.push('#comunidad', '#conexion');
        break;
    }
    
    return hashtags.slice(0, 5); // Limitar a 5 hashtags
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
