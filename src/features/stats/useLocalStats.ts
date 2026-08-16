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
    setSessions((prev) => [full, ...prev].slice(0, MAX_SESSIONS))
  }

  return { sessions, add }
}