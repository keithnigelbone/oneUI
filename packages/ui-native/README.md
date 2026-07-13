# @oneui/ui-native

React Native peer of the OneUI design system. Each component owns an
`interface.ts` contract aligned with web `*.shared.ts` (types, state hooks,
a11y) without importing `@oneui/ui`. See
[docs/native-component-build-playbook.md](../../docs/native-component-build-playbook.md).

## Quick-start

```tsx
import { OneUINativeThemeProvider, defaultNativeTheme, Button } from '@oneui/ui-native';

export default function App() {
  return (
    <OneUINativeThemeProvider theme={defaultNativeTheme()}>
      <Button onPress={() => console.log('pressed')}>Continue</Button>
    </OneUINativeThemeProvider>
  );
}
```

## Build and pack (`dist/packages/ui-native/`)

Publishable artefacts land at the monorepo root `dist/packages/ui-native/`.

```bash
# JS bundles + type declarations + publish manifest
pnpm --filter @oneui/ui-native build

# Build + create oneui-native-<version>.tgz
pnpm --filter @oneui/ui-native run build:pack

# Build + pack @oneui/shared, @oneui/tokens, and @oneui/ui-native
pnpm --filter @oneui/ui-native run build:pack:all
```

Regenerate the bundled default Jio brand snapshot (from `apps/native-sample/brand-data/Jio/base.json`):

```bash
pnpm --filter @oneui/ui-native run generate:default-brand
pnpm flutter:generate-default-brand
```

Metro / Expo in the monorepo resolve `./src/index.ts` for hot reload. External
apps install the `.tgz` and resolve the compiled `index.mjs`.

## Theming

`defaultNativeTheme()` is **demo-only** — it generates a minimal theme from
the built-in neutral scale plus an optional primary hex:

```tsx
defaultNativeTheme({ theme: 'dark', primaryHex: '#3a36e0' });
```

`OneUIBrandProvider` uses the bundled Jio snapshot when `brandData` is omitted:

```tsx
import { OneUIBrandProvider, Button } from '@oneui/ui-native';

<OneUIBrandProvider themeMode="light">
  <Button>Continue</Button>
</OneUIBrandProvider>;
```

Override with Convex payloads when available:

```tsx
<OneUIBrandProvider brandData={{ foundation, components }} themeMode="light" />
```

For lower-level control, snapshot foundation data and pass it to `buildNativeTheme`:

```tsx
import { buildNativeTheme } from '@oneui/ui-native';

const theme = useMemo(
  () => buildNativeTheme(brandFoundation, { theme: 'light', density: 'default' }),
  [brandFoundation]
);
```

`<OneUINativeThemeProvider>` accepts a `recipeOverrides` prop that maps
component slugs to recipe selections — the runtime equivalent of the
brand-CSS overrides web injects per `BUTTON_RECIPE_DEFINITION`:

```tsx
<OneUINativeThemeProvider
  theme={defaultNativeTheme()}
  recipeOverrides={{
    button: { cornerRadius: 'pill', textTransform: 'uppercase', horizontalDensity: 'roomy' },
  }}
>
  ...
</OneUINativeThemeProvider>
```

## Surface context

Wrap any region in `<Surface mode="bold">` (or any of the seven surface
tokens) and descendants automatically pick up role tokens resolved
against that boundary — same algorithm web uses for `[data-surface]`:

```tsx
<Surface mode="bold" appearance="primary" style={{ padding: 16 }}>
  <Button attention="high">On bold</Button>
</Surface>
```

`useSurfaceTokens(appearance)` is the read API; components inside any
`<Surface>` (or the root provider) call it to fetch role-resolved hex
strings ready for `StyleSheet`.

## Components shipped

<!-- AUTO-GENERATED:components START — do not edit by hand. Run `pnpm --filter @oneui/ui-native generate:readme`. -->
<!-- 43 public components -->

