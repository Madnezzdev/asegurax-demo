import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { MESH_ZONE_RULES, MODEL_TRANSFORM, MODEL_URL } from '../config/model'
import { coverageForZone } from '../data/coverages'
import { experience } from '../lib/store'
import { findZone, useZoneAnimator } from '../lib/useZoneAnimator'
import { ProceduralCar } from './ProceduralCar'

/** The car plus its pointer interaction. `useGltf` swaps in /public/models/sedan.glb. */
export function CarModel({ useGltf }: { useGltf: boolean }) {
  const root = useRef<THREE.Group>(null)
  const canvas = useThree((s) => s.gl.domElement)
  const setCursor = (c: string) => (canvas.style.cursor = c)
  useZoneAnimator(root, useGltf)

  const coverageAt = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const zone = findZone(e.object)
    return zone ? coverageForZone(zone) : null
  }

  return (
    <group
      ref={root}
      onPointerMove={(e) => {
        e.stopPropagation()
        const c = coverageAt(e)
        experience.hover(c?.id ?? null)
        setCursor(c ? 'pointer' : 'grab')
      }}
      onPointerOut={() => {
        experience.hover(null)
        setCursor('')
      }}
      onClick={(e) => {
        if (e.delta > 6) return
        e.stopPropagation()
        const c = coverageAt(e)
        if (c) experience.select(c.id)
      }}
    >
      {useGltf ? <GltfCar /> : <ProceduralCar />}
    </group>
  )
}

function GltfCar() {
  const { scene } = useGLTF(MODEL_URL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      const rule = MESH_ZONE_RULES.find((r) => r.test.test(mesh.name) || r.test.test(mesh.parent?.name ?? ''))
      if (rule) mesh.userData = { ...mesh.userData, zone: rule.zone, outline: true }
    })
    return clone
  }, [scene])

  return (
    <primitive
      object={model}
      scale={MODEL_TRANSFORM.scale}
      rotation-y={MODEL_TRANSFORM.rotationY}
      position={MODEL_TRANSFORM.position}
    />
  )
}
