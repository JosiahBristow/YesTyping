import { supabase, supabaseConfigured } from '../../lib/supabase'

export interface RaceRecord {
  id: string
  user_id: string | null
  name: string
  room: string
  wpm: number
  accuracy: number
  won: boolean
  created_at: string
}

export interface SaveRaceInput {
  userId: string | null
  name: string
  room: string
  wpm: number
  accuracy: number
  won: boolean
}

export async function saveRaceResult(input: SaveRaceInput): Promise<void> {
  if (!supabase || !supabaseConfigured) return
  await supabase.from('races').insert({
    user_id: input.userId,
    name: input.name,
    room: input.room,
    wpm: input.wpm,
    accuracy: input.accuracy,
    won: input.won,
  })
}

export async function fetchLeaderboard(limit = 10): Promise<RaceRecord[]> {
  if (!supabase || !supabaseConfigured) return []
  const { data } = await supabase
    .from('races')
    .select('*')
    .order('wpm', { ascending: false })
    .limit(limit)
  return (data ?? []) as RaceRecord[]
}