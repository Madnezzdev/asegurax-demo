import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { coverages } from '../data/coverages'
import { experience, useExperience } from '../lib/store'
import type { Coverage } from '../types/coverage'

const CAR_CENTER = new THREE.Vector3(0, 0.75, 0)
const tmp = new THREE.Vector3()
const toCam = new THREE.Vector3()

export function CoverageHotspots() {
  return (
    <>
      {coverages.map((c) => (
        <CoverageHotspot key={c.id} coverage={c} />
      ))}
    </>
  )
}

/**
 * Pulsing pin anchored to a point of the car. Fades out when it faces away
 * from the camera so pins behind the car don't float over it.
 */
function CoverageHotspot({ coverage }: { coverage: Coverage }) {
  const el = useRef<HTMLDivElement>(null)
  const selected = useExperience((s) => s.selectedId === coverage.id)
  const hovered = useExperience((s) => s.hoveredId === coverage.id)
  const anySelected = useExperience((s) => s.selectedId !== null)
  const position = coverage.hotspot
  const normal = new THREE.Vector3(...position).sub(CAR_CENTER)
  normal.y *= 0.4
  normal.normalize()

  useFrame(({ camera }) => {
    if (!el.current) return
    tmp.set(...position)
    toCam.copy(camera.position).sub(tmp).normalize()
    const facing = normal.dot(toCam)
    const vis = THREE.MathUtils.smoothstep(facing, -0.25, 0.15)
    el.current.style.opacity = String(selected ? 1 : vis * (anySelected ? 0.55 : 1))
    el.current.style.pointerEvents = vis > 0.3 || selected ? 'auto' : 'none'
  })

  const showLabel = hovered || selected

  return (
    <Html position={position} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={el} className="transition-opacity duration-300">
        <button
          type="button"
          aria-label={coverage.title}
          onClick={() => experience.select(coverage.id)}
          onPointerEnter={() => experience.hover(coverage.id)}
          onPointerLeave={() => experience.hover(null)}
          className="group relative flex h-8 w-8 items-center justify-center rounded-full outline-none"
        >
          <span
            className={`absolute inset-0 rounded-full bg-accent-orange/30 ${selected ? '' : 'motion-safe:animate-hotspot'}`}
          />
          <span
            className={`relative block rounded-full border transition-all duration-300 ${
              selected
                ? 'h-4 w-4 border-white bg-brand shadow-glow'
                : 'h-3 w-3 border-white/80 bg-accent-orange group-hover:h-4 group-hover:w-4 group-focus-visible:h-4 group-focus-visible:w-4'
            }`}
          />
          <span
            className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-bg-deep/85 px-3 py-1 text-xs font-medium text-ink backdrop-blur-md transition-all duration-300 ${
              showLabel ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
            }`}
          >
            {coverage.label}
          </span>
        </button>
      </div>
    </Html>
  )
}
