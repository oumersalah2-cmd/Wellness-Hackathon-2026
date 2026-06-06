import Groq from 'groq-sdk';
import type {
  Mode1Response,
  Mode2Response,
  Mode3Response,
  WeeklyReport,
  Profile,
} from '@/types';
import { ethiopianFoods } from './foods';

const MODEL = 'llama-3.3-70b-versatile';

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_')) return null;
  return new Groq({ apiKey });
}

async function callGroq(prompt: string, maxTokens = 1024): Promise<string> {
  const groq = getGroqClient();
  if (!groq) throw new Error('Groq API key not configured');

  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Empty response');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
}

// Mode 1: Food → Workout
export async function generateMode1Recommendations(
  profile: Profile,
  meal: string,
  language: 'en' | 'am' = 'en'
): Promise<Mode1Response> {
  const groq = getGroqClient();
  if (groq) {
    const prompt = `You are FitEthio's nutrition & fitness AI for Ethiopian users.
User profile:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight_kg}kg, Height: ${profile.height_cm}cm
- Goal: ${profile.goal}
- Activity level: ${profile.activity_level}
- Fasting mode: ${profile.fasting_mode}

User plans to eat: "${meal}"

Analyze the meal's macros (estimate calories, protein, carbs, fat based on Ethiopian cuisine knowledge).
Then recommend a specific workout plan for today - include exercise names, sets, reps, duration, and best time to work out after eating.
${profile.fasting_mode ? 'Since fasting mode is active, adapt recommendations accordingly.' : ''}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "meal_analysis": {
    "meal": "meal name",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "analysis": "brief analysis"
  },
  "workout": {
    "type": "workout type",
    "duration_min": number,
    "exercises": [
      {
        "name": "exercise name",
        "sets": number,
        "reps": number,
        "duration_min": number,
        "youtube_query": "URL encoded search query for a YouTube tutorial (e.g. 'how+to+do+squats+properly')"
      }
    ],
    "best_time": "suggested time",
    "water_glasses": number
  }
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Mode 1), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  const mealLower = meal.toLowerCase();
  let foundFood = ethiopianFoods.find(
    f => f.name_en.toLowerCase().includes(mealLower) || f.name_am.includes(meal)
  );
  if (!foundFood) {
    const words = mealLower.split(/\s+/);
    for (const word of words) {
      if (word.length > 2) {
        foundFood = ethiopianFoods.find(
          f => f.name_en.toLowerCase().includes(word)
        );
        if (foundFood) break;
      }
    }
  }

  const mealName = foundFood ? (language === 'am' ? foundFood.name_am : foundFood.name_en) : meal;
  const calories = foundFood ? foundFood.calories_per_serving : 320;
  const protein = foundFood ? Number(foundFood.protein_g) : 10;
  const carbs = foundFood ? Number(foundFood.carbs_g) : 45;
  const fat = foundFood ? Number(foundFood.fat_g) : 8;

  let analysisEn = `This meal is moderate in calories (${calories} kcal) and provides a good balance of carbs (${carbs}g) and protein (${protein}g) to fuel your physical activities.`;
  let analysisAm = `ይህ ምግብ መካከለኛ ካሎሪ (${calories} kcal) ያለው ሲሆን ለሰውነትዎ እንቅስቃሴ የሚሆን የካርቦሃይድሬት (${carbs}g) እና የፕሮቲን (${protein}g) መጠን ያቀርባል።`;
  
  if (calories > 450) {
    analysisEn = `This is a high-calorie, nutrient-rich meal (${calories} kcal) with substantial protein (${protein}g). Excellent for muscle recovery or sustained energy, but requires a higher-intensity workout to balance your calorie intake.`;
    analysisAm = `ይህ ከፍተኛ ካሎሪ (${calories} kcal) እና ከፍተኛ ፕሮቲን (${protein}g) ያለው ምግብ ነው። ለጡንቻ ጥንካሬ ወይም ለቀጣይ ጉልበት በጣም ጥሩ ነው፤ ነገር ግን ካሎሪውን ለማቃጠል ከፍተኛ እንቅስቃሴ ያስፈልገዋል።`;
  } else if (calories < 200) {
    analysisEn = `This is a light, low-calorie meal (${calories} kcal). Good for weight loss, but provides lower energy. Keep your workout moderate or light today.`;
    analysisAm = `ይህ ቀላል እና ዝቅተኛ ካሎሪ (${calories} kcal) ያለው ምግብ ነው። ክብደት ለመቀነስ ጥሩ ቢሆንም ዝቅተኛ ጉልበት ይሰጣል። ዛሬ እንቅስቃሴዎን ቀለል ያድርጉት።`;
  }

  const analysis = language === 'am' ? analysisAm : analysisEn;

  let workoutType = 'Full Body Strength';
  let duration = 30;
  let exercises = [
    { name: 'Squats', sets: 3, reps: 12, duration_min: 5, youtube_query: 'how+to+do+squats+properly' },
    { name: 'Push-ups', sets: 3, reps: 10, duration_min: 5, youtube_query: 'how+to+do+pushups+for+beginners' },
    { name: 'Lunges', sets: 3, reps: 10, duration_min: 5, youtube_query: 'how+to+do+lunges' },
    { name: 'Plank', sets: 3, reps: 60, duration_min: 3, youtube_query: 'how+to+plank+correctly' }
  ];
  let bestTime = 'Late afternoon';
  let waterGlasses = 3;

  if (profile.fasting_mode) {
    workoutType = 'Gentle Recovery';
    duration = 20;
    exercises = [
      { name: 'Stretching', sets: 1, reps: 1, duration_min: 8, youtube_query: 'full+body+stretching+routine' },
      { name: 'Walking', sets: 1, reps: 1, duration_min: 10, youtube_query: 'brisk+walking+form' },
      { name: 'Yoga', sets: 1, reps: 1, duration_min: 5, youtube_query: 'beginner+yoga+routine' }
    ];
    bestTime = 'Evening after break-fast';
    waterGlasses = 4;
  } else if (profile.goal === 'lose_weight') {
    workoutType = 'HIIT Cardio';
    duration = 40;
    exercises = [
      { name: 'Jumping Jacks', sets: 4, reps: 20, duration_min: 8, youtube_query: 'how+to+do+jumping+jacks' },
      { name: 'High Knees', sets: 4, reps: 30, duration_min: 8, youtube_query: 'how+to+do+high+knees' },
      { name: 'Squats', sets: 3, reps: 15, duration_min: 6, youtube_query: 'bodyweight+squats+tutorial' },
      { name: 'Burpees', sets: 3, reps: 8, duration_min: 5, youtube_query: 'how+to+do+burpees' }
    ];
    bestTime = 'Morning before breakfast';
    waterGlasses = 4;
  } else if (profile.goal === 'build_muscle') {
    workoutType = 'Hypertrophy Strength';
    duration = 45;
    exercises = [
      { name: 'Weighted Squats', sets: 4, reps: 10, duration_min: 10, youtube_query: 'how+to+do+weighted+squats' },
      { name: 'Push-ups', sets: 4, reps: 12, duration_min: 8, youtube_query: 'pushup+variations+for+muscle' },
      { name: 'Lunges', sets: 3, reps: 12, duration_min: 8, youtube_query: 'walking+lunges+tutorial' },
      { name: 'Plank Hold', sets: 3, reps: 60, duration_min: 4, youtube_query: 'perfect+plank+form' }
    ];
    bestTime = 'Late afternoon';
    waterGlasses = 3;
  }

  if (language === 'am') {
    const translationMap: Record<string, string> = {
      'Squats': 'ስኳት (የጉልበት ማጠናከሪያ)',
      'Push-ups': 'ፑሽ አፕ (የደረት ማጠናከሪያ)',
      'Lunges': 'ለንጅ (የጭን ማጠናከሪያ)',
      'Plank': 'ፕላንክ (የሆድ ማጠናከሪያ)',
      'Stretching': 'የጡንቻ መዘርጋት (ቀሊል እንቅስቃሴ)',
      'Walking': 'የእግር ጉዞ',
      'Yoga': 'ዮጋ እና መረጋጋት',
      'Jumping Jacks': 'ጃምፒንግ ጃክስ (ፈጣን ዝላይ)',
      'High Knees': 'ከፍ ያለ ጉልበት ሩጫ',
      'Burpees': 'በርፒስ (ሙሉ ሰውነት እንቅስቃሴ)',
      'Weighted Squats': 'ክብደት ያለው ስኳት',
      'Plank Hold': 'ፕላንክ መያዝ',
      'Full Body Strength': 'ሙሉ የሰውነት ጥንካሬ',
      'Gentle Recovery': 'ቀሊል ማገገሚያ እና መዘርጋት',
      'HIIT Cardio': 'ከፍተኛ ጥንካሬ ካርዲዮ (ስብ ማቃጠያ)',
      'Hypertrophy Strength': 'የጡንቻ ማሳደጊያ ጥንካሬ',
      'Late afternoon': 'ከሰዓት በኋላ (ከምግብ 2 ሰዓት ቆይቶ)',
      'Evening after break-fast': 'ማታ ጾም ከተፈታ በኋላ',
      'Morning before breakfast': 'ጥዋት ከቁርስ በፊት'
    };

    workoutType = translationMap[workoutType] || workoutType;
    bestTime = translationMap[bestTime] || bestTime;
    exercises = exercises.map(ex => ({
      ...ex,
      name: translationMap[ex.name] || ex.name
    }));
  }

  return {
    meal_analysis: {
      meal: mealName,
      calories,
      protein,
      carbs,
      fat,
      analysis
    },
    workout: {
      type: workoutType,
      duration_min: duration,
      exercises,
      best_time: bestTime,
      water_glasses: waterGlasses
    }
  };
}

// Mode 2: Workout → Food
export async function generateMode2Recommendations(
  profile: Profile,
  workoutDescription: string,
  language: 'en' | 'am' = 'en'
): Promise<Mode2Response> {
  const groq = getGroqClient();
  if (groq) {
    const prompt = `You are FitEthio's recovery nutrition AI for Ethiopian users.
User profile:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight_kg}kg, Height: ${profile.height_cm}cm
- Goal: ${profile.goal}
- Activity level: ${profile.activity_level}

Workout completed: "${workoutDescription}"

Estimate calories burned from this workout. Do NOT hallucinate random sports. Only assess the provided workout.
Then, recommend specific REAL Ethiopian meals ONLY (from: injera, tibs, shiro, misir wot, kinche, ful, kategna, firfir, gored gored, doro wot, ayib, teff porridge, sambusa, chechebsa, genfo, enkulal firfir, dulet, derek tibs) for breakfast, lunch, and dinner today to fuel recovery.
${profile.fasting_mode ? 'All suggestions MUST be vegan/fasting-friendly (no meat/dairy). Use: yetsom beyaynetu, misir wot, shiro, ful, vegetables.' : ''}
Include accurate portions, macros, and reasoning. Never recommend non-Ethiopian foods like pasta, burgers, or generic salads.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "calories_burned": number,
  "meals": {
    "breakfast": {"name": "meal", "portion": "size", "calories": number, "protein": number, "carbs": number, "fat": number},
    "lunch": {"name": "meal", "portion": "size", "calories": number, "protein": number, "carbs": number, "fat": number},
    "dinner": {"name": "meal", "portion": "size", "calories": number, "protein": number, "carbs": number, "fat": number}
  },
  "water_liters": number,
  "avoid": ["food1", "food2"]
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Mode 2), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  const workoutLower = workoutDescription.toLowerCase();
  let caloriesBurned = 250;
  if (workoutLower.includes('run') || workoutLower.includes('jog') || workoutLower.includes('cardio') || workoutLower.includes('hiit')) {
    caloriesBurned = 420;
  } else if (workoutLower.includes('weight') || workoutLower.includes('strength') || workoutLower.includes('gym') || workoutLower.includes('squat')) {
    caloriesBurned = 350;
  } else if (workoutLower.includes('walk') || workoutLower.includes('stretch') || workoutLower.includes('yoga')) {
    caloriesBurned = 150;
  }

  const availableFoods = ethiopianFoods.filter(f => !profile.fasting_mode || f.is_fasting_friendly);
  const breakfasts = availableFoods.filter(f => f.category === 'breakfast');
  const lunchDinners = availableFoods.filter(f => f.category === 'lunch');

  const bf = breakfasts.length > 0 ? breakfasts[Math.floor(Math.random() * breakfasts.length)] : ethiopianFoods[0];
  const ln = lunchDinners.length > 0 ? lunchDinners[0] : ethiopianFoods[1];
  const dn = lunchDinners.length > 1 ? lunchDinners[1] : (lunchDinners.length > 0 ? lunchDinners[0] : ethiopianFoods[1]);

  const meals = {
    breakfast: {
      name: language === 'am' ? bf.name_am : bf.name_en,
      portion: language === 'am' ? '1 መካከለኛ ሰህን' : '1 medium plate',
      calories: bf.calories_per_serving,
      protein: Number(bf.protein_g),
      carbs: Number(bf.carbs_g),
      fat: Number(bf.fat_g)
    },
    lunch: {
      name: language === 'am' ? ln.name_am : ln.name_en,
      portion: language === 'am' ? '1 መካከለኛ ሰህን ከእንጀራ ጋር' : '1 plate with 1 injera',
      calories: ln.calories_per_serving,
      protein: Number(ln.protein_g),
      carbs: Number(ln.carbs_g),
      fat: Number(ln.fat_g)
    },
    dinner: {
      name: language === 'am' ? dn.name_am : dn.name_en,
      portion: language === 'am' ? '1 መካከለኛ ሰህን' : '1 medium portion',
      calories: dn.calories_per_serving,
      protein: Number(dn.protein_g),
      carbs: Number(dn.carbs_g),
      fat: Number(dn.fat_g)
    }
  };

  const waterLiters = caloriesBurned > 300 ? 2.5 : 2.0;
  const avoid = profile.fasting_mode
    ? (language === 'am' ? ['ሥጋ እና የእንስሳት ተዋጽኦዎችን', 'በጣም ጣፋጭ ምግቦችን'] : ['Meat, dairy, and animal products', 'Highly processed sugary foods'])
    : (language === 'am' ? ['ዘይት የበዛባቸው የተጠበሱ ምግቦችን', 'ካፌይን ማምሻውን መውሰድ'] : ['Deep-fried foods', 'Excessive caffeine late in the day']);

  return {
    calories_burned: caloriesBurned,
    meals,
    water_liters: waterLiters,
    avoid
  };
}

