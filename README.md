# FitEthio - Ethiopian Wellness Platform MVP 🇪🇹

**The problem is simple but significant:** health and wellness apps are built for a global audience that doesn't include Ethiopia. There's no mainstream app that knows what injera is, understands that a user might be fasting for Hudade, speaks Amharic, or recommends moringa instead of whey protein. Ethiopians are left either ignoring these tools entirely or forcing their lifestyle into a foreign framework that doesn't fit.

**FitEthio's solution** is an AI-powered wellness platform that treats Ethiopian food, fasting culture, and local context as first-class features — not afterthoughts. The three AI modes (Food→Workout, Workout→Food, Skincare) share a single user profile and adapt together. When fasting mode is on, everything shifts — meal suggestions, macro targets, supplement advice — all automatically.

This is the FitEthio MVP — fully interactive and AI-powered. 

## 🌟 What it does

### Mode 1: Food → Workout
Tap any Ethiopian food chip (Injera + Tibs, Shiro, Doro Wot, etc.) or type your own meal, hit the button, and it returns: 
- Calorie + macro breakdown
- A specific workout plan with sets/reps
- The best time to exercise
- Water intake advice

### Mode 2: Workout → Food
Tap a workout chip (Running 5km, HIIT 30min, etc.) or describe what you did, and it returns: 
- Calories burned
- Recovery status
- A 3-meal Ethiopian food plan for the day (breakfast, lunch, dinner with reasoning)
- What to avoid
- Water target

### Mode 3: Beauty & Skin Wellness
- Culturally tailored skincare routines
- Supplements
- Natural Ethiopian ingredients (like Moringa)

**Everything is powered by AI (Groq/Claude)**, so inputs in Amharic or mixed English/Amharic will also work — just type naturally.

## 🚀 MVP Scope
The MVP is scoped around seven core deliverables to validate whether Ethiopian users will engage with a culturally-aware wellness tool:
1. **Auth & Onboarding** (including BMI & macro target generation)
2. **Three Core AI Modes** (Food→Workout, Workout→Food, Beauty/Skincare)
3. **Daily Check-in Dashboard** (Sleep, Mood, Water Tracker)
4. **Progress Tracking Page** (Weekly AI Reports, Streak visualization)
5. **Community Leaderboard**
6. **Bilingual Support** (English & Amharic)
7. **Secure API Backend** (Next.js API route protecting AI keys)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI Engine**: Groq API (llama3-70b-8192 model)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth (Email + Google + GitHub)
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

# Groq AI (or switch to Anthropic API if explicitly using Claude models in production)
GROQ_API_KEY=your_groq_api_key

# Next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### 3. Database Setup

Run the required SQL queries in your Supabase SQL editor to create the `profiles`, `daily_logs`, `progress_entries`, and `ethiopian_foods` tables. (See `/database/schema.sql` if provided, or reference the legacy README for exact schemas).

### 4. Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - redirects to `/en` or `/am`

## 🔐 Security & Architecture

To use this as your actual product, it is wired to its own backend (Next.js API routes at `/api/mode1`, `/api/mode2`, etc.) so the API key isn't exposed client-side. Supabase handles Row-Level Security ensuring user data is private.

## 📄 License & Acknowledgements

Built with ❤️ for Ethiopian wellness.
FitEthio © 2026 | Your personalized Ethiopian wellness companion 🇪🇹
