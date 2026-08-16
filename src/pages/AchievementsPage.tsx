import { useTranslation } from 'react-i18next'
import { ACHIEVEMENTS, useAchievements, type Achievement, type AchievementCategory } from '../features/achievements/achievements'
import { useBi } from '../lib/lang'
import { cn } from '../lib/cn'

const CATEGORY_ORDER: AchievementCategory[] = ['progress', 'course', 'speed', 'accuracy', 'game']

const CATEGORY_ICON: Record<AchievementCategory, string> = {
  progress: '📈',
  course: '🎓',
  speed: '⚡',
  accuracy: '🎯',
  game: '🎮',
}

export function AchievementsPage() {
  const { t } = useTranslation()
  const unlocked = useAchievements((s) => s.unlocked)
  const progress = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)
  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.achievements')}</div>
        <h1>{t('achievements.title')}</h1>
        <p>{t('achievements.subtitle')}</p>
      </div>

      <div className="card achievement-summary">
        <div className="achievement-summary-head">
          <b>
            {t('achievements.count', { count: unlocked.length })}
            <span className="achievement-total"> / {ACHIEVEMENTS.length}</span>
          </b>
          <span className="achievement-pct">{progress}%</span>
        </div>
        <div className="achievement-track">
          <div className="achievement-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === category)
        const doneInCat = items.filter((a) => unlocked.includes(a.id)).length
        if (items.length === 0) return null
        return (
          <section key={category} className="achievement-cat">
            <h2 className="section-title achievement-cat-title">
              {CATEGORY_ICON[category]} {t(`achievements.cat.${category}`)}
              <span className="achievement-cat-count">
                {doneInCat}/{items.length}
              </span>
            </h2>
            <div className="achievement-grid">
              {items.map((a) => (
                <AchievementCard key={a.id} achievement={a} unlocked={unlocked.includes(a.id)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const title = useBi(achievement.title)
  const desc = useBi(achievement.desc)
  return (
    <div className={cn('achievement-card', !unlocked && 'locked')}>
      <span className="achievement-ic">{unlocked ? achievement.icon : '🔒'}</span>
      <div>
        <b>{title}</b>
        <p>{desc}</p>
      </div>
    </div>
  )
}