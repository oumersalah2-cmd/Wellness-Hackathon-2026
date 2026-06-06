'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { LoadingSpinner } from '@/components/Loading'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/context/AuthContext'
import type { Mode3Response } from '@/types'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Mode3Page() {
  return (
    <ProtectedRoute>
      <Mode3Content />
    </ProtectedRoute>
  )
}

function Mode3Content() {
  const t = useTranslations('mode3')
  const locale = useLocale()
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Mode3Response | null>(null)

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mode3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, language: locale }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      addToast('Failed to load recommendations', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-3xl font-serif font-bold">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('description')}</p>
      </div>

      {loading && <LoadingSpinner />}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>🌅 {t('morning')}</CardHeader>
            <CardBody>
              <ol className="list-decimal list-inside space-y-2">
                {result.skincare.morning.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>🌙 {t('evening')}</CardHeader>
            <CardBody>
              <ol className="list-decimal list-inside space-y-2">
                {result.skincare.evening.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>💊 {t('supplements')}</CardHeader>
            <CardBody className="space-y-4">
              {result.supplements.map((sup: any, i) => (
                <div key={i} className="p-4 bg-accent/10 rounded-lg">
                  <p className="font-bold">{sup.name}</p>
                  <p className="text-sm text-gray-600">{sup.reason}</p>
                  <p className="text-sm text-primary mt-1">{sup.dosage}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>🌿 {t('naturalOptions')}</CardHeader>
            <CardBody className="space-y-4">
              {result.natural_options.map((opt: any, i) => (
                <div key={i} className="p-4 bg-primary/10 rounded-lg">
                  <p className="font-bold text-primary">{opt.ingredient}</p>
                  <p className="text-sm">{opt.benefits}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('howToUse')}: {opt.how_to_use}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {result.avoid.length > 0 && (
            <Card>
              <CardHeader>⚠️ {t('avoid')}</CardHeader>
              <CardBody>
                <ul className="list-disc list-inside">
                  {result.avoid.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <Button onClick={loadRecommendations} variant="outline" className="w-full">
            Refresh Recommendations
          </Button>
        </div>
      )}
    </div>
  )
}
