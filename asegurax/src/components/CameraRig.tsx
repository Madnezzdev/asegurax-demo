import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DEFAULT_CAMERA, coverageById } from '../data/coverages'
import { fxSettings } from '../lib/fx'
import { experience, useExperience } from '../lib/store'
import type { Vec3 } from '../types/coverage'

const from = new THREE.Spherical()
const to = new THREE.Spherical()
const offset = new THREE.Vector3()

const MIN_DISTANCE = 4
const MAX_DISTANCE = 10

/**
 * Orbit controls plus smooth camera moves to each coverage's framing.
 * Narrow viewports push the camera back so the whole car stays in frame.
 */
export function CameraRig({
  zoomEnabled,
  viewShift,
  controlsRef,
}: {
  zoomEnabled: boolean
  /** Fraction of the viewport to push the image up (room for the mobile sheet). */
  viewShift: number
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const shift = useRef(-1)
  useEffect(() => {
    shift.current = -1 // re-apply the view offset after a resize
  }, [size])
  const aspect = useThree((s) => s.size.width / s.size.height)
  const playId = useExperience((s) => s.playId)
  const selectedId = useExperience((s) => s.selectedId)
  const interacted = useExperience((s) => s.interacted)
  const goal = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null)
  const fit = THREE.MathUtils.clamp(1.15 / aspect, 1, 1.6)

  const framing = (position: Vec3, target: Vec3) => {
    const t = new THREE.Vector3(...target)
    const p = new THREE.Vector3(...position).sub(t).multiplyScalar(fit).add(t)
    return { position: p, target: t }
  }

  // Initial framing (and refit on resize while idle)
  useEffect(() => {
    if (experience.get().selectedId) return
    const f = framing(DEFAULT_CAMERA.position, DEFAULT_CAMERA.target)
    camera.position.copy(f.position)
    controlsRef.current?.target.copy(f.target)
    controlsRef.current?.update()
  }, [fit])

  useEffect(() => {
    if (playId === 0) return
    const f = coverageById(selectedId)?.camera ?? DEFAULT_CAMERA
    goal.current = framing(f.position, f.target)
  }, [playId])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const stop = () => {
      goal.current = null
      experience.markInteracted()
    }
    controls.addEventListener('start', stop)
    return () => controls.removeEventListener('start', stop)
  }, [controlsRef])

  useFrame((_, delta) => {
    const damped = THREE.MathUtils.damp(Math.max(shift.current, 0), viewShift, 4, Math.min(delta, 0.05))
    const next = Math.abs(damped - viewShift) < 1e-3 ? viewShift : damped
    if (next !== shift.current) {
      shift.current = next
      if (next === 0) camera.clearViewOffset()
      else camera.setViewOffset(size.width, size.height, 0, next * size.height, size.width, size.height)
    }

    const controls = controlsRef.current
    if (!goal.current || !controls) return
    const k = fxSettings.reducedMotion ? 1 : 1 - Math.exp(-2.6 * Math.min(delta, 0.05))
    // Interpolate around the car (spherical), so moves never cut through it
    controls.target.lerp(goal.current.target, k)
    from.setFromVector3(offset.copy(camera.position).sub(controls.target))
    to.setFromVector3(offset.copy(goal.current.position).sub(goal.current.target))
    let dTheta = to.theta - from.theta
    if (dTheta > Math.PI) dTheta -= Math.PI * 2
    if (dTheta < -Math.PI) dTheta += Math.PI * 2
    from.theta += dTheta * k
    from.phi += (to.phi - from.phi) * k
    from.radius += (to.radius - from.radius) * k
    camera.position.setFromSpherical(from).add(controls.target)
    controls.update()
    if (camera.position.distanceTo(goal.current.position) < 0.01) goal.current = null
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableZoom={zoomEnabled}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      zoomSpeed={0.6}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE * fit}
      minPolarAngle={0.2}
      maxPolarAngle={1.45}
      autoRotate={!interacted && !fxSettings.reducedMotion}
      autoRotateSpeed={0.5}
    />
  )
}

/** Moves the camera toward / away from the orbit target, within limits. */
export function dolly(controls: OrbitControlsImpl | null, factor: number) {
  if (!controls) return
  const cam = controls.object
  const offset = cam.position.clone().sub(controls.target)
  const d = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)
  cam.position.copy(controls.target).add(offset.setLength(d))
  controls.update()
}
