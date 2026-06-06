'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Input } from '@/components/Form'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/Toast'
import { upsertProgressEntry, getDailyLogs } from '@/lib/supabase'
import { calculateDailyWater } from '@/lib/utils'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const { profile, user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  
  const [waterLogged, setWaterLogged] = useState(0)
  const [mood, setMood] = useState(3)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [todaysLogs, setTodaysLogs] = useState<any[]>([])
  const [moodTips, setMoodTips] = useState<any>(null)
  const [sleepTips, setSleepTips] = useState<any>(null)
  const [loadingSleep, setLoadingSleep] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const waterTarget = profile ? calculateDailyWater(profile.weight_kg) : 2000
  const waterPercentage = Math.min((waterLogged / waterTarget) * 100, 100)

  useEffect(() => {
    loadTodaysLogs()
    // Check if first visit today
    const lastCheckInDate = localStorage.getItem('lastCheckInDate')
    if (lastCheckInDate !== today) {
      setShowCheckIn(true)
    }
  }, [today])

  const loadTodaysLogs = async () => {
    if (!user) return
    const { data } = await getDailyLogs(user.id, today)
    setTodaysLogs(data || [])
  }

  const addWater = async () => {
    const newWater = waterLogged + 250
    setWaterLogged(newWater)

    if (user) {
      await upsertProgressEntry(user.id, today, { water_ml: newWater })
    }
    addToast('Water logged! 💧', 'success')
  }

  const saveMood = async () => {
    if (user) {
      await upsertProgressEntry(user.id, today, { mood_score: mood })
      localStorage.setItem('lastCheckInDate', today)
      setShowCheckIn(false)
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
  }

  const getSleepTips = async () => {
    setLoadingSleep(true)
    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, bedtimeGoal: '10:00 PM', stressLevel: 5, language: locale }),
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
          <p className="text-lg mb-4">Complete your profile to get started</p>
          <Link href={`/${locale}/onboarding`}>
            <Button>{t('next')} →</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold">
          {t('goodMorning')}, {profile.name}! 🌅
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{today}</p>
      </div>

      {showCheckIn && (
        <div className="mb-6 bg-accent/20 border-l-4 border-accent p-4 rounded shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-accent-dark">Daily Habit Reminder 🔔</h3>
            <p className="text-sm">Don't forget to complete your morning check-in!</p>
          </div>
          <Button onClick={() => setShowCheckIn(true)} size="sm">Check In Now</Button>
        </div>
      )}

      {/* Morning Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>{t('morningCheckIn')}</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('mood')} ({mood}/5)
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
                  <span>😢</span>
                  <span>😐</span>
                  <span>😊</span>
                  <span>😄</span>
                  <span>🤩</span>
                </div>
              </div>
              <Button onClick={saveMood} size="lg" className="w-full">
                {t('submit')}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Mood Tips Rendering */}
      {moodTips && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="flex items-center gap-2 text-primary">
            <span>🧠</span> {moodTips.title}
          </CardHeader>
          <CardBody className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              {moodTips.tips.map((tip: string, idx: number) => (
                <li key={idx} className="text-sm">{tip}</li>
              ))}
            </ul>
            {moodTips.breathing_exercise && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg mt-4">
                <h4 className="font-bold mb-2">{moodTips.breathing_exercise.technique}</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  {moodTips.breathing_exercise.steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <div className="text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('calories')}</div>
            <div className="text-2xl font-bold text-primary">2,500</div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <div className="text-center">
            <div className="text-3xl mb-2">💧</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('water')}</div>
            <div className="text-2xl font-bold text-primary">{waterLogged / 250} gl</div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <div className="text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('streak')}</div>
            <div className="text-2xl font-bold text-primary">7</div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <div className="text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('mood')}</div>
            <div className="text-2xl font-bold text-primary">{mood}/5</div>
          </div>
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
                {t('title')} Water Intake
              </span>
              <span className="text-sm text-gray-500">{waterPercentage.toFixed(0)}%</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>{waterLogged} ml</span>
                <span className="text-gray-500">{waterTarget} ml target</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: Math.ceil(waterTarget / 250) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i * 250 < waterLogged) {
                        setWaterLogged(i * 250)
                      }
                    }}
                    className={`p-3 rounded-lg text-2xl transition-all ${
                      i * 250 < waterLogged
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    💧
                  </button>
                ))}
              </div>
              <Button onClick={addWater} variant="secondary" className="w-full">
                Add Water (250ml) 💧
              </Button>
            </CardBody>
          </Card>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${locale}/mode1`}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                <CardBody className="text-center">
                  <div className="text-4xl mb-3">🍽️</div>
                  <h3 className="font-semibold">{t('mode1')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Food → Workout</p>
                </CardBody>
              </Card>
            </Link>

            <Link href={`/${locale}/mode2`}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                <CardBody className="text-center">
                  <div className="text-4xl mb-3">💪</div>
                  <h3 className="font-semibold">{t('mode2')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Workout → Food</p>
                </CardBody>
              </Card>
            </Link>

            <Link href={`/${locale}/mode3`}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                <CardBody className="text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="font-semibold">{t('mode3')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Budget-Friendly Local Skincare</p>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>Profile</CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Goal</span>
                <span className="font-semibold capitalize">{profile.goal.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Activity</span>
                <span className="font-semibold capitalize">{profile.activity_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">BMI</span>
                <span className="font-semibold">24.5</span>
              </div>
              {profile.fasting_mode && (
                <div className="bg-accent/10 p-2 rounded mt-2">
                  <p className="text-xs font-semibold text-accent">Fasting Mode Active 🕌</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>Progress</CardHeader>
            <CardBody className="space-y-3">
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
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between font-semibold border-b pb-2">
                    <span>Target Wake Up</span>
                    <span className="text-primary">{sleepTips.wake_up_time}</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Bedtime Routine:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {sleepTips.bedtime_routine.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Generate your evening routine for better recovery.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

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