// Mode 3: Skincare & Wellness
export async function generateMode3Recommendations(
  profile: Profile,
  language: 'en' | 'am' = 'en'
): Promise<Mode3Response> {
  const groq = getGroqClient();
  if (groq) {
    const prompt = `You are FitEthio's holistic wellness AI for Ethiopian users.
User profile:
- Gender: ${profile.gender}, Age: ${profile.age}
- Skin type: ${profile.skin_type}
- Activity level: ${profile.activity_level}
- Location: Ethiopia (high UV year-round, especially Addis Ababa)

Generate a personalized skincare routine (morning + evening steps), 3 supplement suggestions with reasons, and 3 natural Ethiopian ingredient options (teff, moringa, flaxseed, honey, neem, eucalyptus) that match their profile.
Be specific about what to avoid based on their skin type.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "skincare": {
    "morning": ["step1", "step2", "step3"],
    "evening": ["step1", "step2", "step3"]
  },
  "supplements": [
    {"name": "supplement", "reason": "why", "dosage": "suggested amount"},
    {"name": "supplement", "reason": "why", "dosage": "suggested amount"},
    {"name": "supplement", "reason": "why", "dosage": "suggested amount"}
  ],
  "natural_options": [
    {"ingredient": "name", "benefits": "what it does", "how_to_use": "instructions"},
    {"ingredient": "name", "benefits": "what it does", "how_to_use": "instructions"},
    {"ingredient": "name", "benefits": "what it does", "how_to_use": "instructions"}
  ],
  "avoid": ["product/ingredient1", "product/ingredient2"]
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Mode 3), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  const skinType = profile.skin_type || 'normal';

  let skincareMorning = ['Wash with cool water', 'Apply hydrating toner', 'Apply sunscreen SPF 50+ (Essential for Ethiopian sun)'];
  let skincareEvening = ['Double cleanse with a gentle cleanser', 'Apply niacinamide or skin treatment', 'Apply a nourishing moisturizer'];
  let avoid = ['Harsh physical scrubs', 'High concentration acids without patch testing'];
  let supplements = [
    { name: 'Vitamin D3', reason: 'To support immune health and skin barrier, despite sunny weather', dosage: '1000 IU daily' },
    { name: 'Zinc', reason: 'Helps control sebum production and reduces inflammation', dosage: '15 mg daily' },
    { name: 'Omega-3 (Fish oil or Flaxseed oil)', reason: 'Hydrates the skin from within and supports heart health', dosage: '1000 mg daily' }
  ];
  let naturalOptions = [
    { ingredient: 'Ethiopian Honey (Mar)', benefits: 'Natural antibacterial and humectant, excellent for wound healing and hydration', how_to_use: 'Apply as a 15-minute face mask twice a week' },
    { ingredient: 'Moringa Leaf Extract', benefits: 'Packed with vitamins A, C, and E, rich in antioxidants that protect skin from high UV rays', how_to_use: 'Consume as tea or mix powder in water' },
    { ingredient: 'Flaxseed (Telba)', benefits: 'High in Omega-3 fatty acids, provides moisture to the skin and improves elasticity', how_to_use: 'Roast, grind, and mix 1 tablespoon in warm water daily' }
  ];

  if (skinType === 'oily') {
    skincareMorning = ['Cleanse with a gentle foaming salicylic acid cleanser', 'Apply oil-free moisturizer', 'Apply matte-finish sunscreen SPF 50+'];
    skincareEvening = ['Double cleanse to remove sebum and dirt', 'Apply salicylic acid toner', 'Apply light gel-based moisturizer'];
    avoid = ['Heavy oils (like coconut oil on face)', 'Over-cleansing (causes rebound oiliness)'];
  } else if (skinType === 'dry') {
    skincareMorning = ['Wash face with water only or non-foaming hydrating cleanser', 'Apply hyaluronic acid serum on damp skin', 'Apply cream-based sunscreen SPF 50+'];
    skincareEvening = ['Cleanse with a gentle lotion cleanser', 'Apply ceramides moisturizer', 'Seal with 2-3 drops of rosehip oil'];
    avoid = ['Alcohol-based toners', 'Hot water washes'];
  } else if (skinType === 'sensitive') {
    skincareMorning = ['Rinse with lukewarm water', 'Apply centella asiatica calming serum', 'Apply mineral sunscreen SPF 50+'];
    skincareEvening = ['Cleanse with a soap-free, fragrance-free cleanser', 'Apply barrier repair cream', 'Avoid active ingredients for now'];
    avoid = ['Fragrances and essential oils', 'Glycolic acid or strong retinoids'];
  }

  if (language === 'am') {
    const amSkincareMorning = skincareMorning.map(step => {
      if (step.includes('sunscreen') || step.includes('SPF')) return 'የፀሐይ መከላከያ ቅባት (SPF 50+) ይቀቡ (ለኢትዮጵያ ፀሐይ በጣም አስፈላጊ ነው)';
      if (step.includes('Wash') || step.includes('Rinse')) return 'ፊትን በቀዝቃዛ ወይም ለብ ባለ ውሃ መታጠብ';
      if (step.includes('toner')) return 'ፊትን የሚያረጥብ ቶነር መጠቀም';
      if (step.includes('moisturizer')) return 'ቀላል እርጥበት ሰጪ ቅባት (Moisturizer) መጠቀም';
      if (step.includes('hyaluronic')) return 'ፊትን የሚያረጥብ ሃያሉሮኒክ አሲድ ሴረም መጠቀም';
      return step;
    });

    const amSkincareEvening = skincareEvening.map(step => {
      if (step.includes('Cleanse') || step.includes('cleanse')) return 'ፊትን በቀላል ማጽጃ (Cleanser) በደንብ መታጠብ';
      if (step.includes('moisturizer')) return 'የሌሊት እርጥበት ሰጪ ቅባት መጠቀም';
      if (step.includes('niacinamide') || step.includes('treatment')) return 'ለፊት ቆዳ ጠቃሚ የሆነ ሴረም ወይም የቆዳ ህክምና መጠቀም';
      if (step.includes('rosehip')) return '2-3 ጠብታ የሮዝሂፕ ዘይት መጠቀም';
      return step;
    });

    const amAvoid = avoid.map(av => {
      if (av.includes('scrubs')) return 'ሸካራ የፊት መፋቂያዎችን (Scrubs)';
      if (av.includes('acids')) return 'ያለ ባለሙያ ምክር ጠንካራ አሲዶችን መጠቀም';
      if (av.includes('oils')) return 'ከባድ የሆኑ የፊት ዘይቶችን (እንደ ኮኮናት ዘይት)';
      if (av.includes('alcohol')) return 'አልኮሆል ያለባቸውን የፊት ምርቶች';
      if (av.includes('Fragrances')) return 'ሽቶ ወይም ጠንካራ ጠረን ያላቸውን የፊት ክሬሞች';
      return av;
    });

    const amSupplements = [
      { name: 'ቪታሚን ዲ3 (Vitamin D3)', reason: 'ምንም እንኳን ፀሐያማ ቢሆንም፣ የሰውነትን በሽታ የመከላከል አቅም እና የቆዳ ጥንካሬን ይረዳል', dosage: '1000 IU በየቀኑ' },
      { name: 'ዚንክ (Zinc)', reason: 'የፊት ቅባትን ለመቆጣጠር እና የቆዳ መቆጣትን/ብጉርን ለመቀነስ ይረዳል', dosage: '15 mg በየቀኑ' },
      { name: 'ኦሜጋ-3 (Omega-3)', reason: 'ቆዳን ከውስጥ እንዲረطب ያደርጋል እንዲሁም ለልብ ጤንነት ጠቃሚ ነው', dosage: '1000 mg በየቀኑ' }
    ];

    const amNaturalOptions = [
      { ingredient: 'የኢትዮጵያ ንጹህ ማር', benefits: 'ተፈጥሯዊ ፀረ-ባክቴሪያ እና ቆዳን የሚያረጥብ፣ ለቆዳ ጤንነትና ውበት በጣም ተመራጭ ነው', how_to_use: 'በሳምንት ሁለት ጊዜ ለ15 ደቂቃ ፊት ላይ ቀብቶ መታጠብ' },
      { ingredient: 'የሞሪንጋ ቅጠል (Moringa)', benefits: 'በቪታሚን ኤ፣ ሲ እና ኢ የበለፀገ ሲሆን ቆዳን ከፀሐይ ጨረር መከላከያነት ያገለግላል', how_to_use: 'በሻይ መልክ መጠጣት ወይም ዱቄቱን በውሃ በጥብጦ መጠቀም' },
      { ingredient: 'ተልባ (Flaxseed)', benefits: 'በኦሜጋ-3 የበለፀገ በመሆኑ ቆዳን ያለሰልሳል፣ የመለጠጥ አቅሙን ያሳድጋል', how_to_use: 'ቆልቶ በመፍጨት 1 የሾርባ ማንኪያ በየቀኑ በለብ ባለ ውሃ ጠዋት መጠጣት' }
    ];

    return {
      skincare: {
        morning: amSkincareMorning,
        evening: amSkincareEvening
      },
      supplements: amSupplements,
      natural_options: amNaturalOptions,
      avoid: amAvoid
    };
  }

  return {
    skincare: {
      morning: skincareMorning,
      evening: skincareEvening
    },
    supplements,
    natural_options: naturalOptions,
    avoid
  };
}

// Weekly Report Generation
export async function generateWeeklyReport(
  profile: Profile,
  weeklyStats: {
    avg_calories: number;
    workouts_completed: number;
    avg_water: number;
    avg_mood: number;
    avg_sleep: number;
    weight_change: number;
  },
  language: 'en' | 'am' = 'en'
): Promise<WeeklyReport> {
  const groq = getGroqClient();
  if (groq) {
    const prompt = `Generate a friendly weekly wellness report for ${profile.name}.
Weekly data:
- Average calories: ${weeklyStats.avg_calories}
- Workouts completed: ${weeklyStats.workouts_completed}
- Average water intake: ${weeklyStats.avg_water}L
- Average mood score (1-5): ${weeklyStats.avg_mood}
- Average sleep: ${weeklyStats.avg_sleep} hours
- Weight change: ${weeklyStats.weight_change > 0 ? '+' : ''}${weeklyStats.weight_change}kg
User goal: ${profile.goal}

Write in second person with warm, encouraging tone. Include:
1. What they did well
2. One area to improve
3. Three specific goals for next week
Use Ethiopian cultural context where relevant.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "summary": "overall summary",
  "highlight": "what they did well",
  "improve": "area to improve",
  "goals": ["goal1", "goal2", "goal3"]
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt, 512));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Weekly Report), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  let summary = `Great job this week, ${profile.name}! You're making progress toward your goal to ${profile.goal.replace('_', ' ')}. Keep showing up!`;
  let highlight = `You completed ${weeklyStats.workouts_completed} workouts and kept a solid routine.`;
  let improve = `Your average sleep was ${weeklyStats.avg_sleep} hours. Try to get closer to 7-8 hours next week.`;
  let goals = [
    `Complete at least 3 workouts next week`,
    `Drink an average of ${weeklyStats.avg_water > 2 ? '2.5' : '2.0'} liters of water daily`,
    `Try to sleep by 10:00 PM for better recovery`
  ];

  if (language === 'am') {
    summary = `ድንቅ ሳምንት ነበር ${profile.name}! ክብደትዎን ለመቀነስ/ለመጠበቅ ያቀዱትን ግብ ለማሳካት ትክክለኛ መንገድ ላይ ነዎት። በርቱ!`;
    highlight = `በዚህ ሳምንት ${weeklyStats.workouts_completed} የስፖርት እንቅስቃሴዎችን በማድረግ ጠንካራ ዝግጁነት አሳይተዋል።`;
    improve = `አማካኝ የእንቅልፍ ሰዓትዎ ${weeklyStats.avg_sleep} ሰዓት ነበር። በሚቀጥለው ሳምንት ይህንን ወደ 7-8 ሰዓት ለማሳደግ ይሞክሩ።`;
    goals = [
      `በሚቀጥለው ሳምንት ቢያንስ 3 የስፖርት እንቅስቃሴዎችን ማጠናቀቅ`,
      `በቀን በአማካይ ${weeklyStats.avg_water > 2 ? '2.5' : '2.0'} ሊትር ውሃ መጠጣት`,
      `ለተሻለ ማገገም ማታ በ4:00 ሰዓት ለመተኛት መሞከር`
    ];
  }

  return {
    summary,
    highlight,
    improve,
    goals
  };
}

