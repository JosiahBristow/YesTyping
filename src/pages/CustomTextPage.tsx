import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TypingSession } from '../features/typing/TypingSession'
import type { EngineResult } from '../features/typing/metrics'
import { useLocalStats } from '../features/stats/useLocalStats'

const STORAGE_KEY = 'yestyping.customText'

function loadSaved(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function CustomTextPage() {
  const { t } = useTranslation()
  const { add } = useLocalStats()
  const [draft, setDraft] = useState(loadSaved)
  const [text, setText] = useState<string | null>(null)
  const [seed, setSeed] = useState(0)

  const start = () => {
    const value = draft.trim()
    if (!value) return
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // ignore
    }
    setText(value)
  }

  const restart = () => setSeed((s) => s + 1)

  const onFinish = (result: EngineResult) => {
    add({
      label: 'Custom text',
      mode: result.mode,
      wpm: result.wpm,
      accuracy: result.accuracy,
      elapsedSec: result.elapsedSec,
      correctChars: result.correctChars,
    })
  }

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.courses')}</div>
        <h1>{t('custom.title')}</h1>
        <p>{t('custom.subtitle')}</p>
      </div>

      {!text ? (
        <div className="card speed-panel">
          <textarea
            className="custom-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('custom.placeholder')}
            rows={8}
          />
          <div className="custom-actions">
            <button type="button" className="btn btn-primary" onClick={start} disabled={!draft.trim()}>
              {t('custom.start')} →
            </button>
            <Link to="/courses" className="btn btn-ghost">
              {t('custom.back')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="card speed-panel">
          <TypingSession key={seed} text={text} onFinish={onFinish} />
          <div className="custom-actions" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setText(null)}>
              ← {t('custom.new')}
            </button>
            <button type="button" className="btn btn-primary" onClick={restart}>
              ↺ {t('practice.restart')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}