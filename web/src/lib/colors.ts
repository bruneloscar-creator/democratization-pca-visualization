/** PC1 choropleth anchored on 2014 terciles (notebook methodology). */

export const PC1_DOMAIN = { min: -8.7, max: 4.3 } as const

/** Defaults match meta.json terciles2014 — pass live meta when rendering. */
export const DEFAULT_TERCILES = { q33: -1.3953, q66: 1.7846 } as const

export type Pc1ScaleOpts = {
  min?: number
  max?: number
  q33?: number
  q66?: number
}

export type DataAvailability = 'ok' | 'no_data' | 'insufficient'

const MISSING_BASE = 'rgb(71,85,105)'

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t))
}

function lerpChannel(a: number, b: number, u: number): number {
  return Math.round(a + (b - a) * u)
}

function mixRgb(c0: [number, number, number], c1: [number, number, number], u: number): string {
  return `rgb(${lerpChannel(c0[0], c1[0], u)},${lerpChannel(c0[1], c1[1], u)},${lerpChannel(c0[2], c1[2], u)})`
}

function lerpStops(t: number, stops: [number, [number, number, number]][]): string {
  const x = clamp01(t)
  let i = 0
  while (i < stops.length - 1 && x > stops[i + 1][0]) i++
  const [t0, c0] = stops[i]
  const [t1, c1] = stops[Math.min(i + 1, stops.length - 1)]
  const u = t1 === t0 ? 0 : (x - t0) / (t1 - t0)
  return mixRgb(c0, c1, u)
}

/**
 * Continuous PC1 → color, with segment breaks at 2014 terciles so
 * hybrid countries stay amber/slate and only PC1 ≥ q66 reads as cyan/blue.
 */
export function pc1ToColor(pc1: number | null | undefined, opts: Pc1ScaleOpts = {}): string {
  if (pc1 == null || Number.isNaN(pc1)) return MISSING_BASE

  const min = opts.min ?? PC1_DOMAIN.min
  const max = opts.max ?? PC1_DOMAIN.max
  const q33 = opts.q33 ?? DEFAULT_TERCILES.q33
  const q66 = opts.q66 ?? DEFAULT_TERCILES.q66

  if (pc1 <= q33) {
    // Autocracy band: deep red → warm amber (ends at hybrid boundary)
    const t = (q33 - min) > 0 ? (pc1 - min) / (q33 - min) : 0
    return lerpStops(t, [
      [0, [160, 45, 48]],
      [0.55, [190, 85, 55]],
      [1, [200, 140, 70]],
    ])
  }

  if (pc1 <= q66) {
    // Hybrid band: amber → neutral slate (no teal/cyan)
    const t = (q66 - q33) > 0 ? (pc1 - q33) / (q66 - q33) : 0
    return lerpStops(t, [
      [0, [200, 140, 70]],
      [0.5, [150, 135, 105]],
      [1, [105, 118, 138]],
    ])
  }

  // Democracy band: slate-teal → cyan (starts only above q66)
  const t = (max - q66) > 0 ? (pc1 - q66) / (max - q66) : 1
  return lerpStops(t, [
    [0, [70, 145, 150]],
    [0.45, [45, 175, 165]],
    [1, [94, 234, 212]],
  ])
}

export function statusFromPc1(
  pc1: number,
  q33 = DEFAULT_TERCILES.q33,
  q66 = DEFAULT_TERCILES.q66,
): 'democracy' | 'hybrid' | 'autocracy' {
  if (pc1 >= q66) return 'democracy'
  if (pc1 >= q33) return 'hybrid'
  return 'autocracy'
}

export function statusColor(status: string): string {
  if (status === 'democracy') return '#5eead4'
  if (status === 'hybrid') return '#fbbf24'
  return '#f87171'
}

/** Classify map fill: missing from dataset vs present but no score this year. */
export function dataAvailability(
  iso3: string | null | undefined,
  yearScores: Record<string, number>,
  knownIsos?: Set<string> | null,
): DataAvailability {
  if (!iso3) return 'no_data'
  if (yearScores[iso3] != null && !Number.isNaN(yearScores[iso3])) return 'ok'
  if (knownIsos?.has(iso3)) return 'insufficient'
  return 'no_data'
}

export const HATCH_PATTERN_ID = 'demoscope-nodata-hatch'
export const HATCH_FILL = `url(#${HATCH_PATTERN_ID})`
export const HATCH_BASE_HEX = '#475569'
export const HATCH_STRIPE_HEX = '#94a3b8'

export const COMPARE_PALETTE = [
  '#5eead4',
  '#38bdf8',
  '#a78bfa',
  '#fbbf24',
  '#fb7185',
  '#34d399',
  '#f472b6',
  '#94a3b8',
]
