import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { deleteRoom, upsertRoom } from './rooms'

export type RacePhase = 'waiting' | 'racing' | 'done'

interface PresencePayload {
  name: string
  progress: number
  finished: boolean
  wpm: number
  accuracy: number
  ready: boolean
}

export interface RacePlayer {
  key: string
  name: string
  progress: number
  finished: boolean
  wpm: number
  accuracy: number
  ready: boolean
}

export interface ChatMessage {
  key: string
  name: string
  text: string
  ts: number
}

function fromPresence(channel: RealtimeChannel): Record<string, RacePlayer> {
  const state = channel.presenceState<PresencePayload>()
  const next: Record<string, RacePlayer> = {}
  for (const [key, items] of Object.entries(state)) {
    const p = items[0]
    if (p) {
      next[key] = {
        key,
        name: p.name,
        progress: p.progress ?? 0,
        finished: p.finished ?? false,
        wpm: p.wpm ?? 0,
        accuracy: p.accuracy ?? 0,
        ready: p.ready ?? false,
      }
    }
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [ready, setReady] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const myKeyRef = useRef(Math.random().toString(36).slice(2, 10))
  const phaseRef = useRef<RacePhase>('waiting')
  phaseRef.current = phase
  const nameRef = useRef(name)
  nameRef.current = name
  const presenceReadyRef = useRef(false)
  const readyRef = useRef(false)
  const playersRef = useRef<Record<string, RacePlayer>>({})
  playersRef.current = players

  useEffect(() => {
    if (!roomId || !supabase || !supabaseConfigured) return
    const client = supabase
    // Use our own session key as the presence key so local updates and the
    // players map (keyed by presence keys) always line up.
    const channel = client.channel(`race:${roomId}`, {
      config: { presence: { key: myKeyRef.current } },
    })
    channelRef.current = channel

    const presenceCount = () => Object.keys(channel.presenceState()).length
    const syncRoom = () => {
      const count = presenceCount()
      if (!presenceReadyRef.current) return
      if (count === 0) void deleteRoom(roomId)
      else void upsertRoom(roomId, count)
    }

    // When everyone in the room is ready, the host (smallest presence key)
    // broadcasts the start so all clients type the same seeded text.
    const maybeAutoStart = () => {
      if (phaseRef.current !== 'waiting') return
      const entries = Object.entries(playersRef.current)
      if (entries.length < 2) return
      if (entries.some(([, p]) => !p.ready)) return
      const hostKey = entries.map(([k]) => k).sort()[0]
      if (hostKey !== myKeyRef.current) return
      const s = Math.floor(Math.random() * 1_000_000)
      setSeed(s)
      setPhase('racing')
      void channel.send({ type: 'broadcast', event: 'start', payload: { seed: s } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const autoStart = () => maybeAutoStart()

    const applyPresence = () => {
      presenceReadyRef.current = true
      // Keep ready flags that were set via broadcast (presence only carries
      // the initial ready:false from each player's join).
      const from = fromPresence(channel)
      for (const [key, p] of Object.entries(from)) {
        if (playersRef.current[key]) from[key] = { ...p, ready: playersRef.current[key].ready }
      }
      setPlayers(from)
      syncRoom()
      maybeAutoStart()
    }
    const applyProgress = (key: string, p: PresencePayload) => {
      setPlayers((prev) => {
        const existing = prev[key]
        return { ...prev, [key]: { key, name: existing?.name ?? p.name, progress: p.progress ?? 0, finished: p.finished ?? false, wpm: p.wpm ?? 0, accuracy: p.accuracy ?? 0, ready: existing?.ready ?? p.ready ?? false } }
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
      .on('broadcast', { event: 'ready' }, ({ payload }) => {
        const { key, ready } = payload as { key: string; ready: boolean }
        setPlayers((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], ready } } : prev))
        autoStart()
      })
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        applyProgress(payload.key as string, payload as PresencePayload)
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        const msg = payload as ChatMessage
        setMessages((prev) => [...prev.slice(-50), msg])
      })

    void channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        await channel.track({ name: nameRef.current, progress: 0, finished: false, wpm: 0, accuracy: 0, ready: false })
        syncRoom()
      }
    })

    // keep the room row fresh while we're sitting in it
    const keepAlive = window.setInterval(syncRoom, 15000)

    return () => {
      window.clearInterval(keepAlive)
      // Only delete the room when I'm the last player still in it; otherwise
      // the remaining players' presence sync keeps the count correct.
      if (presenceReadyRef.current && Object.keys(channel.presenceState()).length <= 1) {
        void deleteRoom(roomId)
      }
      void client.removeChannel(channel)
      channelRef.current = null
      setConnected(false)
      setPhase('waiting')
      setMessages([])
      setReady(false)
      readyRef.current = false
      setPlayers({})
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

  const toggleReady = () => {
    const ch = channelRef.current
    if (!ch) return
    const next = !readyRef.current
    readyRef.current = next
    setReady(next)
    setPlayers((prev) => (prev[myKeyRef.current] ? { ...prev, [myKeyRef.current]: { ...prev[myKeyRef.current], ready: next } } : prev))
    void ch.track({ name: nameRef.current, progress: 0, finished: false, wpm: 0, accuracy: 0, ready: next })
    void ch.send({ type: 'broadcast', event: 'ready', payload: { key: myKeyRef.current, ready: next } })
  }

  const updateProgress = (p: Omit<PresencePayload, 'name' | 'ready'>) => {
    const ch = channelRef.current
    const payload: PresencePayload = { ...p, name: nameRef.current, ready: readyRef.current }
    setPlayers((prev) => ({ ...prev, [myKeyRef.current]: { key: myKeyRef.current, name: nameRef.current, progress: p.progress ?? 0, finished: p.finished ?? false, wpm: p.wpm ?? 0, accuracy: p.accuracy ?? 0, ready: readyRef.current } }))
    if (!ch) return
    void ch.send({ type: 'broadcast', event: 'progress', payload: { key: myKeyRef.current, ...payload } })
  }

  const finishRace = (p: Omit<PresencePayload, 'name' | 'ready'>) => {
    updateProgress({ ...p, finished: true })
    setPhase('done')
  }

  const sendChat = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const ch = channelRef.current
    const msg: ChatMessage = { key: myKeyRef.current, name: nameRef.current, text: trimmed, ts: Date.now() }
    setMessages((prev) => [...prev.slice(-50), msg])
    if (!ch) return
    void ch.send({ type: 'broadcast', event: 'chat', payload: msg })
  }

  return { connected, players, phase, seed, messages, ready, myKey: myKeyRef.current, startRace, toggleReady, updateProgress, finishRace, sendChat }
}