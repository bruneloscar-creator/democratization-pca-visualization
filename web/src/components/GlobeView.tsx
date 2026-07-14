import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import type { FeatureCollection, Feature } from 'geojson'
import {
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  MeshPhongMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import {
  dataAvailability,
  HATCH_BASE_HEX,
  HATCH_STRIPE_HEX,
  pc1ToColor,
  type Pc1ScaleOpts,
} from '../lib/colors'
import { resolveIso3 } from '../lib/data'
import type { ScoresByYear } from '../types'
import type { CountryHoverState } from '../lib/countryHover'
import { supportsCountryHover } from '../lib/countryHover'

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

type PolyFeat = Feature & { properties: Record<string, unknown> & { __iso3?: string | null } }

function createHatchMaterial(): MeshPhongMaterial {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = HATCH_BASE_HEX
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = HATCH_STRIPE_HEX
  ctx.lineWidth = 7
  ctx.lineCap = 'square'
  for (let i = -size; i < size * 2; i += 12) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + size, size)
    ctx.stroke()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(6, 6)
  texture.needsUpdate = true

  const mat = new MeshPhongMaterial({
    map: texture,
    color: new Color('#ffffff'),
    emissive: new Color('#1e293b'),
    emissiveIntensity: 0.35,
    shininess: 2,
    transparent: false,
  })
  return mat
}

