import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCourse } from '../features/courses'
import { firstIncompleteLesson, isLessonUnlocked } from '../features/courses/lessonLock'
import { progressKey, useProgress } from '../features/progress/useProgress'
import { useBi, useLang } from '../lib/lang'
import { cn } from '../lib/cn'

export function LessonListPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const course = getCourse(id)
  const title = useBi(course?.title ?? { en: '', zh: '' })
  const desc = useBi(course?.desc ?? { en: '', zh: '' })
  const lang = useLang((s) => s.lang)
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

  const completed = course.lessons.filter((l) => done[progressKey(course.id, l.id)]).length
  const pct = Math.round((completed / course.lessons.length) * 100)
  const nextIndex = firstIncompleteLesson(course, done)
  const nextLesson = course.lessons[nextIndex]

  return (
    <div className="page container" style={{ maxWidth: '760px' }}>
      <div className="page-head">
        <Link to="/courses" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem' }}>
          ← {t('practice.back')}
        </Link>
        <div className="eyebrow">{t('nav.courses')}</div>
        <h1>
          {course.icon} {title}
        </h1>
        <p>{desc}</p>
      </div>

      <div className="card lesson-list-continue">
        <div className="course-progress">
          <div className="course-progress-track">
            <div className="course-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="course-progress-label">
            {t('courses.progress', { done: completed, total: course.lessons.length })}
          </span>
        </div>
        {nextLesson && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/practice/${course.id}/${nextLesson.id}`)}
          >
            {completed > 0 ? `${t('practice.resume')} →` : `${t('courses.start')} →`}
          </button>
        )}
      </div>

      <div className="lesson-list">
        {course.lessons.map((lesson, i) => {
          const unlocked = isLessonUnlocked(course, done, i)
          const isDone = Boolean(done[progressKey(course.id, lesson.id)])
          const label = lang === 'zh' ? lesson.title.zh : lesson.title.en
          return (
            <button
              key={lesson.id}
              type="button"
              disabled={!unlocked}
              className={cn('lesson-card', unlocked && 'unlocked', isDone && 'done', i === nextIndex && 'next')}
              onClick={() => navigate(`/practice/${course.id}/${lesson.id}`)}
            >
              <span className="lesson-card-num">{unlocked ? (isDone ? '✓' : String(i + 1).padStart(2, '0')) : '🔒'}</span>
              <span className="lesson-card-title">{label}</span>
              {!unlocked && <span className="lesson-card-lock">{t('practice.lockedShort')}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}