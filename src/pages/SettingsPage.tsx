import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { displayName, useAuth } from '../lib/auth'
import { useSound } from '../lib/sound'
import { useSettings, KEYBOARD_STYLES, type KeyboardStyle } from '../lib/settings'
import { LAYOUTS, type LayoutId } from '../features/typing/layouts'
import { useLayout } from '../lib/layout'
import { useLang } from '../lib/lang'
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

export function SettingsPage() {
  const { t } = useTranslation()
  const sound = useSound((s) => s.enabled)
  const { showKeyboard, setShowKeyboard, keyboardStyle, setKeyboardStyle } = useSettings()
  const { layout, setLayout } = useLayout()
  const { lang, setLang } = useLang()
  const user = useAuth((s) => s.user)

  return (
    <div className="page container" style={{ maxWidth: '720px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('settings.title')}</div>
        <h1>{t('settings.heading')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <div className="card settings-panel">
        <h2 className="settings-section">{t('settings.account')}</h2>
        {user ? (
          <>
            <Row label={t('settings.username')}>
              <span className="settings-value">
                <span className="user-avatar">{displayName(user).slice(0, 1).toUpperCase()}</span>
                {displayName(user)}
              </span>
            </Row>
            <Row label={t('settings.email')}>
              <span className="settings-value">{user.email}</span>
            </Row>
            <Row label={t('settings.signOut')}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void useAuth.getState().signOut()}>
                {t('auth.signOut')}
              </button>
            </Row>
          </>
        ) : (
          <Row label={t('settings.account')}>
            <Link to="/login" className="btn btn-primary btn-sm">
              {t('nav.login')}
            </Link>
          </Row>
        )}
      </div>

      <div className="card settings-panel">
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
      </div>
    </div>
  )
}