// Sleep recommendations
export async function generateSleepRecommendations(
  profile: Profile,
  bedtimeGoal: string,
  stressLevel: number,
  language: 'en' | 'am' = 'en'
): Promise<any> {
  const groq = getGroqClient();
  if (groq) {
    const prompt = `You are FitEthio's sleep wellness coach.
User: ${profile.name}, Age: ${profile.age}
Bedtime goal: ${bedtimeGoal}
Current stress level (1-10): ${stressLevel}

Provide:
1. Ideal sleep duration recommendation
2. A 3-step bedtime routine (using natural/traditional methods when relevant)
3. Recommended wake-up time
4. 2-3 practical tips for better sleep quality

Respond ONLY with valid JSON (no markdown):
{
  "ideal_sleep_hours": number,
  "bedtime_routine": ["step1", "step2", "step3"],
  "wake_up_time": "HH:MM AM/PM",
  "tips": ["tip1", "tip2", "tip3"]
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt, 512));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Sleep Recommendations), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  const idealHours = stressLevel > 7 ? 8.5 : 7.5;
  
  let wakeUpTime = '06:00 AM';
  if (bedtimeGoal.includes('10')) wakeUpTime = '05:30 AM';
  else if (bedtimeGoal.includes('11')) wakeUpTime = '06:30 AM';
  else if (bedtimeGoal.includes('12')) wakeUpTime = '07:30 AM';

  let routine = [
    'Prepare a warm cup of herbal tea (Chamomile or Eucalyptus/Tena Adam)',
    'Turn off all digital screens 30 minutes before bed',
    'Do a 5-minute deep breathing exercise to release muscle tension'
  ];

  let tips = [
    'Avoid heavy traditional meals like Tibs or Doro Wot within 3 hours of sleep',
    'Keep your sleeping room cool and dark',
    'Try to maintain the same sleep and wake-up schedule, even on weekends'
  ];

  if (language === 'am') {
    wakeUpTime = wakeUpTime.replace('AM', 'ጥዋት').replace('PM', 'ማታ');
    routine = [
      'ለብ ያለ የዕፅዋት ሻይ (እንደ ጤና አዳም ወይም ካሞሚል) ማዘጋጀትና መጠጣት',
      'ከመተኛትዎ 30 ደቂቃ በፊት ስልክ እና ኮምፒተር ማጥፋት',
      'የጡንቻን ውጥረት ለመቀነስ ለ5 ደቂቃ ያህል ረጅም ትንፋሽ መውሰድና መተንፈስ'
    ];
    tips = [
      'ከመተኛትዎ 3 ሰዓት በፊት እንደ ጢብስ ወይም ዶሮ ወጥ ያሉ ከባድ ምግቦችን አለመመገብ',
      'የመኝታ ክፍልዎን ቀዝቃዛ እና ጨለማ ማድረግ',
      'ቅዳሜና እሁድን ጨምሮ ሁልጊዜ በተመሳሳይ ሰዓት መተኛት እና መነሳት'
    ];
  }

  return {
    ideal_sleep_hours: idealHours,
    bedtime_routine: routine,
    wake_up_time: wakeUpTime,
    tips
  };
}

// Mental wellness - mood-based tips
export async function generateMoodTips(
  profile: Profile,
  moodScore: number,
  language: 'en' | 'am' = 'en'
): Promise<any> {
  const groq = getGroqClient();
  if (groq) {
    const moodLabel =
      moodScore === 1
        ? 'very sad'
        : moodScore === 2
          ? 'sad'
          : moodScore === 3
            ? 'neutral'
            : moodScore === 4
              ? 'good'
              : 'excellent';

    const prompt = `You are FitEthio's mental wellness advisor.
User: ${profile.name}, Age: ${profile.age}
Current mood: ${moodLabel} (${moodScore}/5)

Provide 3 practical, actionable tips to improve emotional wellness. ${moodScore <= 2 ? 'Include grounding/breathing techniques.' : ''}
Reference Ethiopian culture, spirituality, or community where appropriate.

Respond ONLY with valid JSON (no markdown):
{
  "title": "brief title",
  "tips": ["tip1", "tip2", "tip3"],
  "breathing_exercise": ${moodScore <= 2 ? '{"technique": "technique name", "steps": ["step1", "step2", "step3"]}' : 'null'}
}

Respond in ${language === 'am' ? 'Amharic' : 'English'}.`;

    try {
      const parsed = JSON.parse(await callGroq(prompt, 512));
      return parsed;
    } catch (error) {
      console.error('Groq API Error (Mood Tips), falling back to mock:', error);
    }
  }

  // MOCK FALLBACK
  let title = 'Wellness Guidance';
  let tips = [
    'Take a 10-minute walk outside to get fresh air and sunshine.',
    'Connect with a close friend or family member for a chat.',
    'Drink a warm glass of water or tea and practice mindfulness.'
  ];
  let breathingExercise: any = null;

  if (moodScore <= 2) {
    title = 'Stress Relief & Calming';
    tips = [
      'Practice deep breathing to lower heart rate and cortisol levels.',
      'Take a short break from screens and step into a quiet room.',
      'Listen to calming Ethiopian spiritual or instrumental music (e.g. Begena or Tizita).'
    ];
    breathingExercise = {
      technique: '4-7-8 Breathing Technique',
      steps: [
        'Inhale quietly through your nose for 4 seconds.',
        'Hold your breath for a count of 7 seconds.',
        'Exhale completely through your mouth making a whoosh sound for 8 seconds.',
        'Repeat this cycle 4 times.'
      ]
    };
  } else if (moodScore === 3) {
    title = 'Mindful Reset';
    tips = [
      'Write down 3 things you are grateful for today.',
      'Stretch your back and shoulders to relieve light tension.',
      'Sip some Ethiopian coffee or tea slowly, focusing on the aroma.'
    ];
  } else {
    title = 'Positive Momentum';
    tips = [
      'Keep up this positive energy! Share a smile or kind word with someone today.',
      'Use this high-energy state to tackle a challenging task on your list.',
      'Reflect on what made today great and write it down.'
    ];
  }

  if (language === 'am') {
    if (moodScore <= 2) {
      title = 'ውጥረትን መቀነሻ እና ማረጋጊያ';
      tips = [
        'የልብ ምትን ለመቀነስ ረጅም ትንፋሽ መውሰድ እና ማስወጣትን ተለማመዱ።',
        'ከስክሪን እረፍት ወስደው ጸጥ ያለ ክፍል ውስጥ ለጥቂት ደቂቃዎች ይቀመጡ።',
        'የሚያረጋጋ የባህል ወይም የቤገና ሙዚቃ ያዳምጡ።'
      ];
      breathingExercise = {
        technique: 'ባለ 4-7-8 መተንፈሻ ዘዴ',
        steps: [
          'በአፍንጫዎ ለ4 ሰከንዶች ያህል ቀስ ብለው አየር ያስገቡ።',
          'አየሩን በሳንባዎ ውስጥ ለ7 ሰከንዶች ያህል ይያዙት።',
          'በአፍዎ ውስጥ ለ8 ሰከንዶች ያህል አየሩን ቀስ ብለው ያስውጡ።',
          'ይህንን ዑደት 4 ጊዜ ይድገሙት።'
        ]
      };
    } else if (moodScore === 3) {
      title = 'አእምሮን ማደሻ';
      tips = [
        'ዛሬ ላከናወኑት 3 ነገሮች ምስጋና ይግለጹ።',
        'የጡንቻ ውጥረትን ለመቀነስ ትከሻዎን እና ጀርባዎን ያንቀሳቅሱ።',
        'የኢትዮጵያን ቡና ወይም ሻይ ቀስ ብለው እየተጋቱ ይደሰቱ።'
      ];
    } else {
      title = 'መልካም ስሜት ማስቀጠያ';
      tips = [
        'ይህንን መልካም ጉልበት ያስቀጥሉ! ዛሬ ለአንድ ሰው መልካም ቃል ያጋሩ።',
        'በዚህ ንቁ ሰዓት ከባድ የተባሉ ስራዎችን ያከናውኑ።',
        'የዛሬውን ቀን መልካም ያደረጉትን ነገሮች በማስታወሻዎ ላይ ይጻፉ።'
      ];
    }
  }

  return {
    title,
    tips,
    breathing_exercise: breathingExercise
  };
}
