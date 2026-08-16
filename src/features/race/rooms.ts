import { supabase, supabaseConfigured } from '../../lib/supabase'

export interface RoomInfo {
  code: string
  players: number
  updated_at: string
}

const STALE_MS = 30 * 60 * 1000

/** Register (or update) a room in the public room list. */
export async function upsertRoom(code: string, players: number): Promise<void> {
  if (!supabase || !supabaseConfigured) return
  await supabase.from('rooms').upsert({
    code,
    players,
    updated_at: new Date().toISOString(),
  })
}

/** Remove a room from the list (used when the last player leaves). */
export async function deleteRoom(code: string): Promise<void> {
  if (!supabase || !supabaseConfigured) return
  await supabase.from('rooms').delete().eq('code', code)
}

/** List currently-open rooms, pruning stale ones first. */
export async function fetchRooms(limit = 20): Promise<RoomInfo[]> {
  if (!supabase || !supabaseConfigured) return []
  const cutoff = new Date(Date.now() - STALE_MS).toISOString()
  await supabase.from('rooms').delete().lt('updated_at', cutoff)
  const { data } = await supabase
    .from('rooms')
    .select('code, players, updated_at')
    .gt('players', 0)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as RoomInfo[]
}