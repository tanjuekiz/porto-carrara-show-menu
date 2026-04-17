import { GoogleGenAI } from "@google/genai";

let aiClient: any = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in the settings.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function generateProductImage(productName: string, description: string, restaurantName: string): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Task: Create a professional, realistic, appetizing studio-lit food photograph of a "${productName}". 
    Details: ${description}. 
    Restaurant context: ${restaurantName}.
    
    Style criteria for a 5-star restaurant menu:
    - Ultra-realistic, high-resolution food photography.
    - Soft natural lighting with high-end studio appeal.
    - Authentic textures: crispy crusts, melting cheese, fresh herbs, or juicy perfectly seared meats.
    - Professional 45-degree close-up composition.
    - NO watermarks, NO text, NO artificial looking filters.
    - If it is a pizza, ensure a hand-tossed artisanal look with fresh basil and premium mozzarella.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Geen afbeelding gegenereerd door AI.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
}
