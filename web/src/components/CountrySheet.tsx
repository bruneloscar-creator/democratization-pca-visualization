import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { statusColor } from '../lib/colors'
import type { Country, Meta } from '../types'
import { useI18n, useStatusLabel } from '../i18n'
import { PCTimeSeries } from './PCTimeSeries'
import { Trajectory3D } from './Trajectory3D'

type Props = {
  country: Country | null
  meta: Meta
  year: number
  inCompare: boolean
  onClose: () => void
  onToggleCompare: () => void
  onOpenNeighbor: (iso3: string) => void
}

export function CountrySheet({
  country,
  meta,
  year,
  inCompare,
  onClose,
  onToggleCompare,
  onOpenNeighbor,
}: Props) {
  const { t, dict } = useI18n()
  const statusLabel = useStatusLabel()
  const point = country?.series.find((s) => s.year === year) ?? country?.series.at(-1)
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {country && (
        <>
          <motion.button
            type="button"
            aria-label={t('countrySheet.close')}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={reduceMotion ? false : { x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed inset-x-0 bottom-0 top-0 z-40 isolate flex w-full max-w-xl flex-col sm:inset-x-auto sm:right-0 sm:rounded-l-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="country-sheet-title"
          >
            <div className="glass-strong pointer-events-none absolute inset-0 sm:rounded-l-3xl" aria-hidden />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-l-3xl">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">
                    {t('countrySheet.fiche', { year })}
                  </p>
                  <h2 id="country-sheet-title" className="font-display truncate text-2xl text-white sm:text-4xl">
                    {country.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {country.iso3}
                    {country.region ? ` · ${country.region}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="tap-target shrink-0 rounded-full border border-white/15 px-4 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1"
                >
                  {t('countrySheet.close')}
                </button>
              </div>

              <div className="panel-scroll flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] dock-safe-bottom sm:space-y-6 sm:px-5 sm:py-5">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <Stat
                    label={t('countrySheet.statusLabel')}
                    value={statusLabel(country.status)}
                    accent={statusColor(country.status)}
                  />
                  <Stat
                    label={t('countrySheet.pc1Current')}
                    value={point ? point.PC1.toFixed(2) : '—'}
                  />
                  <Stat label={t('countrySheet.pc1Ref')} value={country.pc1_2014.toFixed(2)} />
                  <Stat
                    label={t('countrySheet.delta', {
                      from: country.year_start,
                      to: country.year_end,
                    })}
                    value={`${country.pc1_change >= 0 ? '+' : ''}${country.pc1_change.toFixed(2)}`}
                    accent={country.pc1_change >= 0 ? '#5eead4' : '#f87171'}
                  />
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  {t('countrySheet.blurb', {
                    statusIntro: dict.interpretations.status,
                    name: country.name,
                    status: statusLabel(country.status).toLowerCase(),
                    pct: (meta.explainedVariance.PC1 * 100).toFixed(1),
                  })}
                </p>

                <button
                  type="button"
                  onClick={onToggleCompare}
                  className={`min-h-12 w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    inCompare
                      ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-200'
                      : 'border-white/15 bg-white/5 text-white hover:border-cyan-300/30'
                  }`}
                >
                  {inCompare ? t('countrySheet.removeCompare') : t('countrySheet.addCompare')}
                </button>

                <section>
                  <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {t('countrySheet.neighbors')}
                  </h3>
                  <div className="space-y-2">
                    {country.neighbors.map((n) => (
                      <button
                        key={n.iso3}
                        type="button"
                        onClick={() => onOpenNeighbor(n.iso3)}
                        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-cyan-300/30 hover:bg-cyan-400/5"
                      >
                        <span className="min-w-0 truncate text-sm text-white">{n.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-slate-400 sm:text-xs">
                          d={n.distance.toFixed(2)} · PC1 {n.PC1.toFixed(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {t('countrySheet.trajectories1d')}
                  </h3>
                  <PCTimeSeries
                    series={country.series}
                    dataKey="PC1"
                    color="#5eead4"
                    label={dict.axisLabels.PC1}
                    height={120}
                  />
                  <PCTimeSeries
                    series={country.series}
                    dataKey="PC2"
                    color="#38bdf8"
                    label={dict.axisLabels.PC2}
                    height={120}
                  />
                  <PCTimeSeries
                    series={country.series}
                    dataKey="PC3"
                    color="#a78bfa"
                    label={dict.axisLabels.PC3}
                    height={120}
                  />
                </section>

                <section>
                  <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {t('countrySheet.trajectory3d')}
                  </h3>
                  <Trajectory3D series={country.series} height={240} />
                  <p className="mt-2 text-[10px] text-slate-500">{t('countrySheet.trajectoryHint')}</p>
                </section>

                <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-400">
                  <p className="mb-2 font-medium text-slate-200">{t('countrySheet.axisReading')}</p>
                  <p className="mb-1">{dict.interpretations.PC1}</p>
                  <p className="mb-1">{dict.interpretations.PC2}</p>
                  <p>{dict.interpretations.PC3}</p>
                </section>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 sm:px-3 sm:py-3">
      <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">{label}</p>
      <p
        className="mt-1 break-words text-[0.95rem] font-medium leading-snug sm:text-lg"
        style={{ color: accent ?? '#e8eef7' }}
      >
        {value}
      </p>
    </div>
  )
}
