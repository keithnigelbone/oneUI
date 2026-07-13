# Testing Patterns

**Analysis Date:** 2026-05-29

## Test Frameworks

**Primary Runner:** Vitest (all packages)

| Package | Environment | Config |
|---------|-------------|--------|
| `packages/ui` | jsdom | `packages/ui/vitest.config.ts` |
| `packages/shared` | node | `packages/shared/vitest.config.ts` |
| `packages/ui-native` | node | `packages/ui-native/vitest.config.ts` |
| `packages/kb-web` | — | `packages/kb-web/vitest.config.ts` |
| `packages/kb-rn` | — | `packages/kb-rn/vitest.config.ts` |
| `apps/platform` | — | `apps/platform/vitest.config.ts` |

**Assertion Library:** `@testing-library/jest-dom` (extended via `vitest.setup.ts`)

**A11y:** `vitest-axe` (wraps `axe-core`) — separate a11y config at `packages/ui/vitest.a11y.config.ts`

**E2E / Visual QA:** Playwright (`apps/qa-playground/playwright.config.ts`, `apps/button-figma-validation/playwright.config.ts`)

**Visual Regression:** Chromatic (`@chromatic-com/storybook ^5.1.2`, `chromatic ^16.7.0`)

**React Native tests:** `@testing-library/react-native` with native vitest config

## Run Commands

```bash
pnpm test                      # All tests across all packages (turbo)
pnpm test:a11y                 # A11y gate — packages/ui only (vitest-axe)
pnpm test:playwright:ui        # Playwright UI mode
pnpm chromatic                 # Visual regression via Storybook
pnpm typecheck                 # TypeScript compilation check (turbo)
pnpm check:literals            # Zero hard-coded values gate (tsx scripts/check-literals.ts)
pnpm validate:tokens           # 100% token resolution gate
pnpm check:parity              # Web ↔ Native token consistency
pnpm check:layers              # CSS layer order correctness
pnpm check:metadata            # Slot naming RFC enforcement (check:metadata)
pnpm check:oneui-barrel        # No @oneui/ui barrel imports
pnpm ci:gates                  # Full CI gate chain (run before any merge)
```

**Per-package test:**
```bash
pnpm --filter @oneui/ui test
pnpm --filter @oneui/shared test
pnpm --filter @oneui/ui-native test
```

**Per-component Playwright QA reports:**
```bash
pnpm qa:button:report          # Playwright visual QA for Button
pnpm qa:chip:a11y              # Playwright a11y for Chip
pnpm qa:tabs:a11y:all          # Full a11y audit for Tabs
```

## Coverage Requirements

**Target:** 90% minimum across statements, branches, functions, and lines.

**Policy (from `docs/DEVELOPER_GUIDE.md` §9):**
> 90% minimum across statements, branches, functions, and lines. Tests below this threshold block the `pnpm test` quality gate.

Coverage thresholds are declared as project policy; verify current Vitest coverage config per-package before adding new test suites — the root vitest configs do not yet define `coverage.thresholds` inline.

## Test File Organization

**Web components:** Co-located within the component directory.
```
packages/ui/src/components/Button/
  Button.test.tsx           # Unit tests — co-located
```

**Web hooks:**
```
packages/ui/src/hooks/__tests__/
  useBrandCSS.test.tsx
  useStyleInjection.test.tsx
```

**Web utilities:**
```
packages/ui/src/utils/
  foundationCSS.test.ts     # Co-located utility test
  buildComponentOverrideCSS.test.ts
```

**Registry tests:**
```
packages/ui/src/registry/__tests__/
  componentRegistry.test.ts
  componentThemeCSS.test.ts
```

**Shared engine tests (pure functions, node env):**
```
packages/shared/src/engine/__tests__/
  cssGenNew.test.ts
  surfaceNew.test.ts
  tokenBoundary.test.ts
  validateBrandCSS.test.ts
  buildAvailableScales.test.ts
  precompute.test.ts
  cacheKey.test.ts
  ... (30 files total)
```

**Shared data tests:**
```
packages/shared/src/data/__tests__/
  dimension-scales.test.ts
  stroke-scale.test.ts
```

**Cross-component a11y gate:**
```
packages/ui/src/components/adoption.a11y.test.tsx
```
Single file tests multiple interactive components via `expectNoA11yViolations`.

