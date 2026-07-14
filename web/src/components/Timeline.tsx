import { motion, useReducedMotion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WorldEvolution } from '../types'
import { useI18n } from '../i18n'

type Props = {
  year: number
  minYear: number
  maxYear: number
  playing: boolean
  onYear: (y: number) => void
  onTogglePlay: () => void
  worldEvolution: WorldEvolution
}

export function Timeline({
  year,
  minYear,
  maxYear,
  playing,
  onYear,
  onTogglePlay,
  worldEvolution,
}: Props) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  // Politics-only PCA only — never splice in mainModel for missing years.
  // Those series use different scales; splicing caused a spurious end jump
  // (~0.31 → ~0.62). politicalOnly is exported through the analysis window.
  const data = worldEvolution.politicalOnly
  const chartMinYear = data[0]?.year ?? minYear
  const chartMaxYear = data[data.length - 1]?.year ?? maxYear
  const sliderMin = Math.max(minYear, chartMinYear)
  const sliderMax = Math.min(maxYear, chartMaxYear)
  const sliderYear = Math.min(Math.max(year, sliderMin), sliderMax)
  // IQR band as stacked base + width (notebook fill_between q25–q75).
  const chartData = data.map((d) => ({
    ...d,
    iqrBase: d.PC1_q25,
    iqrWidth: d.PC1_q75 - d.PC1_q25,
  }))

  return (
    <motion.div
      initial={reduceMotion ? false : { y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="timeline-panel glass pointer-events-auto relative isolate w-full max-w-3xl rounded-[1.35rem] p-2.5 shadow-[0_20px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.18)] sm:p-3 md:p-2.5 md:px-3.5"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2 md:mb-1">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-200/75 sm:text-[10px] sm:tracking-[0.2em]">
            {t('timeline.title')}
          </p>
          <p className="font-display text-xl leading-none text-white sm:text-2xl md:text-xl">
            {sliderYear}
          </p>
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          className="tap-target shrink-0 rounded-full border border-white/15 bg-white/8 px-3 text-xs font-semibold text-white transition hover:border-cyan-200/35 hover:bg-white/12 sm:min-h-0 sm:min-w-0 sm:px-3.5 sm:py-1.5 md:py-1"
        >
          {playing ? t('timeline.pause') : t('timeline.play')}
        </button>
      </div>

      <div className="mb-1 h-10 w-full min-w-0 sm:mb-1.5 sm:h-12 md:mb-1 md:h-11">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pc1fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8cf7e8" stopOpacity={0.48} />
                <stop offset="100%" stopColor="#8cf7e8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="year" hide />
            <YAxis hide domain={['auto', 'auto']} width={0} />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,16,28,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value, name) => {
                if (name === 'iqrBase' || name === 'iqrWidth') return [null, null]
                return [Number(value).toFixed(3), t('timeline.medianPc1')]
              }}
            />
            <Area
              type="monotone"
              dataKey="iqrBase"
              stackId="iqr"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="iqrWidth"
              stackId="iqr"
              stroke="none"
              fill="rgba(140,247,232,0.14)"
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="PC1_median"
              stroke="#8cf7e8"
              strokeWidth={2}
              fill="url(#pc1fill)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        value={sliderYear}
        onChange={(e) => onYear(Number(e.target.value))}
        className="w-full"
        aria-label={t('timeline.yearAria')}
      />
      <div className="mt-0.5 flex justify-between gap-2 text-[10px] text-slate-400 md:mt-0">
        <span className="shrink-0">{sliderMin}</span>
        <span className="truncate text-center">{t('timeline.politicalMedian')}</span>
        <span className="shrink-0">{sliderMax}</span>
      </div>
    </motion.div>
  )
}
