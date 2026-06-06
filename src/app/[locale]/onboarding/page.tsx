'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input, Select } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { calculateBMI, getBMICategory, calculateDailyCalories, calculateDailyWater, calculateProteinRequirement } from '@/lib/utils'
import { createProfile } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const STEPS = 7

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const locale = useLocale()
  const { user, setProfile, setUser } = useAuth()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    goal: '',
    activity_level: '',
    skin_type: '',
    fasting_mode: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 2:
        if (!formData.name) newErrors.name = 'Name is required'
        if (!formData.age || parseInt(formData.age) < 13) newErrors.age = 'Valid age required'
        if (!formData.gender) newErrors.gender = 'Gender is required'
        if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0) newErrors.weight_kg = 'Valid weight required'
        if (!formData.height_cm || parseFloat(formData.height_cm) <= 0) newErrors.height_cm = 'Valid height required'
        break
      case 3:
        if (!formData.goal) newErrors.goal = 'Please select a goal'
        break
      case 4:
        if (!formData.activity_level) newErrors.activity_level = 'Please select activity level'
        break
      case 5:
        if (!formData.skin_type) newErrors.skin_type = 'Please select skin type'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleFinish = async () => {
    if (!validateStep()) return

    try {
      let userId = user?.id
      if (!userId) {
        const { signUp } = await import('@/lib/supabase')
        const { data } = await signUp('demo@fitethio.com', 'demo123456')
        userId = data?.user?.id || 'demo-user'
      }

      const profileData = {
        ...formData,
        age: parseInt(formData.age),
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        language: locale,
      }

      await createProfile(userId, profileData)
      const fullProfile = { id: userId, ...profileData, created_at: new Date().toISOString() }
      setProfile(fullProfile as any)
      setUser({ id: userId, email: 'demo@fitethio.com' })
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      console.error('Error creating profile:', error)
      setErrors({ submit: 'Failed to save profile' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white dark:from-dark dark:to-neutral-900">
      {/* Progress Bar */}
      <div className="bg-primary/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-primary">
              {t('step')} {step} {t('of')} {STEPS}
            </span>
            <span className="text-sm text-gray-500">{Math.round((step / STEPS) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="text-center">
            <div className="text-6xl mb-6">🇪🇹</div>
            <h1 className="text-4xl font-serif font-bold mb-4">{t('welcome')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('welcomeSubtitle')}</p>
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              <p className="flex items-start gap-3">
                <span className="text-2xl">🍽️</span>
                <span>Personalized nutrition based on Ethiopian cuisine</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl">💪</span>
                <span>Custom workout plans matched to your meals</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <span>Skincare & wellness tailored to your needs</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl">🧘</span>
                <span>Mental wellness with cultural context</span>
              </p>
            </div>
            <Button onClick={handleNext} size="lg" className="mt-8">
              {t('next')} →
            </Button>
          </Card>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <Card>
            <CardHeader>{t('basicInfo')}</CardHeader>
            <CardBody className="space-y-4">
              <Input
                label={t('name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Your full name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('age')}
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={errors.age}
                  min="13"
                />
                <Select
                  label={t('gender')}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  error={errors.gender}
                  options={[
                    { value: 'male', label: t('male') },
                    { value: 'female', label: t('female') },
                    { value: 'other', label: t('other') },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('weight')}
                  name="weight_kg"
                  type="number"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  error={errors.weight_kg}
                  step="0.1"
                  min="0"
                />
                <Input
                  label={t('height')}
                  name="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  error={errors.height_cm}
                  step="0.1"
                  min="0"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <Card>
            <CardHeader>{t('yourGoal')}</CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'lose_weight', label: t('loseWeight'), emoji: '📉' },
                { value: 'build_muscle', label: t('buildMuscle'), emoji: '💪' },
                { value: 'stay_fit', label: t('stayFit'), emoji: '🏃' },
                { value: 'eat_healthy', label: t('eatHealthy'), emoji: '🥗' },
              ].map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, goal: goal.value }))
                    setErrors((prev) => ({ ...prev, goal: '' }))
                  }}
                  className={`p-6 rounded-lg text-center font-semibold transition-all ${
                    formData.goal === goal.value
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-2">{goal.emoji}</div>
                  <div>{goal.label}</div>
                </button>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Step 4: Activity Level */}
        {step === 4 && (
          <Card>
            <CardHeader>{t('activityLevel')}</CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'sedentary', label: t('sedentary'), emoji: '🛋️' },
                { value: 'light', label: t('light'), emoji: '🚶' },
                { value: 'moderate', label: t('moderate'), emoji: '🏃' },
                { value: 'very_active', label: t('veryActive'), emoji: '⛹️' },
              ].map((activity) => (
                <button
                  key={activity.value}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, activity_level: activity.value }))
                    setErrors((prev) => ({ ...prev, activity_level: '' }))
                  }}
                  className={`p-6 rounded-lg text-center font-semibold transition-all ${
                    formData.activity_level === activity.value
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-2">{activity.emoji}</div>
                  <div>{activity.label}</div>
                </button>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Step 5: Skin Type */}
        {step === 5 && (
          <Card>
            <CardHeader>{t('skinType')}</CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'oily', label: t('oily'), emoji: '🫧' },
                { value: 'dry', label: t('dry'), emoji: '🏜️' },
                { value: 'combination', label: t('combination'), emoji: '⚖️' },
                { value: 'normal', label: t('normal'), emoji: '✨' },
                { value: 'sensitive', label: t('sensitive'), emoji: '🌸' },
              ].map((skin) => (
                <button
                  key={skin.value}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, skin_type: skin.value }))
                    setErrors((prev) => ({ ...prev, skin_type: '' }))
                  }}
                  className={`p-4 rounded-lg text-center font-semibold transition-all ${
                    formData.skin_type === skin.value
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{skin.emoji}</div>
                  <div className="text-sm">{skin.label}</div>
                </button>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Step 6: Fasting Mode */}
        {step === 6 && (
          <Card>
            <CardHeader>{t('fasting')}</CardHeader>
            <CardBody className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">{t('fastingQuestion')}</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, fasting_mode: true }))}
                  className={`p-6 rounded-lg font-semibold transition-all ${
                    formData.fasting_mode
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">✅</div>
                  <div>{t('yes')}</div>
                </button>
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, fasting_mode: false }))}
                  className={`p-6 rounded-lg font-semibold transition-all ${
                    !formData.fasting_mode
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">❌</div>
                  <div>{t('no')}</div>
                </button>
              </div>
              {formData.fasting_mode && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    When fasting is active, we'll provide vegan meal options that respect your traditions.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Step 7: BMI Result */}
        {step === 7 && (
          <div className="space-y-6">
            {(() => {
              const bmi = calculateBMI(
                parseFloat(formData.weight_kg),
                parseFloat(formData.height_cm)
              )
              const category = getBMICategory(bmi)
              const calories = calculateDailyCalories(
                parseInt(formData.age),
                formData.gender,
                parseFloat(formData.weight_kg),
                parseFloat(formData.height_cm),
                formData.activity_level
              )
              const protein = calculateProteinRequirement(
                parseFloat(formData.weight_kg),
                formData.goal
              )
              const water = calculateDailyWater(parseFloat(formData.weight_kg))

              return (
                <>
                  <Card className="text-center">
                    <CardHeader className="text-3xl">{t('bmiResult')}</CardHeader>
                    <CardBody className="space-y-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-primary/10 p-6 rounded-lg">
                          <div className="text-4xl font-bold text-primary">{bmi.toFixed(1)}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">BMI</div>
                        </div>
                        <div className="bg-accent/10 p-6 rounded-lg">
                          <div className="text-lg font-bold">{category}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{calories}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Kcal/day</div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{(water / 1000).toFixed(1)}L</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Water/day</div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">Daily Targets</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-semibold text-primary">{protein.toFixed(1)}g</div>
                            <div className="text-gray-600 dark:text-gray-400">Protein</div>
                          </div>
                          <div>
                            <div className="font-semibold text-primary">{calories}</div>
                            <div className="text-gray-600 dark:text-gray-400">Calories</div>
                          </div>
                          <div>
                            <div className="font-semibold text-primary">8-10</div>
                            <div className="text-gray-600 dark:text-gray-400">Glasses</div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <div className="flex gap-4">
                    <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1">
                      {t('back')}
                    </Button>
                    <Button onClick={handleFinish} size="lg" className="flex-1">
                      {t('finish')} 🚀
                    </Button>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 7 && (
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1">
                {t('back')}
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {t('next')} →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
