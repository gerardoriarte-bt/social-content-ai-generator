
import { GoogleGenAI, Type } from "@google/genai";
import type { AIParams, BusinessLine, ContentIdea, Company } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A catchy title for the social media post.",
      },
      description: {
        type: Type.STRING,
        description: "A detailed description of the content, including call to action.",
      },
      hashtags: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "An array of relevant hashtags without the '#' symbol.",
      },
      rationale: {
        type: Type.STRING,
        description: "A brief explanation of why this idea is suitable, linking it to the business context, objective, and AI parameters."
      }
    },
    required: ["title", "description", "hashtags", "rationale"],
  },
};

// Helper to add unique IDs and clean up data
const processIdeas = (ideas: any[]): ContentIdea[] => {
    return ideas.map((idea: Omit<ContentIdea, 'id'>) => ({
      ...idea,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      hashtags: idea.hashtags.map(h => h.replace(/#/g, ''))
    }));
}


export const generateContentIdeas = async (
  company: Company,
  businessLine: BusinessLine,
  params: AIParams,
  objective: string
): Promise<ContentIdea[]> => {
  try {
    const prompt = `
      You are an expert social media strategist.
      Your task is to generate 5 creative and engaging content ideas.

      The context is for the company "${company.name}", specifically for their business line "${businessLine.name}".
      Business Line Context: "${businessLine.context}".
      
      The main objective of this content campaign is: "${objective}".

      The ideas must be tailored for the following social network and content type:
      - Target Social Network: ${params.socialNetwork}.
      - Desired Content Type: ${params.contentType}.

      The generated content must adhere to these specific characteristics:
      - Tone: ${params.tone}
      - Intention: ${params.intention}
      - Evoked Emotion: ${params.emotion}
      - Character/Persona: ${params.character}

      For each idea, provide a 'rationale' that clearly explains why it aligns with the company, business line, objective, and all specified parameters.

      Provide the output in the specified JSON format. Ensure each idea is unique and directly relevant to the provided context.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const ideas = JSON.parse(jsonString);

    return processIdeas(ideas);

  } catch (error) {
    console.error("Error generating content ideas:", error);
    throw new Error("Failed to generate ideas from AI. Check the console for more details.");
  }
};

export const generateAlternativeIdeas = async (
  originalIdea: ContentIdea,
  company: Company,
  businessLine: BusinessLine,
  params: AIParams,
  objective: string
): Promise<ContentIdea[]> => {
    try {
        const prompt = `
        You are an expert social media strategist.
        Based on the following ORIGINAL idea:
        - Title: "${originalIdea.title}"
        - Description: "${originalIdea.description}"

        Generate 3 creative and distinct ALTERNATIVES. These alternatives should maintain the core concept of the original idea but explore different angles, hooks, or calls to action.

        The overall context for the company "${company.name}" and its business line "${businessLine.name}" remains the same:
        - Business Context: "${businessLine.context}"
        - Objective: "${objective}"
        - Social Network: ${params.socialNetwork}
        - Tone: ${params.tone}
        - Intention: ${params.intention}

        For each new alternative, provide a 'rationale' explaining how it offers a fresh perspective on the original idea while still aligning with the overall company and campaign goals.
        Provide the output in the specified JSON format.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
      
      const jsonString = response.text.trim();
      const ideas = JSON.parse(jsonString);
  
      return processIdeas(ideas);

    } catch (error) {
        console.error("Error generating alternative ideas:", error);
        throw new Error("Failed to generate alternatives from AI. Check console for details.");
    }
};