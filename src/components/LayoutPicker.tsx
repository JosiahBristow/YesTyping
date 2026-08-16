import { useTranslation } from 'react-i18next'
import { LAYOUTS, type LayoutId } from '../features/typing/layouts'
import { useLayout } from '../lib/layout'
import { cn } from '../lib/cn'

export function LayoutPicker() {
  const { t } = useTranslation()
  const { layout, setLayout } = useLayout()

  return (
    <div className="layout-switch" role="group" aria-label={t('layout.label')}>
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
  )
}