**React Native tests:**
```
packages/ui-native/src/components/Button/
  Button.native.test.tsx    # Functional tests (co-located)
  ButtonA11y.test.ts        # A11y-only tests (co-located)
  Button.native.test.ts     # Pure logic tests

packages/ui-native/src/components/Chip/
  ChipA11y.test.ts          # Pattern: ComponentA11y.test.ts for RN a11y
```

**Script tests:**
```
scripts/__tests__/
  snapshot-brands.test.ts
  check-literals.test.ts
```

## Test File Naming

| Pattern | Use case |
|---------|----------|
| `ComponentName.test.tsx` | Web component unit tests |
| `ComponentName.native.test.tsx` | React Native component tests |
| `ComponentNameA11y.test.ts` | React Native a11y tests |
| `adoption.a11y.test.tsx` | Cross-component a11y gate |
| `featureName.test.ts` | Pure function / engine tests |
| `__tests__/featureName.test.ts` | Engine tests in `packages/shared` |

## Test Structure

**Standard suite:**
```tsx
/**
 * Button.test.tsx
 * Unit and accessibility tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<Button onPress={handlePress}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });
});
```

**Nested describe for grouping:**
```tsx
describe('Button', () => {
  describe('Rendering', () => { ... });       // DOM structure
  describe('Size tests (f-step system)', () => { ... });
  describe('Condensed mode tests', () => { ... });
  describe('Slot tests (start/end)', () => { ... });
  describe('Appearance tests', () => { ... });
  describe('Attention alias tests', () => { ... });
  describe('forwardRef tests', () => { ... });
  describe('Data attribute tests', () => { ... });
});
```

## Mocking

**Framework:** `vi` (Vitest's built-in mock)

**Spy pattern:**
```ts
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
render(<Button size={14}>Deprecated</Button>);
expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('size={14} is deprecated'));
warnSpy.mockRestore();
```

**Mock function:**
```ts
const handlePress = vi.fn();
render(<Button onPress={handlePress}>Click</Button>);
await user.click(screen.getByRole('button'));
expect(handlePress).toHaveBeenCalledOnce();
```

**Dynamic import in tests:**
```ts
it('LinkButton does NOT emit data-underline by default', async () => {
  const { LinkButton } = await import('../LinkButton/LinkButton');
  render(<LinkButton>Link</LinkButton>);
  expect(screen.getByRole('button')).not.toHaveAttribute('data-underline');
});
```

**CSS file reading in tests (for CSS contract assertions):**
```ts
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

it('ghost variant opts out of CSS decoration stroke', () => {
  const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
  const ghostBlock = css.match(/\.ghost\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';
  expect(ghostBlock).toContain('--Button-cssDecorationInsetStrokeWidth-active: var(--Spacing-0);');
});
```

## A11y Testing

**Tool:** `vitest-axe` (wraps `axe-core`) via `packages/ui/src/test-utils/a11y.ts`.

**Config:** Restricts to WCAG 2.1 AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`). Excludes Base UI focus-guard spans (known false positive for `aria-command-name`).

**Usage:**
```ts
import { expectNoA11yViolations } from '../../test-utils/a11y';

it('has no a11y violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  await expectNoA11yViolations(container);
});
```

**A11y test config:** `packages/ui/vitest.a11y.config.ts` — runs files matching `**/*.a11y.test.ts` and `**/*.a11y.test.tsx`. No jsdom setup, plain `@vitejs/plugin-react`.

**Gate:** `pnpm test:a11y` — runs only a11y test files. Integrated into `CLAUDE.md` quality gates as mandatory before shipping any component.

**Adoption gate:** `packages/ui/src/components/adoption.a11y.test.tsx` — single file that covers 10+ interactive components (FAB, Tabs, Select, Switch, Dialog, Chip, Tooltip, IconButton, etc.) with real user interactions via `userEvent`.

**React Native a11y:** Each native component has a dedicated `ComponentNameA11y.test.ts` file co-located in its directory (e.g., `packages/ui-native/src/components/Button/ButtonA11y.test.ts`).

## Storybook Interaction Testing

**Story `play` functions** use `storybook/test` (wraps `@testing-library`):
```tsx
import { within, userEvent, expect } from 'storybook/test';

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
  },
};
```

**8 Required Story Types** (mandatory per `docs/DEVELOPER_GUIDE.md`):

| # | Story name | Purpose |
|---|-----------|---------|
| 1 | `Default` | Base usage with minimal props |
| 2 | `Variants` | All visual variants (bold/subtle/ghost) |
| 3 | `Sizes` | All size options (XS/S/M/L) |
| 4 | `States` | Disabled, loading, error states |
| 5 | `WithIcons` | All icon slot combinations (start/end) |
| 6 | `Interactive` | Play function with `userEvent` |
| 7 | `Responsive` | Viewport-specific rendering |
| 8 | `Themes` | Side-by-side light/dark comparison |

Stories use `Meta<typeof Component>` with `tags: ['autodocs']`. Argtype controls map to prop types explicitly. `Button.stories.tsx` imports showcase components from `Button.showcase.tsx` for consistency with platform docs.

## Visual Regression

**Tool:** Chromatic (integrated with Storybook)

**Run:** `pnpm chromatic` — all Storybook stories are snapshot candidates.

**Config:** `@chromatic-com/storybook ^5.1.2` plugin in Storybook. `chromatic ^16.7.0` CLI.

**Policy:** Visual regression must pass before shipping. No chromatic-specific story configuration was found in the reviewed files — standard Chromatic behavior applies (screenshot each story).

## React Native Test Setup

**Vitest config (`packages/ui-native/vitest.config.ts`):**
```ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      'react-native': new URL('../../node_modules/react-native/index.js', import.meta.url).pathname,
    },
  },
  resolve: {
    conditions: ['react-native', 'require', 'default'],
  },
});
```

**All native renders wrap in provider:**
```tsx
const wrap = (ui: React.ReactElement): React.ReactElement => (
  <OneUINativeThemeProvider theme={defaultNativeTheme()}>{ui}</OneUINativeThemeProvider>
);

