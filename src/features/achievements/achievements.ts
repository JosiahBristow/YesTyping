import { create } from 'zustand'
import { COURSES } from '../courses'
import { loadSessions } from '../stats/useLocalStats'
import { useProgress } from '../progress/useProgress'
import { playAchievement } from '../../lib/sound'
import type { Bi } from '../../lib/lang'

export type AchievementCategory = 'course' | 'speed' | 'accuracy' | 'game' | 'progress'

export interface Achievement {
  id: string
  icon: string
  category: AchievementCategory
  title: Bi
  desc: Bi
}

const cat = (category: AchievementCategory) => category

export const ACHIEVEMENTS: Achievement[] = [
  // Progress
  { id: 'first-lesson', icon: '🚀', category: cat('progress'), title: { en: 'First steps', zh: '第一步' }, desc: { en: 'Complete your first lesson.', zh: '完成第一节课。' } },
  { id: 'sessions-10', icon: '🎯', category: cat('progress'), title: { en: 'Getting hooked', zh: '渐入佳境' }, desc: { en: 'Finish 10 practice sessions.', zh: '完成 10 次练习。' } },
  { id: 'sessions-50', icon: '🏅', category: cat('progress'), title: { en: 'Dedicated', zh: '持之以恒' }, desc: { en: 'Finish 50 practice sessions.', zh: '完成 50 次练习。' } },
  { id: 'sessions-100', icon: '🥇', category: cat('progress'), title: { en: 'Regular', zh: '雷打不动' }, desc: { en: 'Finish 100 practice sessions.', zh: '完成 100 次练习。' } },
  { id: 'chars-5k', icon: '⌨️', category: cat('progress'), title: { en: 'Five thousand', zh: '敲击五千' }, desc: { en: 'Type 5,000 correct characters in total.', zh: '累计正确输入 5000 个字符。' } },
  { id: 'time-1h', icon: '⏰', category: cat('progress'), title: { en: 'An hour in', zh: '练习一小时' }, desc: { en: 'Practice for 1 hour in total.', zh: '累计练习满 1 小时。' } },
  { id: 'streak-3', icon: '📆', category: cat('progress'), title: { en: 'Three in a row', zh: '连续三天' }, desc: { en: 'Practice on 3 consecutive days.', zh: '连续 3 天练习。' } },
  { id: 'streak-7', icon: '🗓️', category: cat('progress'), title: { en: 'Full week', zh: '一周不断' }, desc: { en: 'Practice on 7 consecutive days.', zh: '连续 7 天练习。' } },
  { id: 'all-lessons', icon: '🏆', category: cat('progress'), title: { en: 'Completionist', zh: '课程全通' }, desc: { en: 'Complete every lesson in every course.', zh: '完成所有课程的全部课时。' } },

  // Speed
  { id: 'wpm-30', icon: '🐢', category: cat('speed'), title: { en: 'Warm up', zh: '热身' }, desc: { en: 'Reach 30 WPM in a session.', zh: '单次练习速度达到 30 WPM。' } },
  { id: 'wpm-50', icon: '🚗', category: cat('speed'), title: { en: 'Cruising', zh: '风驰电掣' }, desc: { en: 'Reach 50 WPM in a session.', zh: '单次练习速度达到 50 WPM。' } },
  { id: 'wpm-80', icon: '🏎️', category: cat('speed'), title: { en: 'Speedster', zh: '极速狂飙' }, desc: { en: 'Reach 80 WPM in a session.', zh: '单次练习速度达到 80 WPM。' } },
  { id: 'wpm-100', icon: '🚀', category: cat('speed'), title: { en: 'Afterburner', zh: '飞驰电掣' }, desc: { en: 'Reach 100 WPM in a session.', zh: '单次练习速度达到 100 WPM。' } },

  // Accuracy
  { id: 'perfect', icon: '💯', category: cat('accuracy'), title: { en: 'Flawless', zh: '零失误' }, desc: { en: 'Finish a session with 100% accuracy.', zh: '以 100% 正确率完成一次练习。' } },
  { id: 'combo-20', icon: '🔥', category: cat('accuracy'), title: { en: 'On fire', zh: '势如破竹' }, desc: { en: 'Type 20 characters in a row without an error.', zh: '连续正确输入 20 个字符。' } },
  { id: 'combo-50', icon: '⚡', category: cat('accuracy'), title: { en: 'Unstoppable', zh: '势不可挡' }, desc: { en: 'Type 50 characters in a row without an error.', zh: '连续正确输入 50 个字符。' } },
  { id: 'combo-100', icon: '🌩️', category: cat('accuracy'), title: { en: 'Machine', zh: '人形打字机' }, desc: { en: 'Type 100 characters in a row without an error.', zh: '连续正确输入 100 个字符。' } },

  // Courses
  { id: 'finger-course', icon: '🖐️', category: cat('course'), title: { en: 'Finger master', zh: '指法大师' }, desc: { en: 'Complete every finger basics lesson.', zh: '完成指法基础的全部课程。' } },
  { id: 'course-numbers', icon: '🔢', category: cat('course'), title: { en: 'Number cruncher', zh: '数字高手' }, desc: { en: 'Complete every numbers row lesson.', zh: '完成数字键位课程的全部课时。' } },
  { id: 'course-english', icon: '🔤', category: cat('course'), title: { en: 'Wordsmith', zh: '英语能手' }, desc: { en: 'Complete every English lesson.', zh: '完成英文练习课程的全部课时。' } },
  { id: 'course-code', icon: '💻', category: cat('course'), title: { en: 'Code warrior', zh: '代码高手' }, desc: { en: 'Complete every code typing lesson.', zh: '完成代码练习课程的全部课时。' } },
  { id: 'course-symbols', icon: '🔣', category: cat('course'), title: { en: 'Symbol seeker', zh: '符号达人' }, desc: { en: 'Complete every symbol lesson.', zh: '完成符号练习课程的全部课时。' } },
  { id: 'course-numpad', icon: '🧮', category: cat('course'), title: { en: 'Numpad ace', zh: '小键盘之王' }, desc: { en: 'Complete every numpad lesson.', zh: '完成数字小键盘课程的全部课时。' } },
  { id: 'course-vim', icon: '🖥️', category: cat('course'), title: { en: 'Vim virtuoso', zh: 'Vim 大师' }, desc: { en: 'Complete every Vim lesson.', zh: '完成 Vim 键位课程的全部课时。' } },
  { id: 'course-pinyin', icon: '🗣️', category: cat('course'), title: { en: 'Pinyin pro', zh: '拼音达人' }, desc: { en: 'Complete every Pinyin lesson.', zh: '完成拼音练习课程的全部课时。' } },
  { id: 'course-chinese', icon: '🀄', category: cat('course'), title: { en: 'Chinese star', zh: '中文高手' }, desc: { en: 'Complete every Chinese lesson.', zh: '完成中文输入课程的全部课时。' } },
  { id: 'course-vocab', icon: '📚', category: cat('course'), title: { en: 'Lexicon', zh: '单词大师' }, desc: { en: 'Complete every vocabulary lesson.', zh: '完成单词记忆课程的全部课时。' } },

  // Games
  { id: 'race-win', icon: '🏁', category: cat('game'), title: { en: 'First blood', zh: '首战告捷' }, desc: { en: 'Win a race in the speed test.', zh: '在竞速对战中获胜一次。' } },
  { id: 'race-5', icon: '🏆', category: cat('game'), title: { en: 'Race winner', zh: '常胜将军' }, desc: { en: 'Win 5 races.', zh: '在竞速对战中累计获胜 5 次。' } },
  { id: 'game-1000', icon: '🎮', category: cat('game'), title: { en: 'Game on', zh: '初露锋芒' }, desc: { en: 'Score 1,000 in Word Rain.', zh: '单词雨得分达到 1000。' } },
  { id: 'game-5000', icon: '👑', category: cat('game'), title: { en: 'High roller', zh: '游戏高手' }, desc: { en: 'Score 5,000 in Word Rain.', zh: '单词雨得分达到 5000。' } },
  { id: 'game-combo-10', icon: '🔥', category: cat('game'), title: { en: 'Rainmaker', zh: '连击大师' }, desc: { en: 'Reach a 10-combo in Word Rain.', zh: '单词雨中连击达到 10。' } },
]

