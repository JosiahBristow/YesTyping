import { useTranslation } from 'react-i18next'
import type { PassVerdict } from '../features/typing/metrics'
import { cn } from '../lib/cn'

export function PassBanner({ verdict }: { verdict: PassVerdict }) {
  const { t } = useTranslation()
  const rows = [
    { ok: verdict.criteria.time, label: t('practice.passTime') },
    { ok: verdict.criteria.wpm, label: t('practice.passWpm') },
    { ok: verdict.criteria.accuracy, label: t('practice.passAccuracy') },
  ]
  return (
    <div className={cn('pass-banner', verdict.passed ? 'pass' : 'fail')}>
      <div className="pass-verdict">
        {verdict.passed ? '🎉' : '💪'} {verdict.passed ? t('practice.passed') : t('practice.notPassed')}
      </div>
      <div className="pass-criteria">
        {rows.map((r) => (
          <span key={r.label} className={cn('pass-criterion', r.ok && 'ok')}>
            {r.ok ? '✓' : '✗'} {r.label}
          </span>
        ))}
      </div>
      {!verdict.passed && <p className="pass-hint">{t('practice.retryHint')}</p>}
    </div>
  )
}