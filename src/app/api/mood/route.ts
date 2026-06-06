import { NextResponse } from 'next/server'
import { generateMoodTips } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { profile, moodScore, language } = await req.json()
    const result = await generateMoodTips(profile, moodScore, language || 'en')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Mood API Error:', error)
    return NextResponse.json({ error: 'Failed to generate mood tips' }, { status: 500 })
  }
}
