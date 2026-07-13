## Code Review — Text component initial commit

Overall this is a well-structured implementation that correctly mirrors the Icon/Button intermediate-variable pattern and wires V2 typography tokens throughout. The 8 Storybook stories, token manifest, recipe, meta, and showcase are all present. There are a few issues that must be resolved before merge, ranging from broken token names to a logic bug in the reduced-motion handler.

---

### 🔴 Critical — must fix before merge

#### 1. Wrong font slot token names (`Text.module.css`, lines ~65–330)

`--Typography-Font-Text` and `--Typography-Font-Heading` do not exist in the design system. The four font slots are `--Typography-Font-Primary`, `--Typography-Font-Secondary`, `--Typography-Font-Script`, and `--Typography-Font-Code` (see CLAUDE.md § Typography and the `Always include font-family: var(--Typography-Font-Primary)` rule).

Affected fallbacks:

```css
/* WRONG */
--_text-font-family: var(--Body-FontFamily, var(--Typography-Font-Text));
--_text-font-family: var(--Headline-FontFamily, var(--Typography-Font-Heading));
--_text-font-family: var(--Display-FontFamily, var(--Typography-Font-Heading));

/* CORRECT */
--_text-font-family: var(--Body-FontFamily, var(--Typography-Font-Primary));
--_text-font-family: var(--Headline-FontFamily, var(--Typography-Font-Secondary));
--_text-font-family: var(--Display-FontFamily, var(--Typography-Font-Secondary));
```

Same fix needed in `Text.showcase.tsx` → `labelStyle.fontFamily`.

#### 2. `--Text-color` is a non-standard, undocumented override surface (`Text.module.css`, attention selectors)

```css
/* WRONG — introduces an undocumented --Text-color override hook */
.root[data-attention='high'] {
  color: var(--Text-color, var(--_text-high));
}
```

No other component (Button, Icon) uses a `--{Component}-color` intermediate wrapper. It creates an implicit override surface that bypasses the token system — consumers could write `style={{ '--Text-color': 'red' }}` and silently skip both appearance and attention logic. Drop `--Text-color` and consume the intermediate vars directly:

```css
.root[data-attention='high'] {
  color: var(--_text-high);
}
.root[data-attention='medium'] {
  color: var(--_text-medium);
}
.root[data-attention='low'] {
  color: var(--_text-low);
}
.root[data-attention='tintedA11y'] {
  color: var(--_text-tintedA11y);
}
```

#### 3. Reduced-motion handler ignores active attention level (`Text.module.css`, ~line 640)

```css
@media (prefers-reduced-motion: reduce) {
  .root[data-animation='shimmer'],
  .root[data-animation='reveal'] {
    animation: none;
    background: none;
    -webkit-text-fill-color: currentColor;
    color: var(--Text-color, var(--_text-high)); /* ← always high, ignores attention */
  }
}
```

A user with `attention="low"` and `prefers-reduced-motion` gets high-contrast text instead of low. Once `--Text-color` is removed (issue 2), fix this to not hardcode a single attention level. The simplest correct fix is to just reset the shimmer-specific properties without overriding `color` at all — the base `color` declaration from the attention selector is still in effect:

```css
@media (prefers-reduced-motion: reduce) {
  .root[data-animation='shimmer'],
  .root[data-animation='reveal'] {
    animation: none;
    background: none;
    -webkit-text-fill-color: currentColor;
    /* Do NOT reset color here — the attention selector already sets it correctly */
  }
}
```

---

### 🟡 High — should fix before merge

#### 4. Literal ms/em values in animation fallbacks (`Text.module.css`, ~lines 610–630)

```css
animation: oneuiTextShimmer var(--Motion-Duration-Expressive-2XL, 2400ms) ...
animation: oneuiTextReveal  var(--Motion-Duration-Expressive-S,   360ms)  ...
transform: translateY(var(--Spacing-3, 0.5em));
```

`2400ms`, `360ms`, `0.5em` are hard-coded literals. `pnpm check:literals` enforces zero hard-coded values; these will fail the gate. Use token-only values — if the motion token isn't guaranteed to be present, use a spacing/dimension token for the translate, and remove the ms fallbacks (the property just won't animate, which is safe):

```css
animation: oneuiTextShimmer var(--Motion-Duration-Expressive-2XL) ...
animation: oneuiTextReveal  var(--Motion-Duration-Expressive-S)   ...
transform: translateY(var(--Spacing-3));
```

