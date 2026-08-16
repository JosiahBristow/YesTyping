import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { courseLabel, getCourse } from '../features/courses'
import { TypingSession } from '../features/typing/TypingSession'
import type { EngineResult } from '../features/typing/metrics'
import { useLocalStats } from '../features/stats/useLocalStats'
import { useProgress, progressKey } from '../features/progress/useProgress'
import { maybeUnlock } from '../features/achievements/achievements'
import { useBi } from '../lib/lang'
import { syncStats } from '../features/stats/remoteStats'

const EMPTY = { en: '', zh: '' }

export function PracticePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const course = getCourse(id)
  const title = useBi(course?.title ?? EMPTY)
  const [lessonIndex, setLessonIndex] = useState(() => {
    if (!course) return 0
    const done = useProgress.getState().done
    const firstIncomplete = course.lessons.findIndex((l) => !done[progressKey(course.id, l.id)])
    return firstIncomplete === -1 ? 0 : firstIncomplete
  })
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
    <div className="page container" style={{ maxWidth: '860px' }}>
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
    </div>
  )
}