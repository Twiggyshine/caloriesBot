export interface FoodItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionData {
  items: FoodItem[];
  total: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  confidence: "low" | "medium" | "high";
  comment?: string;
}