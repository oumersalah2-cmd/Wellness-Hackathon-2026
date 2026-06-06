'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { LoadingSpinner } from '@/components/Loading'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Mock Data for the Hackathon Demo
const MOCK_LEADERBOARD = [
  { name: 'Kidus M.', streak: 42, goal: 'stay_fit' },
  { name: 'Sarah T.', streak: 38, goal: 'lose_weight' },
  { name: 'Abebe B.', streak: 31, goal: 'build_muscle' },
  { name: 'Meron A.', streak: 27, goal: 'eat_healthy' },
  { name: 'Dawit S.', streak: 24, goal: 'stay_fit' },
  { name: 'Yared T.', streak: 21, goal: 'build_muscle' },
  { name: 'Helen G.', streak: 18, goal: 'lose_weight' },
]

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <CommunityContent />
    </ProtectedRoute>
  )
}

function CommunityContent() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching leaderboard data
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Community Leaderboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          See who's staying consistent across Ethiopia and beyond.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-xl font-bold text-primary">Global Streaks</div>
            <p className="text-sm text-gray-600">Track consistency</p>
          </CardBody>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardBody className="text-center">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-xl font-bold text-accent">1,240</div>
            <p className="text-sm text-gray-600">Active Members</p>
          </CardBody>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardBody className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-xl font-bold text-blue-500">Addis Ababa</div>
            <p className="text-sm text-gray-600">Top Active Region</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-2xl font-serif">Top Performers</CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {MOCK_LEADERBOARD.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : 
                      idx === 1 ? 'bg-gray-200 text-gray-600' : 
                      idx === 2 ? 'bg-orange-100 text-orange-600' : 
                      'bg-primary/10 text-primary'}`}
                  >
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{user.goal.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-900/50">
                  <span className="text-xl">🔥</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{user.streak} days</span>
                </div>
              </div>
            ))}
            
            {/* Show current user at the bottom if logged in */}
            {profile && (
              <div className="flex items-center justify-between p-4 bg-primary/5 border-t border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-primary text-white">
                    You
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{profile.name}</h3>
                    <span className="text-xs text-primary uppercase tracking-wider">{profile.goal.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-900/50">
                  <span className="text-xl">🔥</span>
                  <span className="font-bold text-red-600 dark:text-red-400">7 days</span>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
