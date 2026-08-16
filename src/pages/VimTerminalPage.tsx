import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VimTerminal } from '../components/VimTerminal'

export function VimTerminalPage() {
  const { t } = useTranslation()
  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">{t('courses.vim')}</div>
        <h1>{t('vimTerminal.title')}</h1>
        <p>{t('vimTerminal.subtitle')}</p>
      </div>

      <VimTerminal />

      <div className="vt-back">
        <Link to="/courses/vim" className="btn btn-ghost btn-sm">
          ← {t('vimTerminal.back')}
        </Link>
      </div>
    </div>
  )
}