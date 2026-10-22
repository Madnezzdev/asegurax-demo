import type { IconName } from '../types/coverage'

const paths: Record<IconName | 'arrow' | 'close' | 'drag' | 'tap' | 'plus' | 'minus' | 'chevron', JSX.Element> = {
  hail: (
    <>
      <path d="M7 15a4.5 4.5 0 1 1 1.6-8.7A5.5 5.5 0 0 1 19 8.5a3.5 3.5 0 0 1-1 6.5" />
      <circle cx="8.5" cy="19" r="1" />
      <circle cx="12.5" cy="17.5" r="1" />
      <circle cx="16" cy="20" r="1" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M7 7V5h3v2M14 7V5h3v2M13 10l-3 4h4l-3 4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 14.5v2.5" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </>
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19c0 1.5-2 2.5-5 2.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  drag: (
    <>
      <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-2a1.5 1.5 0 0 1 3 0V12M14 11a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3.3 16.7a1.5 1.5 0 0 1 2.3-1.9L8 17" />
      <path d="M2 6h3M19 6h3" />
    </>
  ),
  tap: (
    <>
      <circle cx="12" cy="9" r="2" />
      <path d="M7.5 9a4.5 4.5 0 0 1 9 0" />
      <path d="M12 11v7l-2-1.5M12 18l2-1.5" />
    </>
  ),
}

export type AnyIcon = keyof typeof paths

export function Icon({ name, className = 'h-5 w-5' }: { name: AnyIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
