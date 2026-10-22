import { Icon, type AnyIcon } from './Icon'
import { Reveal } from './Reveal'

const steps: { title: string; text: string; icon: AnyIcon }[] = [
  { title: 'Explorá', text: 'Seleccioná una parte de tu vehículo.', icon: 'drag' },
  { title: 'Conocé', text: 'Descubrí qué tipo de protección puede corresponder.', icon: 'shield' },
  { title: 'Elegí', text: 'Encontrá una cobertura adaptada a tus necesidades.', icon: 'arrow' },
]

export function CoverageSection() {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent-orange">¿Cómo funciona?</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Entender tu seguro debería ser simple.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/5 bg-white/5 md:grid-cols-3 lg:mt-20">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="h-full">
              <div className="group relative h-full bg-bg p-8 transition-colors duration-500 hover:bg-bg-2 lg:p-10">
                <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-brand transition-transform duration-700 group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-ink-muted/60">0{i + 1}</span>
                  <Icon name={s.icon} className="h-5 w-5 text-ink-muted transition-colors duration-500 group-hover:text-accent-orange" />
                </div>
                <h3 className="mt-14 font-display text-2xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
