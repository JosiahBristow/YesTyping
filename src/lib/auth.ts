import { create } from 'zustand'
import { supabase, supabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

const EMAIL_DOMAIN = 'yestyping.local'

function usernameEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`
}

/** Resolve a username to its internal auth email via the security-definer RPC. */
async function resolveUsernameEmail(username: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('get_auth_email', { username })
  if (error) return null
  return (data as string | null) ?? null
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

interface AuthResult {
  ok: boolean
  error?: string
  code?: 'rate_limit' | 'confirm_email' | 'signup_disabled'
}

/** Turn a raw Supabase error into something actionable. */
function classifyAuthError(error: { message: string }): { error: string; code?: AuthResult['code'] } {
  if (/signup.{0,20}disabled|signups not allowed/i.test(error.message)) {
    return { error: error.message, code: 'signup_disabled' }
  }
  if (/rate limit/i.test(error.message)) {
    return { error: error.message, code: 'rate_limit' }
  }
  return { error: error.message }
}

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  signUp: (username: string, password: string) => Promise<AuthResult>
  signIn: (username: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: supabaseConfigured,
  initialized: false,
  error: null,

  signUp: async (username, password) => {
    if (!supabase) return { ok: false, error: 'Supabase not configured' }
    const existing = await resolveUsernameEmail(username)
    if (existing) return { ok: false, error: 'That username is already taken.' }
    const { data, error } = await supabase.auth.signUp({
      email: usernameEmail(username),
      password,
      options: { data: { username } },
    })
    if (error) return { ok: false, ...classifyAuthError(error) }
    if (!data.session) {
      return { ok: true, error: 'Email confirmation is on — please disable it in Supabase.', code: 'confirm_email' }
    }
    set({ error: null })
    return { ok: true }
  },

  signIn: async (username, password) => {
    if (!supabase) return { ok: false, error: 'Supabase not configured' }
    const email = await resolveUsernameEmail(username)
    if (!email) return { ok: false, error: 'User not found.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, ...classifyAuthError(error) }
    set({ error: null })
    return { ok: true }
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
  const meta = user.user_metadata as { username?: string; full_name?: string; name?: string }
  return meta.username || meta.full_name || meta.name || user.email?.split('@')[0] || 'player'
}