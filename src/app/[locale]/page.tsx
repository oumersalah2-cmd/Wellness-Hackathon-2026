'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const locale = useLocale()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-white dark:from-primary/20 dark:via-dark dark:to-neutral-900">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6 animate-bounce">🇪🇹</div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
          Welcome to <span className="text-primary">FitEthio</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Your personalized Ethiopian wellness companion - nutrition, fitness, skincare, and mental health in one AI-powered platform
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {user ? (
            <Button
              onClick={() => router.push(`/${locale}/dashboard`)}
              size="lg"
            >
              Go to Dashboard 🚀
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push(`/${locale}/signup`)}
                size="lg"
              >
                Get Started 🚀
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/login`)}
                variant="outline"
                size="lg"
              >
                Log In
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">
          Three Powerful Modes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-2xl font-semibold mb-2">Food → Workout</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Describe your meal and get a personalized workout plan tailored to your nutrition
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-2xl font-semibold mb-2">Workout → Food</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Log your workout and receive meal recommendations for optimal recovery
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-semibold mb-2">Skincare & Wellness</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized skincare routines and natural Ethiopian wellness tips
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="max-w-6xl mx-auto px-4 py-20 bg-primary/10 rounded-2xl">
        <h2 className="text-3xl font-serif font-bold text-center mb-12">
          Complete Wellness Tracking
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '💧', title: 'Water Tracking', desc: 'Daily hydration goals' },
            { icon: '📈', title: 'Progress Charts', desc: 'Visualize your growth' },
            { icon: '🔥', title: 'Streak Tracking', desc: 'Stay consistent' },
            { icon: '😊', title: 'Mood Check-in', desc: 'Mental wellness matters' },
            { icon: '🇪🇹', title: 'Ethiopian Foods', desc: '40+ local recipes' },
            { icon: '🕌', title: 'Fasting Mode', desc: 'Respect traditions' },
            { icon: '🤖', title: 'AI Powered', desc: 'Smart recommendations' },
            { icon: '🌍', title: 'Bilingual', desc: 'English & Amharic' },
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Card className="bg-gradient-to-r from-primary to-accent">
          <CardBody className="text-white text-center">
            <h3 className="text-3xl font-serif font-bold mb-4">
              Ready to Transform Your Wellness Journey?
            </h3>
            <p className="mb-6 text-lg opacity-90">
              Join thousands of Ethiopians taking control of their health with FitEthio
            </p>
            {user ? (
              <Button
                onClick={() => router.push(`/${locale}/dashboard`)}
                variant="secondary"
                size="lg"
              >
                Return to Dashboard 🌟
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/${locale}/signup`)}
                variant="secondary"
                size="lg"
              >
                Start Your Journey 🌟
              </Button>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">FitEthio © 2026 - የእርስዎ ጤና ወዳጅ</p>
          <p className="text-sm">
            Personalized wellness for all Ethiopians | Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}
