# Select Web ↔ Native Parity

| Feature | Web (`@oneui/ui`) | Native (`@oneui/ui-native`) | Notes |
|--------|-------------------|-----------------------------|-------|
| Shared contract | `Select.shared.ts` | `interface.ts` (mirrored) | Figma trigger/menu normalizers on web |
| Trigger: input | `InputField` inside `BaseSelect.Trigger` | Read-only `Input` + chevron | Web uses full field stack |
| Trigger: button | `Button` via Trigger `render` | `Button` | Parity |
| Trigger: iconButton | `IconButton` via Trigger `render` | `IconButton` | Parity |
| Menu: single | `BaseSelect.Root` | RN `Modal` list | Parity intent |
| Menu: multi | `multiple` + `Checkbox` rows | `Checkbox` rows | Parity |
| Menu: actions | `BaseMenu.Root` | `onAction` + close | Parity |
| Search | Sticky filter input | `Input` in menu header | Parity |
| Groups | `sections` + `option.group` | Same | Parity |
| Secondary text | `secondaryText` prop | Same | Parity |
| `inputStart` presets | icon / avatar / image / text | `start` node only on native | Web adds Figma enum resolver |
| Appearance | 9 roles + `auto` | Same | Parity |
| Surface context | CSS `[data-surface]` on menu via `BrandScopePortal` | `useSurfaceTokens` | Parity intent |

## Sources

| Platform | Files |
|----------|--------|
| Web | `packages/ui/src/components/Select/Select.tsx`, `Select.shared.ts`, `SelectInputFieldTrigger.tsx`, `SelectStartSlots.tsx` |
| Native | `packages/ui-native/src/components/Select/Select.native.tsx`, `interface.ts` |

## Known gaps

- **menuAlignment `fill` / menuSize `fill`** — supported on web; menu matches trigger width via `--anchor-width`.
- **SelectableInput `state=feedback`** — visual feedback chrome on standalone preview; live select uses `invalid` + `feedback` string on `InputField`.
- **Platform legacy API** — web keeps `onChange` + `sm`/`md`/`lg` size aliases for existing platform usages.
