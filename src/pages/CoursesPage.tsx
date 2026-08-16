import { useTranslation } from 'react-i18next'
import { COURSES } from '../features/courses'
import { CourseCard } from '../components/CourseCard'

export function CoursesPage() {
  const { t } = useTranslation()
  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">{t('nav.courses')}</div>
        <h1>{t('courses.title')}</h1>
        <p>{t('courses.subtitle')}</p>
      </div>
      <div className="course-grid">
        {COURSES.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  )
}