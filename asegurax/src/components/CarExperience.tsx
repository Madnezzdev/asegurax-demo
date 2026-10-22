import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { MODEL_URL } from '../config/model'
import { DEFAULT_CAMERA } from '../data/coverages'
import { fxSettings } from '../lib/fx'
import { experience, useExperience } from '../lib/store'
import { useCoarsePointer, useIsDesktop, usePrefersReducedMotion } from '../lib/useMedia'
import { CameraRig, dolly } from './CameraRig'
import { CarModel } from './CarModel'
import { CoverageEffects } from './CoverageEffects'
import { CoverageHotspots } from './CoverageHotspot'
import { Icon } from './Icon'
import { Loader } from './Loader'
import { Stage } from './Stage'

/** Uses /public/models/sedan.glb when it exists, otherwise the procedural car. */
function useGltfAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null)
  useEffect(() => {
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((r) => setAvailable(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')))
      .catch(() => setAvailable(false))
  }, [])
  return available
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}

export default function CarExperience() {
  const reduced = usePrefersReducedMotion()
  const coarse = useCoarsePointer()
  const gltf = useGltfAvailable()
  const [ready, setReady] = useState(false)
  const controls = useRef<OrbitControlsImpl | null>(null)
  const interacted = useExperience((s) => s.interacted)
  const hasSelection = useExperience((s) => s.selectedId !== null)
  const isDesktop = useIsDesktop()
  fxSettings.reducedMotion = reduced

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && experience.select(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="relative h-full w-full"
      // Wheel zoom only with Ctrl/⌘ (or trackpad pinch) so the page keeps scrolling normally.
      onWheelCapture={(e) => {
        if (controls.current) controls.current.enableZoom = coarse || e.ctrlKey || e.metaKey
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={ready ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: 32, near: 0.1, far: 80, position: DEFAULT_CAMERA.position }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="!touch-none"
          aria-label="Modelo 3D interactivo de un auto"
        >
          <Suspense fallback={null}>
            <Stage />
            {gltf !== null && (
              <>
                <CarModel useGltf={gltf} />
                <Ready onReady={() => setReady(true)} />
              </>
            )}
            <CoverageEffects />
            <CoverageHotspots />
          </Suspense>
          <CameraRig zoomEnabled={coarse} viewShift={!isDesktop && hasSelection ? 0.24 : 0} controlsRef={controls} />
        </Canvas>
      </motion.div>

      <AnimatePresence>
        {!ready && (
          <motion.div className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction hints */}
      <AnimatePresence>
        {ready && !interacted && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-24 flex flex-col items-center gap-2 px-4 text-center lg:bottom-36"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-bg-deep/60 px-4 py-2 text-sm text-ink backdrop-blur-md">
              <Icon name="drag" className="h-4 w-4 text-accent-orange motion-safe:animate-nudge" />
              Arrastrá para explorar
            </span>
            <span className="text-xs text-ink-muted">
              {coarse ? 'Tocá una zona del vehículo' : 'Hacé click sobre una zona del vehículo'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom */}
      <div className="absolute bottom-24 right-4 hidden flex-col gap-2 sm:flex lg:bottom-28 lg:right-8">
        {[
          { icon: 'plus' as const, label: 'Acercar', f: 0.85 },
          { icon: 'minus' as const, label: 'Alejar', f: 1.18 },
        ].map((b) => (
          <button
            key={b.icon}
            type="button"
            aria-label={b.label}
            title={coarse ? b.label : `${b.label} (o Ctrl + rueda)`}
            onClick={() => {
              experience.markInteracted()
              dolly(controls.current, b.f)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-bg-deep/50 text-ink-muted backdrop-blur-md transition hover:border-accent-orange/50 hover:text-ink"
          >
            <Icon name={b.icon} className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
