import { useTranslation } from 'react-i18next'
import { useSettings } from '../lib/settings'

export function KeyboardToggle() {
  const { t } = useTranslation()
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const setShowKeyboard = useSettings((s) => s.setShowKeyboard)

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-pressed={showKeyboard}
      onClick={() => setShowKeyboard(!showKeyboard)}
    >
      {showKeyboard ? '🙈' : '⌨️'} {showKeyboard ? t('practice.hideKeyboard') : t('practice.showKeyboard')}
    </button>
  )
}