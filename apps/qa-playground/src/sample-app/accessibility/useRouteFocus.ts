import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Moves focus to the main content heading on route change so screen-reader
 * users are informed of navigation and keyboard focus is not lost.
 */
export function useRouteFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.focus({ preventScroll: false })
  }, [pathname])

  return ref
}
