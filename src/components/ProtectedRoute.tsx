'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/Loading'

/**
 * Wrap any page with this component to require authentication.
 * If the user is not logged in, they are redirected to /login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${locale}/login`)
    }
  }, [user, loading, router, locale])

  // Show spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render children if user is not logged in (redirect in progress)
  if (!user) {
    return null
  }

  return <>{children}</>
}
