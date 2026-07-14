export type YearPoint = {
  year: number
  PC1: number
  PC2: number
  PC3: number
  coverage: number
}

export type Neighbor = {
  iso3: string
  name: string
  distance: number
  PC1: number
  PC2: number
  PC3: number
}

export type Country = {
  iso3: string
  iso2: string | null
  name: string
  region: string | null
  status: 'democracy' | 'hybrid' | 'autocracy'
  statusFr: string
  pc1_2014: number
  pc1_latest: number
  pc1_first: number
  pc1_change: number
  year_start: number
  year_end: number
  neighbors: Neighbor[]
  series: YearPoint[]
}

export type Meta = {
  title: string
  analysisWindow: [number, number]
  pcaReferenceYear: number
  nCountries2014: number
  nVariables: number
  variables: string[]
  explainedVariance: {
    PC1: number
    PC2: number
    PC3: number
    cumulative3: number
  }
  terciles2014: { q33: number; q66: number }
  axisLabels: Record<string, string>
  interpretations: Record<string, string>
  author: {
    name: string
    email: string
    linkedin: string
    affiliation: string
  }
  sources: { title: string; url: string }[]
}

export type WorldEvolution = {
  politicalOnly: {
    year: number
    PC1_median: number
    PC1_q25: number
    PC1_q75: number
    PC2_median: number
    countries: number
  }[]
  mainModel: {
    year: number
    PC1_median: number
    PC1_mean: number
    PC1_q25: number
    PC1_q75: number
    countries: number
  }[]
  decadeMarkers: number[]
}

export type ScoresByYear = Record<string, Record<string, number>>

export type ViewMode = 'world' | 'about' | 'compare'
export type MapMode = 'globe' | 'map'
