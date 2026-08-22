export type MealType = "breakfast" | "lunch" | "dinner";

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
};

export const MEAL_ICONS: Record<MealType, "sunny-outline" | "fast-food-outline" | "restaurant-outline"> = {
  breakfast: "sunny-outline",
  lunch: "fast-food-outline",
  dinner: "restaurant-outline",
};

export const INCLUDED_COLOR = "#16A34A";
export const NOT_INCLUDED_COLOR = "#DC2626";
export const WARNING_COLOR = "#EA580C";

export function mealStatusColor(included: boolean): string {
  return included ? INCLUDED_COLOR : NOT_INCLUDED_COLOR;
}
