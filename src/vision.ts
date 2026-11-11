import { GoogleGenAI } from '@google/genai';
import { NutritionData } from './types.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY не найден в .env");
}

// Теперь apiKey гарантированно string
const ai = new GoogleGenAI({ apiKey });
const PROMPT = `Ты нутрициолог. На фото еда. Определи каждое блюдо/продукт,
примерную массу в граммах и пищевую ценность.
Верни ТОЛЬКО JSON без пояснений в формате:
{
  "items": [{"name": "...", "grams": 0, "calories": 0, "protein": 0, "fat": 0, "carbs": 0}],
  "total": {"calories": 0, "protein": 0, "fat": 0, "carbs": 0},
  "confidence": "low|medium|high",
  "comment": "короткая заметка на русском"
}
Если на фото нет еды, верни {"items": []}.`;

export async function analyzeFood(imageBuffer: Buffer, mediaType = "image/jpeg"): Promise<NutritionData> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mediaType,
        },
      },
      PROMPT,
    ],
    config: {
      responseMimeType: "application/json", 
    }
  });

  const text = response.text || "{}";
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
  } catch (e) {
    console.error("Ошибка парсинга JSON от Gemini:", text);
    return { items: [], total: { calories: 0, protein: 0, fat: 0, carbs: 0 }, confidence: "low" };
  }
}