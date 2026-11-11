import { NutritionData } from './types.js';

export function formatResult(data: NutritionData): string {
  if (!data.items || data.items.length === 0) return "На фото не вижу еды 🤷";

  const lines = data.items.map(
    (i) => `• ${i.name} (~${i.grams} г): ${i.calories} ккал | Б ${i.protein} / Ж ${i.fat} / У ${i.carbs}`
  );

  const t = data.total || { calories: 0, protein: 0, fat: 0, carbs: 0 };
  
  const result = [
    "🍽 Что на фото:",
    ...lines,
    "",
    `🔥 Итого: ~${t.calories} ккал`,
    `Белки ${t.protein} г · Жиры ${t.fat} г · Углеводы ${t.carbs} г`,
    `Точность: ${data.confidence}`,
    data.comment ? `\n💬 ${data.comment}` : "",
  ];

  return result.filter(Boolean).join("\n");
}