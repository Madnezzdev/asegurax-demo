import { useLayoutEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { coverageById } from '../data/coverages'
import { envelope, getFx } from './fx'
import { createOutlineMaterial, createOutlineMesh } from './outline'
import { experience } from './store'

const ORANGE = new THREE.Color('#FF7A32')
const RED = new THREE.Color('#FF4B3E')
const AMBER = new THREE.Color('#FFB43B')
const BLACK = new THREE.Color('#000000')

interface Entry {
  mesh: THREE.Mesh
  mat: THREE.MeshStandardMaterial
  baseColor: THREE.Color
  baseEmissive: THREE.Color
  baseEmissiveIntensity: number
  baseEnv: number
  zone: string | null
  role: string | null
  dim: number
  glow: number
}

/**
 * Drives highlight, dimming and outlines for every mesh under `root`.
 * Meshes opt in through userData: `zone` (interactive area), `role`
 * ("light" | "indicator"), `outline` (gets an outline shell) and `skipFx`
 * (material animated by its own component).
 * Works the same for the procedural car and for a loaded GLB.
 */
export function useZoneAnimator(root: RefObject<THREE.Object3D>, key: unknown) {
  const entries = useRef<Entry[]>([])
  const outlines = useRef(new Map<string, THREE.ShaderMaterial>())
  const outlineLevel = useRef(new Map<string, number>())
  const { gl } = useThree()
  const size = useRef(new THREE.Vector2())

  useLayoutEffect(() => {
    const group = root.current
    if (!group) return
    const list: Entry[] = []
    const created: THREE.Object3D[] = []
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || mesh.userData.isOutline || mesh.userData.skipFx) return
      const zone = findZone(mesh)
      const source = mesh.material as THREE.MeshStandardMaterial
      if (!source || !('emissive' in source)) return
      const mat = source.clone()
      mesh.material = mat
      list.push({
        mesh,
        mat,
        baseColor: mat.color.clone(),
        baseEmissive: mat.emissive.clone(),
        baseEmissiveIntensity: mat.emissiveIntensity,
        baseEnv: mat.envMapIntensity,
        zone,
        role: mesh.userData.role ?? null,
        dim: 1,
        glow: 0,
      })
      if (mesh.userData.outline && zone) {
        let om = outlines.current.get(zone)
        if (!om) {
          om = createOutlineMaterial('#FF8A3D', 2.5)
          outlines.current.set(zone, om)
          outlineLevel.current.set(zone, 0)
        }
        const outline = createOutlineMesh(mesh, om)
        mesh.add(outline)
        created.push(outline)
      }
    })
    entries.current = list
    return () => {
      created.forEach((o) => {
        o.removeFromParent()
        ;(o as THREE.Mesh).geometry.dispose()
      })
      list.forEach((e) => e.mat.dispose())
      outlines.current.forEach((m) => m.dispose())
      outlines.current.clear()
      outlineLevel.current.clear()
    }
  }, [root, key])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = clock.elapsedTime
    const fx = getFx(time)
    const sel = fx.coverage
    const hovered = coverageById(experience.get().hoveredId)
    const focusZone = sel && sel.target !== 'car' ? sel.target : null

    // Whole-car effects
    let globalDim = 1
    let globalOutline = 0
    let globalGlow = 0
    let glowColor = ORANGE
    if (fx.kind === 'theft') {
      const e = envelope(fx.t, 0.25, 0.35)
      globalDim = 1 - 0.9 * e
      globalOutline = e
    } else if (fx.kind === 'scan') {
      globalGlow = 0.45 * envelope(fx.t, 0.2, 0.3)
      glowColor = RED
    }

    for (const e of entries.current) {
      const isFocus = !!focusZone && e.zone === focusZone
      const isHover = !!hovered && hovered.target === e.zone && hovered.target !== 'car'
      let dimTarget = focusZone && !isFocus ? 0.38 : 1
      dimTarget *= globalDim
      let glowTarget = isFocus ? 0.18 + 0.1 * Math.sin(time * 3) : isHover ? 0.22 : 0
      if (fx.kind === 'wheelPulse' && isFocus) glowTarget = 0.25 + 0.35 * Math.max(0, Math.sin(time * 7)) * (fx.active ? 1 : 0.4)
      if (fx.kind === 'hail' && isFocus && fx.active) glowTarget += 0.25 * Math.max(0, Math.sin(time * 23) * Math.sin(time * 9))
      if (fx.kind === 'shield' && isFocus) glowTarget += 0.25 * envelope(fx.t)
      if (globalGlow > 0 && (e.zone === 'body' || e.zone === 'hood')) glowTarget = Math.max(glowTarget, globalGlow)

      e.dim = THREE.MathUtils.damp(e.dim, dimTarget, 5, dt)
      e.glow = THREE.MathUtils.damp(e.glow, glowTarget, 8, dt)

      e.mat.color.copy(e.baseColor).multiplyScalar(e.dim)
      e.mat.envMapIntensity = e.baseEnv * e.dim
      if (e.role === 'light') {
        e.mat.emissiveIntensity = e.baseEmissiveIntensity * Math.max(e.dim, 0.15)
      } else if (e.role === 'indicator') {
        const blink = fx.kind === 'assist' && fx.t < 1 && Math.sin(fx.elapsed * Math.PI * 3) > 0
        e.mat.emissive.copy(blink ? AMBER : BLACK)
        e.mat.emissiveIntensity = blink ? 4 : 0
      } else {
        const k = e.role === 'glass' ? 0.18 : e.zone === 'wheels' ? 1 : 0.28
        e.mat.emissive.copy(e.baseEmissive).lerp(glowColor, Math.min(e.glow * 4, 1))
        e.mat.emissiveIntensity = Math.max(e.baseEmissiveIntensity, e.glow * k)
      }
    }

    gl.getDrawingBufferSize(size.current)
    outlines.current.forEach((mat, zone) => {
      const isFocus = zone === focusZone
      const isHover = hovered?.target === zone
      const target = Math.max(isFocus ? 0.95 : isHover ? 0.8 : 0, globalOutline)
      const level = THREE.MathUtils.damp(outlineLevel.current.get(zone) ?? 0, target, 9, dt)
      outlineLevel.current.set(zone, level)
      mat.uniforms.opacity.value = level
      mat.uniforms.size.value.copy(size.current)
      mat.uniforms.color.value.copy(fx.kind === 'theft' ? AMBER : ORANGE)
    })
    for (const e of entries.current) {
      for (const child of e.mesh.children) {
        if (child.userData.isOutline) child.visible = (outlineLevel.current.get(e.zone ?? '') ?? 0) > 0.01
      }
    }
  })
}

function findZone(obj: THREE.Object3D | null): string | null {
  while (obj) {
    if (obj.userData.zone) return obj.userData.zone
    obj = obj.parent
  }
  return null
}

export { findZone }
