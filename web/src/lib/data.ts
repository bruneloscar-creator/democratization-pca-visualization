import type { Country, Meta, ScoresByYear, WorldEvolution } from '../types'

export async function loadAppData() {
  const [meta, countries, scoresByYear, worldEvolution, loadings] = await Promise.all([
    fetch('/data/meta.json').then((r) => r.json() as Promise<Meta>),
    fetch('/data/countries.json').then((r) => r.json() as Promise<Record<string, Country>>),
    fetch('/data/scores_by_year.json').then((r) => r.json() as Promise<ScoresByYear>),
    fetch('/data/world_evolution.json').then((r) => r.json() as Promise<WorldEvolution>),
    fetch('/data/loadings.json').then((r) => r.json() as Promise<Record<string, Record<string, number>>>),
  ])
  return { meta, countries, scoresByYear, worldEvolution, loadings }
}

export function getScoreAtYear(country: Country, year: number): number | null {
  const exact = country.series.find((s) => s.year === year)
  if (exact) return exact.PC1
  // nearest prior
  let best: number | null = null
  for (const s of country.series) {
    if (s.year <= year) best = s.PC1
  }
  return best
}

export function getPointAtYear(country: Country, year: number) {
  const exact = country.series.find((s) => s.year === year)
  if (exact) return exact
  let best = country.series[0]
  for (const s of country.series) {
    if (s.year <= year) best = s
  }
  return best
}

/** Natural Earth ISO_A3 quirks → our dataset codes */
export const GEO_ISO_ALIASES: Record<string, string> = {
  KOS: 'XKX',
  '-99': '',
}

export function resolveIso3(props: Record<string, unknown>): string | null {
  const candidates = [
    props.ISO_A3,
    props.ADM0_A3,
    props.iso_a3,
    props.ISO_A3_EH,
    props.GU_A3,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.length === 3 && c !== '-99') {
      return GEO_ISO_ALIASES[c] ?? c
    }
  }
  return null
}
