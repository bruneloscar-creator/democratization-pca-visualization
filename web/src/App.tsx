import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { FeatureCollection } from 'geojson'
import { motion } from 'framer-motion'
import { loadAppData } from './lib/data'
import { PC1_DOMAIN, pc1ToColor } from './lib/colors'
import type {
  Country,
  MapMode,
  Meta,
  ScoresByYear,
  ViewMode,
  WorldEvolution,
} from './types'
import { Dock } from './components/Dock'
import { CountrySearch } from './components/CountrySearch'
import {
  CountryHoverTooltip,
} from './components/CountryHoverTooltip'
import type { CountryHoverState } from './lib/countryHover'
import { HatchSwatch } from './components/NoDataHatch'
import { buildPc1RankMap } from './lib/pc1Rank'
import { LanguageToggle, useI18n } from './i18n'
import { IntroSplash } from './components/IntroSplash'

const GlobeView = lazy(() =>
  import('./components/GlobeView').then((module) => ({ default: module.GlobeView })),
)
const FlatMap = lazy(() =>
  import('./components/FlatMap').then((module) => ({ default: module.FlatMap })),
)
const Timeline = lazy(() =>
  import('./components/Timeline').then((module) => ({ default: module.Timeline })),
)
const CountrySheet = lazy(() =>
  import('./components/CountrySheet').then((module) => ({ default: module.CountrySheet })),
)
const ComparePanel = lazy(() =>
  import('./components/ComparePanel').then((module) => ({ default: module.ComparePanel })),
)
const AboutPage = lazy(() =>
  import('./components/AboutPage').then((module) => ({ default: module.AboutPage })),
)

