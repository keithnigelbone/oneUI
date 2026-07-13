import { Container, SelectableButton, Text } from '@/debug/oneui'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { useAppStore } from '@/sample-app/store/appStore'
import type { ThemePreference } from '@/sample-app/utils/resolveTheme'
import { resolveTheme } from '@/sample-app/utils/resolveTheme'

const THEME_OPTIONS: { id: ThemePreference; label: string; hint: string }[] = [
  { id: 'light', label: 'Light', hint: 'Light surfaces and high-contrast text' },
  { id: 'dark', label: 'Dark', hint: 'Dark surfaces tuned for low-light use' },
  { id: 'auto', label: 'System', hint: 'Follow your device appearance setting' },
]

interface ThemeSettingsProps {
  /** Show the System / auto option (default: true). */
  showAuto?: boolean
  /** Optional prefix for data-testid on each option. */
  testIdPrefix?: string
}

/** Light / dark / system appearance controls backed by Zustand + BrandProvider `mode`. */
export function ThemeSettings({ showAuto = true, testIdPrefix = 'theme' }: ThemeSettingsProps) {
  const themePreference = useAppStore((s) => s.themePreference)
  const setThemePreference = useAppStore((s) => s.setThemePreference)
  const announce = useAnnouncer((s) => s.announce)

  const options = showAuto ? THEME_OPTIONS : THEME_OPTIONS.filter((o) => o.id !== 'auto')
  const active = resolveTheme(themePreference)

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="3" width="full">
      <div role="group" aria-label="Theme">
        <Container surface="ghost" layout="flex" direction="row" gap="2" wrap>
        {options.map((option) => (
          <SelectableButton
            key={option.id}
            selected={themePreference === option.id}
            onSelectedChange={() => {
              setThemePreference(option.id)
              announce(`${option.label} theme selected`)
            }}
            data-testid={`${testIdPrefix}-option-${option.id}`}
          >
            {option.label}
          </SelectableButton>
        ))}
        </Container>
      </div>
      <Text variant="body" size="S" attention="medium">
        Active mode: {active}
        {themePreference === 'auto' ? ' (from system preference)' : ''}
      </Text>
    </Container>
  )
}
