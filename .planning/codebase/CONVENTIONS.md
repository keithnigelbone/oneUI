# Coding Conventions

**Analysis Date:** 2026-05-29

## TypeScript Strictness

**Config:** `tsconfig.json` (root), inherited by all packages via `"extends": "../../tsconfig.json"`.

**Enforced flags:**
- `strict: true` (umbrella — enables all strict checks)
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `strictBindCallApply: true`
- `strictPropertyInitialization: true`
- `noImplicitThis: true`
- `alwaysStrict: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `forceConsistentCasingInFileNames: true`
- `allowJs: false` — TypeScript only, no mixed JS

**Relaxed:**
- `noUnusedLocals: false`, `noUnusedParameters: false` — not enforced (ESLint handles it at warn level)

**Target:** `ES2022`, `moduleResolution: bundler`

**Type declarations:**
- `packages/ui/tsconfig.json` adds `"types": ["react", "react-dom", "vitest/globals", "@testing-library/jest-dom"]`

## File Naming Conventions

**Components (PascalCase, co-located in a named directory):**
```
packages/ui/src/components/Button/
  Button.tsx              # Web implementation
  Button.shared.ts        # Shared types + hooks (web + native)
  Button.module.css       # Web styles
  Button.stories.tsx      # Storybook stories
  Button.test.tsx         # Unit tests
  Button.meta.ts          # Unified component metadata
  Button.tokens.ts        # Token manifest
  Button.recipe.ts        # Design decision recipe
  Button.showcase.tsx     # Shared preview components (Storybook + platform)
  ButtonContext.ts         # Internal context (PascalCase, no suffix)
  index.ts                # Named barrel exports
```

**React Native component files:**
```
packages/ui-native/src/components/Button/
  Button.native.tsx        # Native implementation
  Button.native.test.tsx   # Native unit tests
  Button.native.test.ts    # Alternative (pure logic tests)
  Button.styles.native.ts  # Native StyleSheet
  Button.showcase.native.tsx
  ButtonA11y.test.ts       # A11y-only native tests
  interface.ts             # Native prop contract + state hooks
  index.ts
```

**Other file naming rules:**
- `.module.css` suffix for all CSS Modules
- `.shared.ts` suffix for platform-shared types/hooks
- `.meta.ts` suffix for component metadata
- `.tokens.ts` suffix for token manifests
- `.recipe.ts` suffix for design recipes
- `.showcase.tsx` suffix for shared preview components
- `__tests__/` subdirectory for engine/utility tests in `packages/shared`
- `index.ts` barrel file per component folder

**Directory naming:** PascalCase for components (matching the component name exactly). `_shared/` and `_storyHelpers/` use underscore-prefix for internal-only folders.

## Component File Structure

Every web component in `packages/ui/src/components/` follows this exact pattern, exemplified by `Button/`:

1. **`ComponentName.shared.ts`** — Types, interfaces, and `useComponentState` hook. Used by both web and native. Imports from `@oneui/shared` only. Never imports from `@oneui/ui`.

2. **`ComponentName.tsx`** — Web implementation. Always `'use client'` directive at top. Uses `React.forwardRef`. Imports Base UI primitives, never forks them. Imports CSS module as `styles`.

3. **`ComponentName.module.css`** — Zero literals. All values via `var(--Token-Name)`. Intermediate `--_component-*` local vars for role-agnostic plumbing. Appearance classes remap intermediates. Size via `[data-size="N"]` attribute selectors.

4. **`ComponentName.stories.tsx`** — 8 story types required (see Testing section). Imports showcase components for variant display, not inline JSX.

5. **`ComponentName.test.tsx`** — Co-located unit tests. Uses `@testing-library/react` + Vitest.

6. **`ComponentName.meta.ts`** — Exports `COMPONENT_META: ComponentMeta`. Imports from `@oneui/shared`.

7. **`ComponentName.tokens.ts`** — Exports `COMPONENT_TOKENS` and `COMPONENT_TOKEN_MANIFEST`.

8. **`ComponentName.recipe.ts`** — Exports `COMPONENT_RECIPE_DEFINITION: ComponentRecipeDefinition`.

9. **`ComponentName.showcase.tsx`** — Shared between Storybook and platform docs. No Storybook imports, no app imports.

10. **`index.ts`** — Named exports only. Exports component, types, hooks, showcase components, token manifest, recipe definition, and meta object.

## Import Organization

**Convention (no enforced auto-sort, follows logical grouping):**
```ts
// 1. React / Node stdlib
import React, { isValidElement, useMemo } from 'react';

// 2. External packages
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';

