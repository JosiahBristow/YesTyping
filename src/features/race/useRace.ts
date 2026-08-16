import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../../lib/supabase'

export type RacePhase = 'waiting' | 'racing' | 'done'

interface PresencePayload {
  name: string
  progress: number
  finished: boolean
  wpm: number
  accuracy: number
}

export interface RacePlayer {
  key: string
  name: string
  progress: number
  finished: boolean
  wpm: number
  accuracy: number
}

function fromPresence(channel: RealtimeChannel): Record<string, RacePlayer> {
  const state = channel.presenceState<PresencePayload>()
  const next: Record<string, RacePlayer> = {}
  for (const [key, items] of Object.entries(state)) {
    const p = items[0]
    if (p) next[key] = { key, name: p.name, progress: p.progress ?? 0, finished: p.finished ?? false, wpm: p.wpm ?? 0, accuracy: p.accuracy ?? 0 }
  }
  return next
}

/** Join a realtime race room. All clients share the same text (seeded) and
 *  broadcast their live progress so everyone can see the others' bars. */
export function useRace(roomId: string, name: string) {
  const [connected, setConnected] = useState(false)
  const [players, setPlayers] = useState<Record<string, RacePlayer>>({})
  const [phase, setPhase] = useState<RacePhase>('waiting')
  const [seed, setSeed] = useState<number | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const myKeyRef = useRef(Math.random().toString(36).slice(2, 10))
  const phaseRef = useRef<RacePhase>('waiting')
  phaseRef.current = phase
  const nameRef = useRef(name)
  nameRef.current = name

  useEffect(() => {
    if (!roomId || !supabase || !supabaseConfigured) return
    const client = supabase
    const channel = client.channel(`race:${roomId}`)
    channelRef.current = channel

    const applyPresence = () => setPlayers(fromPresence(channel))
    const applyProgress = (key: string, p: PresencePayload) => {
      setPlayers((prev) => {
        const existing = prev[key]
        return { ...prev, [key]: { key, name: existing?.name ?? p.name, progress: p.progress ?? 0, finished: p.finished ?? false, wpm: p.wpm ?? 0, accuracy: p.accuracy ?? 0 } }
      })
    }

    channel
      .on('presence', { event: 'sync' }, applyPresence)
      .on('presence', { event: 'join' }, applyPresence)
      .on('presence', { event: 'leave' }, applyPresence)
      .on('broadcast', { event: 'start' }, ({ payload }) => {
        if (phaseRef.current !== 'waiting') return
        setSeed(payload.seed as number)
        setPhase('racing')
      })
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        applyProgress(payload.key as string, payload as PresencePayload)
      })

    void channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        await channel.track({ name: nameRef.current, progress: 0, finished: false, wpm: 0, accuracy: 0 })
      }
    })

    return () => {
      void client.removeChannel(channel)
      channelRef.current = null
      setConnected(false)
      setPhase('waiting')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const startRace = () => {
    const ch = channelRef.current
    if (!ch) return
    const s = Math.floor(Math.random() * 1_000_000)
    setSeed(s)
    setPhase('racing')
    void ch.send({ type: 'broadcast', event: 'start', payload: { seed: s } })
  }

  const updateProgress = (p: Omit<PresencePayload, 'name'>) => {
    const ch = channelRef.current
    const payload: PresencePayload = { ...p, name: nameRef.current }
    setPlayers((prev) => ({ ...prev, [myKeyRef.current]: { key: myKeyRef.current, name: nameRef.current, progress: p.progress ?? 0, finished: p.finished ?? false, wpm: p.wpm ?? 0, accuracy: p.accuracy ?? 0 } }))
    if (!ch) return
    void ch.send({ type: 'broadcast', event: 'progress', payload: { key: myKeyRef.current, ...payload } })
  }

  const finishRace = (p: Omit<PresencePayload, 'name'>) => {
    updateProgress({ ...p, finished: true })
    setPhase('done')
  }

  return { connected, players, phase, seed, myKey: myKeyRef.current, startRace, updateProgress, finishRace }
}