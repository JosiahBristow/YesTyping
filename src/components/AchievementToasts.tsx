import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../features/achievements/achievements'
import { useBi, type Bi } from '../lib/lang'

const TOAST_MS = 4000

export function AchievementToasts() {
  const { t } = useTranslation()
  const toasts = useToast((s) => s.toasts)
  const remove = useToast((s) => s.remove)

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((a) => (
        <Toast key={a.id} achievement={a} remove={remove} label={t('achievements.toast')} />
      ))}
    </div>
  )
}

function Toast({
  achievement,
  remove,
  label,
}: {
  achievement: { id: string; icon: string; title: Bi; desc: Bi }
  remove: (id: string) => void
  label: string
}) {
  const title = useBi(achievement.title)
  const desc = useBi(achievement.desc)
  const { id, icon } = achievement

  useEffect(() => {
    const timer = window.setTimeout(() => remove(id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [id, remove])

  return (
    <div className="toast" role="status">
      <span className="toast-ic">{icon}</span>
      <div className="toast-body">
        <span className="toast-label">{label}</span>
        <b>{title}</b>
        <span className="toast-desc">{desc}</span>
      </div>
      <button type="button" className="toast-close" aria-label="close" onClick={() => remove(id)}>
        ×
      </button>
    </div>
  )
}