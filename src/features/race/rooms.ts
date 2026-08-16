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

/** List currently-open rooms, pruning stale ones first. Returns null when the
 *  rooms table is missing/unreadable (Supabase schema not set up yet). */
export async function fetchRooms(limit = 20): Promise<RoomInfo[] | null> {
  if (!supabase || !supabaseConfigured) return null
  const cutoff = new Date(Date.now() - STALE_MS).toISOString()
  const prune = await supabase.from('rooms').delete().lt('updated_at', cutoff)
  const { data, error } = await supabase
    .from('rooms')
    .select('code, players, updated_at')
    .gt('players', 0)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error || prune.error) return null
  return (data ?? []) as RoomInfo[]
}