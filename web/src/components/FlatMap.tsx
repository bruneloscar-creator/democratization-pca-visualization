import { useEffect, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Feature } from 'geojson'
import {
  dataAvailability,
  HATCH_FILL,
  pc1ToColor,
  type Pc1ScaleOpts,
} from '../lib/colors'
import { resolveIso3 } from '../lib/data'
import type { ScoresByYear } from '../types'
import type { CountryHoverState } from '../lib/countryHover'
import { supportsCountryHover } from '../lib/countryHover'
import { NoDataHatchDefs } from './NoDataHatch'

type Props = {
  geo: FeatureCollection
  scoresByYear: ScoresByYear
  year: number
  selected: string[]
  knownIsos: Set<string>
  scaleOpts: Pc1ScaleOpts
  onSelect: (iso3: string) => void
  onHover?: (state: CountryHoverState | null) => void
  width: number
  height: number
}

/**
 * fitExtent padding so chrome (header / timeline / dock) stays clear.
 * Larger stages use smaller relative padding → higher effective map scale.
 *
 * | container width | padX              | padTop             | padBottom           |
 * | --------------- | ----------------- | ------------------ | ------------------- |
 * | < 640 (mobile)  | max(12, 3%)       | max(148, 22%)      | max(168, 28%)       |
 * | 640–1023        | max(20, 3%)       | max(88, 12%)       | max(128, 20%)       |
 * | 1024–1439       | max(14, 1.5%)     | max(64, 6.5%)      | max(96, 11%)        |
 * | ≥ 1440          | max(10, 1%)       | max(52, 4.5%)      | max(80, 8.5%)       |
 */
function fitPadding(w: number, h: number) {
  if (w < 640) {
    return {
      x: Math.max(12, w * 0.03),
      top: Math.max(148, h * 0.22),
      bottom: Math.max(168, h * 0.28),
    }
  }
  if (w < 1024) {
    return {
      x: Math.max(20, w * 0.03),
      top: Math.max(88, h * 0.12),
      bottom: Math.max(128, h * 0.2),
    }
  }
  if (w < 1440) {
    return {
      x: Math.max(14, w * 0.015),
      top: Math.max(64, h * 0.065),
      bottom: Math.max(96, h * 0.11),
    }
  }
  return {
    x: Math.max(10, w * 0.01),
    top: Math.max(52, h * 0.045),
    bottom: Math.max(80, h * 0.085),
  }
}

export function FlatMap({
  geo,
  scoresByYear,
  year,
  selected,
  knownIsos,
  scaleOpts,
  onSelect,
  onHover,
  width,
  height,
}: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const hoverEnabled = useMemo(() => supportsCountryHover(), [])
  const yearScores = scoresByYear[String(year)] ?? {}
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const onHoverRef = useRef(onHover)
  onHoverRef.current = onHover

  useEffect(() => {
    return () => onHoverRef.current?.(null)
  }, [])

  const safeW = Math.max(1, Math.floor(width))
  const safeH = Math.max(1, Math.floor(height))

  const { path, features } = useMemo(() => {
    const { x: padX, top: padTop, bottom: padBottom } = fitPadding(safeW, safeH)
    const projection = geoMercator().fitExtent(
      [
        [padX, padTop],
        [safeW - padX, safeH - padBottom],
      ],
      geo,
    )
    const pathFn = geoPath(projection)
    return { path: pathFn, features: geo.features }
  }, [geo, safeW, safeH])

  const emitHover = (iso3: string | null, x: number, y: number) => {
    if (!hoverEnabled || !onHover) return
    if (!iso3 || !knownIsos.has(iso3)) {
      onHover(null)
      return
    }
    onHover({ iso3, x, y })
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <svg width={safeW} height={safeH} className="block h-full w-full select-none">
        <defs>
          <NoDataHatchDefs />
          <filter id="map-glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={safeW} height={safeH} fill="transparent" />
        {features.map((f, i) => {
          const iso3 = resolveIso3((f.properties ?? {}) as Record<string, unknown>)
          const d = path(f as Feature) ?? ''
          const avail = dataAvailability(iso3, yearScores, knownIsos)
          const pc1 = iso3 ? yearScores[iso3] : undefined
          const isSel = iso3 != null && selectedSet.has(iso3)
          const isHover = iso3 != null && hover === iso3
          const fill =
            isSel
              ? '#ffffff'
              : avail !== 'ok'
                ? HATCH_FILL
                : pc1ToColor(pc1, scaleOpts)

          return (
            <path
              key={iso3 ?? `f-${i}`}
              d={d}
              fill={fill}
              fillOpacity={iso3 ? (isHover ? 1 : 0.92) : 0.45}
              stroke={isSel ? '#5eead4' : isHover ? 'rgba(255,255,255,0.7)' : 'rgba(7,11,18,0.55)'}
              strokeWidth={isSel ? 1.6 : 0.45}
              filter={isSel ? 'url(#map-glow)' : undefined}
              className="transition-[fill,stroke,fill-opacity] duration-300"
              style={{ cursor: iso3 && knownIsos.has(iso3) ? 'pointer' : 'default' }}
              onMouseEnter={() => iso3 && setHover(iso3)}
              onMouseMove={(e) => {
                if (!iso3) return
                emitHover(iso3, e.clientX, e.clientY)
              }}
              onMouseLeave={() => {
                setHover(null)
                onHover?.(null)
              }}
              onClick={() => iso3 && knownIsos.has(iso3) && onSelect(iso3)}
            />
          )
        })}
      </svg>
    </div>
  )
}
