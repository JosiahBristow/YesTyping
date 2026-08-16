import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLang } from '../lib/lang'
import { useSound } from '../lib/sound'
import { AchievementToasts } from './AchievementToasts'

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { lang, setLang } = useLang()
  const sound = useSound((s) => s.enabled)

  const navLink = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-mark">Y</span>
            YesTyping
          </Link>
          <nav className="nav" aria-label="main">
            <NavLink to="/" end className={navLink}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/courses" className={navLink}>
              {t('nav.courses')}
            </NavLink>
            <NavLink to="/speed-test" className={navLink}>
              {t('nav.speedTest')}
            </NavLink>
            <NavLink to="/stats" className={navLink}>
              {t('nav.stats')}
            </NavLink>
            <NavLink to="/achievements" className={navLink}>
              {t('nav.achievements')}
            </NavLink>
          </nav>
          <div className="nav-spacer" />
          <Link to="/settings" className="nav-icon-btn" aria-label={t('nav.settings')} title={t('nav.settings')}>
            ⚙️
          </Link>
          <button
            type="button"
            className="sound-toggle"
            aria-label={sound ? t('sound.off') : t('sound.on')}
            title={sound ? t('sound.off') : t('sound.on')}
            onClick={() => useSound.getState().setEnabled(!sound)}
          >
            {sound ? '🔊' : '🔇'}
          </button>
          <div className="lang-switch" role="group" aria-label={t('lang.label')}>
            <button
              type="button"
              className={lang === 'zh' ? 'active' : ''}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
      <AchievementToasts />

      <footer className="site-footer">
        <div className="container">
          <span>YesTyping · {t('footer.tagline')}</span>
          <span>v0.1.0</span>
        </div>
      </footer>
    </div>
  )
}