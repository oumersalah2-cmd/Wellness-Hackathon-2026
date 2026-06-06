# FitEthio - Ethiopian Wellness Platform 🇪🇹

A personalized, AI-powered health platform tailored for Ethiopians. FitEthio combines nutrition, fitness, skincare, sleep, and mental wellness guidance using Groq AI and the Ethiopian food database.

## 🌟 Features

### Three Intelligent Modes
- **Mode 1: Food → Workout** - Input your meal, get personalized workout recommendations
- **Mode 2: Workout → Food** - Describe your workout, receive meal suggestions for recovery
- **Mode 3: Skincare & Wellness** - Get personalized skincare routines, supplements, and natural Ethiopian ingredients

### Core Features
- 📊 Dashboard with water tracking, mood check-in, and quick stats
- 🏃 Workout streak tracking with calendar visualization
- 📈 Progress charts (weight, calories, water, mood trends)
- 📋 Weekly AI-generated wellness reports
- 🧘 Mental wellness with mood-based tips
- 🕌 Ethiopian Orthodox fasting mode support
- 🌍 Bilingual interface (English + Amharic)
- 🍽️ 40+ Ethiopian food database with nutritional info

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI Engine**: Groq API (llama3-70b-8192 model)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth with email/password
- **Charts**: Recharts for data visualization
- **Internationalization**: next-intl for EN/AM support
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Groq API key
- npm or yarn

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/oumersalah2-cmd/Wellness-Hackathon-2026.git
cd Wellness-Hackathon-2026
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### 3. Database Setup

Run these SQL queries in Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight_kg DECIMAL NOT NULL,
  height_cm DECIMAL NOT NULL,
  goal TEXT CHECK (goal IN ('lose_weight', 'build_muscle', 'stay_fit', 'eat_healthy')),
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'normal', 'sensitive')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active')),
  fasting_mode BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create daily logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  log_type TEXT CHECK (log_type IN ('food', 'workout', 'water', 'mood', 'sleep')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create progress entries table
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL,
  water_ml INT DEFAULT 0,
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 5),
  sleep_hours DECIMAL,
  streak_days INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Create ethiopian foods table
CREATE TABLE ethiopian_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_am TEXT NOT NULL,
  calories_per_serving INT NOT NULL,
  protein_g DECIMAL NOT NULL,
  carbs_g DECIMAL NOT NULL,
  fat_g DECIMAL NOT NULL,
  serving_description TEXT,
  is_fasting_friendly BOOLEAN DEFAULT FALSE,
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own progress" ON progress_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress_entries FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - redirects to `/en` or `/am`

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── onboarding/        # 7-step onboarding
│   │   ├── dashboard/         # Main hub
│   │   ├── mode1/             # Food → Workout
│   │   ├── mode2/             # Workout → Food
│   │   ├── mode3/             # Skincare & Wellness
│   │   ├── progress/          # Charts & reports
│   │   └── layout.tsx         # Root layout
│   └── globals.css
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Form.tsx
│   ├── Navigation.tsx
│   ├── Loading.tsx
│   └── Toast.tsx
├── lib/
│   ├── supabase.ts            # Database operations
│   ├── groq.ts                # AI integration
│   ├── utils.ts               # Health calculations
│   └── foods.ts               # Food database
├── types/index.ts             # TypeScript types
├── context/AuthContext.tsx    # Auth state
├── locales/
│   ├── en.json                # English strings
│   └── am.json                # Amharic strings
├── middleware.ts              # Protected routes
├── i18n.ts                    # i18n config
└── tailwind.config.ts
```

## 🎯 Usage Workflows

### Onboarding (7 Steps)
1. 🎉 Welcome
2. 👤 Basic info
3. 🎯 Select goal
4. 💪 Activity level
5. 💅 Skin type
6. 🕌 Fasting mode
7. 📊 View targets

### Mode 1: Food → Workout
```
Meal input → Groq analyzes macros → Recommends workout
```

### Mode 2: Workout → Food
```
Workout input → Groq calculates burn → Recommends meals
```

### Mode 3: Skincare & Wellness
```
Profile data → Morning/evening routines → Supplements → Natural ingredients
```

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Supabase Auth with JWT
- ✅ Protected routes via middleware
- ✅ Secrets in environment variables

## 🌐 Internationalization

- `/en/*` - English
- `/am/*` - Amharic
- All UI text translated
- Language-aware AI responses

## 📊 Ethiopian Foods Database

40+ foods including:
- Injera, Tibs, Shiro, Misir Wot
- Doro Wot, Gored Gored, Dulet
- Teff Porridge, Genfo, Ful
- Sambusa, Ayib, Kategna
- Fasting-friendly options (Yetsom Beyaynetu)

## 🤖 AI Integration

**Groq Model:** llama3-70b-8192

**Functions:**
- `generateMode1Recommendations()` - Food → Workout
- `generateMode2Recommendations()` - Workout → Food
- `generateMode3Recommendations()` - Skincare
- `generateWeeklyReport()` - Weekly summary
- `generateSleepRecommendations()` - Sleep tips
- `generateMoodTips()` - Mental wellness

All responses in JSON, language-aware.

## 🎨 Design System

```
Primary: #2D7A4F      /* Ethiopian Green */
Accent:  #E8B84B      /* Ethiopian Gold */
BG:      #F9F6F0      /* Warm Off-White */
Dark:    #1a1a1a      /* Dark */

Typography:
- Headers: Instrument Serif
- Body: DM Sans
```

## 📱 Responsive Design

- Mobile-first approach
- Tailored for phone users
- Desktop-optimized layouts
- Dark mode support

## 🚀 Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GROQ_API_KEY

# Deploy
vercel deploy
```

## 🐛 Troubleshooting

### Supabase Connection Issues
```
✓ Verify URL and keys in .env.local
✓ Check RLS policies are enabled
✓ Test connection in Supabase dashboard
```

### Groq API Errors
```
✓ Ensure GROQ_API_KEY is set
✓ Check API quota in Groq dashboard
✓ Verify JSON format in responses
```

### Build Issues
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 📈 Future Enhancements

- [ ] Community leaderboard
- [ ] Push notifications
- [ ] Social sharing
- [ ] Advanced analytics dashboard
- [ ] Wearable device integration
- [ ] Video tutorial library
- [ ] Meal planning feature
- [ ] Social challenges

## 📄 License

MIT License - Free for personal and commercial use

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support & Contact

- **GitHub:** [@oumersalah2-cmd](https://github.com/oumersalah2-cmd)
- **Issues:** [Report here](https://github.com/oumersalah2-cmd/Wellness-Hackathon-2026/issues)
- **Email:** [Add your email]

## 🙏 Acknowledgments

- Built with ❤️ for Ethiopian wellness
- Powered by Groq AI
- Inspired by Ethiopian culture and traditions
- Special thanks to Supabase and Next.js communities

---

**FitEthio © 2026** | Your personalized Ethiopian wellness companion 🇪🇹
