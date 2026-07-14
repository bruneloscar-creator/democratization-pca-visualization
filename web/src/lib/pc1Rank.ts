/**
 * World PC1 rank for a given year.
 *
 * Convention (matches choropleth / status reading): higher PC1 = more democratic.
 * Rank 1 = highest PC1 among countries with a valid score that year.
 * Ties break by ISO3 ascending for stable ordering.
 */

export type Pc1RankInfo = {
  pc1: number
  rank: number
  total: number
}

export function buildPc1RankMap(
  yearScores: Record<string, number>,
): Map<string, Pc1RankInfo> {
  const entries = Object.entries(yearScores).filter(
    ([, v]) => typeof v === 'number' && !Number.isNaN(v),
  )
  entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const total = entries.length
  const map = new Map<string, Pc1RankInfo>()
  for (let i = 0; i < entries.length; i++) {
    const [iso3, pc1] = entries[i]!
    map.set(iso3, { pc1, rank: i + 1, total })
  }
  return map
}

export function getPc1Rank(
  iso3: string,
  yearScores: Record<string, number>,
): Pc1RankInfo | null {
  return buildPc1RankMap(yearScores).get(iso3) ?? null
}
