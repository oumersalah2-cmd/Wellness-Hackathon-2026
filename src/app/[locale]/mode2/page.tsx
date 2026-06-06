'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { LoadingSpinner } from '@/components/Loading'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/context/AuthContext'
import type { Mode2Response } from '@/types'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Mode2Page() {
  return (
    <ProtectedRoute>
      <Mode2Content />
    </ProtectedRoute>
  )
}

function Mode2Content() {
  const t = useTranslations('mode2')
  const locale = useLocale()
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [workout, setWorkout] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Mode2Response | null>(null)

  const analyze = async () => {
    if (!workout.trim()) {
      addToast('Please describe your workout', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mode2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workout, profile, language: locale }),
      })
      const data = await res.json()
      setResult(data)
      addToast('Meal plan ready! 🍽️', 'success')
    } catch {
      addToast('Failed to analyze workout', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💪</div>
        <h1 className="text-3xl font-serif font-bold">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('description')}</p>
      </div>

      <Card className="mb-8">
        <CardBody className="space-y-4">
          <Input
            label={t('workoutInput')}
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
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
          <Card className="text-center">
            <CardBody>
              <div className="text-4xl font-bold text-primary">{result.calories_burned}</div>
              <div className="text-gray-600">{t('caloriesBurned')}</div>
              <p className="mt-2 text-sm">💧 {result.water_liters}L water recommended</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>🍽️ {t('meals')}</CardHeader>
            <CardBody className="space-y-4">
              {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
                const meal = result.meals[mealType]
                return (
                  <div key={mealType} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold capitalize mb-2">{t(mealType)}</h3>
                    <p className="font-bold text-primary">{meal.name}</p>
                    <p className="text-sm text-gray-500">{t('portion')}: {meal.portion}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>{meal.calories} kcal</span>
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fat}g</span>
                    </div>
                  </div>
                )
              })}
            </CardBody>
            <div className="px-4 pb-4">
              <Button onClick={analyze} isLoading={loading} variant="secondary" className="w-full">
                🔄 Swap Meals for Alternatives
              </Button>
            </div>
          </Card>

          {result.avoid.length > 0 && (
            <Card>
              <CardHeader>⚠️ {t('avoid')}</CardHeader>
              <CardBody>
                <ul className="list-disc list-inside space-y-1">
                  {result.avoid.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
