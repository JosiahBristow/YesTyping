import { useEffect, useState } from 'react'
import type { EngineMode } from '../typing/metrics'

export interface SessionRecord {
  id: string
  at: number
  label: string
  mode: EngineMode
  wpm: number
  accuracy: number
  elapsedSec: number
  correctChars: number
  durationSec?: number
  keyErrors?: Record<string, number>
}

const STORAGE_KEY = 'yestyping.sessions.v1'
const MAX_SESSIONS = 200

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SessionRecord[]
  } catch {
    return []
  }
}

function saveAll(sessions: SessionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // storage full or unavailable — ignore, sessions stay in memory
  }
}

export function useLocalStats() {
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions())

  useEffect(() => {
    saveAll(sessions)
  }, [sessions])

  const add = (rec: Omit<SessionRecord, 'id' | 'at'>) => {
    const full: SessionRecord = {
      ...rec,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
    }
    const next = [full, ...loadSessions()].slice(0, MAX_SESSIONS)
    saveAll(next)
    setSessions(next)
  }

  return { sessions, add }
}