const STORAGE_KEY = 'yestyping.achievements.v1'
const RACE_KEY = 'yestyping.raceWins'
const STREAK_KEY = 'yestyping.streak'
const GAME_COMBO_KEY = 'yestyping.gameMaxCombo'

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

const COURSE_ACHIEVEMENT: Record<string, string> = {
  'finger-basics': 'finger-course',
  numbers: 'course-numbers',
  english: 'course-english',
  code: 'course-code',
  symbols: 'course-symbols',
  numpad: 'course-numpad',
  vim: 'course-vim',
  pinyin: 'course-pinyin',
  chinese: 'course-chinese',
  vocab: 'course-vocab',
}

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayStr(): string {
  const d = new Date(Date.now() - 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function readStreak(): number {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) ?? '') as { n?: number } | null
    return typeof data?.n === 'number' ? data.n : 0
  } catch {
    return 0
  }
}

function bumpStreak(): void {
  const today = todayStr()
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) ?? '') as { n?: number; last?: string } | null
    if (data?.last === today) return
    const n = data?.last === yesterdayStr() ? (data.n ?? 0) + 1 : 1
    localStorage.setItem(STREAK_KEY, JSON.stringify({ n, last: today }))
  } catch {
    // storage unavailable — ignore
  }
}

/** Compute every achievement that follows from persisted state. */
export function evaluateAll(): string[] {
  const ids: string[] = []
  const done = useProgress.getState().done
  const sessions = loadSessions()
  const totalLessons = COURSES.reduce((acc, c) => acc + c.lessons.length, 0)
  const doneCount = Object.keys(done).length
  const allChars = sessions.reduce((a, s) => a + s.correctChars, 0)
  const totalSec = sessions.reduce((a, s) => a + s.elapsedSec, 0)
  const maxWpm = sessions.reduce((m, s) => Math.max(m, s.wpm), 0)
  const maxAcc = sessions.reduce((m, s) => Math.max(m, s.accuracy), 0)
  const maxCombo = sessions.reduce((m, s) => Math.max(m, s.maxCombo ?? 0), 0)
  const raceWins = readNumber(RACE_KEY)
  const gameBest = readNumber('yestyping.gameBest')
  const gameCombo = readNumber(GAME_COMBO_KEY)
  const streak = readStreak()

  // Progress
  if (doneCount >= 1) ids.push('first-lesson')
  if (sessions.length >= 10) ids.push('sessions-10')
  if (sessions.length >= 50) ids.push('sessions-50')
  if (sessions.length >= 100) ids.push('sessions-100')
  if (allChars >= 5000) ids.push('chars-5k')
  if (totalSec >= 3600) ids.push('time-1h')
  if (streak >= 3) ids.push('streak-3')
  if (streak >= 7) ids.push('streak-7')
  if (doneCount >= totalLessons) ids.push('all-lessons')

  // Speed
  if (maxWpm >= 30) ids.push('wpm-30')
  if (maxWpm >= 50) ids.push('wpm-50')
  if (maxWpm >= 80) ids.push('wpm-80')
  if (maxWpm >= 100) ids.push('wpm-100')

  // Accuracy
  if (maxAcc >= 100) ids.push('perfect')
  if (maxCombo >= 20) ids.push('combo-20')
  if (maxCombo >= 50) ids.push('combo-50')
  if (maxCombo >= 100) ids.push('combo-100')

  // Courses
  for (const course of COURSES) {
    const id = COURSE_ACHIEVEMENT[course.id]
    if (id && course.lessons.length > 0 && course.lessons.every((l) => done[`${course.id}:${l.id}`])) {
      ids.push(id)
    }
  }

  // Games
  if (raceWins >= 1) ids.push('race-win')
  if (raceWins >= 5) ids.push('race-5')
  if (gameBest >= 1000) ids.push('game-1000')
  if (gameBest >= 5000) ids.push('game-5000')
  if (gameCombo >= 10) ids.push('game-combo-10')

  return ids
}

