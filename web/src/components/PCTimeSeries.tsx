import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { YearPoint } from '../types'

type Props = {
  series: YearPoint[]
  dataKey: 'PC1' | 'PC2' | 'PC3'
  color: string
  label: string
  height?: number
}

export function PCTimeSeries({ series, dataKey, color, label, height = 140 }: Props) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-medium text-white">{label}</p>
        <p className="shrink-0 text-[10px] uppercase tracking-widest text-slate-400">{dataKey}</p>
      </div>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,16,28,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v) => [Number(v).toFixed(3), dataKey]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${dataKey})`}
              dot={false}
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
