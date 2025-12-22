
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const generateProfessionalContent = async (jobTitle: string, company: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
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

    return JSON.parse(response.text).suggestions;
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["التميز في الأداء", "حلول ذكية لأعمالك", "شريكك نحو النجاح"];
  }
};