// 3. CSS module (co-located)
import styles from './Button.module.css';

// 4. Local package (same component)
import { ButtonProps, useButtonState } from './Button.shared';

// 5. Sibling components (relative)
import { ButtonDecoration } from './ButtonDecoration';
import { Icon } from '../../icons/Icon';

// 6. Package aliases (@oneui/shared types)
import type { SemanticIconName } from '@oneui/shared';
```

**Rule:** `import type` for type-only imports is used consistently (not enforced by lint but standard practice across codebase).

**Banned import:**
```ts
// BANNED — no-restricted-imports: error
import { anything } from '@oneui/ui';

// REQUIRED — use deep path imports
import { Button } from '@oneui/ui/components/Button';
```

This is an **error-level ESLint rule** preventing barrel import of the entire `@oneui/ui` package.

## Path Aliases

Defined in root `tsconfig.json`:

| Alias | Resolves to |
|-------|------------|
| `@oneui/ui` | `packages/ui/src` |
| `@oneui/ui/engine` | `packages/ui/src/engine` |
| `@oneui/ui/*` | `packages/ui/src/*` |
| `@oneui/ui-native` | `packages/ui-native/src` |
| `@oneui/ui-native-materials` | `packages/ui-native-materials/src` |
| `@oneui/ui-native/*` | `packages/ui-native/src/*` |
| `@oneui/tokens` | `packages/tokens/src` |
| `@oneui/tokens/*` | `packages/tokens/src/*` |
| `@oneui/shared` | `packages/shared/src` |
| `@oneui/shared/*` | `packages/shared/src/*` |
| `@oneui/shared/engine` | `packages/shared/src/engine` |
| `@oneui/convex` | `packages/convex/src` |

## CSS Module Conventions

**Zero Literals Rule — Enforced by `pnpm check:literals`:**
- No hard-coded colors, pixels, font-sizes, or weights anywhere in `.module.css` files
- All values must be `var(--Token-Name)`

**Class naming pattern (camelCase in CSS, accessed via `styles.camelCaseName`):**
```css
.button { }            /* root element */
.fullWidth { }         /* boolean modifier */
.disabled { }          /* state modifier */
.loading { }           /* state modifier */
.bold { }              /* variant */
.subtle { }            /* variant */
.ghost { }             /* variant */
.appearancePrimary { } /* appearance role */
.appearanceNeutral { } /* appearance role */
.start { }             /* slot */
.end { }               /* slot */
.label { }             /* inner text */
```

**Intermediate variable pattern:**
```css
.button {
  /* Local --_component-* vars are remapped by appearance classes */
  --_btn-bold: var(--Button-roleBold, var(--Primary-Bold, var(--Surface-Bold)));
  background-color: var(--_btn-bg);
}

