
import { GoogleGenAI, Type } from "@google/genai";

export const generateProfessionalContent = async (jobTitle: string, company: string) => {
  // Always use the process.env.API_KEY directly in the constructor
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بصفتك خبير تسويق، اقترح شعار (Tagline) قصير جداً واحترافي باللغة العربية لشركة تعمل في مجال ${company} ولموظف بمنصب ${jobTitle}. أريد 3 خيارات قصيرة جداً.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    // Access text property directly from GenerateContentResponse
    const responseText = response.text || "{}";
    return JSON.parse(responseText).suggestions;
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["التميز في الأداء", "حلول ذكية لأعمالك", "شريكك نحو النجاح"];
  }
};