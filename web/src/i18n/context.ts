import { createContext, useContext } from 'react'
import type { Dictionary, Locale } from './dictionaries'

export type I18nParams = Record<string, string | number>

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (path: string, params?: I18nParams) => string
  dict: Dictionary
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}

export function useStatusLabel() {
  const { dict } = useI18n()
  return (status: 'democracy' | 'hybrid' | 'autocracy') => dict.status[status]
}
