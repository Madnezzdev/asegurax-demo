import type { Coverage, Vec3 } from '../types/coverage'

/**
 * Single source of truth for coverage content. Placeholder copy:
 * replace titles, texts, icons, targets and effects here.
 */
export const coverages: Coverage[] = [
  {
    id: 'glass',
    title: 'Cristales y granizo',
    label: 'Parabrisas',
    description:
      'Protección ante daños en parabrisas y cristales provocados por impactos, accidentes o fenómenos climáticos, según el plan contratado.',
    icon: 'hail',
    target: 'windshield',
    hotspot: [0.42, 1.22, 0],
    camera: { position: [4.3, 2.9, 2.6], target: [0.3, 1.0, 0] },
    effect: 'hail',
    duration: 3800,
  },
  {
    id: 'wheels',
    title: 'Ruedas y neumáticos',
    label: 'Ruedas',
    description:
      'Coberturas y asistencia ante situaciones relacionadas con neumáticos, ruedas o imprevistos durante el viaje, dependiendo del plan.',
    icon: 'wheel',
    target: 'wheels',
    hotspot: [1.35, 0.36, 0.98],
    camera: { position: [2.2, 1.0, 5.2], target: [0, 0.45, 0] },
    effect: 'wheelPulse',
    duration: 2600,
  },
  {
    id: 'mechanical',
    title: 'Asistencia mecánica',
    label: 'Batería',
    description:
      'Servicios de asistencia ante inconvenientes mecánicos, problemas de batería y otras situaciones que pueden inmovilizar el vehículo, según la cobertura contratada.',
    icon: 'battery',
    target: 'hood',
    hotspot: [1.55, 1.02, 0],
    camera: { position: [4.6, 2.8, 1.9], target: [1.3, 0.85, 0] },
    effect: 'hoodOpen',
    duration: 3200,
  },
  {
    id: 'accident',
    title: 'Daños por accidente',
    label: 'Carrocería',
    description:
      'Protección frente a daños ocasionados por accidentes, dependiendo del tipo de cobertura contratada.',
    icon: 'shield',
    target: 'body',
    hotspot: [-0.35, 0.72, 0.96],
    camera: { position: [-1.4, 1.7, 6.1], target: [0, 0.65, 0] },
    effect: 'shield',
    duration: 2800,
  },
  {
    id: 'theft',
    title: 'Robo total',
    label: 'Robo',
    description:
      'Cobertura frente al robo o hurto total del vehículo, según las condiciones de la póliza contratada.',
    icon: 'lock',
    target: 'car',
    hotspot: [-0.45, 1.72, 0],
    camera: { position: [5.6, 3.4, 5.4], target: [0, 0.7, 0] },
    effect: 'theft',
    duration: 2600,
  },
  {
    id: 'total-loss',
    title: 'Destrucción total',
    label: 'Destrucción total',
    description:
      'Cobertura ante daños de gran magnitud que alcancen los criterios establecidos en la póliza.',
    icon: 'scan',
    target: 'car',
    hotspot: [-2.3, 1.05, 0.55],
    camera: { position: [-5.0, 2.5, 4.6], target: [0, 0.65, 0] },
    effect: 'scan',
    duration: 3000,
  },
  {
    id: 'assistance',
    title: 'Asistencia 24/7',
    label: 'Asistencia 24/7',
    description:
      'Servicios de asistencia que pueden ayudarte cuando tu vehículo queda inmovilizado durante el viaje, de acuerdo con las condiciones de la póliza.',
    icon: 'support',
    target: 'car',
    hotspot: [2.55, 0.62, -0.62],
    camera: { position: [6.0, 1.7, -3.4], target: [0.4, 0.6, 0] },
    effect: 'assist',
    duration: 3200,
  },
  {
    id: 'liability',
    title: 'Responsabilidad civil',
    label: 'Responsabilidad civil',
    description:
      'Protección frente a daños ocasionados a terceros, de acuerdo con los límites y condiciones de la cobertura contratada.',
    icon: 'people',
    target: 'car',
    hotspot: [0.2, 0.08, 2.15],
    camera: { position: [0.6, 6.6, 7.4], target: [0, 0.2, 0] },
    effect: 'liability',
    duration: 3000,
  },
]

export const DEFAULT_CAMERA: { position: Vec3; target: Vec3 } = {
  position: [5.4, 2.3, 6.2],
  target: [0, 0.62, 0],
}

export const coverageById = (id: string | null) => coverages.find((c) => c.id === id) ?? null

/** Coverage opened when clicking a mesh of the given zone. */
export const coverageForZone = (zone: string) => coverages.find((c) => c.target === zone) ?? null
