import { NextResponse } from 'next/server'
import { generateWeeklyReport } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { profile, weeklyStats, language } = await req.json()
    const result = await generateWeeklyReport(profile, weeklyStats, language || 'en')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Weekly Report API Error:', error)
    return NextResponse.json({ error: 'Failed to generate weekly report' }, { status: 500 })
  }
}
