import { useTranslation } from 'react-i18next'
import { KEYBOARD_STYLES, useSettings, type KeyboardStyle } from '../lib/settings'
import { useLayout } from '../lib/layout'
import { LAYOUTS, type LayoutId } from '../features/typing/layouts'
import { useLang } from '../lib/lang'
import { useSound } from '../lib/sound'
import { LANGS } from '../i18n'
import { cn } from '../lib/cn'

const KEYBOARD_ICONS: Record<KeyboardStyle, string> = {
  rainbow: '🌈',
  mono: '⬜',
  vintage: '📠',
  neon: '💡',
  pastel: '🌸',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <div className="settings-control">{children}</div>
    </div>
  )
}

export function OnboardingModal() {
  const { t } = useTranslation()
  const { keyboardStyle, setKeyboardStyle, showKeyboard, setShowKeyboard, setOnboarded } = useSettings()
  const { layout, setLayout } = useLayout()
  const { lang, setLang } = useLang()
  const sound = useSound((s) => s.enabled)

  return (
    <div className="modal-overlay">
      <div className="onboard-card card">
        <div className="onboard-head">
          <div className="eyebrow">{t('onboarding.eyebrow')}</div>
          <h1>YesTyping</h1>
          <p>{t('onboarding.subtitle')}</p>
        </div>

        <div className="settings-panel">
          <Row label={t('lang.label')}>
            <div className="seg-group">
              {LANGS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={cn(lang === id && 'active')}
                  onClick={() => setLang(id)}
                >
                  {t(`lang.${id}`)}
                </button>
              ))}
            </div>
          </Row>

          <Row label={t('settings.appearance')}>
            <div className="seg-group" role="radiogroup" aria-label={t('settings.appearance')}>
              {KEYBOARD_STYLES.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={keyboardStyle === id}
                  className={cn(keyboardStyle === id && 'active')}
                  onClick={() => setKeyboardStyle(id)}
                >
                  {KEYBOARD_ICONS[id]} {t(`settings.keyboardStyleOption.${id}`)}
                </button>
              ))}
            </div>
          </Row>

          <Row label={t('layout.label')}>
            <div className="seg-group">
              {LAYOUTS.map((id: LayoutId) => (
                <button
                  key={id}
                  type="button"
                  className={cn(layout === id && 'active')}
                  onClick={() => setLayout(id)}
                >
                  {t(`layout.${id}`)}
                </button>
              ))}
            </div>
          </Row>

          <Row label={t('sound.label')}>
            <button
              type="button"
              className={cn('toggle', sound && 'on')}
              role="switch"
              aria-checked={sound}
              onClick={() => useSound.getState().setEnabled(!sound)}
            >
              <span className="toggle-knob" />
            </button>
          </Row>

          <Row label={t('settings.showKeyboard')}>
            <button
              type="button"
              className={cn('toggle', showKeyboard && 'on')}
              role="switch"
              aria-checked={showKeyboard}
              onClick={() => setShowKeyboard(!showKeyboard)}
            >
              <span className="toggle-knob" />
            </button>
          </Row>
        </div>

        <button type="button" className="btn btn-primary onboard-start" onClick={() => setOnboarded(true)}>
          {t('onboarding.start')}
        </button>
      </div>
    </div>
  )
}
