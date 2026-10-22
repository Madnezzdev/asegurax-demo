import * as THREE from 'three'
import { toCreasedNormals } from 'three-stdlib'

const vertexShader = /* glsl */ `
  uniform float thickness;
  uniform vec2 size;
  void main() {
    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 clipNormal = projectionMatrix * modelViewMatrix * vec4(normal, 0.0);
    vec2 offset = normalize(clipNormal.xy) * thickness / size * clipPosition.w * 2.0;
    clipPosition.xy += offset;
    gl_Position = clipPosition;
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 color;
  uniform float opacity;
  void main() {
    gl_FragColor = vec4(color, opacity);
    #include <colorspace_fragment>
  }
`

/** Screen-space outline shell (inverted hull), thickness in pixels. */
export function createOutlineMaterial(color: THREE.ColorRepresentation, thickness = 2.5) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      opacity: { value: 0 },
      thickness: { value: thickness },
      size: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  })
}

export function createOutlineMesh(source: THREE.Mesh, material: THREE.ShaderMaterial) {
  const outline = new THREE.Mesh(toCreasedNormals(source.geometry, Math.PI), material)
  outline.raycast = () => {}
  outline.visible = false
  outline.userData.isOutline = true
  return outline
}
