import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Course } from '../features/courses/courseData'
import { useBi } from '../lib/lang'
import { cn } from '../lib/cn'

export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation()
  const title = useBi(course.title)
  const desc = useBi(course.desc)

  return (
    <Link to={`/courses/${course.id}`} className={cn('card', 'course-card', `type-${course.type}`)}>
      <div className="course-card-top">
        <span className="course-ic">{course.icon}</span>
        <span className="go">{t('courses.start')} →</span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="meta">
        <span>{t('courses.lessons', { count: course.lessons.length })}</span>
        <span>{t(`courses.${course.type}`)}</span>
      </div>
    </Link>
  )
}