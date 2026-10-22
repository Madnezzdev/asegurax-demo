export function UmbrellaMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ax-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4B3E" />
          <stop offset="0.5" stopColor="#FF7A32" />
          <stop offset="1" stopColor="#FFB43B" />
        </linearGradient>
      </defs>
      <path
        d="M5 25a19 19 0 0 1 38 0c-2.6-2.6-5.7-2.6-8.3 0-2.6-2.6-6-2.6-8.6 0-2.6-2.6-6-2.6-8.6 0-2.6-2.6-5.9-2.6-8.5 0Z"
        fill="url(#ax-grad)"
      />
      <path d="M24 6v-2M24 25v13.5a3.5 3.5 0 0 1-7 0" fill="none" stroke="#F5F6F5" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <UmbrellaMark />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Asegura<span className="text-gradient">X</span>
      </span>
    </span>
  )
}