| Component | Status | Notes |
| --- | --- | --- |
| `AgentPulse` | stable | Animated AI-agent presence indicator. Plays a looping animation per state (idle / listening / thinking / sp… |
| `Avatar` | stable | User representation — image, icon, or initials. Attention drives the fill (high → bold surface, medium → su… |
| `Badge` | stable | Non-interactive status / notification chip. Three variants resolved against the current <Surface> via useSu… |
| `BottomNavigation` | beta | Bottom navigation bar. Hosts 2..5 BottomNavigationItems. Sits above safe-area inset; elevates over scrolled… |
| `BottomNavigationItem` | beta | Single tab inside a BottomNavigation. Required icon glyph + optional label; optional activeIcon (swapped in… |
| `Button` | stable | Primary call-to-action. Three variants (bold / subtle / ghost), 9 multi-accent appearances + auto, four siz… |
| `Card` | alpha | Composite container. Combines a Surface boundary (the tinted fill), a Container (padding + shape), and a sl… |
| `Carousel` | stable | Compound carousel micropattern. Root manages paging (ScrollView-based, mirrors web Embla API), optional loo… |
| `Checkbox` | stable | Selection control with tri-state support (selected / indeterminate / unselected). `appearance` drives both… |
| `CheckboxField` | stable | Field shell around Checkbox. Single mode = one integrated checkbox + label/description/feedback; multi-opti… |
| `Chip` | stable | Interactive selection / filter pill. Three surface-resolved variants (bold / subtle / ghost) inheritable fr… |
| `ChipGroup` | stable | Selection container + context provider for <Chip> children. Pushes size/variant/appearance/disabled down; o… |
| `CircularProgressIndicator` | stable | Circular progress ring. Determinate (arc ∝ value) or indeterminate (spin). Ten t-shirt sizes (2XS…5XL); opt… |
| `Container` | stable | Presentational layout wrapper — constrains children width via variant (fluid / fixed / full-bleed) + maxWid… |
| `CounterBadge` | stable | Numeric count badge (e.g. notification count). Overflows to `${max}+` (default 99); hidden at 0 unless show… |
| `Divider` | stable | Horizontal or vertical separator with an optional inline label (string) or JDS <Icon>. Stroke weight scales… |
| `HeaderNative` | stable | App-shell header micropattern. Root renders a PrimaryNav chrome row (homeBar/contextBar/searchBar) and an o… |
| `Icon` | stable | Semantic icon. Resolves the `icon` glyph (semantic name, ReactElement, or JDS icon component reference) and… |
| `IconButton` | stable | Icon-only call-to-action sharing the Button family state model. Three variants (bold / subtle / ghost), 9 a… |
| `IconContained` | stable | Non-interactive icon in a tinted container (role="image"). attention high = bold fill, medium = subtle tint… |
| `Image` | stable | Responsive image with aspect-ratio presets, fit modes, and an optional interactive (tappable, state-layer)… |
| `IndicatorBadge` | stable | Contentless status dot ("unread" affordance). Five sizes. `appearance` inherits from a slot-owning parent (… |
| `Input` | alpha | Labelled text input. Pairs a single-line field with structured label / helper / error text rendered via Tex… |
| `InputDynamicText` | stable | Helper row under an input — leading copy (e.g. char counter) + optional trailing low-attention condensed Bu… |
| `InputFeedback` | stable | Validation / feedback row under an input. variant = semantic role, attention = low(text)/medium(tint)/high(… |
| `InputField` | stable | Full text-input field stack: label/description header + bordered Input + optional feedback + dynamic-text r… |
| `Logo` | stable | Brand mark / full logo. Content from children (svg node) / svgContent (string) / src (image). `alt` require… |
| `Modal` | stable | A popup dialog that demands user attention and interaction. |
| `Pagination` | stable | Numbered page navigator. Renders numbered chips with sibling/boundary-driven ellipsis collapsing, plus opti… |
| `PaginationDots` | stable | Carousel / page position indicator. Count-driven (renders `count` dots, not children) with a sliding max-5… |
| `Progress` | stable | Linear progress bar. Determinate when `value` is set (exposes accessibilityValue); indeterminate (busy, ani… |
| `Radio` | stable | Single-selection control (leaf). Controlled via `checked` / uncontrolled via `defaultChecked`; mutual exclu… |
| `RadioField` | stable | Field shell around Radio that OWNS single-selection. Integrated-single / multi-option (RadioGroup) / plain-… |
| `Scrim` | stable | A layout fade or overlay tint used to improve legibility of content resting on images or complex backgrounds. |
| `SegmentedControl` | stable | Single-select segmented control. Compound API: root manages selection state (controlled via `value` or unco… |
| `Select` | beta | Selection control: a trigger (input / button / iconButton) that opens an anchored dropdown menu. Single-sel… |
| `SingleTextButton` | stable | Circular single-text action button (max 2 characters). `attention` (high/medium/low) drives the full visual… |
| `Slider` | beta | Draggable value slider — single thumb (number) or range (number[]). Optional tick marks, tooltip, and leadi… |
| `Switch` | stable | A toggle switch for binary states. |
| `Tabs` | stable | A set of tabbed content sections. |
| `Text` | alpha | Typographic primitive. Reads --{Role}-{Size}-FontSize / LineHeight / FontWeight via useTypographyTokens. Ev… |
| `Tooltip` | stable | A brief, contextual popup that displays when hovering or focusing an element. |
| `TouchSlider` | stable | An adjustable slider control. |

<!-- AUTO-GENERATED:components END -->

The table above is generated from the public exports in `src/index.ts` and the
KB metadata in `@jds/kb-rn` — it cannot drift. `pnpm check:parity` flags every
web component without a `*.native.tsx` sibling.

## Spacing tokens (native-only layout)

Native layout uses **numeric** spacing keys from `@oneui/tokens`
(`tokens.spacing['4']`, `tokens.spacing['1-5']`), not f-step names
(`tokens.dimension.f0`) and not legacy t-shirt ids (`M`, `5XS`).

T-shirt → numeric translation for RN theme builders lives in
`src/utils/spacingKeys.ts` and is **not** exported from `@oneui/shared`
(so web/React and Convex read paths stay unchanged).

## Known native-only gaps

- **`SemanticIconName` string slots** on `Button.start` / `end` /
  `leftIcon` / `rightIcon` are not yet supported. They emit a one-time
  dev warning and render nothing. Pass a `ReactNode` (e.g. a lucide-react
  icon) instead. Future: `IconNative` resolver mirroring the web
  `<Icon>` component.
- **`decoration`** prop (web ornament SVG) is silently ignored on native.
- **`type` prop** (web HTML form submit semantics) is ignored on native.
- **Storybook stories** are not in this package — `@storybook/react-native`
  is not yet wired into the monorepo. Future: storybook-native setup.
- **Materials (metallic gradients)** are an optional add-on, not part of this
  package.

## Quality gates

This package participates in the repo's quality gates ([CLAUDE.md](../../CLAUDE.md)
lines 289-300):

```bash
pnpm --filter @oneui/ui-native typecheck
pnpm typecheck                 # root, all packages
pnpm check:parity              # Button row should pass; other components
                                # are expected to fail until brought across
pnpm check:literals            # zero hard-coded values in this package
pnpm test --filter @oneui/ui-native   # requires jest-react-native preset
```

`pnpm test` is wired but requires a jest preset for React Native
(`@react-native/babel-preset`, `react-test-renderer`, etc.) to run.
The test file is in place; the test runner config is a follow-up.

See [scripts/check-parity.ts](../../scripts/check-parity.ts) for the exact
parity contract this package adheres to.

## Building a new component

Follow [docs/native-component-build-playbook.md](../../docs/native-component-build-playbook.md).
Cursor applies the same rules when editing `packages/ui-native/**` via
`.cursor/rules/ui-native-component-build.mdc`.
