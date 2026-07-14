import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { YearPoint } from '../types'
import { useI18n } from '../i18n'

type Props = {
  series: YearPoint[]
  height?: number
}

const COLOR_OLD = new THREE.Color('#d8e2ec')
const COLOR_NEW = new THREE.Color('#0b1f2a')
const AXIS_X = 0x5eead4 // PC1
const AXIS_Y = 0xa78bfa // PC3
const AXIS_Z = 0x38bdf8 // PC2

function yearColor(t: number): THREE.Color {
  return COLOR_OLD.clone().lerp(COLOR_NEW, THREE.MathUtils.clamp(t, 0, 1))
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = mesh.material
    if (!mat) return
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat.dispose()
  })
}

/** User-driven WebGL trajectory in PC1–PC2–PC3 space (color = time). */
export function Trajectory3D({ series, height = 300 }: Props) {
  const { t } = useI18n()
  const mountRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const pathGroupRef = useRef<THREE.Group | null>(null)
  const frameCenterRef = useRef(new THREE.Vector3())
  const frameRadiusRef = useRef(10)

  const yearMin = series[0]?.year ?? 0
  const yearMax = series[series.length - 1]?.year ?? 0
  const [untilYear, setUntilYear] = useState(yearMax)
  const [resetNonce, setResetNonce] = useState(0)

  useEffect(() => {
    setUntilYear(yearMax)
  }, [yearMax, series])

  const visible = useMemo(
    () => series.filter((s) => s.year <= untilYear),
    [series, untilYear],
  )

  const points = useMemo(
    () => visible.map((s) => new THREE.Vector3(s.PC1, s.PC3, s.PC2)),
    [visible],
  )

  const allPoints = useMemo(
    () => series.map((s) => new THREE.Vector3(s.PC1, s.PC3, s.PC2)),
    [series],
  )

  // Scene + orbit controls (stable camera; user-driven).
  useEffect(() => {
    const el = mountRef.current
    if (!el || allPoints.length < 2) return

    const w = el.clientWidth
    const h = height
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 500)

    const box = new THREE.Box3().setFromPoints(allPoints)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const radius = Math.max(size.length() * 0.55, 4)
    frameCenterRef.current.copy(center)
    frameRadiusRef.current = radius

    camera.position.copy(center).add(new THREE.Vector3(radius * 1.35, radius * 0.85, radius * 1.45))
    camera.lookAt(center)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.display = 'block'
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = false
    controls.enablePan = true
    controls.minDistance = radius * 0.35
    controls.maxDistance = radius * 6
    controls.target.copy(center)
    controlsRef.current = controls

    const pathGroup = new THREE.Group()
    pathGroupRef.current = pathGroup
    scene.add(pathGroup)

    // Subtle reference frame around data center
    const axisLen = radius * 0.9
    const origin = center.clone()
    const addAxis = (dir: THREE.Vector3, color: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        origin.clone(),
        origin.clone().add(dir.clone().multiplyScalar(axisLen)),
      ])
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
      )
      scene.add(line)
      return line
    }
    const ax = addAxis(new THREE.Vector3(1, 0, 0), AXIS_X)
    const ay = addAxis(new THREE.Vector3(0, 1, 0), AXIS_Y)
    const az = addAxis(new THREE.Vector3(0, 0, 1), AXIS_Z)

    const grid = new THREE.GridHelper(radius * 2.4, 12, 0x1e293b, 0x1e293b)
    grid.position.copy(center)
    grid.position.y = center.y - radius * 0.55
    const gridMat = grid.material
    if (Array.isArray(gridMat)) {
      gridMat.forEach((m) => {
        m.transparent = true
        m.opacity = 0.35
      })
    } else {
      gridMat.transparent = true
      gridMat.opacity = 0.35
    }
    scene.add(grid)

    const key = new THREE.DirectionalLight(0xffffff, 0.95)
    key.position.set(center.x + 5, center.y + 12, center.z + 6)
    scene.add(key, new THREE.AmbientLight(0x9eb6cc, 0.62))

    let raf = 0
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      if (!mountRef.current) return
      const nw = mountRef.current.clientWidth
      camera.aspect = nw / h
      camera.updateProjectionMatrix()
      renderer.setSize(nw, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      controlsRef.current = null
      pathGroupRef.current = null
      disposeObject(pathGroup)
      ax.geometry.dispose()
      ay.geometry.dispose()
      az.geometry.dispose()
      ;(ax.material as THREE.Material).dispose()
      ;(ay.material as THREE.Material).dispose()
      ;(az.material as THREE.Material).dispose()
      grid.geometry.dispose()
      if (Array.isArray(grid.material)) grid.material.forEach((m) => m.dispose())
      else grid.material.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [allPoints, height])

  // Path mesh: full or scrubbed; vertex colors encode year (light→dark).
  useEffect(() => {
    const group = pathGroupRef.current
    if (!group || points.length < 2) {
      if (group) {
        while (group.children.length) {
          const child = group.children[0]
          group.remove(child)
          disposeObject(child)
        }
      }
      return
    }

    while (group.children.length) {
      const child = group.children[0]
      group.remove(child)
      disposeObject(child)
    }

    const curve = new THREE.CatmullRomCurve3(points)
    const tubularSegments = Math.max(48, points.length * 6)
    const radialSegments = 8
    const tube = new THREE.TubeGeometry(curve, tubularSegments, 0.07, radialSegments, false)

    const colors = new Float32Array(tube.attributes.position.count * 3)
    const vertsPerRing = radialSegments + 1
    for (let i = 0; i < tube.attributes.position.count; i++) {
      const ring = Math.floor(i / vertsPerRing)
      const t = ring / tubularSegments
      const c = yearColor(t)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    tube.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.12,
      roughness: 0.42,
    })
    group.add(new THREE.Mesh(tube, mat))

    const markerGeo = new THREE.SphereGeometry(0.13, 14, 14)
    const startMat = new THREE.MeshStandardMaterial({
      color: COLOR_OLD,
      emissive: COLOR_OLD,
      emissiveIntensity: 0.15,
      roughness: 0.5,
    })
    const endMat = new THREE.MeshStandardMaterial({
      color: COLOR_NEW,
      emissive: COLOR_NEW,
      emissiveIntensity: 0.25,
      roughness: 0.4,
    })
    const start = new THREE.Mesh(markerGeo, startMat)
    start.position.copy(points[0])
    const end = new THREE.Mesh(markerGeo, endMat)
    end.position.copy(points[points.length - 1])
    group.add(start, end)

    return () => {
      while (group.children.length) {
        const child = group.children[0]
        group.remove(child)
        disposeObject(child)
      }
    }
  }, [points])

  // Explicit camera reset (button).
  useEffect(() => {
    if (resetNonce === 0) return
    const controls = controlsRef.current
    if (!controls) return
    const center = frameCenterRef.current
    const radius = frameRadiusRef.current
    controls.object.position
      .copy(center)
      .add(new THREE.Vector3(radius * 1.35, radius * 0.85, radius * 1.45))
    controls.target.copy(center)
    controls.update()
  }, [resetNonce])

  if (series.length < 2) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-8 text-center text-xs text-slate-500">
        {t('countrySheet.trajectoryEmpty')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <div ref={mountRef} style={{ height, width: '100%' }} />

        {/* Axis meaning + color→year (2D overlay — readable on mobile) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
          <div className="max-w-[70%] rounded-lg border border-white/10 bg-black/55 px-2.5 py-2 text-[10px] leading-snug text-slate-300 backdrop-blur-md">
            <p className="mb-1 font-medium tracking-wide text-slate-100">
              {t('countrySheet.trajectoryAxesTitle')}
            </p>
            <p>
              <span className="font-mono text-teal-300">X</span>
              {' · '}
              {t('countrySheet.trajectoryAxisX')}
            </p>
            <p>
              <span className="font-mono text-sky-300">Z</span>
              {' · '}
              {t('countrySheet.trajectoryAxisZ')}
            </p>
            <p>
              <span className="font-mono text-violet-300">Y</span>
              {' · '}
              {t('countrySheet.trajectoryAxisY')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResetNonce((n) => n + 1)}
            className="pointer-events-auto shrink-0 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] text-slate-300 backdrop-blur-md transition hover:border-white/30 hover:text-white"
          >
            {t('countrySheet.trajectoryReset')}
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-wrap items-end justify-between gap-2">
          <div className="rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5 backdrop-blur-md">
            <p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-slate-400">
              {t('countrySheet.trajectoryColorLegend')}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-300">{yearMin}</span>
              <div
                className="h-1.5 w-20 rounded-full sm:w-28"
                style={{
                  background: 'linear-gradient(90deg, #d8e2ec 0%, #0b1f2a 100%)',
                }}
              />
              <span className="font-mono text-[10px] text-slate-300">{yearMax}</span>
            </div>
          </div>
          <p className="rounded-md bg-black/45 px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
            {t('countrySheet.trajectoryHint')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
          <label htmlFor="trajectory-year-scrub" className="uppercase tracking-[0.14em]">
            {t('countrySheet.trajectoryScrub')}
          </label>
          <span className="font-mono text-slate-300">
            {yearMin} → {untilYear}
          </span>
        </div>
        <input
          id="trajectory-year-scrub"
          type="range"
          min={yearMin}
          max={yearMax}
          step={1}
          value={untilYear}
          onChange={(e) => setUntilYear(Number(e.target.value))}
          className="w-full accent-teal-300"
          aria-label={t('countrySheet.trajectoryScrub')}
        />
      </div>
    </div>
  )
}
