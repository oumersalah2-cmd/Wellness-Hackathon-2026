'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/supabase'

export function Navigation() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const { user, setUser, setProfile } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    router.push(`/${locale}`)
  }

  const links = [
    { href: `/${locale}`, label: t('home'), icon: '🏠' },
    { href: `/${locale}/dashboard`, label: 'Dashboard', icon: '📊' },
    { href: `/${locale}/mode1`, label: t('food'), icon: '🍽️' },
    { href: `/${locale}/mode2`, label: t('workout'), icon: '💪' },
    { href: `/${locale}/mode3`, label: t('wellness'), icon: '✨' },
    { href: `/${locale}/progress`, label: t('progress'), icon: '📈' },
    { href: `/${locale}/community`, label: 'Community', icon: '🏆' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-serif font-bold text-xl">
            <span>🇪🇹</span>
            <span className="text-primary">FitEthio</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={locale === 'en' ? pathname.replace('/en', '/am') : pathname.replace('/am', '/en')}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {locale === 'en' ? '🇪🇹 አማ' : '🇬🇧 EN'}
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="hidden sm:inline-block px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'block px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-left block px-3 py-2.5 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  🚪 Log Out
                </button>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  🔑 Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
