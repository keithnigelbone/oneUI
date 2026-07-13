import { useEffect } from 'react'
import { resolveTheme, type ThemePreference } from '@/sample-app/utils/resolveTheme'

/**
 * Mirrors BrandProvider scope onto <html> so portaled overlays (Modal, Tooltip, etc.)
 * inherit brand CSS and the light/dark token cascade — same anchor Storybook uses.
 */
export function useBrandThemeOnDocument(brand: string, themePreference: ThemePreference) {
  useEffect(() => {
    const html = document.documentElement
    const apply = () => {
      const mode = resolveTheme(themePreference)
      html.setAttribute('data-brand', brand)
      html.setAttribute('data-mode', mode)
      html.style.colorScheme = mode
    }

    apply()

    if (themePreference !== 'auto') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [brand, themePreference])
}
