import { Suspense, lazy } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { coverageById, coverages } from '../data/coverages'
import { experience, useExperience } from '../lib/store'
import { useIsDesktop } from '../lib/useMedia'
import { CoveragePanel, CoverageSheet } from './CoveragePanel'
import { Icon } from './Icon'
import { Loader } from './Loader'

const CarExperience = lazy(() => import('./CarExperience'))

const ease = [0.22, 1, 0.36, 1] as const

function HeroCopy() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
      className="max-w-xl"
    >
      {[
        <span key="eyebrow" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-orange motion-safe:animate-pulse" />
          Demo interactiva
        </span>,
        <h1 key="title" className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.1rem] xl:text-6xl">
          Tu auto. Tu cobertura.
          <br />
          <span className="text-gradient">Todo más claro.</span>
        </h1>,
        <p key="sub" className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted sm:text-base lg:mt-6">
          <span className="lg:hidden">Tocá el auto y descubrí qué puede cubrir tu seguro.</span>
          <span className="hidden lg:inline">
            Explorá el vehículo y descubrí algunas de las coberturas que pueden acompañarte en cada situación.
          </span>
        </p>,
        <div key="cta" className="mt-6 hidden items-center gap-5 lg:mt-9 lg:flex">
          <button type="button" onClick={() => experience.select(coverages[0].id)} className="btn-primary group">
            Explorar coberturas
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <span className="text-xs text-ink-muted">8 zonas para descubrir</span>
        </div>,
      ].map((child, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

function CoverageRail() {
  const selectedId = useExperience((s) => s.selectedId)
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 lg:flex-wrap lg:justify-center lg:overflow-visible">
      {coverages.map((c) => {
        const active = c.id === selectedId
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => experience.select(active ? null : c.id)}
            onPointerEnter={() => experience.hover(c.id)}
            onPointerLeave={() => experience.hover(null)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
              active
                ? 'border-accent-orange/60 bg-accent-orange/15 text-ink'
                : 'border-white/10 bg-bg-deep/40 text-ink-muted backdrop-blur-md hover:border-white/25 hover:text-ink'
            }`}
          >
            <Icon name={c.icon} className={`h-3.5 w-3.5 ${active ? 'text-accent-orange' : ''}`} />
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

export function Hero() {
  const isDesktop = useIsDesktop()
  const selected = coverageById(useExperience((s) => s.selectedId))

  return (
    <section id="coberturas" className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden lg:block lg:min-h-[700px]">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[58%] h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,50,0.10)_0%,rgba(41,47,46,0)_60%)] lg:left-[64%]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Copy / panel */}
      <div className="relative z-10 px-5 pt-24 sm:px-8 lg:pointer-events-none lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[44%] lg:items-center lg:pl-12 lg:pt-0 xl:pl-20 2xl:pl-28">
        <div className="lg:pointer-events-auto lg:w-full">
          <AnimatePresence mode="wait">
            {selected && isDesktop && <CoveragePanel key="panel" coverage={selected} />}
            {!selected && <HeroCopy key="copy" />}
          </AnimatePresence>
        </div>
      </div>

      {/* 3D stage */}
      <div className="stage-mask relative min-h-0 flex-1 lg:absolute lg:inset-y-0 lg:left-[30%] lg:right-0">
        <Suspense fallback={<Loader />}>
          <CarExperience />
        </Suspense>
      </div>

      {/* Coverage shortcuts */}
      <div className="absolute inset-x-0 bottom-6 z-20 mx-auto max-w-5xl lg:bottom-8">
        <CoverageRail />
      </div>

      <AnimatePresence>{selected && !isDesktop && <CoverageSheet key="sheet" coverage={selected} />}</AnimatePresence>
    </section>
  )
}
