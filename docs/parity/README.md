# Web (`@oneui/ui`) ↔ Native (`@oneui/ui-native`) — Parity docs

Human-readable comparisons for components that exist on **both** platforms: shared props/state (`packages/ui/src/components/<Name>/*.shared.ts`), how **brand CSS** on web maps to **`buildNativeTheme` + `useSurfaceTokens`** on native, and known gaps.

**Automation:** file presence + shared-type import wiring is enforced by `pnpm check:parity` (`scripts/check-parity.ts`). These markdown guides capture **behavioural** and **visual** intent beyond that gate.

**New components:** follow [native-component-build-playbook.md](../native-component-build-playbook.md) (Cursor rule: `.cursor/rules/ui-native-component-build.mdc`).

| Component | Guide |
|-----------|--------|
| **Button** | [button-web-native-parity.md](./button-web-native-parity.md) |
| **Card** | [Card-web-native-parity.md](./Card-web-native-parity.md) |
| **LinkButton** | [linkbutton-web-native-parity.md](./linkbutton-web-native-parity.md) |
| **AgentPulse** | [AgentPulse-web-native-parity.md](./AgentPulse-web-native-parity.md) |
| **Avatar** | [avatar-web-native-parity.md](./avatar-web-native-parity.md) |
| **IconButton** | [iconbutton-web-native-parity.md](./iconbutton-web-native-parity.md) |
| **SingleTextButton** | [SingleTextButton-web-native-parity.md](./SingleTextButton-web-native-parity.md) |
| **Spinner** | [spinner-web-native-parity.md](./spinner-web-native-parity.md) |
| **Progress** | [progress-web-native-parity.md](./progress-web-native-parity.md) |
| **CircularProgressIndicator** | [circularprogressindicator-web-native-parity.md](./circularprogressindicator-web-native-parity.md) |
| **Badge, IndicatorBadge, CounterBadge** | [badge-web-native-parity.md](./badge-web-native-parity.md) · [indicatorbadge-web-native-parity.md](./indicatorbadge-web-native-parity.md) · [counterbadge-web-native-parity.md](./counterbadge-web-native-parity.md) |
| **Divider** | [divider-web-native-parity.md](./divider-web-native-parity.md) |
| **Separator** | [separator-web-native-parity.md](./separator-web-native-parity.md) |
| **Container** | [container-web-native-parity.md](./container-web-native-parity.md) |
| **Scrim** (native-only — no web peer) | [scrim-web-native-parity.md](./scrim-web-native-parity.md) |
| **Image** | [image-web-native-parity.md](./image-web-native-parity.md) |
| **Logo** | [logo-web-native-parity.md](./logo-web-native-parity.md) |
| **Modal** | [Modal-web-native-parity.md](./Modal-web-native-parity.md) |
| **Pagination** | [Pagination-web-native-parity.md](./Pagination-web-native-parity.md) |
| **PaginationDots** | [paginationdots-web-native-parity.md](./paginationdots-web-native-parity.md) |
| **Carousel** | [carousel-web-native-parity.md](./carousel-web-native-parity.md) |
| **Text** | [text-web-native-parity.md](./text-web-native-parity.md) |
| **BottomNavigationItem** | [bottomnavigationitem-web-native-parity.md](./bottomnavigationitem-web-native-parity.md) |
| **Icon (resolver)** | [icon-web-native-parity.md](./icon-web-native-parity.md) |
| **InputFeedback** | [inputfeedback-web-native-parity.md](./inputfeedback-web-native-parity.md) |
| **IconContained** | [icon-contained-web-native-parity.md](./icon-contained-web-native-parity.md) |
| **Checkbox** | [checkbox-web-native-parity.md](./checkbox-web-native-parity.md) |
| **CheckboxField** | [checkboxfield-web-native-parity.md](./checkboxfield-web-native-parity.md) |
| **Radio, RadioGroup** | [radio-web-native-parity.md](./radio-web-native-parity.md) · Flutter: [flutter-radio-parity.md](./flutter-radio-parity.md) |
| **RadioField** | [radiofield-web-native-parity.md](./radiofield-web-native-parity.md) |
| **InputDynamicText** | [inputdynamictext-web-native-parity.md](./inputdynamictext-web-native-parity.md) |
| **Input** | [input-web-native-parity.md](./input-web-native-parity.md) |
| **InputField** | [inputfield-web-native-parity.md](./inputfield-web-native-parity.md) |
| **Select** | [select-web-native-parity.md](./select-web-native-parity.md) |
| **Chip** | [chip-web-native-parity.md](./chip-web-native-parity.md) |
| **ChipGroup** | [chipgroup-web-native-parity.md](./chipgroup-web-native-parity.md) |
| **BottomNavigation** | [bottomnavigation-web-native-parity.md](./bottomnavigation-web-native-parity.md) |
| **Tabs** | [Tabs-web-native-parity.md](./Tabs-web-native-parity.md) |
| **SegmentedControl** | [segmented-control-web-native-parity.md](./segmented-control-web-native-parity.md) |
| **Tooltip** | [Tooltip-web-native-parity.md](./Tooltip-web-native-parity.md) |
| **Switch** | [switch-web-native-parity.md](./switch-web-native-parity.md) |
| **TouchSlider** | [TouchSlider-web-native-parity.md](./TouchSlider-web-native-parity.md) |
| **Slider** | [Slider-web-native-parity.md](./Slider-web-native-parity.md) |
| **HeaderNative** (web: `WebHeader`) | [Header-web-native-parity.md](./Header-web-native-parity.md) |

**WCAG audit tables:** [docs/native-a11y-audit/README.md](../native-a11y-audit/README.md)

## Cross-cutting topics

- **Flutter surface context (all components):** [flutter-surface-context-audit.md](./flutter-surface-context-audit.md) — engine invariants, per-component matrix, audit procedure.
- **Flutter component parity pass:** [flutter-component-parity-pass.md](./flutter-component-parity-pass.md) — full component list, auto tests, brand matrix.
- **Web engine:** `useBrandCSS` / injected `@layer brand` variables + `[data-surface]` — see [`docs/architecture.md`](../architecture.md) and [`docs/surface-context-awareness.md`](../surface-context-awareness.md).
- **Native theme:** `buildNativeTheme`, `OneUINativeThemeProvider`, `SurfaceContext`, `useSurfaceTokens` — see [`docs/ui-native.md`](../ui-native.md) (if present on your branch).
- **Typography on native:** `useTypographyTokens` may apply RN layout stabilisation (e.g. line-height) vs pure CSS tokens on web — called out per component where it matters.

## When to update

Whenever you change **either** platform’s implementation for a listed component, update the corresponding parity doc (or this index) so drift does not become tribal knowledge.