#### 5. TypeScript `as any` escape hatch for polymorphic `href` (`Text.stories.tsx`, ~line 1455)

```tsx
{...({ href: '#' } as any)}
```

This exists because `TextProps` doesn't carry through the host element's attributes when `as` changes. The standard fix is a generic polymorphic props pattern:

```ts
type TextOwnProps = { as?: ElementType /* ...all Text-specific props */ };
export type TextProps<T extends ElementType = 'span'> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof TextOwnProps>;
```

At minimum, add `[key: string]: unknown` to `TextProps` as a short-term escape, remove the `as any` from stories, and open a follow-up for the full generic solution.

---

### 🟠 Medium — address in this PR or a tracked follow-up

#### 6. Default heading tags risk heading-hierarchy violations (`Text.tsx`, ~line 1820)

```ts
const variantToDefaultTag = {
  display: 'h1',
  headline: 'h2',
  title: 'h3',
  ...
};
```

Defaulting `display` → `h1` means a page that already has an `<h1>` banner title and then uses `<Text variant="display">` for a hero section gets two `<h1>`s. This is a WCAG 1.3.1 / ARIA failure. The safer default is `span` for all variants; the component's JSDoc already says "consumers needing a specific heading level should always pass `as` explicitly" — but the default tag contradicts that advice. Recommend defaulting everything to `span` and documenting the required explicit `as` per WCAG.

#### 7. Test coverage gaps (`Text.test.tsx`)

The tests cover the happy path well. Missing coverage:

- `appearance` prop — none of the 8 roles have a test asserting the right CSS class is applied
- `animation` / `language` data attributes
- `textAlign` data attribute
- `onTextLayout` fires ONLY once even with re-renders (could fire twice if memo invalidated)
- No `pnpm test:a11y` assertions — the quality gate requires zero critical violations

---

### 🔵 Low / nits

#### 8. `useTextState` is not a hook (`Text.shared.ts`)

The function contains no `useState`, `useRef`, `useContext`, etc. Using the `use` prefix misleads the linter and readers into expecting hook call-site rules to apply (only callable at the top of a component). Rename to `resolveTextState` or `getTextState`.

#### 9. Exported helpers with no current consumers (`Text.tokens.ts`)

`getTextTokensByCategory` and `getTextTokenDefault` are exported from the package index but appear to have no callers in this PR. Per CLAUDE.md's "don't design for hypothetical future requirements" rule, remove them unless they're consumed by the Token Editor. If they ARE needed, add a comment stating which consumer requires them.

---

### ✅ What's done well

- Intermediate-variable colour pattern matches Icon/Button exactly — surface-context remapping will work correctly without any JS
- All 27 V2 typography token combinations covered correctly in the variant × size matrix
- `Code-FontWeight-High/Medium/Low` weight tokens used for the code role — correct, consistent with shared engine
- `prefers-reduced-motion` handled at all (most common omission in new components)
- 8 Storybook stories present including `SurfaceContext` — covers the mandatory `[data-surface]` remapping demo
- Token manifest, recipe, and meta files are all complete and consistent with each other
- `maxLines` single-line path uses the cheaper `text-overflow: ellipsis` path rather than the webkit-box model
- `onTextLayout` web stub fires once and not on resize — correct per the JDSText spec note

# Comment 2

## 🔄 Review correction + Figma-verified audit

After re-running the audit against the actual codebase tokens and cross-checking against the Figma source (`bwgH8KvjQxYLguZp0XJ9uc`, label type-style variables), I need to **retract one critique and add stronger evidence on another**. Net result: the motion problem is more severe than I first reported, and the font-slot finding was wrong.

---

### ❌ RETRACTED — Issue 1 (font slot tokens) was wrong

I previously said `--Typography-Font-Text` and `--Typography-Font-Heading` don't exist. **They do.** They're the source-of-truth tokens declared in `packages/tokens/src/css/typography/typography.css`:

```css
--Typography-Font-Text: var(--font-inter, 'Inter'), -apple-system, ...;
--Typography-Font-Heading: var(--font-inter, 'Inter'), -apple-system, ...;
--Typography-Font-Primary: var(--Typography-Font-Text); /* alias */
--Typography-Font-Secondary: var(--Typography-Font-Heading); /* alias */
```

