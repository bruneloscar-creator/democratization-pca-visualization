import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COMPARE_PALETTE, statusColor } from '../lib/colors'
import type { Country } from '../types'
import { useI18n, useStatusLabel } from '../i18n'

type Props = {
  countries: Country[]
  onRemove: (iso3: string) => void
  onOpen: (iso3: string) => void
}

export function ComparePanel({ countries, onRemove, onOpen }: Props) {
  const { t } = useI18n()
  const statusLabel = useStatusLabel()

  if (countries.length === 0) {
    return (
      <div className="page-aurora flex h-full items-center justify-center px-5 pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] dock-safe-bottom sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass relative max-w-lg overflow-hidden rounded-[2rem] p-7 text-center sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="mx-auto flex h-14 w-14 items-end justify-center gap-1.5 rounded-[1.25rem] border border-white/15 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" aria-hidden>
            <span className="h-4 w-1.5 rounded-full bg-cyan-200/55" />
            <span className="h-7 w-1.5 rounded-full bg-cyan-200/80" />
            <span className="h-5 w-1.5 rounded-full bg-indigo-300/75" />
          </div>
          <p className="eyebrow relative mt-6">{t('compare.eyebrow')}</p>
          <p className="font-display relative mt-2 text-3xl text-white sm:text-4xl">{t('compare.emptyTitle')}</p>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">{t('compare.emptyBody')}</p>
          <div className="relative mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(140,247,232,0.6)]" />
            {t('compare.emptyHint')}
          </div>
        </motion.div>
      </div>
    )
  }

  const years = new Set<number>()
  countries.forEach((c) => c.series.forEach((s) => years.add(s.year)))
  const sortedYears = [...years].sort((a, b) => a - b)

  const chartData = sortedYears.map((year) => {
    const row: Record<string, number | string> = { year }
    countries.forEach((c) => {
      const pt = c.series.find((s) => s.year === year)
      if (pt) row[c.iso3] = pt.PC1
    })
    return row
  })

  const chartData2 = sortedYears.map((year) => {
    const row: Record<string, number | string> = { year }
    countries.forEach((c) => {
      const pt = c.series.find((s) => s.year === year)
      if (pt) row[c.iso3] = pt.PC2
    })
    return row
  })

  const chartData3 = sortedYears.map((year) => {
    const row: Record<string, number | string> = { year }
    countries.forEach((c) => {
      const pt = c.series.find((s) => s.year === year)
      if (pt) row[c.iso3] = pt.PC3
    })
    return row
  })

  return (
    <div className="page-aurora panel-scroll h-full overflow-y-auto overflow-x-hidden px-3 pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] dock-safe-bottom sm:px-8 sm:pt-[max(2rem,calc(env(safe-area-inset-top)+1.5rem))]">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between gap-5 pr-16 sm:pr-0"
        >
          <div>
            <p className="eyebrow">{t('compare.eyebrow')}</p>
            <h1 className="font-display mt-1 text-3xl leading-tight text-white sm:text-5xl">
              {t('compare.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              {t('compare.lead')}
            </p>
          </div>
          <div className="glass hidden min-w-24 rounded-2xl px-4 py-3 text-right sm:block">
            <p className="font-display text-2xl leading-none text-white">{countries.length}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t('compare.selected')}
            </p>
          </div>
        </motion.div>

        <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
          {countries.map((c, i) => (
            <div
              key={c.iso3}
              className="glass flex max-w-full items-center gap-2 rounded-full py-1 pl-3 pr-1 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: COMPARE_PALETTE[i % COMPARE_PALETTE.length] }}
              />
              <button
                type="button"
                onClick={() => onOpen(c.iso3)}
                className="truncate py-1.5 text-white hover:underline"
              >
                {c.name}
              </button>
              <button
                type="button"
                onClick={() => onRemove(c.iso3)}
                className="tap-target flex shrink-0 items-center justify-center rounded-full text-lg leading-none text-slate-400 hover:bg-white/10 hover:text-white sm:min-h-8 sm:min-w-8"
                aria-label={t('compare.removeAria', { name: c.name })}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 sm:hidden">
          {countries.map((c) => (
            <button
              key={c.iso3}
              type="button"
              onClick={() => onOpen(c.iso3)}
              className="glass flex w-full flex-col gap-2 rounded-2xl px-4 py-3 text-left"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-white">{c.name}</span>
                <span className="shrink-0 text-xs" style={{ color: statusColor(c.status) }}>
                  {statusLabel(c.status)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    {t('compare.colPc1Ref')}
                  </p>
                  <p>{c.pc1_2014.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    {t('compare.colPc1Recent')}
                  </p>
                  <p>{c.pc1_latest.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    {t('compare.colDelta')}
                  </p>
                  <p style={{ color: c.pc1_change >= 0 ? '#5eead4' : '#f87171' }}>
                    {c.pc1_change >= 0 ? '+' : ''}
                    {c.pc1_change.toFixed(2)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="glass mt-6 hidden overflow-x-auto rounded-[1.35rem] sm:block">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.025] text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2 pr-3">{t('compare.colCountry')}</th>
                <th className="py-2 pr-3">{t('compare.colStatus')}</th>
                <th className="py-2 pr-3">{t('compare.colPc1Ref')}</th>
                <th className="py-2 pr-3">{t('compare.colPc1Recent')}</th>
                <th className="py-2 pr-3">{t('compare.colDelta')}</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.iso3} className="border-b border-white/5 transition hover:bg-white/[0.035]">
                  <td className="px-3 py-3 pr-3 font-medium text-white">{c.name}</td>
                  <td className="py-3 pr-3" style={{ color: statusColor(c.status) }}>
                    {statusLabel(c.status)}
                  </td>
                  <td className="py-3 pr-3 font-mono text-slate-300">{c.pc1_2014.toFixed(2)}</td>
                  <td className="py-3 pr-3 font-mono text-slate-300">{c.pc1_latest.toFixed(2)}</td>
                  <td
                    className="py-3 pr-3 font-mono"
                    style={{ color: c.pc1_change >= 0 ? '#5eead4' : '#f87171' }}
                  >
                    {c.pc1_change >= 0 ? '+' : ''}
                    {c.pc1_change.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {[
          { title: t('compare.chartPc1'), data: chartData, key: 'pc1' },
          { title: t('compare.chartPc2'), data: chartData2, key: 'pc2' },
          { title: t('compare.chartPc3'), data: chartData3, key: 'pc3' },
        ].map((block) => (
          <div key={block.key} className="glass mt-5 overflow-hidden rounded-[1.6rem] p-4 sm:mt-6 sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(140,247,232,0.45)]" />
              <h3 className="text-sm font-semibold text-white">{block.title}</h3>
            </div>
            <div className="h-48 w-full min-w-0 sm:h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={block.data} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    minTickGap={28}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} width={36} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(12,18,34,0.94)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      borderRadius: 16,
                      fontSize: 12,
                      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(18px)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  {countries.map((c, i) => (
                    <Line
                      key={c.iso3}
                      type="monotone"
                      dataKey={c.iso3}
                      name={c.name}
                      stroke={COMPARE_PALETTE[i % COMPARE_PALETTE.length]}
                      strokeWidth={2.35}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