export default function App() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [countries, setCountries] = useState<Record<string, Country>>({})
  const [scoresByYear, setScoresByYear] = useState<ScoresByYear>({})
  const [worldEvolution, setWorldEvolution] = useState<WorldEvolution | null>(null)
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  const [view, setView] = useState<ViewMode>('world')
  const [mapMode, setMapMode] = useState<MapMode>('globe')
  const [year, setYear] = useState(2014)
  const [playing, setPlaying] = useState(false)
  const [activeIso, setActiveIso] = useState<string | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const [mapHover, setMapHover] = useState<CountryHoverState | null>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await loadAppData()
        const neRes = await fetch('/data/countries.geojson')
        if (!neRes.ok) throw new Error('GEO_ERROR')
        const geoFinal = (await neRes.json()) as FeatureCollection

        if (cancelled) return
        setMeta(data.meta)
        setCountries(data.countries)
        setScoresByYear(data.scoresByYear)
        setWorldEvolution(data.worldEvolution)
        setGeo(geoFinal)
        setYear(data.meta.pcaReferenceYear)
        setLoading(false)
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'LOAD_ERROR'
          setError(msg === 'GEO_ERROR' || msg === 'LOAD_ERROR' ? msg : 'LOAD_ERROR')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const [minYear, maxYear] = meta?.analysisWindow ?? [1980, 2021]
  // Timeline / play loop follow politics-only PCA (same scale through 2021).
  // Do not fall back to mainModel for missing years — scales differ.
  const timelineMaxYear =
    worldEvolution?.politicalOnly.at(-1)?.year ?? maxYear
  const timelineMinYear =
    worldEvolution?.politicalOnly[0]?.year ?? minYear

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setYear((y) => (y >= timelineMaxYear ? timelineMinYear : y + 1))
    }, 450)
    return () => window.clearInterval(id)
  }, [playing, timelineMinYear, timelineMaxYear])

  useEffect(() => {
    setYear((y) => Math.min(Math.max(y, timelineMinYear), timelineMaxYear))
  }, [timelineMinYear, timelineMaxYear])

  const activeCountry = activeIso ? countries[activeIso] ?? null : null
  const knownIsos = useMemo(() => new Set(Object.keys(countries)), [countries])
  const yearScores = useMemo(
    () => scoresByYear[String(year)] ?? {},
    [scoresByYear, year],
  )
  const rankByIso = useMemo(() => buildPc1RankMap(yearScores), [yearScores])

  useEffect(() => {
    setMapHover(null)
  }, [mapMode, view])

  const handleMapHover = useCallback((state: CountryHoverState | null) => {
    setMapHover(state)
  }, [])

  const scaleOpts = useMemo(
    () => ({
      min: PC1_DOMAIN.min,
      max: PC1_DOMAIN.max,
      q33: meta?.terciles2014.q33,
      q66: meta?.terciles2014.q66,
    }),
    [meta],
  )
  const q33Label = meta ? meta.terciles2014.q33.toFixed(2) : ''
  const q66Label = meta ? meta.terciles2014.q66.toFixed(2) : ''
  const legendGradient = useMemo(() => {
    if (!meta) return ''
    const opts = {
      min: PC1_DOMAIN.min,
      max: PC1_DOMAIN.max,
      q33: meta.terciles2014.q33,
      q66: meta.terciles2014.q66,
    }
    const { q33, q66 } = meta.terciles2014
    const samples = [
      PC1_DOMAIN.min,
      (PC1_DOMAIN.min + q33) / 2,
      q33,
      (q33 + q66) / 2,
      q66,
      (q66 + PC1_DOMAIN.max) / 2,
      PC1_DOMAIN.max,
    ]
    return `linear-gradient(90deg, ${samples.map((v) => pc1ToColor(v, opts)).join(', ')})`
  }, [meta])
  const compareCountries = useMemo(
    () => compare.map((c) => countries[c]).filter(Boolean),
    [compare, countries],
  )

  const handleSelect = useCallback((iso3: string) => {
    if (!countries[iso3]) return
    setActiveIso(iso3)
  }, [countries])

  const toggleCompare = useCallback(() => {
    if (!activeIso) return
    setCompare((prev) =>
      prev.includes(activeIso) ? prev.filter((c) => c !== activeIso) : [...prev, activeIso].slice(0, 8),
    )
  }, [activeIso])

  const langToggle = (
    <div className="pointer-events-auto">
      <LanguageToggle />
    </div>
  )

  if (loading) {
    return (
      <div className="space-bg flex h-full min-h-dvh items-center justify-center">
        <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 sm:right-8 sm:top-6">
          {langToggle}
        </div>
        <div className="text-center">
          <p className="font-display text-4xl text-white">Demoscope</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {t('loading')}
          </p>
        </div>
      </div>
    )
  }

  if (error || !meta || !geo || !worldEvolution) {
    return (
      <div className="space-bg flex h-full min-h-dvh items-center justify-center p-6 text-center text-red-300">
        <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 sm:right-8 sm:top-6">
          {langToggle}
        </div>
        {error === 'GEO_ERROR'
          ? t('geoError')
          : error === 'LOAD_ERROR'
            ? t('loadError')
            : (error ?? t('dataUnavailable'))}
      </div>
    )
  }

  return (
    <div className="space-bg relative h-full min-h-dvh w-full overflow-hidden">
      <div className="noise" aria-hidden />
      <div className="ambient-orb ambient-orb-a" aria-hidden />
      <div className="ambient-orb ambient-orb-b" aria-hidden />
      <IntroSplash ready />

      {/* Language toggle — above map chrome, below sheet/dock so Fermer stays tappable */}
      <div className="pointer-events-none absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 sm:right-8 sm:top-6">
        {langToggle}
      </div>

      {view === 'world' && (
        <>
          {/* Map/globe — lowest layer; isolated so WebGL glow cannot cover chrome */}
          <div className="map-stage">
            <Suspense fallback={<div className="map-placeholder" aria-hidden />}>
              {mapMode === 'globe' ? (
                <GlobeView
                  geo={geo}
                  scoresByYear={scoresByYear}
                  year={year}
                  selected={[...(activeIso ? [activeIso] : []), ...compare]}
                  knownIsos={knownIsos}
                  scaleOpts={scaleOpts}
                  onSelect={handleSelect}
                  onHover={handleMapHover}
                  width={size.w}
                  height={size.h}
                />
              ) : (
                <FlatMap
                  geo={geo}
                  scoresByYear={scoresByYear}
                  year={year}
                  selected={[...(activeIso ? [activeIso] : []), ...compare]}
                  knownIsos={knownIsos}
                  scaleOpts={scaleOpts}
                  onSelect={handleSelect}
                  onHover={handleMapHover}
                  width={size.w}
                  height={size.h}
                />
              )}
            </Suspense>
          </div>

          {/* Chrome overlays — sibling above map (not co-parented with WebGL) */}
          <div className="ui-chrome">
            <CountryHoverTooltip
              hover={mapHover}
              countries={countries}
              yearScores={yearScores}
              rankByIso={rankByIso}
              knownIsos={knownIsos}
            />
            {/* Compact mobile chrome; desktop keeps roomier layout */}
            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute left-0 right-0 top-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6"
            >
              <div className="flex flex-col gap-3 sm:gap-5">
                <div className="min-w-0 pr-[5.25rem] sm:pr-[5.75rem]">
                  <p className="eyebrow hidden sm:block">
                    {t('brandEyebrow', {
                      from: meta.analysisWindow[0],
                      to: meta.analysisWindow[1],
                    })}
                  </p>
                  <h1 className="font-display text-[1.7rem] leading-none text-white sm:mt-1 sm:text-[2.65rem]">
                    Demoscope
                  </h1>
                  <p className="mt-1 hidden max-w-md text-[13px] leading-relaxed text-slate-400 sm:block">
                    {t('brandTagline')}
                  </p>
                </div>

                {/* Search + map mode + legend share one left-aligned column with explicit gap */}
                <div className="flex flex-col items-start gap-3 sm:gap-4">
                  <div className="pointer-events-auto relative z-10 flex w-full items-stretch gap-2">
                    <CountrySearch countries={countries} onSelect={handleSelect} />
                    <div className="glass flex shrink-0 items-center rounded-full p-1.5">
                      <button
                        type="button"
                        onClick={() => setMapMode('globe')}
                        className={`tap-target rounded-full px-2.5 text-[11px] font-semibold transition sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-2 sm:text-xs ${
                          mapMode === 'globe' ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('globe3d')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapMode('map')}
                        className={`tap-target rounded-full px-2.5 text-[11px] font-semibold transition sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-2 sm:text-xs ${
                          mapMode === 'map' ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('map2d')}
                      </button>
                    </div>
                  </div>

                  {/* Mobile compact legend — in-flow under controls */}
                  <div className="pointer-events-none md:hidden">
                    <div className="glass flex max-w-[16rem] flex-col gap-1 rounded-2xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-[9px] text-slate-500">
                          {t('legendAutocracy').slice(0, 4)}.
                        </span>
                        <div
                          className="h-1.5 min-w-0 flex-1 rounded-full"
                          style={{ background: legendGradient }}
                        />
                        <span className="shrink-0 text-[9px] text-slate-500">
                          {t('legendDemocracy').slice(0, 3)}.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] text-slate-500">
                        <HatchSwatch className="h-2.5 w-4" />
                        <span>{t('legendInsufficient')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop legend — same column as search (avoids absolute top collision) */}
                  <div className="pointer-events-none hidden md:block">
                    <div className="glass max-w-[15rem] rounded-[1.35rem] px-4 py-3.5">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        {t('legendPc1')}
                      </p>
                      <p className="mb-2 text-[9px] leading-snug text-slate-500">
                        {t('legendTerciles', { refYear: meta.pcaReferenceYear })}
                      </p>
                      <div className="h-2 w-full rounded-full" style={{ background: legendGradient }} />
                      <div className="mt-1.5 flex justify-between gap-1 text-[9px] text-slate-500">
                        <span>{t('legendAutocracy')}</span>
                        <span>{t('legendHybrid')}</span>
                        <span>{t('legendDemocracy')}</span>
                      </div>
                      <p className="mt-1 font-mono text-[8px] tabular-nums text-slate-500">
                        {t('legendThresholds', { q33: q33Label, q66: q66Label })}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 border-t border-white/10 pt-2 text-[9px] text-slate-400">
                        <HatchSwatch />
                        <span>{t('legendInsufficient')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.header>

            <div className="timeline-dock-clearance pointer-events-none absolute inset-x-0 flex justify-center px-2 sm:px-4">
              <Suspense fallback={null}>
                <Timeline
                  year={year}
                  minYear={timelineMinYear}
                  maxYear={timelineMaxYear}
                  playing={playing}
                  onYear={setYear}
                  onTogglePlay={() => setPlaying((p) => !p)}
                  worldEvolution={worldEvolution}
                />
              </Suspense>
            </div>
          </div>
        </>
      )}

      {view === 'compare' && (
        <div className="absolute inset-0 z-10">
          <Suspense fallback={null}>
            <ComparePanel
              countries={compareCountries}
              onRemove={(iso) => setCompare((c) => c.filter((x) => x !== iso))}
              onOpen={(iso) => {
                setActiveIso(iso)
              }}
            />
          </Suspense>
        </div>
      )}

      {view === 'about' && (
        <div className="absolute inset-0 z-10">
          <Suspense fallback={null}>
            <AboutPage meta={meta} />
          </Suspense>
        </div>
      )}

      {activeCountry && (
        <Suspense fallback={null}>
          <CountrySheet
            country={activeCountry}
            meta={meta}
            year={year}
            inCompare={activeIso ? compare.includes(activeIso) : false}
            onClose={() => setActiveIso(null)}
            onToggleCompare={toggleCompare}
            onOpenNeighbor={(iso) => setActiveIso(iso)}
          />
        </Suspense>
      )}

      <Dock view={view} onChange={setView} compareCount={compare.length} />
    </div>
  )
}
