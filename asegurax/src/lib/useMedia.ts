import { useEffect, useState } from 'react'

export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export const useIsDesktop = () => useMedia('(min-width: 1024px)')
export const useCoarsePointer = () => useMedia('(pointer: coarse)')
export const usePrefersReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
