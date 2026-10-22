import { motion } from 'framer-motion'
import { coverages } from '../data/coverages'
import { experience } from '../lib/store'
import type { Coverage } from '../types/coverage'
import { Icon } from './Icon'

const step = (id: string, dir: 1 | -1) => {
  const i = coverages.findIndex((c) => c.id === id)
  experience.select(coverages[(i + dir + coverages.length) % coverages.length].id)
}

function PanelBody({ coverage }: { coverage: Coverage }) {
  const index = coverages.findIndex((c) => c.id === coverage.id)
  return (
    <motion.div
      key={coverage.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-orange/30 bg-accent-orange/10 text-accent-orange">
          <Icon name={coverage.icon} className="h-6 w-6" />
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
          Cobertura {String(index + 1).padStart(2, '0')}
          <span className="text-ink-muted/50"> / {String(coverages.length).padStart(2, '0')}</span>
        </span>
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide text-ink sm:text-2xl">{coverage.title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{coverage.description}</p>
      <button type="button" className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-orange">
        Más información
        <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  )
}

function PanelNav({ coverage }: { coverage: Coverage }) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
      <span className="text-[11px] text-ink-muted/70">Sujeto a las condiciones de cada póliza.</span>
      <div className="flex gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            aria-label={dir === 1 ? 'Siguiente cobertura' : 'Cobertura anterior'}
            onClick={() => step(coverage.id, dir)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-muted transition hover:border-accent-orange/60 hover:text-ink"
          >
            <Icon name="chevron" className={`h-4 w-4 ${dir === -1 ? 'rotate-180' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

const CloseButton = () => (
  <button
    type="button"
    aria-label="Cerrar"
    onClick={() => experience.select(null)}
    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-white/5 hover:text-ink"
  >
    <Icon name="close" className="h-4 w-4" />
  </button>
)

/** Floating side panel (desktop). */
export function CoveragePanel({ coverage }: { coverage: Coverage }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel relative w-full max-w-md rounded-3xl p-7"
      aria-live="polite"
    >
      <span className="absolute inset-x-8 top-0 h-px bg-brand opacity-70" />
      <CloseButton />
      <PanelBody coverage={coverage} />
      <PanelNav coverage={coverage} />
    </motion.aside>
  )
}

/** Bottom sheet (mobile). Drag down to dismiss. */
export function CoverageSheet({ coverage }: { coverage: Coverage }) {
  return (
    <motion.aside
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 260 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_, info) => info.offset.y > 80 && experience.select(null)}
      className="glass-panel fixed inset-x-0 bottom-0 z-40 max-h-[48svh] overflow-y-auto rounded-t-3xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
      <CloseButton />
      <PanelBody coverage={coverage} />
      <PanelNav coverage={coverage} />
    </motion.aside>
  )
}
