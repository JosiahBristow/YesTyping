import { supabase, supabaseConfigured } from '../../lib/supabase'
import { displayName, useAuth } from '../../lib/auth'
import { loadSessions } from './useLocalStats'

export type LeaderboardMetric = 'max_wpm' | 'avg_wpm' | 'total_seconds' | 'sessions'

export interface RemoteStatRow {
  user_id: string
  username: string
  max_wpm: number
  avg_wpm: number
  total_seconds: number
  sessions: number
  total_chars: number
}

export interface LeaderboardRow {
  user_id: string
  username: string
  max_wpm: number
  avg_wpm: number
  total_seconds: number
  sessions: number
}

interface StatsPayload {
  user_id: string
  username: string
  max_wpm: number
  avg_wpm: number
  total_seconds: number
  sessions: number
  total_chars: number
}

/** Aggregate the user's local session history into their leaderboard stats. */
function aggregateFromLocal(): Omit<StatsPayload, 'user_id' | 'username'> {
  const sessions = loadSessions()
  const totalChars = sessions.reduce((a, s) => a + s.correctChars, 0)
  const totalSec = sessions.reduce((a, s) => a + s.elapsedSec, 0)
  const maxWpm = sessions.reduce((m, s) => Math.max(m, s.wpm), 0)
  const avgWpm = totalSec > 0 ? Math.round(totalChars / 5 / (totalSec / 60)) : 0
  return {
    max_wpm: maxWpm,
    avg_wpm: avgWpm,
    total_seconds: Math.round(totalSec),
    sessions: sessions.length,
    total_chars: totalChars,
  }
}

/** Push the signed-in user's latest practice stats to the leaderboard. */
export async function syncStats(): Promise<void> {
  const user = useAuth.getState().user
  if (!user || !supabase || !supabaseConfigured) return
  const agg = aggregateFromLocal()
  const payload: StatsPayload = {
    user_id: user.id,
    username: displayName(user),
    ...agg,
  }
  const { error } = await supabase.from('stats').upsert(payload)
  if (error) console.warn('stats sync failed:', error.message)
}

export async function fetchLeaderboard(metric: LeaderboardMetric, limit = 50): Promise<LeaderboardRow[]> {
  if (!supabase || !supabaseConfigured) return []
  const { data, error } = await supabase
    .from('stats')
    .select('user_id, username, max_wpm, avg_wpm, total_seconds, sessions')
    .gt('sessions', 0)
    .order(metric, { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as LeaderboardRow[]
}