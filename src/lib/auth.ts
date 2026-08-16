import { create } from 'zustand'
import { supabase, supabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signInOAuth: (provider: 'github' | 'google') => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: supabaseConfigured,
  initialized: false,
  error: null,

  signUp: async (email, password) => {
    if (!supabase) return { ok: false, error: 'Supabase not configured' }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, error: error.message }
    set({ error: null })
    return data.session ? { ok: true } : { ok: true, error: 'Check your email to confirm your account.' }
  },

  signIn: async (email, password) => {
    if (!supabase) return { ok: false, error: 'Supabase not configured' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    set({ error: null })
    void data
    return { ok: true }
  },

  signInOAuth: async (provider) => {
    if (!supabase) return
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))

if (supabaseConfigured && supabase) {
  void supabase.auth.getSession().then(({ data }) => {
    useAuth.setState({ user: data.session?.user ?? null, loading: false, initialized: true })
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.setState({ user: session?.user ?? null, loading: false, initialized: true })
  })
} else {
  useAuth.setState({ loading: false, initialized: true })
}

export function displayName(user: User | null): string {
  if (!user) return ''
  const meta = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string }
  return meta.full_name || meta.name || user.email?.split('@')[0] || 'player'
}
