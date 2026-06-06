'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { useToast } from '@/components/Toast'
import { signIn, signInWithGoogle, signInWithGithub, isSupabaseConfigured } from '@/lib/supabase'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const locale = useLocale()
  const { addToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        addToast(error.message, 'error')
      } else {
        addToast('Login successful!', 'success')
        router.push(`/${locale}/dashboard`)
      }
    } catch (err) {
      addToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        addToast((error as any).message, 'error')
      } else if (!isSupabaseConfigured) {
        addToast('Login successful (Demo Mode)!', 'success')
        router.push(`/${locale}/dashboard`)
      }
    } catch (err) {
      addToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGithub()
      if (error) {
        addToast((error as any).message, 'error')
      } else if (!isSupabaseConfigured) {
        addToast('Login successful (Demo Mode)!', 'success')
        router.push(`/${locale}/dashboard`)
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
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: '' }))
              }}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: '' }))
              }}
              error={errors.password}
              placeholder="••••••••"
            />

            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              {t('loginButton')}
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

          <div className="flex gap-2">
            <Button onClick={handleGoogleLogin} variant="outline" size="lg" className="w-full" disabled={loading}>
              <span className="text-lg mr-2">🔐</span>
              Google
            </Button>
            <Button onClick={handleGithubLogin} variant="outline" size="lg" className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200" disabled={loading}>
              <span className="text-lg mr-2">🐙</span>
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/signup`} className="text-primary font-semibold hover:underline">
              {t('signup')}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
