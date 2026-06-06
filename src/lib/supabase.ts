import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_'))

let supabase: SupabaseClient | null = null

function getClient() {
  if (!isSupabaseConfigured) return null
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

// Local storage fallback for demo/hackathon without Supabase
const DEMO_USER_KEY = 'fitethio_user'
const DEMO_PROFILE_KEY = 'fitethio_profile'
const DEMO_LOGS_KEY = 'fitethio_logs'
const DEMO_PROGRESS_KEY = 'fitethio_progress'

function getDemoUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DEMO_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

function setDemoUser(user: any) {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
}

export async function signUp(email: string, password: string) {
  const client = getClient()
  if (client) {
    return client.auth.signUp({ email, password })
  }
  const user = { id: 'demo-' + Date.now(), email }
  setDemoUser(user)
  return { data: { user }, error: null }
}

export async function signIn(email: string, password: string) {
  const client = getClient()
  if (client) {
    return client.auth.signInWithPassword({ email, password })
  }
  if (!email || !password) {
    return { data: { user: null }, error: { message: 'Email and password required' } as any }
  }
  const user = { id: 'demo-user', email }
  setDemoUser(user)
  return { data: { user }, error: null }
}

export async function signInWithGoogle() {
  const client = getClient()
  if (client) {
    return client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/en/dashboard` : undefined,
      },
    })
  }
  const user = { id: 'demo-google-user', email: 'google.demo@fitethio.com' }
  setDemoUser(user)
  return { data: { user }, error: null }
}

export async function signOut() {
  const client = getClient()
  if (client) return client.auth.signOut()
  localStorage.removeItem(DEMO_USER_KEY)
  localStorage.removeItem(DEMO_PROFILE_KEY)
  return { error: null }
}

export async function getSession() {
  const client = getClient()
  if (client) {
    const { data } = await client.auth.getSession()
    return data.session
  }
  const user = getDemoUser()
  return user ? { user } : null
}

export async function createProfile(userId: string, profileData: Partial<Profile>) {
  const client = getClient()
  const profile = {
    id: userId,
    ...profileData,
    created_at: new Date().toISOString(),
  }
  if (client) {
    const { error } = await client.from('profiles').upsert(profile)
    if (error) throw error
  } else {
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile))
  }
  return profile
}

export async function getProfile(userId: string) {
  const client = getClient()
  if (client) {
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
    if (error) return { data: null, error }
    return { data, error: null }
  }
  const raw = typeof window !== 'undefined' ? localStorage.getItem(DEMO_PROFILE_KEY) : null
  const data = raw ? JSON.parse(raw) : null
  return { data, error: null }
}

export async function getDailyLogs(userId: string, date: string) {
  const client = getClient()
  if (client) {
    return client.from('daily_logs').select('*').eq('user_id', userId).eq('date', date)
  }
  const raw = typeof window !== 'undefined' ? localStorage.getItem(DEMO_LOGS_KEY) : null
  const logs = raw ? JSON.parse(raw) : []
  return { data: logs.filter((l: any) => l.user_id === userId && l.date === date), error: null }
}

export async function getProgressEntries(userId: string, start: string, end: string) {
  const client = getClient()
  if (client) {
    return client
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)
  }
  const raw = typeof window !== 'undefined' ? localStorage.getItem(DEMO_PROGRESS_KEY) : null
  const entries = raw ? JSON.parse(raw) : []
  const data = entries.filter(
    (e: any) => e.user_id === userId && e.date >= start && e.date <= end
  )
  return { data, error: null }
}

export async function upsertProgressEntry(
  userId: string,
  date: string,
  updates: Record<string, any>
) {
  const client = getClient()
  if (client) {
    const { data: existing } = await client
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    const entry = { user_id: userId, date, ...updates, streak_days: existing?.streak_days || 0 }
    return client.from('progress_entries').upsert(entry)
  }

  const raw = localStorage.getItem(DEMO_PROGRESS_KEY)
  const entries = raw ? JSON.parse(raw) : []
  const idx = entries.findIndex((e: any) => e.user_id === userId && e.date === date)
  const entry = { user_id: userId, date, ...updates, id: `prog-${date}` }
  if (idx >= 0) entries[idx] = { ...entries[idx], ...entry }
  else entries.push(entry)
  localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(entries))
  return { data: entry, error: null }
}
