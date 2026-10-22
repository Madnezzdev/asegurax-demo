import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from './Logo'

const links = [
  { href: '#coberturas', label: 'Coberturas' },
  { href: '#como-funciona', label: '¿Cómo funciona?' },
  { href: '#contacto', label: 'Contacto' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-white/5 bg-bg/70 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12 xl:px-20">
        <a href="#coberturas" aria-label="AseguraX, inicio">
          <Logo />
        </a>
        <div className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link text-sm text-ink-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
        <a href="#contacto" className="btn-primary !px-4 !py-2 text-xs sm:!px-5 sm:!py-2.5 sm:text-sm">
          <span className="sm:hidden">Asesoramiento</span>
          <span className="hidden sm:inline">Quiero asesoramiento</span>
        </a>
      </nav>
    </motion.header>
  )
}
