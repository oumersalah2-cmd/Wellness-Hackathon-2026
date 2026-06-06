import { NextRequest, NextResponse } from 'next/server'
import { generateMode1Recommendations } from '@/lib/groq'
import { getRuleBasedWorkout } from '@/lib/utils'
import type { Profile } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { meal, profile, language } = await req.json()

    if (!meal) {
      return NextResponse.json({ error: 'Meal is required' }, { status: 400 })
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
        const result = await generateMode1Recommendations(demoProfile, meal, language || 'en')
        return NextResponse.json(result)
      } catch (err) {
        console.error('Groq failed, using rule-based fallback:', err)
      }
    }

    const result = getRuleBasedWorkout(meal, demoProfile.goal)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Mode1 API error:', error)
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 })
  }
}
