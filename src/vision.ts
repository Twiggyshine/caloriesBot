import OpenAI from 'openai';
import type { NutritionData } from './types.js';

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY не найден в .env");

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://t.me/CalDietBot ', 
    'X-Title': 'CalSnap',
  },
});

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

export async function analyzeFood(imageBuffer: Buffer): Promise<NutritionData> {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-lite-preview-02-05:free', // Бесплатная модель с поддержкой картинок
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1, 
    });

    const text = response.choices[0]?.message?.content || "{}";
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
    
  } catch (error) {
    console.error("Ошибка OpenRouter:", error);
    return { items: [], total: { calories: 0, protein: 0, fat: 0, carbs: 0 }, confidence: "low" };
  }
}