import type { CarZone } from '../types/coverage'

/**
 * Optional real car model.
 *
 * Drop a GLB at /public/models/sedan.glb and it will be used instead of the
 * procedural fallback car (the app checks for the file at runtime). Meshes are
 * assigned to interactive zones by name using MESH_ZONE_RULES below: adapt the
 * patterns to the mesh names of the final asset. Meshes that match no rule are
 * still rendered, just not clickable.
 *
 * The GLB should be ~4.6 units long, sit on y = 0 and face +X; use
 * MODEL_TRANSFORM to correct scale, rotation or offset otherwise.
 */
export const MODEL_URL = '/models/sedan.glb'

export const MODEL_TRANSFORM = {
  scale: 1,
  rotationY: 0,
  position: [0, 0, 0] as [number, number, number],
}

export const MESH_ZONE_RULES: { test: RegExp; zone: Exclude<CarZone, 'car'> }[] = [
  { test: /windshield|windscreen|parabrisas/i, zone: 'windshield' },
  { test: /wheel|tire|tyre|rim|rueda/i, zone: 'wheels' },
  { test: /hood|bonnet|capot/i, zone: 'hood' },
  { test: /body|door|trunk|bumper|fender|carroceria/i, zone: 'body' },
]
