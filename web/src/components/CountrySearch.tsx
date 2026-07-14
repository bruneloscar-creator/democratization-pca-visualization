import { useMemo, useState } from 'react'
import type { Country } from '../types'
import { useI18n } from '../i18n'

type Props = {
  countries: Record<string, Country>
  onSelect: (iso3: string) => void
}

export function CountrySearch({ countries, onSelect }: Props) {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (query.length < 1) return []
    return Object.values(countries)
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.iso3.toLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 8)
  }, [q, countries])

  return (
    <div className="pointer-events-auto relative min-w-0 flex-1 sm:w-56 sm:max-w-[14rem] sm:flex-none">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder={t('searchPlaceholder')}
        className="glass h-11 w-full rounded-full px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/45 focus:shadow-[0_0_0_3px_rgba(140,247,232,0.07),0_14px_40px_rgba(0,0,0,0.28)] sm:h-auto sm:py-2.5 sm:text-xs"
        aria-label={t('searchPlaceholder')}
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
      />
      {open && results.length > 0 && (
        <ul className="glass-strong absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(16rem,40dvh)] overflow-auto rounded-2xl py-1 shadow-xl">
          {results.map((c) => (
            <li key={c.iso3}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-cyan-400/10 sm:min-h-0 sm:py-2 sm:text-xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(c.iso3)
                  setQ('')
                  setOpen(false)
                }}
              >
                <span className="truncate">{c.name}</span>
                <span className="shrink-0 font-mono text-slate-500">{c.iso3}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
