import { useEffect, useState } from 'react'
import { resolveTheme, type ResolvedTheme, type ThemePreference } from '@/sample-app/utils/resolveTheme'

/** Resolves store theme preference (including `auto`) for BrandProvider. */
export function useBrandTheme(preference: ThemePreference): ResolvedTheme {
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(preference))

  useEffect(() => {
    if (preference !== 'auto') {
      setTheme(resolveTheme(preference))
      return
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setTheme(resolveTheme('auto'))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [preference])

  return theme
}
