'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/Toast'
import { upsertProgressEntry, getDailyLogs, getProgressEntries } from '@/lib/supabase'
import {
  calculateDailyWater,
  calculateDailyCalories,
  calculateProteinRequirement,
  calculateBMI,
  getBMICategory,
  calculateStreak,
  getDateRange,
} from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const { profile, user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  const [waterLogged, setWaterLogged] = useState(0)
  const [mood, setMood] = useState(3)
  const [showModal, setShowModal] = useState(false)
  const [moodTips, setMoodTips] = useState<any>(null)
  const [sleepTips, setSleepTips] = useState<any>(null)
  const [loadingSleep, setLoadingSleep] = useState(false)
  const [streak, setStreak] = useState(0)
  const [todayMoodSaved, setTodayMoodSaved] = useState<number | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // ── Derived from profile ──────────────────────────────────────────────────
  const waterTarget = profile ? calculateDailyWater(profile.weight_kg) : 2000
  const waterPercentage = Math.min((waterLogged / waterTarget) * 100, 100)

  const dailyCalories = profile
    ? calculateDailyCalories(
        profile.age,
        profile.gender,
        profile.weight_kg,
        profile.height_cm,
        profile.activity_level
      )
    : 0

  const dailyProtein = profile
    ? calculateProteinRequirement(profile.weight_kg, profile.goal)
    : 0

  const bmi = profile ? calculateBMI(profile.weight_kg, profile.height_cm) : 0
  const bmiCategory = profile ? getBMICategory(bmi) : ''

  const bmiColor =
    bmiCategory === 'Healthy'
      ? 'text-green-600'
      : bmiCategory === 'Underweight'
        ? 'text-blue-600'
        : bmiCategory === 'Overweight'
          ? 'text-yellow-600'
          : 'text-red-600'

  // Time-aware greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'

  // ── Load today's data on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return

    // Load water logged today
    const savedWater = localStorage.getItem(`water_${today}`)
    if (savedWater) setWaterLogged(parseInt(savedWater))

    // Load saved mood for today
    const savedMood = localStorage.getItem(`mood_${today}`)
    if (savedMood) setTodayMoodSaved(parseInt(savedMood))

    // Load streak from progress entries
    loadStreak()
  }, [user, today])

  const loadStreak = async () => {
    if (!user) return
    const { start } = getDateRange(30)
    const { data } = await getProgressEntries(user.id, start, today)
    if (data && data.length > 0) {
      const dates = data.map((e: any) => e.date)
      setStreak(calculateStreak(dates))
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const addWater = async () => {
    const newWater = waterLogged + 250
    setWaterLogged(newWater)
    localStorage.setItem(`water_${today}`, String(newWater))
    if (user) await upsertProgressEntry(user.id, today, { water_ml: newWater })
    addToast('Water logged! 💧', 'success')
  }

  const saveMood = async () => {
    if (!user) return
    await upsertProgressEntry(user.id, today, { mood_score: mood })
    localStorage.setItem('lastCheckInDate', today)
    localStorage.setItem(`mood_${today}`, String(mood))
    setTodayMoodSaved(mood)
    setShowModal(false)
    addToast('Check-in saved! 🎯', 'success')

    if (mood <= 3) {
      try {
        const res = await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, moodScore: mood, language: locale }),
        })
        const data = await res.json()
        setMoodTips(data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const getSleepTips = async () => {
    setLoadingSleep(true)
    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, bedtimeGoal: '10:00 PM', stressLevel: mood <= 2 ? 8 : 4, language: locale }),
      })
      const data = await res.json()
      setSleepTips(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSleep(false)
    }
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Card>
          <CardBody className="space-y-4 py-12">
            <div className="text-5xl mb-4">🧘</div>
            <h2 className="text-2xl font-bold">Complete Your Profile First</h2>
            <p className="text-gray-500">We need your details to calculate your personalized targets.</p>
            <Link href={`/${locale}/onboarding`}>
              <Button size="lg">Set Up My Profile →</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const moodEmoji = ['😢', '😔', '😐', '😊', '🤩'][mood - 1]
  const goalLabel = profile.goal.replace(/_/g, ' ')
  const activityLabel = profile.activity_level.replace(/_/g, ' ')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold">
          {greeting}, {profile.name}! {greetingEmoji}
        </h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Morning Check-in Banner */}
      {todayMoodSaved === null && (
        <div className="mb-6 bg-accent/20 border-l-4 border-accent p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in">
          <div>
            <h3 className="font-bold text-accent-dark">Daily Habit Reminder 🔔</h3>
            <p className="text-sm text-gray-600">How are you feeling today, {profile.name}?</p>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm">Check In Now</Button>
        </div>
      )}

      {/* Morning Check-in Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>{t('morningCheckIn')}</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  How are you feeling? ({moodEmoji} {mood}/5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-2xl mt-2">
                  <span>😢</span><span>😔</span><span>😐</span><span>😊</span><span>🤩</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button onClick={saveMood} className="w-full">
                  Save Check-In ✓
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Mood Tips */}
      {moodTips && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="flex items-center gap-2 text-primary">
            <span>🧠</span> {moodTips.title}
          </CardHeader>
          <CardBody className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              {moodTips.tips?.map((tip: string, idx: number) => (
                <li key={idx} className="text-sm">{tip}</li>
              ))}
            </ul>
            {moodTips.breathing_exercise && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg mt-4">
                <h4 className="font-bold mb-2">{moodTips.breathing_exercise.technique}</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  {moodTips.breathing_exercise.steps?.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Stats Grid — all dynamic from profile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-all">
          <CardBody className="text-center py-5">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-xs text-gray-500 mb-1">Daily Calories</div>
            <div className="text-2xl font-bold text-primary">{dailyCalories.toLocaleString()}</div>
            <div className="text-xs text-gray-400">kcal target</div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="text-center py-5">
            <div className="text-3xl mb-1">💧</div>
            <div className="text-xs text-gray-500 mb-1">Water Today</div>
            <div className="text-2xl font-bold text-blue-500">{(waterLogged / 1000).toFixed(1)}L</div>
            <div className="text-xs text-gray-400">of {(waterTarget / 1000).toFixed(1)}L target</div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="text-center py-5">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-xs text-gray-500 mb-1">Streak</div>
            <div className="text-2xl font-bold text-orange-500">{streak}</div>
            <div className="text-xs text-gray-400">days active</div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="text-center py-5">
            <div className="text-3xl mb-1">😊</div>
            <div className="text-xs text-gray-500 mb-1">Today's Mood</div>
            <div className="text-2xl font-bold text-primary">
              {todayMoodSaved ? `${todayMoodSaved}/5` : '—'}
            </div>
            <div className="text-xs text-gray-400">{todayMoodSaved ? ['Sad', 'Low', 'Neutral', 'Good', 'Great'][todayMoodSaved - 1] : 'not logged'}</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Water Tracker */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-2xl">💧</span>
                Water Intake
              </span>
              <span className="text-sm font-semibold text-blue-500">{waterPercentage.toFixed(0)}%</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-600">{waterLogged} ml logged</span>
                <span className="text-gray-400">Target: {waterTarget} ml ({(waterTarget / 1000).toFixed(1)}L)</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {Array.from({ length: Math.ceil(waterTarget / 250) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWaterLogged(i * 250)}
                    className={`p-2 rounded-lg text-xl transition-all ${
                      i * 250 < waterLogged
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                    }`}
                  >
                    💧
                  </button>
                ))}
              </div>
              <Button onClick={addWater} variant="secondary" className="w-full">
                + Add 250ml
              </Button>
            </CardBody>
          </Card>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${locale}/mode1`}>
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <CardBody className="text-center py-6">
                  <div className="text-4xl mb-3">🍽️</div>
                  <h3 className="font-semibold">{t('mode1')}</h3>
                  <p className="text-sm text-gray-500 mt-1">Food → Workout</p>
                </CardBody>
              </Card>
            </Link>
            <Link href={`/${locale}/mode2`}>
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <CardBody className="text-center py-6">
                  <div className="text-4xl mb-3">💪</div>
                  <h3 className="font-semibold">{t('mode2')}</h3>
                  <p className="text-sm text-gray-500 mt-1">Workout → Food</p>
                </CardBody>
              </Card>
            </Link>
            <Link href={`/${locale}/mode3`}>
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <CardBody className="text-center py-6">
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="font-semibold">{t('mode3')}</h3>
                  <p className="text-sm text-gray-500 mt-1">Beauty & Skin</p>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Profile Card — fully dynamic */}
          <Card>
            <CardHeader>My Profile</CardHeader>
            <CardBody className="space-y-3 text-sm">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 pb-2 border-b dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-base">{profile.name}</div>
                  <div className="text-gray-400 text-xs capitalize">{goalLabel}</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div className="font-bold text-primary text-lg">{bmi.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">BMI</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div className="font-bold text-primary text-lg">{profile.weight_kg}</div>
                  <div className="text-xs text-gray-400">kg</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div className="font-bold text-primary text-lg">{profile.height_cm}</div>
                  <div className="text-xs text-gray-400">cm</div>
                </div>
              </div>

              {/* BMI Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">BMI Status</span>
                <span className={`font-semibold ${bmiColor}`}>{bmiCategory}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Age</span>
                <span className="font-semibold">{profile.age} yrs</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Gender</span>
                <span className="font-semibold capitalize">{profile.gender}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Activity</span>
                <span className="font-semibold capitalize">{activityLabel}</span>
              </div>

              {/* Daily Targets */}
              <div className="mt-2 pt-2 border-t dark:border-gray-700 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Daily Targets</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Calories</span>
                  <span className="font-semibold text-primary">{dailyCalories.toLocaleString()} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Protein</span>
                  <span className="font-semibold text-green-600">{dailyProtein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Water</span>
                  <span className="font-semibold text-blue-500">{(waterTarget / 1000).toFixed(1)}L</span>
                </div>
              </div>

              {profile.fasting_mode && (
                <div className="bg-accent/10 p-2 rounded-lg mt-2 text-center">
                  <p className="text-xs font-bold text-accent">🕌 Fasting Mode Active</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>Progress</CardHeader>
            <CardBody>
              <Link href={`/${locale}/progress`}>
                <Button variant="outline" className="w-full text-sm">
                  View Full Report →
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Sleep Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span>Sleep Setup 🌙</span>
              {!sleepTips && (
                <Button onClick={getSleepTips} size="sm" variant="outline" isLoading={loadingSleep}>
                  Get Tips
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {sleepTips ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between font-semibold border-b pb-2 dark:border-gray-700">
                    <span>Target Wake Up</span>
                    <span className="text-primary">{sleepTips.wake_up_time}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                    {sleepTips.bedtime_routine?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Generate your evening routine for better recovery.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-slide-in">
            <div
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-lg ${
                toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
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
