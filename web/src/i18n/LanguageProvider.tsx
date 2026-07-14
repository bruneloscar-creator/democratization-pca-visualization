import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  dictionaries,
  STORAGE_KEY,
  type Locale,
} from './dictionaries'
import { I18nContext, type I18nParams } from './context'

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || '').toLowerCase()
    if (lang.startsWith('en')) return 'en'
  }
  return 'fr'
}

function getByPath(dict: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let cur: unknown = dict
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

function interpolate(template: string, params?: I18nParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] != null ? String(params[key]) : `{${key}}`,
  )
}

/** Component-only export for Vite Fast Refresh compatibility. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Keep the server render and the first browser render identical. The saved
  // preference is applied immediately after hydration.
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const dict = dictionaries[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = dict.documentTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', dict.documentDescription)
  }, [locale, dict])

  const t = useCallback(
    (path: string, params?: I18nParams) => {
      const value = getByPath(dict, path)
      if (value == null) return path
      return interpolate(value, params)
    },
    [dict],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, dict }),
    [locale, setLocale, t, dict],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