The Figma source confirms the per-role slot pattern — label texts resolve to `typography/fontFamily/label` → `JioType Var`, which is exactly what `--Label-FontFamily` mirrors in the codebase. The PR's usage of `var(--Body-FontFamily, var(--Typography-Font-Text))` is **correct**. CLAUDE.md is misleading — it documents the `Primary`/`Secondary` aliases but the source-of-truth tokens are `Text`/`Heading`. Apologies for the bad call.

---

### 🔴 ESCALATED — Issue 4 (motion tokens) is worse than I thought

The motion tokens used in `Text.module.css` **don't exist in the runtime CSS at all** — every animation will silently fall back to the literal:

| PR uses                            | Status         | Real token name                       |
| ---------------------------------- | -------------- | ------------------------------------- |
| `--Motion-Duration-Expressive-2XL` | ❌ NOT EMITTED | `--Motion-Duration-2XL`               |
| `--Motion-Duration-Expressive-S`   | ❌ NOT EMITTED | `--Motion-Duration-S`                 |
| `--Motion-Easing-Standard`         | ❌ NOT EMITTED | `--Motion-Easing-Transition-Moderate` |
| `--Motion-Easing-Decelerate`       | ❌ NOT EMITTED | `--Motion-Easing-Entrance-Moderate`   |

Verified against `packages/shared/src/engine/motionCSS.ts` (the only place motion tokens are emitted to the DOM) and `packages/tokens/src/css/primitives.css`. The `Expressive-*` / `Discreet-*` / `Standard` / `Decelerate` names appear ONLY in the legacy `packages/shared/src/types/componentTokens.ts` dropdown labels — they were renamed to t-shirt sizes + Entrance/Exit/Transition/Bounce-Moderate/Subtle and the old names were never aliased. Brand engine emission (`motionCSS.ts:39-87`):

```ts
--Motion-Duration-{2XS,XS,S,M,L,XL,2XL,3XL}      // + Subtle- variants
--Motion-Easing-{Entrance,Exit,Transition,Bounce}-{Moderate,Subtle}
--Motion-Easing-Linear
```

So the shimmer animation runs at `2400ms` literal ease-in-out, and reveal runs at `360ms` literal ease-out, regardless of brand motion config. **This makes my issue 4 a bug, not just a lint failure.** Correct usage:

```css
animation: oneuiTextShimmer var(--Motion-Duration-2XL) var(--Motion-Easing-Transition-Moderate)
  infinite;

animation: oneuiTextReveal var(--Motion-Duration-S) var(--Motion-Easing-Entrance-Moderate) both;
```

The `transform: translateY(var(--Spacing-3, 0.5em))` keyframe — `--Spacing-3` IS emitted (the fallback is unnecessary and a literal violation).

---

### 🟡 STILL VALID — Issue 2 (`--Text-color`)

Re-verified: there is no `--Text-color` token anywhere in `packages/tokens/src/css/` or in any engine emission. Only `--Text-High`, `--Text-Medium`, `--Text-Low`, `--Text-On-{Default,Minimal,Subtle,Elevated,Bold}-{High,Medium,Low}` exist. The `var(--Text-color, var(--_text-high))` wrapper introduces an undocumented override that no other component uses. Critique stands as written.

### 🟡 STILL VALID — Issue 3 (reduced-motion attention bug)

Same fix as the original review — drop the `color:` override inside `@media (prefers-reduced-motion)` so the attention selector's `color` cascade remains in effect.

### 🟡 STILL VALID — Issues 5-9 (polymorphic `as any`, default heading tags, test coverage, `useTextState` naming, unused helpers)

No change.

---

### 📋 Corrected priority order

1. **🔴 BUG** — Motion tokens (`Expressive-*`, `Standard`, `Decelerate`) don't exist. Animations silently use literal fallbacks. (was issue 4 — now critical)
2. **🔴 ANTI-PATTERN** — `--Text-color` undocumented override hook in attention selectors.
3. **🔴 BUG** — Reduced-motion handler ignores active attention level.
4. **🟡** — `as any` polymorphic escape hatch in stories.
5. **🟡** — Default heading tags (`h1`/`h2`/`h3`) cause heading-hierarchy issues.
6. **🟡** — Test coverage gaps (appearance / animation / language / textAlign / a11y).
7. **🔵** — `useTextState` is not a hook (rename).
8. **🔵** — Unused token helper exports.