export function GlobeView({
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
  const globeRef = useRef<ReturnType<typeof Globe> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hatchMatRef = useRef<MeshPhongMaterial | null>(null)
  const hoverIsoRef = useRef<string | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const hoverEnabled = useMemo(() => supportsCountryHover(), [])
  const [size, setSize] = useState({ w: width, h: height })
  const yearScores = scoresByYear[String(year)] ?? {}
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const clearHover = useCallback(() => {
    hoverIsoRef.current = null
    onHover?.(null)
  }, [onHover])

  useEffect(() => () => clearHover(), [clearHover])

  const polygons = useMemo(() => {
    return geo.features.map((f) => {
      const iso3 = resolveIso3((f.properties ?? {}) as Record<string, unknown>)
      return {
        ...f,
        properties: { ...(f.properties ?? {}), __iso3: iso3 },
      } as PolyFeat
    })
  }, [geo])

  useEffect(() => {
    hatchMatRef.current = createHatchMaterial()
    return () => {
      const mat = hatchMatRef.current
      if (mat) {
        mat.map?.dispose()
        mat.dispose()
        hatchMatRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const apply = (w: number, h: number) => {
      const nextW = Math.max(1, Math.floor(w))
      const nextH = Math.max(1, Math.floor(h))
      setSize((prev) => (prev.w === nextW && prev.h === nextH ? prev : { w: nextW, h: nextH }))
    }
    apply(el.clientWidth || width, el.clientHeight || height)
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (cr) apply(cr.width, cr.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height])

  const configureGlobe = useCallback(() => {
    const g = globeRef.current as unknown as {
      controls?: {
        autoRotate: boolean
        autoRotateSpeed: number
        enableZoom: boolean
        enablePan: boolean
        minDistance: number
        maxDistance: number
      }
      pointOfView?: (pov: { lat: number; lng: number; altitude: number }, ms?: number) => void
      globeMaterial?: () => MeshPhongMaterial
      renderer?: () => { setPixelRatio: (n: number) => void }
      lights?: (lights: unknown[]) => void
    } | null
    if (!g) return

    if (g.controls) {
      g.controls.autoRotate = true
      g.controls.autoRotateSpeed = 0.35
      g.controls.enablePan = false
      g.controls.minDistance = 150
      g.controls.maxDistance = 560
    }

    try {
      const keyLight = new DirectionalLight('#d9fffb', 1.15)
      keyLight.position.set(-120, 90, 140)
      const rimLight = new DirectionalLight('#8197ff', 0.7)
      rimLight.position.set(140, -40, -90)
      g.lights?.([
        new AmbientLight(0xbfd6ff, 2.2),
        keyLight,
        rimLight,
      ])
    } catch {
      /* lights API unavailable */
    }

    try {
      const mat = g.globeMaterial?.()
      if (mat) {
        mat.color = new Color('#132a47')
        mat.emissive = new Color('#07152b')
        mat.emissiveIntensity = 0.72
        mat.map = null
        mat.bumpMap = null
        mat.needsUpdate = true
        mat.shininess = 10
        mat.opacity = 1
        mat.transparent = false
      }
    } catch {
      /* globe material not ready */
    }

    try {
      g.renderer?.()?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    } catch {
      /* renderer not ready */
    }

    const altitude = size.w < 640 ? 2.82 : 2.34
    g.pointOfView?.({ lat: 12, lng: 15, altitude }, 0)
  }, [size.w])

  useEffect(() => {
    const id = window.setTimeout(configureGlobe, 0)
    return () => window.clearTimeout(id)
  }, [configureGlobe, size.w, size.h])

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ isolation: 'isolate', contain: 'paint', transform: 'translateZ(0)' }}
      onMouseMove={(e) => {
        pointerRef.current = { x: e.clientX, y: e.clientY }
        if (!hoverEnabled || !hoverIsoRef.current) return
        onHover?.({ iso3: hoverIsoRef.current, x: e.clientX, y: e.clientY })
      }}
      onMouseLeave={clearHover}
    >
      <Globe
        ref={globeRef as never}
        width={size.w}
        height={size.h}
        waitForGlobeReady={false}
        animateIn={false}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe
        showAtmosphere
        atmosphereColor="#8cf7e8"
        atmosphereAltitude={0.12}
        polygonsData={polygons}
        polygonCapColor={(d) => {
          const feat = d as PolyFeat
          const iso3 = feat.properties?.__iso3
          if (!iso3) return 'rgba(82,96,124,0.7)'
          if (selectedSet.has(iso3)) return '#ffffff'
          const avail = dataAvailability(iso3, yearScores, knownIsos)
          if (avail !== 'ok') return 'rgba(76,91,120,0.9)'
          return pc1ToColor(yearScores[iso3], scaleOpts)
        }}
        polygonCapMaterial={
          ((d: object) => {
            const feat = d as PolyFeat
            const iso3 = feat.properties?.__iso3
            if (iso3 && selectedSet.has(iso3)) return undefined
            const avail = dataAvailability(iso3, yearScores, knownIsos)
            if (avail !== 'ok') return hatchMatRef.current ?? undefined
            return undefined
          }) as (obj: object) => import('three').Material
        }
        polygonSideColor={() => 'rgba(6,13,28,0.94)'}
        polygonStrokeColor={(d) => {
          const feat = d as PolyFeat
          const iso3 = feat.properties?.__iso3
          return iso3 && selectedSet.has(iso3) ? '#b9fff5' : 'rgba(224,239,255,0.19)'
        }}
        polygonAltitude={(d) => {
          const feat = d as PolyFeat
          const iso3 = feat.properties?.__iso3
          return iso3 && selectedSet.has(iso3) ? 0.022 : 0.008
        }}
        polygonCapCurvatureResolution={5}
        polygonsTransitionDuration={280}
        onGlobeReady={configureGlobe}
        onPolygonClick={(poly) => {
          const feat = poly as PolyFeat
          const iso3 = feat.properties?.__iso3
          if (iso3 && knownIsos.has(iso3)) onSelect(iso3)
        }}
        onPolygonHover={(poly) => {
          const feat = poly as PolyFeat | null
          const iso3 = feat?.properties?.__iso3 ?? null
          document.body.style.cursor =
            iso3 && knownIsos.has(iso3) ? 'pointer' : 'default'
          if (!hoverEnabled || !onHover) return
          if (!iso3 || !knownIsos.has(iso3)) {
            clearHover()
            return
          }
          hoverIsoRef.current = iso3
          onHover({
            iso3,
            x: pointerRef.current.x,
            y: pointerRef.current.y,
          })
        }}
        rendererConfig={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      />
    </div>
  )
}