function newlyUnlocked(): string[] {
  const unlocked = useAchievements.getState().unlocked
  return evaluateAll().filter((id) => !unlocked.includes(id))
}

function unlockWithToast(ids: string[]): void {
  if (ids.length === 0) return
  useAchievements.getState().unlock(ids)
  playAchievement()
  useToast
    .getState()
    .push(ids.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter((a): a is Achievement => Boolean(a)))
}

/** Call after any typing session finishes: bumps the daily streak and unlocks what applies. */
export function maybeUnlock(): void {
  bumpStreak()
  unlockWithToast(newlyUnlocked())
}

/** Record a race outcome and unlock race achievements. */
export function winRace(won: boolean): void {
  if (!won) return
  try {
    localStorage.setItem(RACE_KEY, String(readNumber(RACE_KEY) + 1))
  } catch {
    // ignore
  }
  unlockWithToast(newlyUnlocked())
}

/** Record Word Rain stats and unlock game achievements. */
export function unlockGame(score: number, maxCombo: number): void {
  try {
    if (score > readNumber('yestyping.gameBest')) localStorage.setItem('yestyping.gameBest', String(score))
    if (maxCombo > readNumber(GAME_COMBO_KEY)) localStorage.setItem(GAME_COMBO_KEY, String(maxCombo))
  } catch {
    // ignore
  }
  unlockWithToast(newlyUnlocked())
}

/** Unlock everything already earned, silently (runs once on startup for returning users). */
export function syncAchievements(): void {
  useAchievements.getState().unlock(newlyUnlocked())
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