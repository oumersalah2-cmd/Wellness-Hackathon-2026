const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Healthy'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function calculateDailyCalories(
  age: number,
  gender: string,
  weightKg: number,
  heightCm: number,
  activityLevel: string
): number {
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375
  return Math.round(bmr * multiplier)
}

export function calculateProteinRequirement(weightKg: number, goal: string): number {
  const multipliers: Record<string, number> = {
    lose_weight: 1.6,
    build_muscle: 2.0,
    stay_fit: 1.4,
    eat_healthy: 1.2,
  }
  return Math.round(weightKg * (multipliers[goal] || 1.4))
}

export function calculateDailyWater(weightKg: number): number {
  return Math.round(weightKg * 35)
}

export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort().reverse()
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  return streak
}

// Rule-based Mode 1 fallback (no API key needed for demo)
export function getRuleBasedWorkout(meal: string, goal: string) {
  const lower = meal.toLowerCase()
  const isHeavy = /kitfo|tibs|doro|gored|dulet|chechebsa|butter/.test(lower)
  const isLight = /shiro|misir|gomen|ful|vegetable|fasting|yetsom/.test(lower)
  const isCarbHeavy = /injera|kinche|genfo|firfir|kategna/.test(lower)

  let calories = 450
  let protein = 25
  let carbs = 55
  let fat = 15
  let analysis = 'Balanced Ethiopian meal — good mix of carbs and protein.'
  let workoutType = 'Moderate Training'
  let exercises = [
    { name: 'Squats', sets: 3, reps: 15, duration_min: 0 },
    { name: 'Push-ups', sets: 3, reps: 12, duration_min: 0 },
    { name: 'Plank', sets: 3, reps: 1, duration_min: 1 },
  ]

  if (isHeavy) {
    calories = 620
    protein = 35
    carbs = 40
    fat = 28
    analysis = 'High-protein meal — ideal for strength training today.'
    workoutType = 'Strength Training — 45 min'
    exercises = [
      { name: 'Squats', sets: 3, reps: 15, duration_min: 0 },
      { name: 'Push-ups', sets: 3, reps: 12, duration_min: 0 },
      { name: 'Dumbbell rows', sets: 3, reps: 10, duration_min: 0 },
      { name: 'Plank', sets: 3, reps: 1, duration_min: 1 },
      { name: 'Lunges', sets: 3, reps: 12, duration_min: 0 },
    ]
  } else if (isLight) {
    calories = 280
    protein = 12
    carbs = 42
    fat = 6
    analysis = 'Light fasting-friendly meal — focus on mobility and moderate cardio.'
    workoutType = 'Light Cardio & Mobility — 30 min'
    exercises = [
      { name: 'Brisk walk', sets: 1, reps: 1, duration_min: 20 },
      { name: 'Stretching', sets: 1, reps: 1, duration_min: 10 },
    ]
  } else if (isCarbHeavy) {
    calories = 520
    protein = 18
    carbs = 78
    fat = 12
    analysis = 'Carb-heavy meal — great fuel for cardio or HIIT.'
    workoutType = 'Cardio Session — 40 min'
    exercises = [
      { name: 'Jogging in place', sets: 1, reps: 1, duration_min: 15 },
      { name: 'Jumping jacks', sets: 3, reps: 20, duration_min: 0 },
      { name: 'Mountain climbers', sets: 3, reps: 15, duration_min: 0 },
    ]
  }

  if (goal === 'lose_weight') {
    analysis += ' Focus on higher reps and shorter rest for fat burn.'
  }

  return {
    meal_analysis: {
      meal,
      calories,
      protein,
      carbs,
      fat,
      analysis,
    },
    workout: {
      type: workoutType,
      duration_min: isHeavy ? 45 : isLight ? 30 : 40,
      exercises,
      best_time: '1.5 hours after eating',
      water_glasses: 3,
    },
  }
}

export function getRuleBasedMeals(workout: string, fastingMode: boolean) {
  const lower = workout.toLowerCase()
  const isIntense = /run|5km|sprint|hiit|heavy|intense/.test(lower)
  const caloriesBurned = isIntense ? 395 : 220

  const meals = fastingMode
    ? {
        breakfast: { name: 'Ful with vegetables', portion: '1 cup', calories: 280, protein: 8, carbs: 35, fat: 8 },
        lunch: { name: 'Yetsom Beyaynetu', portion: '1 plate', calories: 350, protein: 14, carbs: 48, fat: 10 },
        dinner: { name: 'Shiro with gomen', portion: '1 plate', calories: 300, protein: 12, carbs: 38, fat: 8 },
      }
    : {
        breakfast: { name: 'Kinche with milk and honey', portion: '1 cup', calories: 320, protein: 10, carbs: 60, fat: 3 },
        lunch: { name: 'Injera with misir wot and eggs', portion: '1 plate', calories: 480, protein: 22, carbs: 55, fat: 14 },
        dinner: { name: 'Shiro with vegetables', portion: '1 plate', calories: 320, protein: 14, carbs: 35, fat: 12 },
      }

  return {
    calories_burned: caloriesBurned,
    meals,
    water_liters: isIntense ? 2.5 : 2.0,
    avoid: fastingMode ? ['meat', 'dairy', 'eggs'] : ['heavy fried foods', 'excess kitfo'],
  }
}

export function getRuleBasedWellness(profile: {
  gender: string
  age: number
  skin_type: string
  activity_level: string
}) {
  const oilyTips =
    profile.skin_type === 'oily'
      ? ['Use oil-free moisturizer', 'Niacinamide serum for pores', 'Avoid heavy shea butter on face']
      : ['Use hydrating moisturizer', 'Gentle cleanser twice daily', 'SPF 30+ every morning']

  return {
    skincare: {
      morning: [
        'Gentle foam cleanser',
        ...oilyTips.slice(0, 1),
        'SPF 30+ sunscreen (Addis UV is high year-round)',
      ],
      evening: [
        'Micellar water to remove sunscreen',
        'Salicylic acid cleanser (2-3x per week)',
        'Light moisturizer or facial oil',
      ],
    },
    supplements: [
      { name: 'Vitamin C', reason: 'Brightening and immunity', dosage: '500mg daily' },
      { name: 'Omega-3', reason: 'Reduces inflammation from workouts', dosage: '1000mg daily' },
      { name: 'Iron', reason: 'Important for active women', dosage: 'As directed' },
    ],
    natural_options: [
      { ingredient: 'Teff', benefits: 'High iron, great for skin health', how_to_use: 'Include in breakfast porridge' },
      { ingredient: 'Moringa', benefits: 'Rich in antioxidants', how_to_use: 'Add to smoothies or tea' },
      { ingredient: 'Flaxseed', benefits: 'Omega-3 source', how_to_use: 'Sprinkle on breakfast' },
    ],
    avoid: profile.skin_type === 'oily' ? ['Heavy shea butter on face', 'Comedogenic oils'] : ['Harsh alcohol toners'],
  }
}
