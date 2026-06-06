import { NextResponse } from 'next/server'
import { generateSleepRecommendations } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { profile, bedtimeGoal, stressLevel, language } = await req.json()
    const result = await generateSleepRecommendations(profile, bedtimeGoal, stressLevel, language || 'en')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sleep API Error:', error)
    return NextResponse.json({ error: 'Failed to generate sleep recommendations' }, { status: 500 })
  }
}
