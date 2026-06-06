import { NextRequest, NextResponse } from 'next/server'
import { generateMode2Recommendations } from '@/lib/groq'
import { getRuleBasedMeals } from '@/lib/utils'
import type { Profile } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { workout, profile, language } = await req.json()

    if (!workout) {
      return NextResponse.json({ error: 'Workout is required' }, { status: 400 })
    }

    const demoProfile: Profile = profile || {
      id: 'demo',
      name: 'Demo User',
      age: 25,
      gender: 'female',
      weight_kg: 65,
      height_cm: 165,
      goal: 'stay_fit',
      skin_type: 'combination',
      activity_level: 'moderate',
      fasting_mode: false,
      language: 'en',
      created_at: new Date().toISOString(),
    }

    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
      try {
        const result = await generateMode2Recommendations(demoProfile, workout, language || 'en')
        return NextResponse.json(result)
      } catch (err) {
        console.error('Groq failed, using rule-based fallback:', err)
      }
    }

    const result = getRuleBasedMeals(workout, demoProfile.fasting_mode)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Mode2 API error:', error)
    return NextResponse.json({ error: 'Failed to analyze workout' }, { status: 500 })
  }
}
