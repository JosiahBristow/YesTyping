import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { courseLabel, getCourse } from '../features/courses'
import { firstIncompleteLesson, isLessonUnlocked } from '../features/courses/lessonLock'
import { TypingSession } from '../features/typing/TypingSession'
import type { EngineResult } from '../features/typing/metrics'
import { evaluatePass } from '../features/typing/metrics'
import { useLocalStats } from '../features/stats/useLocalStats'
import { useProgress } from '../features/progress/useProgress'
import { maybeUnlock } from '../features/achievements/achievements'
import { useBi } from '../lib/lang'
import { syncStats } from '../features/stats/remoteStats'

const EMPTY = { en: '', zh: '' }

export function PracticePage() {
  const { courseId = '', lessonId = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const course = getCourse(courseId)
  const title = useBi(course?.title ?? EMPTY)
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

  const index = course.lessons.findIndex((l) => l.id === lessonId)
  const clampedIndex = index === -1 ? firstIncompleteLesson(course, done) : index
  const lesson = course.lessons[clampedIndex]
  const locked = !isLessonUnlocked(course, done, clampedIndex)

  const go = (i: number) => {
    const target = Math.max(0, Math.min(i, course.lessons.length - 1))
    navigate(`/practice/${course.id}/${course.lessons[target].id}`)
  }

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
    if (lesson) {
      // Only a passing run counts as done and unlocks the next lesson.
      const verdict = evaluatePass(result, lesson.text.length)
      if (verdict.passed) {
        useProgress.getState().markDone(course.id, lesson.id, result.wpm, result.accuracy)
      }
      maybeUnlock()
      void syncStats()
    }
  }

  const next = () => {
    if (clampedIndex < course.lessons.length - 1) go(clampedIndex + 1)
  }
  const prev = () => {
    if (clampedIndex > 0) go(clampedIndex - 1)
  }

  return (
    <div className="page container" style={{ maxWidth: '1080px' }}>
      <div className="page-head">
        <Link to={`/courses/${course.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem' }}>
          ← {t('practice.backToLessons')}
        </Link>
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
          {locked ? (
            <div className="empty-state">
              <div className="big">🔒</div>
              <p>{t('practice.locked')}</p>
              <Link to={`/courses/${course.id}`} className="btn btn-primary">
                {t('practice.backToLessons')} →
              </Link>
            </div>
          ) : (
              <TypingSession
                key={`${course.id}-${lesson.id}`}
                text={lesson.text}
                numpad={course.type === 'numpad'}
                autoSpace={course.type === 'pinyin'}
                hints={course.type === 'vocab' ? lesson.hints : undefined}
                hanzi={course.type === 'pinyin' ? lesson.hanzi?.split(' ') : undefined}
                graded
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