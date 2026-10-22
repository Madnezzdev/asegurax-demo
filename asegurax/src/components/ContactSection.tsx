import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './Icon'
import { Reveal } from './Reveal'
import { useToast } from './Toast'

const fields = [
  { name: 'nombre', label: 'Nombre', type: 'text', autoComplete: 'given-name', half: true },
  { name: 'apellido', label: 'Apellido', type: 'text', autoComplete: 'family-name', half: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', half: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', autoComplete: 'tel', half: true },
  { name: 'vehiculo', label: 'Vehículo', type: 'text', placeholder: 'Marca, modelo y año', half: false },
]

export function ContactSection() {
  const toast = useToast()
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Demo only: nothing is sent or stored.
    e.preventDefault()
    e.currentTarget.reset()
    setSent(true)
    toast('Demo: el formulario todavía no envía información.')
    window.setTimeout(() => setSent(false), 2400)
  }

  return (
    <section id="contacto" className="relative scroll-mt-20 px-5 pb-24 pt-8 sm:px-8 lg:pb-36">
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent-orange/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent-orange">Contacto</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            ¿Querés encontrar una cobertura para vos?
          </h2>
          <p className="mt-5 max-w-md text-ink-muted">
            Dejanos tus datos y un asesor puede ayudarte a conocer las distintas opciones.
          </p>
          <ul className="mt-10 space-y-4 text-sm text-ink-muted">
            {['Asesoramiento personalizado', 'Comparación entre distintas opciones', 'Sin compromiso'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-orange/10 text-accent-orange">
                  <Icon name="chevron" className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-white/5 bg-bg-2/60 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.name} className={`field ${f.half ? '' : 'sm:col-span-2'}`}>
                  <span>{f.label}</span>
                  <input name={f.name} type={f.type} autoComplete={f.autoComplete} placeholder={f.placeholder ?? ' '} />
                </label>
              ))}
              <label className="field sm:col-span-2">
                <span>Mensaje</span>
                <textarea name="mensaje" rows={4} placeholder="Contanos qué estás buscando" />
              </label>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ink-muted">
              <input type="checkbox" name="optin" className="checkbox mt-0.5" />
              Quiero recibir información sobre opciones de cobertura.
            </label>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="btn-primary group mt-8 w-full justify-center sm:w-auto"
            >
              {sent ? '¡Listo!' : 'Quiero que me contacten'}
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