Issue 1 (font slot tokens) — **retracted, the PR's usage is correct.**

# Comment 3

## Text Component — Design System Audit

A deeper review against the OneUI typography system, plus a research note on the animation API and a confirmed bug in the script-language path.

---

### 1. Type Scale Mismatch — Bug

The OneUI typography token system defines **27 sizes** (see [`typography.css`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/tokens/src/css/typography/typography.css#L12-L165)):

| Role     | Tokens                         | Count |
| -------- | ------------------------------ | ----- |
| Display  | L, M, S                        | 3     |
| Headline | L, M, S                        | 3     |
| Title    | L, M, S                        | 3     |
| Body     | 2XL, XL, L, M, S, XS, 2XS      | **7** |
| Label    | 2XL, XL, L, M, S, XS, 2XS, 3XS | **8** |
| Code     | M, S, XS                       | 3     |

The Text component exposes only **6 sizes** in a single flat union ([`Text.shared.ts#L45`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.shared.ts#L43-L46)):

```ts
export type TextSize = 'M' | '3XS' | '2XS' | 'XS' | 'S' | 'L';
```

**Problems:**

1. **Body 2XL/XL and Label 2XL/XL are unreachable** through the public API — the largest body/label sizes are missing entirely.
2. **3XS is exposed but only valid for Label.** For Body it cascades silently to 2XS ([`Text.module.css#L315-L318`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.module.css#L314-L319)), for Code it cascades to XS, for Display/Headline/Title it cascades to M. Users see size options that don't behave as labelled.
3. **L is exposed for Code** but cascades to M ([`Text.module.css#L368-L371`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.module.css#L367-L372)).
4. **A single flat `TextSize` union is the wrong shape.** Each role has its own valid size set; collapsing them forces every variant to claim sizes it can't render, then silently clamps.

**Fix:** discriminated union per variant, so `variant: 'body'` narrows `size` to the seven Body sizes and `variant: 'display'` narrows to L/M/S. This prevents impossible combos at compile time and matches how designers reason about the scale.

---

### 2. Appearance — Violates CLAUDE.md Rule

[`CLAUDE.md`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/CLAUDE.md) explicitly states:

> Components with a multi-accent `appearance` prop MUST import the canonical type:
> `import type { ComponentAppearance } from '@oneui/shared';`

The canonical [`ComponentAppearance`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/shared/src/types/appearance.ts#L22-L34) covers **11 roles + auto**: `primary | secondary | tertiary | quaternary | neutral | sparkle | brand-bg | positive | negative | warning | informative`.

Text defines its own narrower union of 8 roles ([`Text.shared.ts#L72-L81`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.shared.ts#L72-L82)), missing **tertiary, quaternary, brand-bg** — the multi-accent extension roles for which the brand engine emits tokens. Body copy placed inside a brand-bg accent surface has no way to consume the correct on-colour through this component.

CLAUDE.md allows a narrower local type **only if** the CSS doesn't wire those roles and a comment explains why. Neither is the case here, and the intermediate-variable CSS pattern is trivially extensible.

---

### 3. Animation API — Recommend Removing

Survey of major design systems' Text/Typography components:

| System             | Animations on Text?                     |
| ------------------ | --------------------------------------- |
| Material UI        | No                                      |
| Mantine            | No (separate `Skeleton` + `Transition`) |
| Chakra UI          | No (separate `Skeleton`)                |
| Radix UI           | No                                      |
| shadcn/ui          | No                                      |
| Ant Design         | No (separate `Skeleton`)                |
| React Native Paper | No                                      |

**Industry consensus: Text is an atomic typography primitive; loading and entrance animations are separate concerns.**

Why the current `animation` prop is problematic:

1. **`shimmer` is a skeleton/loading pattern.** It belongs in a dedicated `<Skeleton>` component that can wrap any node — text, images, cards. The current implementation also forces text to transparent and paints a gradient ([`Text.module.css#L444-L458`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.module.css#L443-L459)) — which fights `color`, `text-decoration`, and inline elements like `<mark>`.
2. **`reveal` is an entrance animation.** It belongs in a motion wrapper that can be reused across icons, buttons, cards — with control over delay, stagger, trigger, and sequence.
3. **API surface bloat.** `animation` is the 9th visual modifier on Text; each adds to the test/story matrix.
4. The referenced `--Motion-Duration-Expressive-2XL` and `--Motion-Easing-Standard` tokens should be cross-checked against the actual motion token category in CLAUDE.md.

**Recommendation:** remove `animation` from Text. Add a separate `<Skeleton>` for loading and use motion primitives for entrance animations.

---

### 4. Script Font (`language=\"others\"`) — Silently Broken

The chain:

1. The CSS rule reads ([`Text.module.css#L212-L214`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.module.css#L212-L214)):
   ```css
   .root[data-language=\"others\"]:not([data-variant=\"code\"]) {
     --_text-font-family: var(--Typography-Font-Script, var(--Typography-Font-Text));
   }
   ```
2. `--Typography-Font-Script` is **never defined at `:root`** in [`typography.css`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/tokens/src/css/typography/typography.css#L188-L216) — no default value exists.
3. It is only emitted by the brand CSS engine when `fontSelection.fallbackFontIds[0]` is configured ([`foundationCSS.ts#L224-L226`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/utils/foundationCSS.ts#L224-L226)):
   ```ts
   const scriptFamily = buildFontFamily(config.fontSelection.fallbackFontIds[0], customFonts);
   declarations.push(`--Typography-Font-Script: ${scriptFamily};`);
   ```
4. [`DEFAULT_FONT_FAMILIES.script`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/shared/src/data/typography-roles.ts#L137-L142) declares Noto Sans as the default script font — but it is **never wired** to the CSS token unless a fallback font is added in the typography editor.

**Result:** for any brand without a configured fallback font, toggling `language=\"others\"` silently falls back to the Text slot. The prop exists but has zero observable effect — which is exactly what you saw with Noto Sans.

**Fix:**

- Emit a default `--Typography-Font-Script` at `:root` in `typography.css` (e.g., Noto Sans, matching `DEFAULT_FONT_FAMILIES.script`).
- Surface the script slot in the Fonts tab so brand authors discover it.
- Add a Storybook story with non-Latin sample text (Devanagari/Tamil) so the behaviour is visually testable.

---

### 5. Other Issues

- **`attention=\"none\"` and `attention=\"high\"` are aliases** ([`Text.shared.ts#L230-L231`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.shared.ts#L228-L233)). Two enum values doing the same thing is API smell — pick one or document the parity reason.
- **`onTextLayout` is a one-shot `getBoundingClientRect`** ([`Text.tsx#L111-L121`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.tsx#L111-L121)) carried over from android-only JDSText. On web it doesn't observe resizes — either commit to `ResizeObserver` or remove.
- **`position` analytics data attribute** ([`Text.shared.ts#L246`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.shared.ts#L244-L247)) is out of scope for a typography primitive.
- **Hard-coded size clamps** ([`Text.module.css#L314-L379`](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/blob/4e653da620849ab5899a777830fe6cad74146fb0/packages/ui/src/components/Text/Text.module.css#L314-L379)) shouldn't exist; type-level prevention is the right layer.

---

### Proposed Shape

```ts
type TextVariantSize =
  | { variant: 'display'; size?: 'L' | 'M' | 'S' }
  | { variant: 'headline'; size?: 'L' | 'M' | 'S' }
  | { variant: 'title'; size?: 'L' | 'M' | 'S' }
  | { variant: 'body'; size?: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' }
  | { variant: 'label'; size?: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS' }
  | { variant: 'code'; size?: 'M' | 'S' | 'XS' };

type TextProps = TextVariantSize & {
  weight?: 'high' | 'medium' | 'low'; // body/label/code only
  attention?: 'high' | 'medium' | 'low' | 'tintedA11y';
  appearance?: ComponentAppearance; // canonical 11 + auto
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  maxLines?: number;
  language?: 'latin' | 'others';
  as?: ElementType;
  // standard HTML / a11y props
};
```

**Drop:** `animation`, `onTextLayout`, `position`, `link` slot, the `'none'` attention alias.
**Add:** discriminated variant×size types, canonical `ComponentAppearance`, default `--Typography-Font-Script` at `:root`, a non-Latin Storybook story.
**Companion components (separate):** `<Skeleton>` for loading, `<Motion>` / `<FadeIn>` for entrance animation.

This keeps Text as a pure typography primitive — atomic, type-safe, and aligned with both the OneUI token system and industry conventions.
