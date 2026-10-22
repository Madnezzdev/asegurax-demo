import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-ink-muted">Encontrá protección para lo que te mueve.</p>
          </div>
          <div className="flex gap-16 text-sm">
            <ul className="space-y-3">
              <li><a href="#coberturas" className="text-ink-muted transition-colors hover:text-ink">Coberturas</a></li>
              <li><a href="#contacto" className="text-ink-muted transition-colors hover:text-ink">Contacto</a></li>
            </ul>
            <ul className="space-y-3">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-ink-muted transition-colors hover:text-ink">Instagram</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-ink-muted transition-colors hover:text-ink">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-8 text-xs text-ink-muted/70 md:flex-row md:justify-between">
          <p className="max-w-2xl">
            Contenido ilustrativo utilizado con fines demostrativos. Las coberturas y condiciones finales dependen de cada aseguradora y póliza.
          </p>
          <p>© {new Date().getFullYear()} AseguraX</p>
        </div>
      </div>
    </footer>
  )
}
