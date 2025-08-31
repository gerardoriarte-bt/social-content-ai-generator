
import { GoogleGenAI, Type } from "@google/genai";
import type { AIParams, BusinessLine, ContentIdea } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
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


export const generateContentIdeas = async (
  businessLine: BusinessLine,
  params: AIParams,
  objective: string
): Promise<ContentIdea[]> => {
  try {
    const prompt = `
      You are an expert social media strategist.
      Generate 5 creative and engaging content ideas for a business with the following context: "${businessLine.context}".
      
      The target social network is: ${params.socialNetwork}.
      The desired content type is: ${params.contentType}.
      The main objective of this content campaign is: "${objective}".

      The ideas must adhere to the following characteristics:
      - Tone: ${params.tone}
      - Intention: ${params.intention}
      - Evoked Emotion: ${params.emotion}
      - Character/Persona: ${params.character}

      For each idea, provide a 'rationale' explaining why it's a good fit based on the provided context, objective, and parameters.

      Provide the output in the specified JSON format. Each idea must be unique and tailored to the provided context.
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

    // Minor cleanup of hashtags
    return ideas.map((idea: ContentIdea) => ({
      ...idea,
      hashtags: idea.hashtags.map(h => h.replace(/#/g, ''))
    }));

  } catch (error) {
    console.error("Error generating content ideas:", error);
    throw new Error("Failed to generate ideas from AI. Check the console for more details.");
  }
};
