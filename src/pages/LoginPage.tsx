import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { displayName, isValidUsername, useAuth } from '../lib/auth'
import { supabaseConfigured } from '../lib/supabase'
import { cn } from '../lib/cn'

export function LoginPage() {
  const { t } = useTranslation()
  const { user, loading, error, signIn, signUp, signOut, clearError } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="page container login-wrap">
        <div className="card auth-card">
          <p className="section-sub">{t('auth.loading')}</p>
        </div>
      </div>
    )
  }

  if (!supabaseConfigured) {
    return (
      <div className="page container login-wrap">
        <div className="card auth-card">
          <div className="big">🔑</div>
          <h1 className="auth-title">{t('auth.title')}</h1>
          <p className="section-sub">{t('auth.notConfigured')}</p>
          <p className="auth-code">
            <code>.env</code> → <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code>
          </p>
          <p className="section-sub" style={{ fontSize: '0.85rem' }}>
            {t('auth.notConfiguredHint')}
          </p>
          <Link to="/" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            ← {t('auth.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="page container login-wrap">
        <div className="card auth-card">
          <div className="big">👋</div>
          <h1 className="auth-title">{t('auth.signedInAs')}</h1>
          <p className="section-sub">{displayName(user)}</p>
          <div className="auth-actions">
            <Link to="/" className="btn btn-primary">
              {t('auth.backHome')}
            </Link>
            <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidUsername(username.trim())) {
      setNotice(t('auth.usernameInvalid'))
      return
    }
    if (password.length < 6) {
      setNotice(t('auth.validation'))
      return
    }
    setBusy(true)
    setNotice(null)
    clearError()
    const res = mode === 'signin' ? await signIn(username.trim(), password) : await signUp(username.trim(), password)
    setBusy(false)
    if (res.code === 'rate_limit') {
      setNotice(t('auth.rateLimit'))
    } else if (res.code === 'signup_disabled') {
      setNotice(t('auth.signupDisabled'))
    } else if (res.code === 'confirm_email') {
      setNotice(t('auth.confirmEmail'))
    } else if (!res.ok) {
      setNotice(res.error ?? t('auth.genericError'))
    } else if (res.error) {
      setNotice(res.error)
    }
  }

  return (
    <div className="page container login-wrap">
      <div className="card auth-card">
        <div className="big">🔑</div>
        <h1 className="auth-title">{t('auth.title')}</h1>
        <div className="seg-group auth-tabs">
          <button type="button" className={cn(mode === 'signin' && 'active')} onClick={() => { setMode('signin'); setNotice(null) }}>
            {t('auth.signIn')}
          </button>
          <button type="button" className={cn(mode === 'signup' && 'active')} onClick={() => { setMode('signup'); setNotice(null) }}>
            {t('auth.signUp')}
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => void submit(e)}>
          <label className="auth-field">
            <span>{t('auth.username')}</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" maxLength={20} required />
          </label>
          <label className="auth-field">
            <span>{t('auth.password')}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
          </label>
          {(notice || error) && <p className="auth-notice">{notice ?? error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
            {busy ? '…' : mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <p className="section-sub" style={{ fontSize: '0.82rem', marginTop: '1rem' }}>
          {t('auth.privacyNote')}
        </p>
      </div>
    </div>
  )
}