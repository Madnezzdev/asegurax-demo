import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { toCreasedNormals } from 'three-stdlib'
import { envelope, getFx } from '../lib/fx'

/**
 * Fallback sedan built from Three.js primitives. Front faces +X, wheels sit on
 * y = 0. Interactive meshes carry userData.zone so the same interaction
 * pipeline works here and with a real GLB.
 */

const WHEEL_X = { front: 1.4, rear: -1.36 }
const WHEEL_Y = 0.365
const WHEEL_Z = 0.8
const HOOD_PIVOT: [number, number, number] = [0.93, 0.995, 0]

function bodyShape() {
  const s = new THREE.Shape()
  s.moveTo(-2.2, 0.34)
  s.lineTo(WHEEL_X.rear - 0.5, 0.34)
  s.absarc(WHEEL_X.rear, 0.36, 0.5, Math.PI, 0, true)
  s.lineTo(WHEEL_X.front - 0.5, 0.34)
  s.absarc(WHEEL_X.front, 0.36, 0.5, Math.PI, 0, true)
  s.lineTo(2.18, 0.34)
  s.quadraticCurveTo(2.32, 0.36, 2.33, 0.52)
  s.lineTo(2.3, 0.7)
  s.quadraticCurveTo(2.27, 0.79, 2.04, 0.81)
  s.lineTo(0.92, 0.905)
  s.lineTo(-1.62, 0.93)
  s.lineTo(-2.12, 0.915)
  s.quadraticCurveTo(-2.3, 0.9, -2.3, 0.72)
  s.lineTo(-2.28, 0.46)
  s.quadraticCurveTo(-2.27, 0.34, -2.2, 0.34)
  return s
}

function cabinShape() {
  const s = new THREE.Shape()
  s.moveTo(0.92, 0.95)
  s.lineTo(0.06, 1.4)
  s.quadraticCurveTo(-0.04, 1.45, -0.2, 1.45)
  s.lineTo(-0.85, 1.44)
  s.quadraticCurveTo(-1.0, 1.43, -1.1, 1.36)
  s.lineTo(-1.72, 0.98)
  s.lineTo(-1.72, 0.95)
  s.closePath()
  return s
}

function hoodShape() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.005)
  s.lineTo(1.12, -0.1)
  s.quadraticCurveTo(1.15, -0.085, 1.13, -0.065)
  s.lineTo(0.02, 0.02)
  s.closePath()
  return s
}

function sideWindowShapes() {
  const front = new THREE.Shape()
  front.moveTo(0.8, 1.04)
  front.lineTo(0.1, 1.39)
  front.quadraticCurveTo(0.02, 1.42, -0.1, 1.42)
  front.lineTo(-0.36, 1.42)
  front.lineTo(-0.36, 1.04)
  front.closePath()
  const rear = new THREE.Shape()
  rear.moveTo(-0.46, 1.04)
  rear.lineTo(-0.46, 1.42)
  rear.lineTo(-0.85, 1.41)
  rear.quadraticCurveTo(-0.98, 1.4, -1.06, 1.34)
  rear.lineTo(-1.55, 1.04)
  rear.closePath()
  return [front, rear]
}

function extrude(shape: THREE.Shape, depth: number, bevel: number, bevelSize: number, segments = 5) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize,
    bevelSegments: segments,
    curveSegments: 28,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

/** Cabin sides lean inward towards the roof (tumblehome). */
function taper(g: THREE.BufferGeometry) {
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const k = THREE.MathUtils.clamp((pos.getY(i) - 0.98) / 0.47, 0, 1)
    pos.setZ(i, pos.getZ(i) * (1 - 0.15 * k))
  }
  pos.needsUpdate = true
  return g
}

const smooth = (g: THREE.BufferGeometry) => toCreasedNormals(g, Math.PI / 5)

function glassPane(size: [number, number, number], position: [number, number, number], rotationZ: number) {
  const g = new THREE.BoxGeometry(...size)
  g.rotateZ(rotationZ)
  g.translate(...position)
  return taper(g)
}

function sideWindow(shape: THREE.Shape, z: number) {
  const g = new THREE.ShapeGeometry(shape)
  g.translate(0, 0, z)
  return taper(g)
}

