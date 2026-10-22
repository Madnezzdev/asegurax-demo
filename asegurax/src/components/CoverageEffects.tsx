import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { envelope, fxSettings, getFx } from '../lib/fx'
import { HailEffect } from './HailEffect'

/** All coverage-specific animations; each one listens to the shared fx clock. */
export function CoverageEffects() {
  return (
    <>
      <HailEffect />
      <WheelRings />
      <ShieldEffect />
      <ScanEffect />
      <GroundRipples kind="assist" color="#FFB43B" from={2.6} to={4.2} count={2} />
      <GroundRipples kind="liability" color="#FF7A32" from={2.8} to={6.5} count={3} />
    </>
  )
}

const additive = (color: string) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })

function WheelRings() {
  const rings = useRef<THREE.Mesh[]>([])
  const mat = useMemo(() => additive('#FF7A32'), [])
  const spots: [number, number][] = [
    [1.4, 0.95],
    [1.4, -0.95],
    [-1.36, 0.95],
    [-1.36, -0.95],
  ]
  useFrame(({ clock }) => {
    const fx = getFx(clock.elapsedTime)
    const on = fx.kind === 'wheelPulse' && !fxSettings.reducedMotion
    const phase = (fx.elapsed * 1.4) % 1
    mat.opacity = on ? (1 - phase) * 0.8 * (fx.active ? 1 : 0.35) : 0
    rings.current.forEach((r) => {
      r.visible = on
      r.scale.setScalar(1 + phase * 0.7)
    })
  })
  return (
    <>
      {spots.map(([x, z], i) => (
        <mesh key={i} ref={(m) => m && (rings.current[i] = m)} position={[x, 0.355, z]} material={mat} visible={false}>
          <ringGeometry args={[0.38, 0.41, 48]} />
        </mesh>
      ))}
    </>
  )
}

const shieldShader = {
  uniforms: { opacity: { value: 0 }, color: { value: new THREE.Color('#FF7A32') }, time: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      vPos = position;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float opacity;
    uniform vec3 color;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
      float bands = 0.5 + 0.5 * sin(vPos.y * 40.0 - time * 4.0);
      float a = (fresnel * 0.6 + bands * 0.04) * opacity;
      gl_FragColor = vec4(color, a);
    }
  `,
}

function ShieldEffect() {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...shieldShader,
        uniforms: THREE.UniformsUtils.clone(shieldShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame(({ clock }) => {
    const fx = getFx(clock.elapsedTime)
    const e = fx.kind === 'shield' ? envelope(fx.t, 0.3, 0.35) : 0
    mat.uniforms.opacity.value = e
    mat.uniforms.time.value = clock.elapsedTime
    if (mesh.current) {
      mesh.current.visible = e > 0.001
      const grow = 0.85 + 0.15 * Math.min(fx.t / 0.3, 1)
      mesh.current.scale.set(2.75 * grow, 1.25 * grow, 1.35 * grow)
    }
  })
  return (
    <mesh ref={mesh} position={[0, 0.7, 0]} material={mat} visible={false}>
      <sphereGeometry args={[1, 64, 32]} />
    </mesh>
  )
}

function ScanEffect() {
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const plane = useMemo(() => {
    const m = additive('#FF4B3E')
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.35, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0.2)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 128)
    m.alphaMap = new THREE.CanvasTexture(c)
    return m
  }, [])
  const line = useMemo(() => additive('#FFB43B'), [])

  useFrame(({ clock }) => {
    const fx = getFx(clock.elapsedTime)
    const on = fx.kind === 'scan' && fx.active
    const e = on ? envelope(fx.t, 0.12, 0.2) : 0
    // Ease the sweep front-to-back and back again
    const p = 0.5 - 0.5 * Math.cos(Math.min(fx.t / 0.85, 1) * Math.PI * 2)
    const x = THREE.MathUtils.lerp(2.9, -2.9, p)
    if (group.current) {
      group.current.visible = e > 0.001
      group.current.position.x = x
    }
    plane.opacity = 0.35 * e
    line.opacity = 0.9 * e
    if (light.current) light.current.intensity = 7 * e
  })

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0.85, 0]} rotation-y={Math.PI / 2} material={plane}>
        <planeGeometry args={[2.6, 1.7]} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2} material={line}>
        <planeGeometry args={[0.03, 2.6]} />
      </mesh>
      <pointLight ref={light} color="#FF5A3A" distance={2.4} intensity={0} position={[0, 1.1, 0]} />
    </group>
  )
}

function GroundRipples({
  kind,
  color,
  from,
  to,
  count,
}: {
  kind: 'assist' | 'liability'
  color: string
  from: number
  to: number
  count: number
}) {
  const rings = useRef<THREE.Mesh[]>([])
  const mats = useMemo(() => Array.from({ length: count }, () => additive(color)), [color, count])
  useFrame(({ clock }) => {
    const fx = getFx(clock.elapsedTime)
    const on = fx.kind === kind && fx.active && !fxSettings.reducedMotion
    rings.current.forEach((r, i) => {
      const local = fx.t * 1.25 - i * 0.18
      const visible = on && local > 0 && local < 1
      r.visible = visible
      if (!visible) return
      const ease = 1 - Math.pow(1 - local, 3)
      r.scale.setScalar(THREE.MathUtils.lerp(from, to, ease))
      mats[i].opacity = (1 - local) * 0.7
    })
  })
  return (
    <>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(r) => r && (rings.current[i] = r)}
          rotation-x={-Math.PI / 2}
          position-y={0.012}
          material={m}
          visible={false}
        >
          <ringGeometry args={[0.985, 1, 128]} />
        </mesh>
      ))}
    </>
  )
}
