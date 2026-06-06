'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { LoadingSpinner } from '@/components/Loading'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/Toast'

import { getProgressEntries, upsertProgressEntry } from '@/lib/supabase'
import { getDateRange, calculateStreak } from '@/lib/utils'
import type { WeeklyReport } from '@/types'

export default function ProgressPage() {
  const t = useTranslations('progress')
  const locale = useLocale()
  const { profile, user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  const [weightData, setWeightData] = useState<any[]>([])
  const [caloriesData, setCaloriesData] = useState<any[]>([])
  const [waterData, setWaterData] = useState<any[]>([])
  const [moodData, setMoodData] = useState<any[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<WeeklyReport | null>(null)

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    if (!user) return

    try {
      const { start, end } = getDateRange(30)
      const { data } = await getProgressEntries(user.id, start, end)

      if (data) {
        // Process data for charts
        const processedData = data.map((entry: any) => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: entry.weight_kg,
          water: entry.water_ml,
          mood: entry.mood_score,
        }))

        setWeightData(processedData.filter((d: any) => d.weight))
        setWaterData(processedData.filter((d: any) => d.water))
        setMoodData(processedData.filter((d: any) => d.mood))
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogWeight = async () => {
    if (!newWeight || !user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      await upsertProgressEntry(user.id, today, { weight_kg: parseFloat(newWeight) })
      setNewWeight('')
      addToast('Weight logged! 📊', 'success')
      await loadProgressData()
    } catch (error) {
      addToast('Failed to log weight', 'error')
    }
  }

  const generateReport = async () => {
    if (!profile) return

    setGenerating(true)
    try {
      const weeklyStats = {
        avg_calories: 2500,
        workouts_completed: 5,
        avg_water: 2.5,
        avg_mood: 4,
        avg_sleep: 7,
        weight_change: -1.2,
      }

      const res = await fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, weeklyStats, language: locale }),
      })
      const generatedReport = await res.json()
      
      setReport(generatedReport)
      addToast('Report generated! 📄', 'success')
    } catch (error) {
      console.error('Error:', error)
      addToast('Failed to generate report', 'error')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weight Tracking */}
        <Card>
          <CardHeader>{t('weight')}</CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                step="0.1"
                min="0"
              />
              <Button onClick={handleLogWeight} variant="secondary" size="sm">
                Log
              </Button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#2D7A4F" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Workout Streak */}
        <Card>
          <CardHeader>🔥 Workout Streak</CardHeader>
          <CardBody className="text-center space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary">7</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">28</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg text-sm">
              <p>Keep it up! You're doing amazing 💪</p>
            </div>
          </CardBody>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader>{t('goal')}</CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">{profile?.goal.replace('_', ' ')}</span>
                <span className="text-sm text-primary font-bold">72%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You've completed 18 out of 25 weekly targets
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Calories This Week */}
        <Card>
          <CardHeader>{t('thisWeek')} Calories</CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { date: 'Mon', calories: 2200, target: 2500 },
                  { date: 'Tue', calories: 2350, target: 2500 },
                  { date: 'Wed', calories: 2500, target: 2500 },
                  { date: 'Thu', calories: 2100, target: 2500 },
                  { date: 'Fri', calories: 2600, target: 2500 },
                  { date: 'Sat', calories: 2450, target: 2500 },
                  { date: 'Sun', calories: 2300, target: 2500 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#2D7A4F" />
                  <Bar dataKey="target" fill="#E8B84B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Water & Mood Trend */}
        <Card>
          <CardHeader>Weekly Trend</CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#E8B84B" name="Mood (1-5)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Weekly Report */}
      <Card className="mb-8">
        <CardHeader className="flex items-center justify-between">
          <span>{t('weeklyReport')}</span>
          <Button onClick={generateReport} isLoading={generating} variant="secondary" size="sm">
            {t('generateReport')}
          </Button>
        </CardHeader>
        {report && (
          <CardBody className="space-y-6">
            <div className="bg-accent/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p>{report.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2">✅ {t('highlight')}</h3>
                <p className="text-sm">{report.highlight}</p>
              </div>

              <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-600 mb-2">📈 {t('improve')}</h3>
                <p className="text-sm">{report.improve}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">🎯 {t('nextWeekGoals')}</h3>
              <ul className="space-y-2">
                {report.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-slide-in">
            <div
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-lg ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
              }`}
            >
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
