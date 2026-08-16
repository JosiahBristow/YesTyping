import { create } from 'zustand'
import i18n, { detectLang, persistLang, type Lang } from '../i18n'

export interface Bi {
  en: string
  zh: string
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLang = create<LangState>((set) => ({
  lang: detectLang(),
  setLang: (lang) => {
    persistLang(lang)
    void i18n.changeLanguage(lang)
    set({ lang })
  },
}))

export function useBi(bi: Bi): string {
  const lang = useLang((s) => s.lang)
  return lang === 'zh' ? bi.zh : bi.en
}

export function pick<T>(en: T, zh: T): T {
  return useLang.getState().lang === 'zh' ? zh : en
}