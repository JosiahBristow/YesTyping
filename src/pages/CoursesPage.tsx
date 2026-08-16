import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
        <Link to="/custom" className="card course-card custom-card">
          <div className="course-card-top">
            <span className="course-ic custom-ic">📝</span>
          </div>
          <h3>{t('custom.title')}</h3>
          <p>{t('custom.subtitle')}</p>
          <div className="meta">
            <span>{t('custom.paste')}</span>
            <span className="go">→</span>
          </div>
        </Link>
      </div>
    </div>
  )
}