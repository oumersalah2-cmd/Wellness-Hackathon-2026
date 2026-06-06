// User Profile Types
export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight_kg: number;
  height_cm: number;
  goal: 'lose_weight' | 'build_muscle' | 'stay_fit' | 'eat_healthy';
  skin_type: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active';
  fasting_mode: boolean;
  language: 'en' | 'am';
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  log_type: 'food' | 'workout' | 'water' | 'mood' | 'sleep';
  content: Record<string, any>;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg?: number;
  water_ml: number;
  mood_score?: number;
  sleep_hours?: number;
  streak_days: number;
}

export interface EthiopianFood {
  id: string;
  name_en: string;
  name_am: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_description: string;
  is_fasting_friendly: boolean;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image_url?: string;
}

// AI Response Types
export interface MealAnalysis {
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  analysis: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration_min: number;
}

export interface WorkoutPlan {
  type: string;
  duration_min: number;
  exercises: Exercise[];
  best_time: string;
  water_glasses: number;
}

export interface Mode1Response {
  meal_analysis: MealAnalysis;
  workout: WorkoutPlan;
}

export interface Mode2Response {
  calories_burned: number;
  meals: {
    breakfast: any;
    lunch: any;
    dinner: any;
  };
  water_liters: number;
  avoid: string[];
}

export interface Mode3Response {
  skincare: {
    morning: string[];
    evening: string[];
  };
  supplements: any[];
  natural_options: any[];
  avoid: string[];
}

export interface WeeklyReport {
  summary: string;
  highlight: string;
  improve: string;
  goals: string[];
}
