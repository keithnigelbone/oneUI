# Native accessibility audit (WCAG 2.1 AA)

Systematic audit of every shipped component in `@oneui/ui-native` against [W3C ARIA APG](https://www.w3.org/WAI/ARIA/apg/) patterns and [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&levels=aa).

**Companion:** [Native component build playbook](../native-component-build-playbook.md) §3.3 (helpers in `interface.ts`, pure `*A11y.test.ts`).

## Section indexes

| Section | File | Components |
| ------- | ---- | ---------- |
| Interactive | [interactive.md](./interactive.md) | Button family, form controls, Chip, Icon, navigation |
| Informational | [informational.md](./informational.md) | Badges, progress, text, image, logo |
| Structure | [structure.md](./structure.md) | Divider, Separator, Container |
| Not yet shipped | [future-components.md](./future-components.md) | Switch, Select, Modal, Tabs, … |

## Process (per component)

1. Read `packages/ui-native/src/components/<Name>/interface.ts`, `*.native.tsx`, `*A11y.test.ts`, and `docs/parity/<name>-web-native-parity.md` if present.
2. Map APG role + required states (W3C APG, WCAG 2.1 AA, MDN).
3. Append a row to the correct section table ([`_template.md`](./_template.md)).
4. Implement P0/P1 fixes in `interface.ts` / `.native.tsx`; extend `*A11y.test.ts`.
5. Update parity doc **Accessibility** subsection.
6. Verify: `pnpm --filter @oneui/ui-native exec vitest run <Name>A11y` and `typecheck`.

## React Native vs web capability matrix

| Topic | Web | React Native | Audit action |
| ----- | --- | ------------ | ------------ |
| Role / name / state | `role`, `aria-*` | `accessibilityRole`, `accessibilityLabel`, `accessibilityState` | Centralize in `get*AccessibilityProps` |
| Toggle / pressed | `aria-pressed` | `accessibilityState.selected` (toggle) or `checked` (checkbox) | Document mapping in parity MD |
| Live regions | `aria-live` | `accessibilityLiveRegion` | Badge, CounterBadge, InputDynamicText, InputFeedback |
| Progress value | `aria-valuenow` etc. | `accessibilityValue` | Progress, CircularProgressIndicator |
| Keyboard | Tab, arrows, Enter, Escape | OS focus order; limited programmatic focus | Document limits; `accessibilityActions` when needed |
| Focus visible | `:focus-visible` + halo tokens | Platform default; no CSS halo yet | P2: shared focus ring primitive |
| Touch target | CSS `min-width` / `min-height` | `touchTarget.min` from `@oneui/tokens` + `hitSlop` | Enforce on all `Pressable`s |
| Contrast | Brand CSS engine | `useSurfaceTokens` + same token pairs | Engine-owned; verify on default + `<Surface>` |
| Form errors | `aria-invalid`, `aria-describedby` | `accessibilityLabelledBy`, hints; `aria-invalid` forwarded where used | Input stack |

## Priority definitions

| Priority | Meaning |
| -------- | ------- |
| **P0** | No accessible name, wrong role/state, or control unreachable to assistive tech |
| **P1** | WCAG AA gap fixable in RN without new primitives |
| **P2** | Web-only, design-system primitive gap, or platform limitation (document workaround) |

## Implementation utilities

| Utility | Path | Purpose |
| ------- | ---- | ------- |
| Button family a11y | `packages/ui-native/src/utils/buttonFamilyA11y.ts` | Shared Pressable role/state/haspopup |
| Touch target hitSlop | `packages/ui-native/src/utils/touchTargetA11y.ts` | WCAG min target via `hitSlop` |

## References

- [WCAG 2.1 Quick Reference (AA)](https://www.w3.org/WAI/WCAG21/quickref/?levels=aa)
- [W3C ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
