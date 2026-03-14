export interface Ingredient {
  name: string;
  amount: string;
  category: 'meat_dairy' | 'vegetables_fruits' | 'dry_goods' | 'other';
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  ingredients: Ingredient[];
  recipe: string;
}

export interface DayMealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

export type WorkoutType = 'A' | 'B' | 'C' | 'D';
export type DayActivity = WorkoutType | 'walk' | 'rest';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface Workout {
  id: WorkoutType;
  name: string;
  focus: string;
  color: string;
  tagClass: string;
  exercises: Exercise[];
}

export interface DayLog {
  date: string;
  breakfastDone: boolean;
  lunchDone: boolean;
  dinnerDone: boolean;
  snackDone: boolean;
  workoutDone: boolean;
  walkDone: boolean;
  extraCalories: number;
  weight?: number;
  notes: string;
  mealOverrides: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  shoppingChecked: Record<string, boolean>; // key: `${mealType}_${ingredientIndex}`
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  bought: boolean;
}

export type NavTab = 'today' | 'calendar' | 'progress';
