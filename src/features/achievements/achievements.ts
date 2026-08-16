import { create } from 'zustand'
import { COURSES } from '../courses'
import { loadSessions } from '../stats/useLocalStats'
import { useProgress } from '../progress/useProgress'
import type { EngineResult } from '../typing/metrics'
import type { Bi } from '../../lib/lang'

export interface Achievement {
  id: string
  icon: string
  title: Bi
  desc: Bi
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    icon: '🚀',
    title: { en: 'First steps', zh: '第一步' },
    desc: { en: 'Complete your first lesson.', zh: '完成第一节课。' },
  },
  {
    id: 'perfect',
    icon: '💯',
    title: { en: 'Flawless', zh: '零失误' },
    desc: { en: 'Finish a session with 100% accuracy.', zh: '以 100% 正确率完成一次练习。' },
  },
  {
    id: 'combo-20',
    icon: '🔥',
    title: { en: 'On fire', zh: '势如破竹' },
    desc: { en: 'Type 20 characters in a row without an error.', zh: '连续正确输入 20 个字符。' },
  },
  {
    id: 'combo-50',
    icon: '⚡',
    title: { en: 'Unstoppable', zh: '势不可挡' },
    desc: { en: 'Type 50 characters in a row without an error.', zh: '连续正确输入 50 个字符。' },
  },
  {
    id: 'wpm-30',
    icon: '🐢',
    title: { en: 'Warm up', zh: '渐入佳境' },
    desc: { en: 'Reach 30 WPM in a session.', zh: '单次练习速度达到 30 WPM。' },
  },
  {
    id: 'wpm-50',
    icon: '🚗',
    title: { en: 'Cruising', zh: '风驰电掣' },
    desc: { en: 'Reach 50 WPM in a session.', zh: '单次练习速度达到 50 WPM。' },
  },
  {
    id: 'wpm-80',
    icon: '🏎️',
    title: { en: 'Speedster', zh: '极速狂飙' },
    desc: { en: 'Reach 80 WPM in a session.', zh: '单次练习速度达到 80 WPM。' },
  },
  {
    id: 'finger-course',
    icon: '🖐️',
    title: { en: 'Finger master', zh: '指法大师' },
    desc: { en: 'Complete every finger basics lesson.', zh: '完成指法基础的全部课程。' },
  },
  {
    id: 'sessions-10',
    icon: '🎯',
    title: { en: 'Getting hooked', zh: '渐入佳境' },
    desc: { en: 'Finish 10 practice sessions.', zh: '完成 10 次练习。' },
  },
  {
    id: 'sessions-50',
    icon: '🏅',
    title: { en: 'Dedicated', zh: '持之以恒' },
    desc: { en: 'Finish 50 practice sessions.', zh: '完成 50 次练习。' },
  },
  {
    id: 'all-lessons',
    icon: '🏆',
    title: { en: 'Completionist', zh: '课程全通' },
    desc: { en: 'Complete every lesson in every course.', zh: '完成所有课程的全部课时。' },
  },
]

const STORAGE_KEY = 'yestyping.achievements.v1'

function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as string[]
    return []
  } catch {
    return []
  }
}

function saveUnlocked(unlocked: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  } catch {
    // storage unavailable — ignore
  }
}

interface AchievementState {
  unlocked: string[]
  unlock: (ids: string[]) => void
}

export const useAchievements = create<AchievementState>((set) => ({
  unlocked: loadUnlocked(),
  unlock: (ids) =>
    set((s) => {
      const newly = ids.filter((id) => !s.unlocked.includes(id))
      if (newly.length === 0) return s
      const unlocked = [...s.unlocked, ...newly]
      saveUnlocked(unlocked)
      return { unlocked }
    }),
}))

export function evaluate(result: EngineResult): string[] {
  const unlockedIds: string[] = []
  const done = useProgress.getState().done
  const sessions = loadSessions()
  const totalLessons = COURSES.reduce((acc, c) => acc + c.lessons.length, 0)
  const doneCount = Object.keys(done).length
  const fingerCourse = COURSES.find((c) => c.id === 'finger-basics')

  if (doneCount >= 1) unlockedIds.push('first-lesson')
  if (result.accuracy >= 100) unlockedIds.push('perfect')
  if (result.maxCombo >= 20) unlockedIds.push('combo-20')
  if (result.maxCombo >= 50) unlockedIds.push('combo-50')
  if (result.wpm >= 30) unlockedIds.push('wpm-30')
  if (result.wpm >= 50) unlockedIds.push('wpm-50')
  if (result.wpm >= 80) unlockedIds.push('wpm-80')
  if (fingerCourse && fingerCourse.lessons.every((l) => done[`finger-basics:${l.id}`])) {
    unlockedIds.push('finger-course')
  }
  if (sessions.length >= 10) unlockedIds.push('sessions-10')
  if (sessions.length >= 50) unlockedIds.push('sessions-50')
  if (doneCount >= totalLessons) unlockedIds.push('all-lessons')

  return unlockedIds
}

export function maybeUnlock(result: EngineResult): void {
  const newly = evaluate(result)
  if (newly.length === 0) return
  useAchievements.getState().unlock(newly)
  useToast.getState().push(
    newly
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter((a): a is Achievement => Boolean(a)),
  )
}

interface ToastState {
  toasts: Achievement[]
  push: (items: Achievement[]) => void
  remove: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (items) => set((s) => ({ toasts: [...s.toasts, ...items] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))