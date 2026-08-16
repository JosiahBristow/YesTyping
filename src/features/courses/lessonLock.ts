import { progressKey, type LessonProgress } from '../progress/useProgress'
import type { Course } from './courseData'

/** Lesson i is available when it's the first one, the previous is done, or it's already done. */
export function isLessonUnlocked(course: Course, done: Record<string, LessonProgress>, index: number): boolean {
  if (index === 0) return true
  const prev = course.lessons[index - 1]
  if (prev && done[progressKey(course.id, prev.id)]) return true
  return Boolean(done[progressKey(course.id, course.lessons[index]?.id ?? '')])
}

/** Index of the first lesson not yet completed (0 when everything is done). */
export function firstIncompleteLesson(course: Course, done: Record<string, LessonProgress>): number {
  const i = course.lessons.findIndex((l) => !done[progressKey(course.id, l.id)])
  return i === -1 ? 0 : i
}