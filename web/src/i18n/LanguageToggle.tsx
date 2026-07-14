import { useI18n } from './context'
import type { Locale } from './dictionaries'

const OPTIONS: { locale: Locale; flag: string; labelKey: 'langFr' | 'langEn' }[] = [
  { locale: 'fr', flag: '🇫🇷', labelKey: 'langFr' },
  { locale: 'en', flag: '🇬🇧', labelKey: 'langEn' },
]

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className="pointer-events-auto glass lang-toggle flex shrink-0 rounded-full p-0.5 sm:p-1"
      role="group"
      aria-label={t('language')}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.locale
        return (
          <button
            key={opt.locale}
            type="button"
            onClick={() => setLocale(opt.locale)}
            aria-label={t(opt.labelKey)}
            aria-pressed={active}
            title={t(opt.labelKey)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-base leading-none transition sm:h-9 sm:w-9 ${
              active
                ? 'bg-cyan-400/20 text-white shadow-[inset_0_0_0_1px_rgba(94,234,212,0.35)]'
                : 'text-slate-400 opacity-70 hover:opacity-100 hover:text-white'
            }`}
          >
            <span aria-hidden className="select-none">
              {opt.flag}
            </span>
          </button>
        )
      })}
    </div>
  )
}