function tireGeometry() {
  const pts = [
    [0.235, -0.115],
    [0.31, -0.12],
    [0.343, -0.1],
    [0.355, -0.05],
    [0.357, 0],
    [0.355, 0.05],
    [0.343, 0.1],
    [0.31, 0.12],
    [0.235, 0.115],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const g = new THREE.LatheGeometry(pts, 48)
  g.rotateX(Math.PI / 2)
  return g
}

function useMaterials() {
  return useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({
        color: '#b7bcbf',
        metalness: 0.55,
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#1b2427',
        metalness: 0.3,
        roughness: 0.04,
        clearcoat: 1,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      }),
      trim: new THREE.MeshStandardMaterial({ color: '#16191a', metalness: 0.4, roughness: 0.5 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#141617', roughness: 0.88 }),
      rim: new THREE.MeshStandardMaterial({ color: '#a7adb0', metalness: 0.9, roughness: 0.28 }),
      rimDark: new THREE.MeshStandardMaterial({ color: '#2a2f31', metalness: 0.7, roughness: 0.4 }),
      head: new THREE.MeshStandardMaterial({ color: '#dfe9f2', emissive: '#e9f3ff', emissiveIntensity: 1.6 }),
      tail: new THREE.MeshStandardMaterial({ color: '#5a0f0c', emissive: '#ff2a1e', emissiveIntensity: 1.4 }),
      indicator: new THREE.MeshStandardMaterial({ color: '#4a3010', emissive: '#000000' }),
      battery: new THREE.MeshStandardMaterial({ color: '#202425', emissive: '#FFB43B', emissiveIntensity: 0 }),
    }),
    [],
  )
}

export function ProceduralCar() {
  const m = useMaterials()
  const geo = useMemo(() => {
    const windows = sideWindowShapes()
    return {
      body: smooth(extrude(bodyShape(), 1.6, 0.12, 0.08, 6)),
      cabin: smooth(taper(extrude(cabinShape(), 1.36, 0.07, 0.04, 6))),
      hood: smooth(extrude(hoodShape(), 1.5, 0.02, 0.015, 3)),
      tire: tireGeometry(),
      windshield: glassPane([0.9, 0.012, 1.34], [0.52, 1.215, 0], -0.459),
      rearGlass: glassPane([0.66, 0.012, 1.28], [-1.43, 1.205, 0], 0.547),
      sideWindows: [1, -1].flatMap((side) => windows.map((w) => sideWindow(w, side * 0.752))),
    }
  }, [])

  return (
    <group>
      {/* Body */}
      <mesh geometry={geo.body} material={m.paint} castShadow userData={{ zone: 'body', outline: true }} />
      <mesh geometry={geo.cabin} material={m.paint} castShadow userData={{ zone: 'body', outline: true }} />

      {/* Glass */}
      <group userData={{ zone: 'windshield' }}>
        <mesh geometry={geo.windshield} material={m.glass} userData={{ outline: true, role: 'glass' }} />
        <mesh geometry={geo.rearGlass} material={m.glass} userData={{ role: 'glass' }} />
        {geo.sideWindows.map((g, i) => (
          <mesh key={i} geometry={g} material={m.glass} userData={{ role: 'glass' }} />
        ))}
      </group>

      <Hood geometry={geo.hood} paint={m.paint} battery={m.battery} />

      {/* Details */}
      <group userData={{ zone: 'body' }}>
        {[1, -1].map((side) => (
          <group key={side}>
            <RoundedBox args={[0.2, 0.09, 0.08]} radius={0.03} position={[0.74, 1.06, side * 0.84]} material={m.paint} />
            <mesh position={[0.74, 1.06, side * 0.88]} material={m.trim}>
              <boxGeometry args={[0.16, 0.06, 0.02]} />
            </mesh>
            {[-0.06, -0.98].map((x) => (
              <mesh key={x} position={[x, 0.9, side * 0.922]} material={m.trim}>
                <boxGeometry args={[0.16, 0.025, 0.02]} />
              </mesh>
            ))}
            {[0.86, -0.41, -1.3].map((x) => (
              <mesh key={x} position={[x, 0.68, side * 0.921]} material={m.trim}>
                <boxGeometry args={[0.008, 0.52, 0.006]} />
              </mesh>
            ))}
            <mesh position={[0.02, 0.3, side * 0.9]} material={m.trim}>
              <boxGeometry args={[1.62, 0.07, 0.04]} />
            </mesh>
          </group>
        ))}
        <RoundedBox args={[0.06, 0.16, 1.0]} radius={0.02} position={[2.375, 0.53, 0]} material={m.trim} />
        <RoundedBox args={[0.06, 0.1, 1.2]} radius={0.02} position={[-2.36, 0.46, 0]} material={m.trim} />
      </group>

      {/* Lights */}
      {[1, -1].map((side) => (
        <group key={side}>
          <RoundedBox args={[0.08, 0.06, 0.42]} radius={0.02} position={[2.33, 0.74, side * 0.56]} material={m.head} userData={{ role: 'light' }} />
          <RoundedBox args={[0.06, 0.05, 0.12]} radius={0.015} position={[2.35, 0.66, side * 0.82]} material={m.indicator} userData={{ role: 'indicator' }} />
          <RoundedBox args={[0.05, 0.05, 0.12]} radius={0.015} position={[-2.37, 0.83, side * 0.84]} material={m.indicator} userData={{ role: 'indicator' }} />
        </group>
      ))}
      <RoundedBox args={[0.04, 0.05, 1.56]} radius={0.015} position={[-2.375, 0.9, 0]} material={m.tail} userData={{ role: 'light' }} />

      {/* Wheels */}
      <Wheels tire={geo.tire} rubber={m.rubber} rim={m.rim} rimDark={m.rimDark} />
    </group>
  )
}

