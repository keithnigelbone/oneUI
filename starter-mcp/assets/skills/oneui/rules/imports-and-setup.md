# Imports, Setup & Tokens

## Import from the published package, per platform

| Platform | Components | Icons |
| --- | --- | --- |
| Web | `@jds4/oneui-react` | `@jds4/oneui-icons-jio` |
| React Native | `@oneui/ui-native` | `@oneui/icons-jio-native` |

Never import from the internal workspace name `@oneui/ui`, `oneui-react`, or `@base-ui/react` — the validator flags `unknown-import-path` / `forbidden-base-ui`.

**Incorrect:**
```tsx
import { Button } from "@oneui/ui"        {/* internal workspace name — won't resolve for consumers */}
```

**Correct:**
```tsx
import { Button, Surface, Input } from "@jds4/oneui-react"
```

Use `setup_oneui_project` to scaffold install + provider config, and `check_oneui_versions` / `update_oneui_packages` to manage versions. Validate component existence for the installed version with `list_components` (it filters to what's actually released).

## Token-only — zero literals

Every color, size, spacing, radius, and font value comes from a token. No hex, rgb, oklch, px, rem, or raw font numbers. Web uses `var(--Token-*)`; native uses `tokens.*` style objects. `validate_oneui_code` fails on literals (`literal-color`, `hardcoded-font`, …).

**Incorrect:**
```tsx
<div style={{ background: '#0a1a3f', padding: '16px', fontSize: 14 }}>…</div>
```

**Correct (web):**
```tsx
<Surface mode="bold" style={{ padding: 'var(--Spacing-4)' }}>…</Surface>
```

## Use role-explicit unified tokens, not legacy aliases

New code references the unified role tokens. The legacy/V4 aliases are still emitted for back-compat but must not be introduced.

| Use (unified) | Not (legacy) |
| --- | --- |
| `--Primary-Bold` | `--Surface-Bold`, `--Primary-FG-Bold` |
| `--Primary-Subtle` | `--Surface-Subtle`, `--Primary-BG-Subtle` |
| `--Primary-High` | `--Text-High`, `--Primary-Default-High` |
| `--Body-M-FontSize` | `--Typography-Size-M` |
| `--Body-FontWeight-Medium` | `--Typography-Weight-Medium` |

## Typography: pair every size with a line-height and the font family

Text uses role tokens (`Display`/`Headline`/`Title`/`Body`/`Label`/`Code`). Always pair `FontSize` + `LineHeight`, and always set `font-family: var(--Typography-Font-Primary)` so brand font customization works. Prefer the OneUI text components (`Text`, `Title`, `Headline`, …) which already wire these.

**Correct:**
```css
.heading {
  font-size: var(--Title-M-FontSize);
  line-height: var(--Title-M-LineHeight);
  font-weight: var(--Title-M-FontWeight);
  font-family: var(--Typography-Font-Primary);
}
```

## Shape: interactive vs non-interactive

Each component carries its own default shape; override per brand via `--ComponentName-borderRadius`. As a mental model: buttons are pill (`Shape-Pill`), other interactive controls (inputs/chips/selects) use a subtle radius (`Shape-2`), non-interactive containers (cards) use `Shape-3`–`Shape-10`, and circular elements (avatars/dots) are pill. Don't hand-pick pixel radii.

## Native specifics (when `platform: "reactnative"`)

- Components from `@oneui/ui-native`; only `View`/`ScrollView` may come from `react-native` — all UI is OneUI (`Text`→`Text`, `Pressable`→`Button`/`IconButton`, …). The native validator flags `forbidden-rn-primitive`.
- Styling via `tokens.*` objects (not CSS variables); icons from `@oneui/icons-jio-native`.
- Native generation is still maturing — confirm availability with `list_components` (`platform: "reactnative"`) before composing.
