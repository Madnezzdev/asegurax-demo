import { useMemo } from 'react'
import * as THREE from 'three'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'

/** Studio lighting, floor and platform under the car. */
export function Stage() {
  const fade = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.45, '#9a9a9a')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 5]} intensity={1.5} />
      <directionalLight position={[-5, 3, -6]} intensity={0.45} color="#FF7A32" />
      <spotLight position={[0, 6, -6]} angle={0.5} penumbra={1} intensity={18} color="#ffd8b8" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 2.5, 7]} scale={[12, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 2.5, -7]} rotation-y={Math.PI} scale={[12, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[7, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#FF7A32" position={[-7, 3, 2]} rotation-y={Math.PI / 2} scale={3} />
      </Environment>

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#202625" roughness={0.75} metalness={0.2} transparent alphaMap={fade} />
      </mesh>
      {/* Platform */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <circleGeometry args={[3.35, 96]} />
        <meshStandardMaterial color="#272d2c" roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[3.33, 3.37, 128]} />
        <meshBasicMaterial color="#FF7A32" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[3.55, 3.56, 128]} />
        <meshBasicMaterial color="#AEB7B4" transparent opacity={0.12} />
      </mesh>

      <ContactShadows position={[0, 0.006, 0]} scale={7.5} far={1.6} blur={2.2} opacity={0.85} resolution={512} color="#000000" />
    </>
  )
}
