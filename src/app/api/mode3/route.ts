import { NextRequest, NextResponse } from 'next/server'
import { generateMode3Recommendations } from '@/lib/groq'
import { getRuleBasedWellness } from '@/lib/utils'
import type { Profile } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { profile, language } = await req.json()

    const demoProfile: Profile = profile || {
      id: 'demo',
      name: 'Demo User',
      age: 22,
      gender: 'female',
      weight_kg: 65,
      height_cm: 165,
      goal: 'stay_fit',
      skin_type: 'oily',
      activity_level: 'moderate',
      fasting_mode: false,
      language: 'en',
      created_at: new Date().toISOString(),
    }

    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
      try {
        const result = await generateMode3Recommendations(demoProfile, language || 'en')
        return NextResponse.json(result)
      } catch (err) {
        console.error('Groq failed, using rule-based fallback:', err)
      }
    }

    const result = getRuleBasedWellness(demoProfile)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Mode3 API error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