render(wrap(<Button>Test</Button>));
```

**Native assertion differences vs web:**
- `getByRole('button')` still works (React Native exposes roles)
- No `data-*` attribute assertions — RN has no DOM attributes
- `accessibilityState.disabled` instead of `aria-disabled`
- `accessibilityState.busy` instead of `aria-busy`
- `fireEvent.press` instead of `userEvent.click`

## Shared Engine Tests (Node Environment)

Pure function tests in `packages/shared/src/engine/__tests__/` use no React, no jsdom:

```ts
import { describe, it, expect } from 'vitest';
import { generateFullCSS } from '../cssGenNew';

describe('generateFullCSS', () => {
  it('emits surface context remapping blocks', () => {
    const css = generateFullCSS({ ... });
    expect(css).toContain('[data-surface="bold"]');
  });
});
```

Custom helpers resolve CSS tokens at a given step to validate surface algorithm correctness:
```ts
function resolveTokenAtStep(css: string, step: number, token: string, theme?: 'light' | 'dark'): string | undefined
```

**Test counts (from project memory):**
- `packages/shared`: 811 tests across 15 files
- `packages/ui`: 696 tests (10 pre-existing failures noted)

## Setup Files

**`packages/ui/vitest.setup.ts`:**
```ts
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
```
This gives all web component tests `toBeInTheDocument()`, `toHaveClass()`, `toHaveAttribute()`, etc.

**`packages/ui/vitest.a11y.config.ts`:** No setup file — `vitest-axe` matchers are extended inside `test-utils/a11y.ts` which is imported directly by each a11y test.

## Quality Gates Summary

All gates must pass before any component ships:

| Command | Threshold | What it checks |
|---------|-----------|----------------|
| `pnpm test` | 90% coverage, 0 failures | Unit + component tests |
| `pnpm test:a11y` | 0 critical violations | WCAG 2.1 AA via vitest-axe |
| `pnpm check:literals` | 0 violations | No hard-coded values in CSS |
| `pnpm validate:tokens` | 100% resolved | All token references valid |
| `pnpm typecheck` | 0 errors | TypeScript compilation |
| `pnpm check:parity` | 0 drift | Web ↔ Native token consistency |
| `pnpm check:layers` | correct order | CSS layer declaration order |
| `pnpm chromatic` | no visual diff | Storybook visual regression |
| `pnpm ci:gates` | all of the above + more | Full CI gate chain |

---

*Testing analysis: 2026-05-29*
