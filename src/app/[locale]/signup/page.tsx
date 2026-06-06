'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { useToast } from '@/components/Toast'
import { signUp, signInWithGoogle, signInWithGithub, isSupabaseConfigured } from '@/lib/supabase'

export default function SignupPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const locale = useLocale()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const { error } = await signUp(email, password)
      if (error) {
        addToast((error as any).message, 'error')
      } else {
        addToast('Account created! Complete your profile.', 'success')
        router.push(`/${locale}/onboarding`)
      }
    } catch {
      addToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        addToast((error as any).message, 'error')
      } else if (!isSupabaseConfigured) {
        addToast('Signup successful (Demo Mode)! Complete your profile.', 'success')
        router.push(`/${locale}/onboarding`)
      }
    } catch (err) {
      addToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignup = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGithub()
      if (error) {
        addToast((error as any).message, 'error')
      } else if (!isSupabaseConfigured) {
        addToast('Signup successful (Demo Mode)! Complete your profile.', 'success')
        router.push(`/${locale}/onboarding`)
      }
    } catch (err) {
      addToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center text-2xl">
          <div className="text-4xl mb-3">🇪🇹</div>
          FitEthio
        </CardHeader>
        <CardBody className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
            />
            <Input
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              {t('signupButton')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-neutral-800 text-gray-600">or</span>
            </div>
          </div>

          <Button onClick={handleGoogleSignup} variant="outline" size="lg" className="w-full" disabled={loading}>
            <span className="text-lg mr-2">🔐</span>
            {t('googleAuth')}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('haveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-primary font-semibold hover:underline">
              {t('login')}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
