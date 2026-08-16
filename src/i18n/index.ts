import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

export type Lang = 'en' | 'zh'

export const LANGS: Lang[] = ['zh', 'en']

export function detectLang(): Lang {
  const saved = localStorage.getItem('yestyping.lang') as Lang | null
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function persistLang(lang: Lang) {
  localStorage.setItem('yestyping.lang', lang)
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: detectLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n