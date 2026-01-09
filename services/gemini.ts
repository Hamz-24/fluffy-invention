
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  if (!process.env.API_KEY) return "API Key not configured.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are GuideX AI, a world-class personal mentor. You are empathetic, direct, and highly encouraging. Your goal is to help users stay consistent and motivated. Use a calm and futuristic tone.",
      },
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I encountered an error. Let's try again.";
  }
};

export async function* streamGeminiResponse(prompt: string) {
  if (!process.env.API_KEY) {
    yield "API Key not configured. Please check your environment.";
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are GuideX AI, a world-class personal mentor. Be concise but deeply impactful. Focus on psychology and productivity.",
      }
    });

    const result = await chat.sendMessageStream({ message: prompt });
    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      yield response.text || "";
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    yield "Error connecting to the mentor service.";
  }
}

export const generateVoiceCoaching = async (text: string) => {
  if (!process.env.API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with a calm, motivating tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const analyzeJournalEntry = async (entry: string) => {
  if (!process.env.API_KEY || !entry.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this journal entry for mood, a summary, and a sentiment score (0-100).
      Entry: "${entry}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              description: "The mood identified in the journal entry."
            },
            summary: {
              type: Type.STRING,
              description: "A concise summary of the entry."
            },
            sentiment: {
              type: Type.NUMBER,
              description: "Sentiment score ranging from 0 (negative) to 100 (positive)."
            }
          },
          required: ["mood", "summary", "sentiment"],
          propertyOrdering: ["mood", "summary", "sentiment"]
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};
