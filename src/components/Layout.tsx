import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLang } from '../lib/lang'
import { useSound } from '../lib/sound'
import { displayName, useAuth } from '../lib/auth'
import { cn } from '../lib/cn'
import { AchievementToasts } from './AchievementToasts'

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { lang, setLang } = useLang()
  const sound = useSound((s) => s.enabled)
  const user = useAuth((s) => s.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const navLink = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/courses', label: t('nav.courses') },
    { to: '/speed-test', label: t('nav.speedTest') },
    { to: '/race', label: t('nav.race') },
    { to: '/leaderboard', label: t('nav.leaderboard') },
    { to: '/game', label: t('nav.game') },
    { to: '/stats', label: t('nav.stats') },
    { to: '/achievements', label: t('nav.achievements') },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-mark">Y</span>
            YesTyping
          </Link>
          <nav className="nav" aria-label="main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navLink}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-spacer" />
          <div className="header-actions">
            {user ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-chip"
                  title={user.email ?? ''}
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((o) => !o)}
                >
                  <span className="user-avatar">{displayName(user).slice(0, 1).toUpperCase()}</span>
                  <span className="user-name">{displayName(user)}</span>
                  <span className="user-caret">{userMenuOpen ? '▲' : '▼'}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-head">
                      <b>{displayName(user)}</b>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/settings">{t('nav.settings')}</Link>
                    <button type="button" onClick={() => void useAuth.getState().signOut()}>
                      {t('auth.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-icon-btn login-btn" title={t('nav.login')}>
                👤
              </Link>
            )}
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
              <button type="button" className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
                中文
              </button>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
          </div>
          <button
            type="button"
            className="nav-burger"
            aria-label="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={cn('mobile-nav', menuOpen && 'open')}>
          <nav className="mobile-links" aria-label="mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navLink}>
                {l.label}
              </NavLink>
            ))}
            <div className="mobile-divider" />
            {user ? (
              <Link to="/login" className="mobile-account">
                <span className="user-avatar">{displayName(user).slice(0, 1).toUpperCase()}</span>
                {displayName(user)}
              </Link>
            ) : (
              <Link to="/login" className="mobile-account">
                👤 {t('nav.login')}
              </Link>
            )}
            <Link to="/settings" className="mobile-account">
              ⚙️ {t('nav.settings')}
            </Link>
            <div className="mobile-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => useSound.getState().setEnabled(!sound)}
              >
                {sound ? '🔊' : '🔇'} {t('sound.label')}
              </button>
              <div className="lang-switch" role="group" aria-label={t('lang.label')}>
                <button type="button" className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
                  中文
                </button>
                <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                  EN
                </button>
              </div>
              {user && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void useAuth.getState().signOut()}>
                  {t('auth.signOut')}
                </button>
              )}
            </div>
          </nav>
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