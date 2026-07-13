# Adding Tests for a New React Native Component

> How and where to add **functional**, **accessibility (a11y)**, and **visual (Applitools)** tests
> for a `@oneui/ui-native` component, using the `apps/qa-native` harness.

This guide is the end-to-end recipe. It documents the exact file locations, naming
conventions, code templates, and commands — derived from how the existing components
(Button, IconButton, SingleTextButton, etc.) are wired today.

---

## 0. The mental model — three test layers, two homes

| Layer | What it proves | Runner | Lives in |
| --- | --- | --- | --- |
| **Functional** | Logic + render behaviour (props → output, press handlers, style resolution) | **Vitest** (Node, RN mocked) | `packages/ui-native/src/components/<Name>/` |
| **A11y** | `aria-*` → `accessibility*` mapping, roles, states | **Vitest** (Node, RN mocked) | `packages/ui-native/src/components/<Name>/` |
| **Visual** | Pixel appearance of every variant/section on a real device | **Maestro + Applitools** | `apps/qa-native/` (screen + `visual/` pipeline) |

**Key architectural fact:** functional & a11y tests are **colocated with the component
source** in `packages/ui-native`, *not* inside this app. `apps/qa-native` simply
**runs** them via Vitest (`include: ['../../packages/ui-native/src/**/*.test.{ts,tsx}']`)
and owns the **visual** pipeline (screens + Applitools upload).

> ⚠️ **Two QA apps exist.** `apps/qa-native` (this one — colocated tests + Applitools)
> and `apps/qa-playground/native` (older, self-contained tests in its own `tests/` dir).
> The root script `pnpm qa:native:report` currently targets **`qa-playground/native`**,
> which generates an HTML report. This guide covers **`apps/qa-native`**, the newer home
> where the `CombinationsRules` and the Applitools visual pipeline live. Add new tests
> here.

---

## 1. Functional tests

### 1a. Where

Colocated in the component folder:

```
packages/ui-native/src/components/<Name>/
```

Vitest picks up **any** file matching `*.test.{ts,tsx}` under `packages/ui-native/src`.
Existing components use a few complementary flavours — pick the ones your component needs:

| File pattern | Flavour | Use when |
| --- | --- | --- |
| `<Name>.unit.test.ts` | Pure logic (no renderer) | Testing resolution tables, variant→token maps, size math |
| `<Name>.render.test.tsx` | Render via `@testing-library/react-native` | Testing that props produce visible output, press handlers fire, slots render |
| `<Name>.native.test.tsx` | Render (native parity of the web test) | Mirroring the web component's `.test.tsx` assertions |
| `__tests__/<topic>.test.ts` | Grouped helper/logic tests | Layout math, attention resolution, material recipe, etc. |

You don't need all four — most components have **one render test + one a11y test**.
Complex ones (Button) add unit tests for their resolution tables.

### 1b. Template — pure logic (`<Name>.unit.test.ts`)

Test the resolution logic directly, without a renderer. Build a theme with the shared
engine and assert token wiring (pattern from `Button.unit.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { buildNativeTheme, type OneUINativeTheme } from '@oneui/shared/engine';

function buildTheme(theme: 'light' | 'dark'): OneUINativeTheme {
  return buildNativeTheme(
    {
      colorConfig: { brandScales: [{ name: 'Brand', source: 'custom', baseColor: '#e63329' }] },
      appearanceConfig: {
        accentCount: 1,
        background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
        accents: [{ role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 }],
      },
    },
    { theme },
  )!;
}

describe('<Name> — variant resolution', () => {
  it('bold variant reads surfaces.bold', () => {
    const role = buildTheme('light').rootRoles.primary;
    expect(role.surfaces.bold).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
```

### 1c. Template — render (`<Name>.render.test.tsx`)

Render with `@testing-library/react-native`, always wrapped in the theme provider so
`useSurfaceTokens` / `useNativeTheme` resolve (pattern from `Button.render.test.tsx`):

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MyComponent } from './MyComponent.native';
import { OneUINativeThemeProvider, defaultNativeTheme } from '../../theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <OneUINativeThemeProvider theme={defaultNativeTheme()}>{ui}</OneUINativeThemeProvider>
);

