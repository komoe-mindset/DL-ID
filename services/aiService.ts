
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const findStudentsWithAI = async (query: string, students: Student[]): Promise<string[]> => {
  const ai = getAI();
  if (!ai) return [];

  // We send a subset of data to avoid token limits, though 400 records is fine for Gemini 3
  const studentContext = students.map(s => ({
    id: s.id,
    name: s.name,
    city: s.city
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the most likely Student IDs for this query: "${query}". 
      Return ONLY a JSON array of Student IDs (e.g. ["DL 1", "DL 2"]).
      
      Student List:
      ${JSON.stringify(studentContext)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};
