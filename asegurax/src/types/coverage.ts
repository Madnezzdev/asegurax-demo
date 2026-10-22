export type Vec3 = [number, number, number]

/**
 * Interactive areas of the car. Meshes are tagged with one of these zones
 * (procedural model) or mapped to one by name (GLB, see config/model.ts).
 * "car" means the coverage applies to the vehicle as a whole.
 */
export type CarZone = 'body' | 'windshield' | 'wheels' | 'hood' | 'car'

export type CoverageEffect =
  | 'hail'
  | 'wheelPulse'
  | 'hoodOpen'
  | 'shield'
  | 'theft'
  | 'scan'
  | 'assist'
  | 'liability'

export type IconName =
  | 'hail'
  | 'wheel'
  | 'battery'
  | 'shield'
  | 'lock'
  | 'scan'
  | 'support'
  | 'people'

export interface Coverage {
  id: string
  /** Panel title. */
  title: string
  /** Short label for tooltips and chips. */
  label: string
  description: string
  icon: IconName
  /** Zone highlighted and clickable for this coverage. */
  target: CarZone
  /** Where the floating hotspot sits, in car space. */
  hotspot: Vec3
  /** Camera framing when selected. */
  camera: { position: Vec3; target: Vec3 }
  effect: CoverageEffect
  /** Effect length in ms. */
  duration: number
}
