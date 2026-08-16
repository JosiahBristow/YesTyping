import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { courseLabel, getCourse } from '../features/courses'
import type { Lesson } from '../features/courses/courseData'
import { TypingSession } from '../features/typing/TypingSession'
import type { EngineResult } from '../features/typing/metrics'
import { useLocalStats } from '../features/stats/useLocalStats'
import { useProgress, progressKey } from '../features/progress/useProgress'
import { maybeUnlock } from '../features/achievements/achievements'
import { useBi } from '../lib/lang'
import { cn } from '../lib/cn'
import { syncStats } from '../features/stats/remoteStats'

const EMPTY = { en: '', zh: '' }

function LessonItem({
  lesson,
  index,
  active,
  completed,
  locked,
  onClick,
}: {
  lesson: Lesson
  index: number
  active: boolean
  completed: boolean
  locked: boolean
  onClick: () => void
}) {
  const label = useBi(lesson.title)
  return (
    <button
      type="button"
      className={cn('lesson-item', active && 'active', locked && 'locked')}
      disabled={locked}
      aria-disabled={locked}
      onClick={onClick}
    >
      <span className="num">{locked ? '🔒' : completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
      <span>{label}</span>
    </button>
  )
}

export function PracticePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const course = getCourse(id)
  const title = useBi(course?.title ?? EMPTY)
  const [lessonIndex, setLessonIndex] = useState(0)
  const { add } = useLocalStats()
  const done = useProgress((s) => s.done)

  if (!course) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="big">🤷</div>
          <p>{t('courses.title')}</p>
          <Link to="/courses" className="btn btn-primary">
            {t('courses.title')}
          </Link>
        </div>
      </div>
    )
  }

  const lesson = course.lessons[lessonIndex] ?? course.lessons[0]
  const clampedIndex = course.lessons.findIndex((l) => l.id === lesson.id)

  // Sequential unlock: lesson 0 is always open; lesson i needs i-1 completed
  // (already-completed lessons stay accessible for review).
  const isUnlocked = (i: number): boolean =>
    i === 0 ||
    Boolean(done[progressKey(course.id, course.lessons[i - 1].id)]) ||
    Boolean(done[progressKey(course.id, course.lessons[i].id)])

  const currentLocked = !isUnlocked(clampedIndex)
  const firstUnlocked = course.lessons.findIndex((_, i) => isUnlocked(i))

  const onFinish = (result: EngineResult) => {
    add({
      label: courseLabel(course, clampedIndex),
      mode: result.mode,
      wpm: result.wpm,
      accuracy: result.accuracy,
      elapsedSec: result.elapsedSec,
      correctChars: result.correctChars,
      keyErrors: result.keyErrors,
      maxCombo: result.maxCombo,
    })
    const lesson = course.lessons[clampedIndex]
    if (lesson) {
      useProgress.getState().markDone(course.id, lesson.id, result.wpm, result.accuracy)
      maybeUnlock()
      void syncStats()
    }
  }

  const next = () =>
    setLessonIndex((i) => {
      const target = Math.min(i + 1, course.lessons.length - 1)
      return isUnlocked(target) ? target : i
    })
  const prev = () => setLessonIndex((i) => Math.max(i - 1, 0))

  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">{t('nav.courses')}</div>
        <h1>{title}</h1>
        <p>
          {t('practice.lesson', {
            index: clampedIndex + 1,
            total: course.lessons.length,
          })}
        </p>
      </div>

      <div className="practice-wrap">
        <div className="practice-main-col">
          <div className="card practice-panel">
            {currentLocked ? (
              <div className="empty-state">
                <div className="big">🔒</div>
                <p>{t('practice.locked')}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setLessonIndex(Math.max(0, firstUnlocked))}
                >
                  {t('practice.unlockNext')} →
                </button>
              </div>
            ) : (
              <TypingSession
                key={`${course.id}-${lesson.id}`}
                text={lesson.text}
                numpad={course.type === 'numpad'}
                hints={course.type === 'vocab' ? lesson.hints : undefined}
                onFinish={onFinish}
                onNext={next}
                onPrev={prev}
              />
            )}
          </div>
          {course.type === 'vim' && (
            <Link to="/vim-terminal" className="btn btn-ghost vim-term-link">
              🖥️ {t('vimTerminal.open')}
            </Link>
          )}
        </div>

        <aside className="lesson-side">
          <h4>{t('practice.choseLesson')}</h4>
          {course.lessons.map((l, i) => (
            <LessonItem
              key={l.id}
              lesson={l}
              index={i}
              active={i === clampedIndex}
              completed={Boolean(done[progressKey(course.id, l.id)])}
              locked={!isUnlocked(i)}
              onClick={() => setLessonIndex(i)}
            />
          ))}
        </aside>
      </div>
    </div>
  )
}