
import { GoogleGenAI } from "@google/genai";

export const getMotivationalMessage = async (progress: number, isHit: boolean) => {
  // Fix: Directly use process.env.API_KEY and initialize inside the function to avoid stale key issues
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = isHit 
    ? `O vendedor bateu a meta mensal! Escreva uma mensagem de celebração curta e corporativa em português.`
    : `O vendedor atingiu ${progress.toFixed(0)}% da meta. Escreva uma mensagem motivacional curta e encorajadora em português para inspirá-lo a continuar vendendo.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access .text as a property (getter), not a function, and ensure it's trimmed
    return response.text?.trim() || "Foco total no sucesso!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O sucesso é a soma de pequenos esforços repetidos dia após dia.";
  }
};
