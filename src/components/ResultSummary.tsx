import { useTranslation } from 'react-i18next'
import type { EngineResult } from '../features/typing/metrics'
import { formatClock } from '../features/typing/metrics'

export interface ResultSummaryProps {
  result: EngineResult
  title: string
  subtitle?: string
  footer?: React.ReactNode
}

export function ResultSummary({ result, title, subtitle, footer }: ResultSummaryProps) {
  const { t } = useTranslation()
  return (
    <div className="result-card">
      <h2>{title}</h2>
      {subtitle && <p className="sub">{subtitle}</p>}
      <div className="result-stats">
        <div className="result-stat">
          <b>{result.wpm}</b>
          <span>{t('practice.wpm')}</span>
        </div>
        <div className="result-stat">
          <b>{result.accuracy}%</b>
          <span>{t('practice.accuracy')}</span>
        </div>
        <div className="result-stat">
          <b>{result.consistency}%</b>
          <span>{t('practice.consistency')}</span>
        </div>
        <div className="result-stat">
          <b>{formatClock(result.elapsedSec)}</b>
          <span>{t('practice.time')}</span>
        </div>
      </div>
      {footer && <div className="result-actions">{footer}</div>}
    </div>
  )
}