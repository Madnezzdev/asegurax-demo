/** Brand loader: an umbrella arc drawing itself. */
export function Loader({ label = 'Preparando el vehículo' }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4" role="status">
      <svg viewBox="0 0 64 40" className="h-12 w-20">
        <defs>
          <linearGradient id="ax-loader" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF4B3E" />
            <stop offset="0.5" stopColor="#FF7A32" />
            <stop offset="1" stopColor="#FFB43B" />
          </linearGradient>
        </defs>
        <path d="M6 32a26 26 0 0 1 52 0" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M6 32a26 26 0 0 1 52 0"
          fill="none"
          stroke="url(#ax-loader)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={100}
          className="animate-loader-arc"
        />
      </svg>
      <span className="text-xs uppercase tracking-[0.25em] text-ink-muted">{label}</span>
    </div>
  )
}
