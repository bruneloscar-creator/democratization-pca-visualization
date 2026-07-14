import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { dataAvailability } from '../lib/colors'
import type { Pc1RankInfo } from '../lib/pc1Rank'
import type { CountryHoverState } from '../lib/countryHover'
import type { Country } from '../types'
import { useI18n } from '../i18n'

type Props = {
  hover: CountryHoverState | null
  countries: Record<string, Country>
  yearScores: Record<string, number>
  rankByIso: Map<string, Pc1RankInfo>
  knownIsos: Set<string>
}

const OFFSET = 14
const EDGE = 12

function clampTooltip(x: number, y: number, w = 200, h = 72) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : x + w
  const vh = typeof window !== 'undefined' ? window.innerHeight : y + h
  let left = x + OFFSET
  let top = y + OFFSET
  if (left + w > vw - EDGE) left = x - w - OFFSET
  if (top + h > vh - EDGE) top = y - h - OFFSET
  left = Math.max(EDGE, Math.min(left, vw - w - EDGE))
  top = Math.max(EDGE, Math.min(top, vh - h - EDGE))
  return { left, top }
}

export function CountryHoverTooltip({
  hover,
  countries,
  yearScores,
  rankByIso,
  knownIsos,
}: Props) {
  const { t } = useI18n()

  const content = useMemo(() => {
    if (!hover) return null
    const country = countries[hover.iso3]
    if (!country) return null

    const avail = dataAvailability(hover.iso3, yearScores, knownIsos)
    const rankInfo = rankByIso.get(hover.iso3) ?? null

    return {
      name: country.name,
      avail,
      rankInfo,
    }
  }, [hover, countries, yearScores, rankByIso, knownIsos])

  const pos = hover ? clampTooltip(hover.x, hover.y) : { left: 0, top: 0 }

  return (
    <AnimatePresence>
      {hover && content ? (
        <motion.div
          key={hover.iso3}
          role="tooltip"
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="country-hover-tooltip glass pointer-events-none fixed z-[25] max-w-[14rem] rounded-2xl px-3 py-2 shadow-lg"
          style={{ left: pos.left, top: pos.top }}
        >
          <p className="truncate font-medium text-[13px] leading-tight text-white">
            {content.name}
          </p>
          {content.avail === 'ok' && content.rankInfo ? (
            <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-slate-300">
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500">{t('tooltip.pc1')}</span>
                <span className="font-mono tabular-nums text-cyan-200/90">
                  {content.rankInfo.pc1.toFixed(2)}
                </span>
              </p>
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500">{t('tooltip.rank')}</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {content.rankInfo.rank === 1
                    ? t('tooltip.rankFirst', { total: content.rankInfo.total })
                    : t('tooltip.rankOf', {
                        rank: content.rankInfo.rank,
                        total: content.rankInfo.total,
                      })}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
              {t('tooltip.insufficient')}
            </p>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
