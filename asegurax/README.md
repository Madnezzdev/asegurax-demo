# AseguraX · Demo interactiva

Landing demo (solo frontend) para el broker de seguros AseguraX. La pieza central es un sedán 3D
interactivo: se puede rotar, hacer zoom, pasar el mouse por las zonas y hacer click para ver cada
cobertura con su animación. No hay backend, cotización ni envío de formularios.

## Correr

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build
```

## Stack

React 18 + TypeScript + Vite, Tailwind CSS, Three.js con @react-three/fiber y @react-three/drei,
Framer Motion.

## Estructura

```
src/
  data/coverages.ts        Todas las coberturas: título, texto, ícono, zona, hotspot, cámara y animación
  types/coverage.ts        Tipos de cobertura, zonas y efectos
  config/model.ts          Dónde va el GLB definitivo y cómo se mapean sus meshes a zonas
  lib/
    store.ts               Estado de la experiencia (selección, hover, interacción)
    fx.ts                  Reloj compartido de los efectos 3D
    useZoneAnimator.ts     Highlight, oscurecido y outlines por zona (sirve para el auto procedural y para un GLB)
    outline.ts             Material de outline (inverted hull en screen space)
  components/
    Hero.tsx               Hero: texto, panel de cobertura, escenario 3D y accesos rápidos
    CarExperience.tsx      Canvas 3D (carga diferida), hints y zoom
    CarModel.tsx           Auto + interacción por puntero; usa el GLB si existe
    ProceduralCar.tsx      Sedán de respaldo construido con geometrías de Three.js
    Stage.tsx              Luces, environment, piso, plataforma y sombra
    CameraRig.tsx          OrbitControls + movimientos de cámara por cobertura
    CoverageHotspot.tsx    Pines animados sobre el auto
    CoveragePanel.tsx      Panel lateral (desktop) y bottom sheet (mobile)
    CoverageEffects.tsx    Ruedas, escudo, scan, anillos de asistencia y RC
    HailEffect.tsx         Granizo
    Navbar, CoverageSection, ContactSection, Footer, Toast, Logo, Icon, Loader, Reveal
```

## Cambiar coberturas

Todo sale de `src/data/coverages.ts`. Cada entrada define:

- `title`, `label`, `description`, `icon`
- `target`: zona del auto que se resalta y que abre esta cobertura al hacer click
  (`windshield`, `wheels`, `hood`, `body`) o `car` para coberturas del auto completo (solo hotspot)
- `hotspot`: posición del pin
- `camera`: encuadre al seleccionarla
- `effect` y `duration`: animación (`hail`, `wheelPulse`, `hoodOpen`, `shield`, `theft`, `scan`, `assist`, `liability`)

## Reemplazar el auto por un modelo real

1. Copiar el modelo a `public/models/sedan.glb`. La app lo detecta sola al arrancar; si no existe usa
   el auto procedural.
2. Ajustar en `src/config/model.ts` las reglas `MESH_ZONE_RULES` para que los nombres de los meshes del
   GLB caigan en las zonas correctas, y `MODEL_TRANSFORM` si el modelo necesita otra escala,
   rotación u offset (se espera ~4,6 unidades de largo, apoyado en y = 0 y mirando hacia +X).

Con un GLB funcionan el hover, el click por zona, el highlight, los outlines y los efectos de escena.
La apertura del capot y el giro de ruedas son propios del auto procedural.

## Detalles de interacción

- Zoom con Ctrl/⌘ + rueda (o pinch en trackpad/touch) y botones +/−, para no secuestrar el scroll de la página.
- `Esc` cierra la cobertura abierta. En mobile el bottom sheet se cierra arrastrándolo hacia abajo.
- Respeta `prefers-reduced-motion` (sin partículas ni movimientos de cámara animados).
