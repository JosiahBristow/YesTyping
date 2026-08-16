import { useTranslation } from 'react-i18next'
import { ACHIEVEMENTS, useAchievements, type Achievement } from '../features/achievements/achievements'
import { useBi } from '../lib/lang'
import { cn } from '../lib/cn'

export function AchievementsPage() {
  const { t } = useTranslation()
  const unlocked = useAchievements((s) => s.unlocked)

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.achievements')}</div>
        <h1>{t('achievements.title')}</h1>
        <p>
          {t('achievements.subtitle')} {t('achievements.count', { count: unlocked.length })}
        </p>
      </div>

      <div className="achievement-grid">
        {ACHIEVEMENTS.map((a) => (
          <AchievementCard key={a.id} achievement={a} unlocked={unlocked.includes(a.id)} />
        ))}
      </div>
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