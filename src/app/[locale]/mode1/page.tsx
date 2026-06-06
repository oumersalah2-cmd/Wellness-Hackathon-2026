'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { LoadingSpinner } from '@/components/Loading'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/context/AuthContext'
import type { Mode1Response } from '@/types'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Mode1Page() {
  return (
    <ProtectedRoute>
      <Mode1Content />
    </ProtectedRoute>
  )
}

function Mode1Content() {
  const t = useTranslations('mode1')
  const locale = useLocale()
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [meal, setMeal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Mode1Response | null>(null)

  const analyze = async () => {
    if (!meal.trim()) {
      addToast('Please describe your meal', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mode1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, profile, language: locale }),
      })
      const data = await res.json()
      setResult(data)
      addToast('Workout plan ready! 💪', 'success')
    } catch {
      addToast('Failed to analyze meal', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🍽️</div>
        <h1 className="text-3xl font-serif font-bold">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('description')}</p>
      </div>

      <Card className="mb-8">
        <CardBody className="space-y-4">
          <Input
            label={t('mealInput')}
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            placeholder={t('example')}
          />
          <Button onClick={analyze} isLoading={loading} size="lg" className="w-full">
            {t('analyze')}
          </Button>
        </CardBody>
      </Card>

      {loading && <LoadingSpinner />}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>{t('mealAnalysis')}</CardHeader>
            <CardBody>
              <p className="font-semibold text-lg mb-4">{result.meal_analysis.meal}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{result.meal_analysis.calories}</div>
                  <div className="text-sm">{t('calories')}</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.meal_analysis.protein}g</div>
                  <div className="text-sm">{t('protein')}</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.meal_analysis.carbs}g</div>
                  <div className="text-sm">{t('carbs')}</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.meal_analysis.fat}g</div>
                  <div className="text-sm">{t('fat')}</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{result.meal_analysis.analysis}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>💪 {t('workoutPlan')}: {result.workout.type}</CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-gray-500">
                {result.workout.duration_min} min · {t('bestTime')}: {result.workout.best_time} · {t('water')}: {result.workout.water_glasses} glasses
              </p>
              <div className="space-y-3">
                {result.workout.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-semibold">{ex.name}</span>
                      {ex.youtube_query && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${ex.youtube_query}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center mt-1"
                        >
                          ▶ Watch Video
                        </a>
                      )}
                    </div>
                    <span className="text-primary font-bold">
                      {ex.duration_min > 0 ? `${ex.duration_min} min` : `${ex.sets} x ${ex.reps}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