describe('MyComponent (native)', () => {
  it('renders its children', () => {
    render(wrap(<MyComponent>Hello</MyComponent>));
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();          // `jest` global is provided by the setup
    render(wrap(<MyComponent onPress={onPress}>Tap</MyComponent>));
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    render(wrap(<MyComponent disabled onPress={onPress}>Nope</MyComponent>));
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('resolves the recipe cornerRadius override', () => {
    render(
      <OneUINativeThemeProvider theme={defaultNativeTheme()} recipeOverrides={{ myComponent: { cornerRadius: 'none' } }}>
        <MyComponent>Square</MyComponent>
      </OneUINativeThemeProvider>,
    );
    const flat = StyleSheet.flatten(screen.getByRole('button').props.style);
    expect(flat.borderRadius).toBe(0);
  });
});
```

**Environment notes** (handled by `apps/qa-native/vitest.setup.ts` — you don't configure these):

- `react-native` and `react-native-svg` are replaced with plain-JS mocks (`__mocks__/`) so
  Node can load them without Flow syntax. Anything requiring a real native runtime must be
  asserted at the **props/style** level, not by pixel/layout.
- `react` is de-duped to a single instance (avoids "Invalid hook call").
- On failure, the setup dumps the RN tree via `screen.debug()` into the test output.

### 1d. Run functional tests

```bash
cd apps/qa-native
pnpm test                       # all colocated ui-native tests (vitest run)
pnpm test <Name>                # filter by filename, e.g. pnpm test Button
pnpm test:native:report         # run + write JSON to test-results/native-all.json
```

---

## 2. Accessibility (a11y) tests

### 2a. Where & naming

Colocated, one dedicated file per component:

```
packages/ui-native/src/components/<Name>/<Name>A11y.test.ts
```

(Casing follows the component — e.g. `ButtonA11y.test.ts`, `avatarA11y.test.ts`. Match the
existing sibling files.)

### 2b. The pattern — test the interface helper, not the render

OneUI native components expose a **pure accessibility-props resolver** from their
`interface.ts` (e.g. `getButtonAccessibilityProps`, `getSingleTextButtonAccessibilityProps`).
A11y tests call that helper directly and assert the `aria-* → accessibility*` mapping — no
renderer needed, so they're fast and deterministic.

**Step 1 — expose the helper in `interface.ts`** (if your component doesn't have one yet):

```ts
// packages/ui-native/src/components/MyComponent/interface.ts
export function getMyComponentAccessibilityProps(
  props: MyComponentProps,
  state: { isDisabled: boolean },
) {
  return {
    accessible: props['aria-hidden'] ? undefined : true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
    accessibilityLabelledBy: props['aria-describedby'],
    accessibilityElementsHidden: props['aria-hidden'] === true,
    accessibilityState: {
      disabled: state.isDisabled,
      busy: props.loading === true,
      expanded: props['aria-expanded'],
    },
    'aria-haspopup': props['aria-haspopup'],
    focusable: !state.isDisabled,
  };
}
```

**Step 2 — write `MyComponentA11y.test.ts`** (pattern from `SingleTextButtonA11y.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { getMyComponentAccessibilityProps } from './interface';

describe('MyComponent accessibility', () => {
  it('exposes a button role and maps aria-label to accessibilityLabel', () => {
    const props = getMyComponentAccessibilityProps({ 'aria-label': 'Save' }, { isDisabled: false });
    expect(props.accessibilityRole).toBe('button');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Save');
  });

  it('reflects disabled and busy from loading', () => {
    const props = getMyComponentAccessibilityProps(
      { 'aria-label': 'Save', loading: true },
      { isDisabled: true },
    );
    expect(props.accessibilityState.disabled).toBe(true);
    expect(props.accessibilityState.busy).toBe(true);
  });

  it('maps aria-expanded to accessibilityState.expanded', () => {
    expect(
      getMyComponentAccessibilityProps({ 'aria-label': 'Menu', 'aria-expanded': true }, { isDisabled: false })
        .accessibilityState.expanded,
    ).toBe(true);
  });

  it('hides from the tree when aria-hidden', () => {
    expect(
      getMyComponentAccessibilityProps({ 'aria-label': 'Hidden', 'aria-hidden': true }, { isDisabled: false })
        .accessibilityElementsHidden,
    ).toBe(true);
  });
});
```

**Recommended a11y coverage** (what existing components assert):

- `aria-label` → `accessibilityLabel`, and correct `accessibilityRole` + `accessible: true`
- `disabled` / `loading` → `accessibilityState.disabled` / `.busy`
- `aria-expanded` → `accessibilityState.expanded`; `aria-haspopup` forwarded; `focusable`
- `accessibilityHint` + `aria-describedby` → `accessibilityLabelledBy`
- `aria-hidden` → `accessibilityElementsHidden`
- Any sub-element a11y (e.g. loading spinner exposes `progressbar` role)

### 2c. Run a11y tests

They run with the same Vitest command (they're just `*.test.ts` files):

```bash
cd apps/qa-native
pnpm test MyComponentA11y        # just this file
pnpm test                        # everything
```

---

## 3. Visual tests (Applitools)

Visual tests capture **one Applitools checkpoint per section** of a component's screen,
on a real emulator, and diff against the baseline. Driver chain:
**Maestro** (navigate + scroll) → **adb** screencap → **sharp** crop → **Applitools Eyes
Images SDK** upload. Everything lives in `apps/qa-native/`.

### 3a. Source of truth: the component **Screen** + `section-*` testIDs

`visual/generate.mts` scans `src/screens/components/*Screen.tsx` for:

- exactly one `screen-<Name>` testID (the scroll container), and
- ordered `section-<slug>` testID **string literals**.

Each `section-*` becomes one Applitools checkpoint, **in source order**. Adding a section
to the screen auto-adds a checkpoint — there is no hand-maintained map.

> **Critical:** auto-generated showcase screens (`makeShowcaseScreen` via
> `showcaseRegistry.ts`) do **not** emit `section-*` testIDs, so they get **no** visual
> checkpoints. To get visual coverage you must author a **bespoke**
> `src/screens/components/<Name>Screen.tsx` with explicit `section-*` testIDs (like
> `ButtonScreen.tsx`).

### 3b. Author the screen from your `CombinationsRules` file

Your rules files in `apps/qa-native/CombinationsRules/<Name>Rules.txt` define the sections
(e.g. `ButtonRules.txt` → "section1: All attentions", "section2: button with slots", …).
Translate each rule section into one `section-*` block. Template (condensed from
`ButtonScreen.tsx`):

```tsx
// apps/qa-native/src/screens/components/MyComponentScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MyComponent, useSurfaceTokens } from '@oneui/ui-native';
import { tokens, typography } from '@oneui/tokens';

const SECTIONS = [
  { testID: 'section-attentions', title: '1 · All attentions', render: () => (
      <>
        <MyComponent testID="mc-attn-high" attention="high">High</MyComponent>
        <MyComponent testID="mc-attn-medium" attention="medium">Medium</MyComponent>
        <MyComponent testID="mc-attn-low" attention="low">Low</MyComponent>
      </>
    ) },
  { testID: 'section-sizes', title: '2 · Sizes', render: () => (
      <>
        <MyComponent testID="mc-size-s" size="s">S</MyComponent>
        <MyComponent testID="mc-size-m" size="m">M</MyComponent>
        <MyComponent testID="mc-size-l" size="l">L</MyComponent>
      </>
    ) },
] as const;

export function MyComponentScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID="screen-MyComponent"                         // ← screen-<Name>
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {SECTIONS.map((s) => (
        <View key={s.testID} testID={s.testID} style={styles.section}>   {/* ← section-<slug> */}
          <Text style={[styles.title, { color: role.content.high }]}>{s.title}</Text>
          <View style={styles.row}>{s.render()}</View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: tokens.spacing['4'], gap: tokens.spacing['5'] },
  section: { gap: tokens.spacing['4'], paddingBottom: tokens.spacing['4'], borderBottomWidth: 1 },
  title: { fontSize: typography.size.l, fontWeight: typography.weight.high },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['2-5'], alignItems: 'center' },
});
```

Rules that follow:

- **`testID="screen-<Name>"`** on the outer `ScrollView` — `<Name>` must match the nav route
  key in `componentRegistry.ts`.
- **`testID="section-<slug>"`** as a **string literal** on each section container (the
  generator reads them via regex; don't compute them dynamically).
- Give each variant a stable, descriptive **item** `testID` so Maestro/Detox can target it.
- Only use design **tokens** for styling (`tokens.spacing.*`, `typography.*`, `useSurfaceTokens`).

### 3c. Register the screen for navigation

Edit `apps/qa-native/src/componentRegistry.ts`:

```ts
import { MyComponentScreen } from './screens/components/MyComponentScreen';
// …
export const componentRegistry = {
  // …
  MyComponent: { title: 'MyComponent', Screen: MyComponentScreen },
} as const satisfies Record<string, ComponentRegistryEntry>;
```

(The Home list, `nav-<Name>` testID, and route are derived from this registry.)

### 3d. Prerequisites (once per machine / shell)

- **Android emulator** booted, with the app loaded in **Expo Go**:
  `pnpm --filter @oneui/qa-native dev` (or `pnpm --filter @oneui/qa-native android`).
- **Maestro CLI** + a **JDK** + Android **adb** on PATH (the `capture.sh` wrapper prepends
  the common install locations).
- Applitools key:
  ```bash
  cd apps/qa-native
  export APPLITOOLS_API_KEY=<your-key>       # uploads to jioeyes.applitools.com by default
  # export APPLITOOLS_SERVER_URL=...         # only if your account lives elsewhere
  ```

> This environment note: iOS/Android simulators require Xcode / Android SDK / Java. Visual
> capture needs a booted **Android emulator + Expo Go** — it cannot run purely headless.

### 3e. Commands

| Goal | Command |
| --- | --- |
| Rebuild the plan (flows + `manifest.json`) after editing/adding a screen | `pnpm --filter @oneui/qa-native visual:gen` |
| Full run — all screens, capture + upload (interleaved) | `pnpm --filter @oneui/qa-native visual` |
| One screen, capture + upload | `pnpm --filter @oneui/qa-native visual:run MyComponent` |
| Capture only (no upload), inspect `visual/screenshots/` | `pnpm --filter @oneui/qa-native visual:capture MyComponent` |
| Re-upload already-captured PNGs | `pnpm --filter @oneui/qa-native visual:upload MyComponent` |

- `pnpm visual` = `visual:gen` then `visual:run` (capture + per-screen upload).
- First run of a screen **creates baselines** (`Passed`); later runs show `Unresolved` until
  you accept the new images. Set `APPLITOOLS_BATCH_ACCEPT_NEW=true` to auto-accept new
  baselines.
- Results land in the batch **"OneUI qa-native — RN component sections"**; one Eyes test per
  screen (`testName = route`), one checkpoint per section.
- **Known limit:** sections taller than the phone viewport are captured partially (top only);
  full capture needs vertical stitching (not yet implemented).

### 3f. Visual pipeline files (reference)

| File | Role |
| --- | --- |
| `visual/generate.mts` | Scans screens → `manifest.json` + navigation Maestro `flows/<route>.yaml`. |
| `visual/capture.sh` | Wrapper: sets PATH (Maestro/JDK/adb), runs `capture-crop.mts`, forwards args. |
| `visual/capture-crop.mts` | Navigates, scrolls, reads section bounds (`maestro hierarchy`), crops (sharp), uploads with `--upload`. |
| `visual/upload.mts` | Standalone uploader for already-captured PNGs. |
| `visual/README.md` | Full operator's guide (setup, commands, notes). |
| `manifest.json`, `flows/`, `screenshots/` | Generated artifacts (git-ignored). |

---

## 4. End-to-end checklist for a brand-new component

Assume the component `MyComponent` already exists at
`packages/ui-native/src/components/MyComponent/MyComponent.native.tsx`.

**Functional + a11y (in `packages/ui-native`):**

- [ ] Expose `getMyComponentAccessibilityProps(...)` from `MyComponent/interface.ts`.
- [ ] Add `MyComponent/MyComponent.render.test.tsx` — render, press, disabled, variants, slots.
- [ ] (If it has resolution tables) add `MyComponent/MyComponent.unit.test.ts`.
- [ ] Add `MyComponent/MyComponentA11y.test.ts` — aria→accessibility mapping.
- [ ] `cd apps/qa-native && pnpm test MyComponent` → green.

**Visual (in `apps/qa-native`):**

- [ ] Write `CombinationsRules/MyComponentRules.txt` describing the sections (you own these).
- [ ] Author `src/screens/components/MyComponentScreen.tsx` with `screen-MyComponent` +
      one `section-<slug>` per rule section (string literals) + per-variant item testIDs.
- [ ] Register it in `src/componentRegistry.ts`.
- [ ] `pnpm --filter @oneui/qa-native visual:gen` → confirm your screen + section count print.
- [ ] Boot emulator + Expo Go, export `APPLITOOLS_API_KEY`.
- [ ] `pnpm --filter @oneui/qa-native visual:run MyComponent` → check the Applitools dashboard,
      accept baselines.

**Repo quality gates** (from `CLAUDE.md`) before shipping:

- [ ] `pnpm typecheck` · `pnpm check:literals` · `pnpm test` · `pnpm check:parity`

---

## 5. Command quick-reference

```bash
# ── Functional + a11y (Vitest; colocated in packages/ui-native) ──
cd apps/qa-native
pnpm test                         # run all colocated ui-native tests
pnpm test <Name>                  # filter, e.g. pnpm test Button / pnpm test ButtonA11y
pnpm test:native:report           # run + JSON → test-results/native-all.json

# ── Visual (Applitools; Android emulator + Expo Go + Maestro) ──
export APPLITOOLS_API_KEY=<key>
pnpm --filter @oneui/qa-native visual:gen            # rebuild plan after screen edits
pnpm --filter @oneui/qa-native visual                # all screens (gen + run)
pnpm --filter @oneui/qa-native visual:run <Name>     # one screen, capture + upload
pnpm --filter @oneui/qa-native visual:capture <Name> # capture only (no key needed)
pnpm --filter @oneui/qa-native visual:upload <Name>  # re-upload saved PNGs
```
