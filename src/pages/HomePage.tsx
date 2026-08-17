import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { COURSES } from '../features/courses'
import { CourseCard } from '../components/CourseCard'
import { keyForChar } from '../features/typing/layouts'
import { playKey } from '../lib/sound'
import { cn } from '../lib/cn'

const TOP_ROW = 'qwertyuiop'.split('')
const HOME_ROW = 'asdfghjkl'.split('')
const BOTTOM_ROW = 'zxcvbnm'.split('')

const LESSON_COUNT = COURSES.reduce((acc, c) => acc + c.lessons.length, 0)

export function HomePage() {
  const { t } = useTranslation()
  const [pressed, setPressed] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.key.length !== 1) return
      setPressed(keyForChar(e.key))
      window.setTimeout(() => setPressed(null), 140)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const press = (key: string) => {
    setPressed(key)
    playKey()
    window.setTimeout(() => setPressed(null), 140)
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <span className="hero-kicker">{t('hero.kicker')}</span>
            <h1>
              {t('hero.title1')} <span className="accent typo">{t('hero.title2')}</span>
            </h1>
            <p className="hero-sub">{t('hero.subtitle')}</p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary">
                {t('hero.cta')} →
              </Link>
              <Link to="/speed-test" className="btn btn-ghost">
                {t('hero.ctaCourses')}
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <b>{COURSES.length}</b>
                <span>{t('hero.stat1')}</span>
              </div>
              <div className="hero-stat">
                <b>{LESSON_COUNT}</b>
                <span>{t('hero.stat2')}</span>
              </div>
              <div className="hero-stat">
                <b>live</b>
                <span>{t('hero.stat3')}</span>
              </div>
            </div>
          </div>

          <div className="hero-kb" aria-hidden>
            <div className="hero-kb-row">
              {TOP_ROW.map((k) => (
                <span
                  key={k}
                  className={cn('hero-key', k === 'e' && 'focus', k === 'r' && 'focus', pressed === k && 'press')}
                  onClick={() => press(k)}
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="hero-kb-row">
              {HOME_ROW.map((k) => (
                <span
                  key={k}
                  className={cn('hero-key', (k === 'f' || k === 'j') && 'focus', pressed === k && 'press')}
                  onClick={() => press(k)}
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="hero-kb-row">
              {BOTTOM_ROW.map((k) => (
                <span key={k} className={cn('hero-key', pressed === k && 'press')} onClick={() => press(k)}>
                  {k}
                </span>
              ))}
              <span className="hero-key brand">⌫</span>
            </div>
            <div className="hero-kb-row">
              <span className={cn('hero-key space', pressed === 'space' && 'press')} onClick={() => press('space')}>
                space
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="page container" style={{ paddingTop: '1.5rem' }}>
        <div className="eyebrow">{t('features.courseTypes')}</div>
        <h2 className="section-title">{t('features.title')}</h2>
        <p className="section-sub">{t('features.subtitle')}</p>

        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-ic">⌨️</span>
            <div>
              <h3>{t('features.fingerTitle')}</h3>
              <p>{t('features.fingerDesc')}</p>
            </div>
          </div>
          <div className="feature-card">
            <span className="feature-ic">🔤</span>
            <div>
              <h3>{t('features.englishTitle')}</h3>
              <p>{t('features.englishDesc')}</p>
            </div>
          </div>
          <div className="feature-card">
            <span className="feature-ic">⚡</span>
            <div>
              <h3>{t('features.speedTitle')}</h3>
              <p>{t('features.speedDesc')}</p>
            </div>
          </div>
          <div className="feature-card">
            <span className="feature-ic">📈</span>
            <div>
              <h3>{t('features.statsTitle')}</h3>
              <p>{t('features.statsDesc')}</p>
            </div>
          </div>
        </div>

        <div className="course-grid" style={{ marginTop: '1.5rem' }}>
          {COURSES.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>
    </>
  )
}