function Hood({
  geometry,
  paint,
  battery,
}: {
  geometry: THREE.BufferGeometry
  paint: THREE.Material
  battery: THREE.MeshStandardMaterial
}) {
  const hinge = useRef<THREE.Group>(null)
  const batt = useRef<THREE.Group>(null)
  const spark = useRef<THREE.PointLight>(null)
  const open = useRef(0)

  useFrame(({ clock }, delta) => {
    const fx = getFx(clock.elapsedTime)
    const isOpen = fx.kind === 'hoodOpen'
    open.current = THREE.MathUtils.damp(open.current, isOpen ? 1 : 0, isOpen ? 2.6 : 4, Math.min(delta, 0.05))
    if (hinge.current) hinge.current.rotation.z = open.current * 0.62
    if (batt.current) {
      batt.current.position.y = 0.86 + open.current * 0.11
      batt.current.visible = open.current > 0.02
    }
    const e = isOpen ? envelope(fx.t, 0.35, 0.25) : 0
    const flicker = e * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 31) * Math.sin(clock.elapsedTime * 13))
    battery.emissiveIntensity = flicker * 2.5
    if (spark.current) spark.current.intensity = flicker * 6
  })

  return (
    <group userData={{ zone: 'hood' }}>
      <group ref={hinge} position={HOOD_PIVOT}>
        <mesh geometry={geometry} material={paint} castShadow userData={{ outline: true }} />
      </group>
      <group ref={batt} position={[1.6, 0.86, 0.32]} visible={false}>
        <RoundedBox args={[0.26, 0.14, 0.18]} radius={0.015} material={battery} userData={{ skipFx: true }} />
        {[0.07, -0.07].map((x, i) => (
          <mesh key={x} position={[x, 0.085, 0.05]}>
            <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
            <meshStandardMaterial color={i ? '#FF4B3E' : '#d0d4d6'} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <pointLight ref={spark} color="#FFB43B" intensity={0} distance={1.6} position={[0, 0.25, 0]} />
      </group>
    </group>
  )
}

function Wheels({
  tire,
  rubber,
  rim,
  rimDark,
}: {
  tire: THREE.BufferGeometry
  rubber: THREE.Material
  rim: THREE.Material
  rimDark: THREE.Material
}) {
  const spinners = useRef<THREE.Group[]>([])
  const speed = useRef(0)

  useFrame(({ clock }, delta) => {
    const fx = getFx(clock.elapsedTime)
    const target = fx.kind === 'wheelPulse' && fx.active ? 7 : 0
    speed.current = THREE.MathUtils.damp(speed.current, target, 2.5, Math.min(delta, 0.05))
    spinners.current.forEach((g) => g && (g.rotation.z -= speed.current * delta))
  })

  const positions: [number, number, number][] = [
    [WHEEL_X.front, WHEEL_Y, WHEEL_Z],
    [WHEEL_X.front, WHEEL_Y, -WHEEL_Z],
    [WHEEL_X.rear, WHEEL_Y, WHEEL_Z],
    [WHEEL_X.rear, WHEEL_Y, -WHEEL_Z],
  ]

  return (
    <group userData={{ zone: 'wheels' }}>
      {positions.map((p, i) => {
        const side = Math.sign(p[2])
        return (
          <group key={i} position={p} scale={[1.03, 1.03, side]}>
            <group ref={(g) => g && (spinners.current[i] = g)}>
              <mesh geometry={tire} material={rubber} castShadow userData={{ outline: true }} />
              <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]} material={rimDark}>
                <cylinderGeometry args={[0.235, 0.235, 0.05, 40]} />
              </mesh>
              <mesh position={[0, 0, 0.1]} material={rim}>
                <torusGeometry args={[0.225, 0.018, 10, 48]} />
              </mesh>
              {Array.from({ length: 5 }, (_, k) => (
                <group key={k} rotation={[0, 0, (k / 5) * Math.PI * 2]}>
                  <mesh position={[0, 0.12, 0.11]} material={rim}>
                    <boxGeometry args={[0.055, 0.21, 0.025]} />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={rim}>
                <cylinderGeometry args={[0.055, 0.06, 0.03, 24]} />
              </mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}
