import { IconButton, Tooltip } from '@/debug/oneui'
import { useAppStore } from '@/sample-app/store/appStore'
import { resolveTheme } from '@/sample-app/utils/resolveTheme'
import { TESTIDS } from '@/sample-app/testids'

/** Header control — toggles between light and dark (skips system). */
export function ThemeToggle() {
  const themePreference = useAppStore((s) => s.themePreference)
  const setThemePreference = useAppStore((s) => s.setThemePreference)
  const active = resolveTheme(themePreference)
  const next = active === 'dark' ? 'light' : 'dark'

  return (
    <Tooltip content={active === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
      <IconButton
        icon={active === 'dark' ? 'sun' : 'moon'}
        aria-label={active === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        attention="medium"
        appearance="neutral"
        size="m"
        onClick={() => setThemePreference(next)}
        data-testid={TESTIDS.layout.themeToggle}
      />
    </Tooltip>
  )
}
