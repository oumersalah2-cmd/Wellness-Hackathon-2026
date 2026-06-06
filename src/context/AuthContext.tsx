'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Profile } from '@/types'
import { getSession, getProfile, signOut as supabaseSignOut } from '@/lib/supabase'

interface AuthContextType {
  user: { id: string; email?: string } | null
  profile: Profile | null
  loading: boolean
  setProfile: (profile: Profile | null) => void
  setUser: (user: { id: string; email?: string } | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
  setUser: () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuth() {
      try {
        const session = await getSession()
        if (session?.user) {
          setUser(session.user as any)
          const { data } = await getProfile(session.user.id)
          if (data) setProfile(data as Profile)
        }
      } catch (err) {
        console.error('Auth load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAuth()
  }, [])

  const logout = async () => {
    await supabaseSignOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
