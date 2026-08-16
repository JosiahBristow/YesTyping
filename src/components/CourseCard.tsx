import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Course } from '../features/courses/courseData'
import { useBi } from '../lib/lang'
import { useProgress } from '../features/progress/useProgress'
import { progressKey } from '../features/progress/useProgress'
import { cn } from '../lib/cn'

export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation()
  const title = useBi(course.title)
  const desc = useBi(course.desc)
  const done = useProgress((s) => s.done)
  const completed = course.lessons.filter((l) => done[progressKey(course.id, l.id)]).length
  const pct = Math.round((completed / course.lessons.length) * 100)
  const isComplete = completed === course.lessons.length

  return (
    <Link to={`/courses/${course.id}`} className={cn('card', 'course-card', `type-${course.type}`)}>
      <div className="course-card-top">
        <span className="course-ic">{course.icon}</span>
        <span className="go">{isComplete ? t('courses.done') : `${t('courses.start')} →`}</span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="course-progress">
        <div className="course-progress-track">
          <div className="course-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="course-progress-label">
          {t('courses.progress', { done: completed, total: course.lessons.length })}
        </span>
      </div>
      <div className="meta">
        <span>{t('courses.lessons', { count: course.lessons.length })}</span>
        <span>{t(`courses.${course.type}`)}</span>
      </div>
    </Link>
  )
}