/* Appearance classes remap intermediates — no duplication */
.appearanceNeutral {
  --_btn-bold: var(--Neutral-Bold);
}
```

**Component override hooks pattern:**
```css
background-color: var(--Button-backgroundColor, var(--_btn-bg));
border-radius: var(--Button-borderRadius, var(--Shape-Pill));
```
Every overridable value is prefixed with `--ComponentName-propertyName` to allow brand customization.

**`localsConvention: 'camelCase'`** is set in `vitest.config.ts` so CSS module keys are accessed as `styles.camelCaseName` in JS.

**Token usage rules (MANDATORY):**
- Use unified role-explicit tokens: `--Body-M-FontSize`, `--Primary-Bold`, `--Primary-High`
- Do NOT use legacy aliases: `--Typography-Size-M`, `--Primary-FG-Bold`, `--Text-High`
- Always pair `font-size` with a `line-height` token
- Always include `font-family: var(--Typography-Font-Primary)`
- Focus rings must use `--Surface-Halo-Gap` (not `--Surface-Main`) for surface-context adaptability

## Export Patterns

**Component barrel (`index.ts`):**
```ts
// Named exports only — never default exports
export { Button } from './Button';
export { useButtonState, resolveSize } from './Button.shared';
export type { ButtonProps, ButtonAppearance, ButtonVariant } from './Button.shared';
export { ButtonPreview } from './ButtonPreview';
export { BUTTON_TOKEN_MANIFEST, BUTTON_TOKENS } from './Button.tokens';
export { BUTTON_RECIPE_DEFINITION } from './Button.recipe';
export { BUTTON_META } from './Button.meta';
export { ButtonAttentionLevels, ButtonSizes } from './Button.showcase';
```

**All exports are named. Default exports are not used.**

**`packages/ui/src/index.ts`** is the package root but is restricted via `no-restricted-imports` — callers must use deep paths like `@oneui/ui/components/Button`.

## Naming Conventions

**Constants:** `SCREAMING_SNAKE_CASE`
```ts
export const BUTTON_META: ComponentMeta = { ... };
export const BUTTON_TOKENS: Record<string, TokenDefinition> = { ... };
export const BUTTON_RECIPE_DEFINITION: ComponentRecipeDefinition = { ... };
const SPINNER_SIZE_MAP: Record<number, CircularProgressIndicatorSize> = { ... };
```

**Functions:** `camelCase`
```ts
export function resolveSize(size: ButtonSize): number { ... }
export function useButtonState(props: ButtonProps) { ... }
function renderIconNode(icon: SemanticIconName | React.ReactElement): React.ReactNode { ... }
```

**Components:** `PascalCase`
```ts
export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(...) { ... });
Button.displayName = 'Button';
```

**`displayName` is required** on every `forwardRef` component.

**Types/Interfaces:** `PascalCase`
```ts
export type ButtonAppearance = ComponentAppearance;
export type ButtonVariant = 'bold' | 'subtle' | 'ghost';
export interface ButtonProps extends ButtonBaseProps { ... }
```

**Appearance type rule:** Components with `appearance` prop MUST import `ComponentAppearance` from `@oneui/shared`:
```ts
import type { ComponentAppearance } from '@oneui/shared';
export type ButtonAppearance = ComponentAppearance;
```
Do not redefine the union locally.

**Data attributes:** Used for CSS targeting and test selectors:
```ts
'data-oneui-component': 'Button'   // scoped brand overrides
'data-variant': resolvedVariant     // CSS variant hooks
'data-appearance': resolvedAppearance
'data-size': String(numericSize)
'data-condensed': ''               // boolean presence attr
```

**Slot naming:** `start`/`end` for icon slots (not `left`/`right`, `leading`/`trailing`). Enforced by `pnpm check:metadata` per RFC `docs/rfcs/0001-slot-naming.md`.

## React Conventions

**Client components:** `'use client'` directive at the top of all web component files.

**Base UI usage:** Always wrap Base UI primitives, never fork:
```ts
import { Button as BaseButton } from '@base-ui/react';
// or
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
```

**Compound API pattern:**
```ts
export const Accordion: React.FC<AccordionProps> & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Panel: typeof AccordionPanel;
} = ({ ... }) => { ... };
```

**clsx for class composition:**
```ts
const className = clsx(
  styles.button,
  styles[resolvedVariant],
  appearanceClassName,
  { [styles.fullWidth]: fullWidth, [styles.disabled]: isDisabled },
  classNameProp,
);
```

**React Native components** use `StyleSheet.create()` with `tokens.*` values (not CSS variables). Native files end in `.native.tsx`. Props contract lives in `interface.ts`, not `Component.shared.ts`.

## Linting Configuration

**Tool:** ESLint 9 flat config (`eslint.config.mjs`).

**Plugins:** `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `storybook`.

**Error-level rules (block CI):**
- `no-restricted-imports`: Bans `import { * } from '@oneui/ui'` barrel
- Standard `js.configs.recommended` violations

**Warn-level rules (visible but non-blocking):**
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (ignores `_`-prefixed)
- `react-hooks/rules-of-hooks`: warn
- `react-hooks/exhaustive-deps`: warn
- `react/display-name`: warn
- All `jsx-a11y/*` rules: warn (being tightened per-package toward error)

**Off rules:**
- `react/react-in-jsx-scope`: off (React 17+ JSX transform)
- `react/prop-types`: off (TypeScript covers this)
- `no-undef`: off (TypeScript handles identifier checking)

## Prettier Configuration

**Config file:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

Key choices: single quotes, trailing commas, 100-char line width, 2-space indent.

## Comment Style

JSDoc-style block comments at the top of every file explaining purpose and key features:
```ts
/**
 * Button.tsx
 * React (web) implementation using Base UI
 *
 * Key features:
 * - Uses @base-ui/react Button primitive (never fork)
 * - Token-only styling in CSS Module
 */
```

Inline comments explain non-obvious decisions with "why", not "what":
```ts
// Prefer tinted over achromatic so brand identity persists on bold fills.
--_btn-bold-high: var(--Button-roleBoldHigh, ...);

// Contained-only props are excluded from the input type so adding a new
// contained-only prop that's forgotten here becomes a type error.
type ContainedOnlyProps = 'contained' | 'condensed' | 'fullWidth' | 'decoration';
```

---

*Convention analysis: 2026-05-29*
