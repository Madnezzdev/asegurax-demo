import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { fxSettings, getFx } from '../lib/fx'

const STONES = 90
const IMPACTS = 40
const hidden = new THREE.Matrix4().makeScale(0, 0, 0)

/** Approximate top surface of the car, used as the hail's landing height. */
function surfaceAt(x: number, z: number) {
  if (Math.abs(z) > 0.9 || x > 2.35 || x < -2.35) return 0.02
  if (x > 0.95) return 0.97
  if (x > 0.08) return 0.98 + ((0.95 - x) / 0.87) * 0.47
  if (x > -1.1) return 1.49
  if (x > -1.74) return 1.49 - ((-1.1 - x) / 0.64) * 0.47
  return 0.98
}

interface Stone {
  pos: THREE.Vector3
  vy: number
  alive: boolean
}

export function HailEffect() {
  const stones = useRef<THREE.InstancedMesh>(null)
  const impacts = useRef<THREE.InstancedMesh>(null)
  const state = useMemo(
    () => ({
      stones: Array.from({ length: STONES }, (): Stone => ({ pos: new THREE.Vector3(), vy: 0, alive: false })),
      impacts: Array.from({ length: IMPACTS }, () => ({ pos: new THREE.Vector3(), age: 1 })),
      nextImpact: 0,
      running: false,
    }),
    [],
  )
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const c = useMemo(() => new THREE.Color(), [])

  const spawn = (s: Stone, spread: number) => {
    s.pos.set(THREE.MathUtils.randFloat(-1.2, 2.2), 2.4 + Math.random() * spread, THREE.MathUtils.randFloat(-0.95, 0.95))
    s.vy = -THREE.MathUtils.randFloat(5.5, 7.5)
    s.alive = true
  }

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const fx = getFx(clock.elapsedTime)
    const raining = fx.kind === 'hail' && fx.t < 0.8 && !fxSettings.reducedMotion
    if (raining && !state.running) state.stones.forEach((s) => spawn(s, 2.5))
    state.running = raining
    if (!stones.current || !impacts.current) return

    state.stones.forEach((s, i) => {
      if (!s.alive) {
        stones.current!.setMatrixAt(i, hidden)
        return
      }
      s.vy -= 9 * dt
      s.pos.y += s.vy * dt
      const floor = surfaceAt(s.pos.x, s.pos.z)
      if (s.pos.y <= floor) {
        const imp = state.impacts[state.nextImpact]
        imp.pos.set(s.pos.x, floor + 0.01, s.pos.z)
        imp.age = 0
        state.nextImpact = (state.nextImpact + 1) % IMPACTS
        if (raining) spawn(s, 1)
        else s.alive = false
      }
      m.compose(s.pos, q, v.setScalar(1))
      stones.current!.setMatrixAt(i, s.alive ? m : hidden)
    })
    stones.current.instanceMatrix.needsUpdate = true

    state.impacts.forEach((imp, i) => {
      imp.age = Math.min(imp.age + dt * 2.5, 1)
      const k = imp.age >= 1 ? 0 : 0.4 + imp.age * 1.4
      m.compose(imp.pos, q, v.setScalar(k))
      impacts.current!.setMatrixAt(i, k ? m : hidden)
      impacts.current!.setColorAt(i, c.setRGB(1, 0.75, 0.55).multiplyScalar(1 - imp.age))
    })
    impacts.current.instanceMatrix.needsUpdate = true
    if (impacts.current.instanceColor) impacts.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={stones} args={[undefined, undefined, STONES]} frustumCulled={false}>
        <icosahedronGeometry args={[0.022, 0]} />
        <meshStandardMaterial color="#eef6ff" emissive="#cfe6ff" emissiveIntensity={0.6} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={impacts} args={[undefined, undefined, IMPACTS]} frustumCulled={false}>
        <ringGeometry args={[0.03, 0.05, 20]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  )
}
