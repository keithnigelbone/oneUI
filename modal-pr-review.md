# Modal Component — PR #5 Code Review (Comprehensive)

> **PR:** [Nuno-Marcelino_jplgit/OneUiStudio_Base_v4#5](https://github.com/Nuno-Marcelino_jplgit/OneUiStudio_Base_v4/pull/5) — `feat/react/modal`
> **Author:** @Amrutha-Mk_jplgit
> **Reviewer:** @Nuno-Marcelino_jplgit
> **Date:** 2026-05-11

Issues sorted by severity. Each item has the file, the problem, and the fix.

---

## Blocking — Must Fix Before Merge

### 1. Close Button Does Not Use `<IconButton>`

**Files:** `Modal.tsx` lines 181–183, `Modal.module.css` lines 185–220

The close button is built from scratch using `BaseDialog.Close` + raw `<Icon>` + ~35 lines of manually-written hover/focus/pressed CSS. The design system already has `<IconButton>` purpose-built for this — appearance roles, ghost variant, focus halo with `--Surface-Halo-Gap`, hover/pressed tokens. It is used everywhere else in the codebase.

The current approach re-implements IconButton's logic by hand and will silently diverge as IconButton evolves. The close button icon color is also hardcoded to `--Text-Medium` regardless of `appearance` — IconButton ghost variant would automatically use `--{Role}-TintedA11y`.

**Replace:**
```tsx
<BaseDialog.Close className={styles.closeButton} aria-label="Close">
  <Icon icon="close" size="4" aria-hidden={true} />
</BaseDialog.Close>
```

**With:**
```tsx
<BaseDialog.Close
  render={
    <IconButton
      icon="close"
      variant="ghost"
      appearance={resolvedAppearance as IconButtonAppearance}
      aria-label="Close"
      size={8}
    />
  }
/>
```

Drops the `.closeButton` CSS block entirely. The `render` prop is the canonical Base UI pattern (already used in `Tooltip.tsx`).

---

### 2. Wrong Token Used for Modal Width

**File:** `Modal.module.css` lines 90 and 95

```css
.sizeS { width: var(--Modal-width-S, var(--Dialog-Height-Medium)); }
.sizeM { width: var(--Modal-width-M, var(--Dialog-Height-Large)); }
```

`--Dialog-Height-Medium` and `--Dialog-Height-Large` are **height** tokens (verified in `packages/tokens/src/css/primitives.css` lines 274–275 and 503–504). Using them as modal **widths** is semantically wrong and will break when those tokens are tuned for Dialog height reasons.

**Fix:** use fixed values with `INTENTIONAL-LITERAL` annotations until proper width tokens are added (as `.sizeL` already does):

```css
/* INTENTIONAL-LITERAL: no --Modal-width-S token exists yet. */
.sizeS { width: var(--Modal-width-S, 400px); max-width: calc(100vw - var(--Spacing-6)); }

/* INTENTIONAL-LITERAL: no --Modal-width-M token exists yet. */
.sizeM { width: var(--Modal-width-M, 480px); max-width: calc(100vw - var(--Spacing-6)); }
```

---

### 3. Accessibility — No Fallback Accessible Name When Header Hidden

**Files:** `Modal.tsx`, `Modal.shared.ts`

When `header={false}` (the "No Header" story) or `showTitle={false}`, the dialog has no accessible name. `BaseDialog.Title` is the only source of the dialog's `aria-labelledby`. Without it, screen readers announce an unnamed dialog — WCAG 2.1 AA 4.1.2 violation.

**Fix — add `aria-label` prop:**
```ts
// Modal.shared.ts — add to ModalProps:
'aria-label'?: string;
```
```tsx
// Modal.tsx — pass to BaseDialog.Popup:
<BaseDialog.Popup
  aria-label={(!showHeader || !showTitle) ? props['aria-label'] : undefined}
  ...
>
```

No test currently covers this — the "No Header" test only checks body content renders.

---

### 4. `onOpenChange` Drops Base UI Event Details (Loss of Capability)

**File:** `Modal.tsx` line 150

```tsx
onOpenChange={onOpenChange ? (nextOpen: boolean) => onOpenChange(nextOpen) : undefined}
```

Base UI's signature is `onOpenChange(open: boolean, eventDetails: ChangeEventDetails)`. The `eventDetails` includes the close reason: `triggerPress`, `outsidePress`, `escapeKey`, `closePress`, `focusOut`, `imperativeAction`, `none`. The Modal strips this argument — consumers cannot distinguish between dismissal types.

This matters for product flows like "warn before discarding unsaved changes when user presses Escape, but allow click-outside to discard silently." Currently impossible.

**Fix:** Forward the second argument:
```ts
// Modal.shared.ts
onOpenChange?: (open: boolean, details?: { reason: string }) => void;
```
```tsx
// Modal.tsx
onOpenChange={onOpenChange as any /* until type unified with Base UI */}
```

Or, preferably, re-export `BaseDialog.Root.ChangeEventDetails` and use it directly in the type.

---

### 5. Slot System Violates RFC 0001

**Files:** `Modal.shared.ts`, `Modal.meta.ts`

Per `docs/rfcs/0001-slot-naming.md` (Accepted 2026-04-20), content slots must be named `start` / `end` and be a single `ReactNode` prop. The Modal violates this in three ways:

**5a. Double-prop gate for `headerStart`:**
```tsx
headerStart?: 'none' | 'icon' | 'badge'   // type selector
headerStartContent?: ReactNode             // actual content
```
No other component does this. Button, Input, ListItem all use a single `start?: ReactNode` — presence/absence is the gate. The type discriminator is a Figma annotation that leaked into the public API and enforces nothing in code. Collapse to:
```tsx
headerStart?: ReactNode  // single slot
```

**5b. Meta slot names don't match prop names:**
```ts
// Modal.meta.ts declares:
slots: [
  { name: 'headerStart', ... },    // ❌ actual prop: headerStartContent
  { name: 'body', ... },            // ❌ actual prop: children
  { name: 'footerStart', ... },     // ✓ matches
  { name: 'footerContent', ... },   // ✓ matches
]
```
`pnpm check:metadata` will block this drift after RFC 0001 Phase D ships.

**5c. `acceptedTypes` enforced only in editor UI, not in code:**
```ts
{ name: 'headerStart', acceptedTypes: ['Icon', 'Badge'] }
{ name: 'footerContent', acceptedTypes: ['Button'] }
```
Nothing in TypeScript or runtime enforces this. A consumer can put a `<Checkbox>` in `footerContent` and it renders fine. Either document this is editor-only or tighten the types (e.g., `footerContent?: ReactElement<ButtonProps> | ReactElement<ButtonProps>[]`).

---

## Should Fix Before Merge

### 6. Base UI Capabilities Not Exposed

The Modal wraps `BaseDialog` correctly (keeps it headless, doesn't fork behavior) but hides several useful Base UI features. Missing on the public API:

| Base UI prop | Where | What it does | Why expose it |
|---|---|---|---|
| `initialFocus` | `BaseDialog.Popup` | Custom element to focus on open | Required for forms — focus the first input |
| `finalFocus` | `BaseDialog.Popup` | Where focus returns on close | Required when trigger is hidden after action |
| `modal` (`'trap-focus'`) | `BaseDialog.Root` | Trap focus without scroll lock | Required for non-blocking modals |
| `actionsRef` | `BaseDialog.Root` | Imperative `.close()` | Required for parent-driven close from refs |
| `container` | `BaseDialog.Portal` | Custom portal target | Required when modal must mount inside a scroll container |
| `keepMounted` | `BaseDialog.Portal` | Keep DOM mounted while hidden | Required for tests + animation libraries |
| `onOpenChangeComplete` | `BaseDialog.Root` | Fires after animation | Required for animation cleanup |

**Fix:** Add these as optional props passed through. They are zero-cost when omitted and unblock real production use cases.

---

### 7. Recipe References Non-Existent Token

**File:** `Modal.recipe.ts` line 87

```ts
dividerDefault: {
  hidden: [],
  visible: [
    { tokenName: 'dividerVisibility', value: 'always' },  // ❌ no such token
  ],
},
```

`dividerVisibility` is not defined in `MODAL_TOKENS` (only `dividerColor` exists). The recipe will silently produce a no-op override when the `visible` option is selected. Either:
- Add `dividerVisibility` to `Modal.tokens.ts` as a prop-driven token
- Or convert the recipe to set `dividerTopVisibility` / `dividerBottomVisibility` as default prop values (which is closer to actual intent)

---

### 8. Token Manifest Category Count Off

**File:** `Modal.tokens.ts` lines 177–183

```ts
categories: {
  color: 5,        // ❌ actually 6 (backgroundColor, titleColor, descriptionColor, closeButtonColor, dividerColor, scrimColor)
  shape: 1,
  spacing: 4,
  elevation: 1,
  typography: 2,
}
```

The `closeButtonColor` token will go away after issue #1 (close button moved to IconButton), so the final count should be `color: 5` after the fix lands. Worth verifying once #1 is done.

---

### 9. Cannot Disable Escape Key Dismissal

**File:** `Modal.tsx` line 151, `Modal.shared.ts` line 167

```tsx
dismissible?: boolean  // only maps to disablePointerDismissal
```

`dismissible={false}` only disables click-outside-to-close. Escape always closes by default in Base UI. For destructive-action flows that require explicit confirmation, there is no way to disable Escape.

**Fix:** Either:
- Rename `dismissible` to `disableOutsideClick` and add a separate `disableEscapeKey` prop, or
- Have `dismissible={false}` block Escape too via the `onOpenChange` event details (reject when `reason === 'escapeKey'`)

The second approach is cleaner once issue #4 is fixed.

---

### 10. `footer` + `footerContent` Coupling Undocumented

**File:** `Modal.tsx` line 198

```tsx
{showFooter && footerContent && (
```

`footer={true}` (default) but no `footerContent` passed → footer section silently renders nothing. Consumers expecting `footer={true}` to reserve space will be confused. Either:
- Change to `{showFooter && (` and let consumers control content, or
- Add a JSDoc note that `footerContent` is the real gate when `footer={true}`

---

### 11. Non-Functional Design-Time Props Mislead Consumers

**Files:** `Modal.shared.ts` lines 124–138, `Modal.tsx` lines 126–129

`dividerTopScrollPosition` and `dividerBottomScrollPosition` are accepted as props, mirrored to `data-*` attributes, but nothing reads them at runtime. The actual divider visibility logic uses live scroll state. Consumers will assume these props affect behavior.

**Fix:** Add `@internal Figma design-time annotation only — has no runtime effect.` to both JSDoc comments, or move them out of the public props API and inject the `data-*` attributes internally only.

---

### 12. Test Gaps — No Accessibility Tests Despite the Claim

**File:** `Modal.test.tsx`

PR description says "18 unit/a11y tests pass" — there are no a11y tests. No `axe-core`, no `jest-axe`. All 18 are behavioral unit tests.

Missing coverage:

| Scenario | Current | Needed |
|---|---|---|
| Accessibility tree (axe) | ✗ | `expect(await axe(container)).toHaveNoViolations()` |
| Escape key closes modal | ✗ | `userEvent.keyboard('{Escape}')` |
| Focus trap (Tab stays inside) | ✗ | Tab sequence test |
| `dismissible={false}` blocks pointer | ✗ | click outside + spy |
| No accessible name when `header={false}` | ✗ | `getByRole('dialog')` name check |
| `onScroll` dividers show/hide correctly | ✗ | scroll simulation |
| `onOpenChange` reason argument | ✗ (after fix #4) | event details assertion |

CLAUDE.md quality gate requires `pnpm test:a11y` with zero critical violations.

---

## Minor Points

### 13. Duplicate / Overlapping Component — Dialog Already Exists

**Files:** `packages/ui/src/components/Dialog/Dialog.tsx`

There is already a `Dialog` component in the codebase that wraps the same `BaseDialog` primitive. The PR description does not mention it. The two are arguably distinct (Dialog is composable — consumer writes `<DialogTrigger>`, `<DialogPortal>` themselves; Modal is opinionated layout), but this needs a clear note in the PR description and likely in the component JSDoc explaining when to use which.

If the team intends Modal to supersede Dialog, that should be flagged as a follow-up deprecation. If both stay, the docs need a "Dialog vs Modal" decision guide.

---

### 14. `--Dialog-Header-MinHeight` Token Reference Unclear

**File:** `Modal.module.css` line 123

```css
min-height: var(--Dialog-Header-MinHeight, calc(var(--Spacing-4) * 3));
```

Uses a `--Dialog-Header-MinHeight` token that I could not find defined anywhere. The `calc(var(--Spacing-4) * 3)` fallback always wins. Either define the token in `Modal.tokens.ts` or remove the `var()` reference and use the `calc()` directly.

---

### 15. Center-Align Offset is Hardcoded Per Close Button Size

**File:** `Modal.module.css` line 140

```css
.header[data-header-align='center'] .headerContent {
  padding-left: calc(var(--Spacing-4-5) + var(--Spacing-3));
}
```

The offset duplicates the close button width (`Spacing-4-5`) plus gap (`Spacing-3`). If the close button size changes (which will happen when #1 swaps to `IconButton`, default size 10 = 40px not 24px), the center alignment breaks visually. Should derive from a shared `--_modal-close-width` variable defined on `.popup`.

---

### 16. Scroll Listener Misses Content Size Changes

**File:** `Modal.tsx` lines 110–116

`useEffect` adds a scroll listener but does not observe content size changes. If body content loads asynchronously (data fetch, image render, lazy component), the divider state computed on mount is stale.

**Fix:** Add `ResizeObserver` for the body element to re-run `handleScroll` on size changes.

---

### 17. `<div role="separator">` Should Be `<hr>`

**File:** `Modal.tsx` lines 187 and 196

```tsx
{showTopDivider && <div className={styles.divider} role="separator" />}
```

`<hr>` is natively semantic, requires no role, and is the correct element for a thematic break.

---

### 18. `Interactive` Play Function Is Incomplete

**File:** `Modal.stories.tsx` line 582

```ts
play: async ({ canvasElement }: any) => {
  ...
  await userEvent.click(trigger);
  // ← never asserts the modal is visible
}
```

As a visual regression guard this provides no signal. Add:
```ts
await waitFor(() => {
  expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
});
```

---

### 19. Stories Don't Demonstrate `<ModalTrigger>` Pattern

**File:** `Modal.stories.tsx`, `Modal.showcase.tsx`

Both files export `ModalTrigger` and `ModalClose` (lines 218–219 of `Modal.tsx`) but no story uses them. Every story controls `open` state with `useState`. The trigger pattern is the recommended Base UI usage — at least one story should demonstrate it for documentation purposes.

---

### 20. `appearanceClassMap` Has 11 Entries But Stories List Only 9 Roles Initially

**File:** `Modal.shared.ts` line 7 (JSDoc) vs `Modal.tsx` line 26 (code)

JSDoc says "9 roles per Figma spec" but `appearanceClassMap` (and the CSS) supports all 11 canonical roles. The TypeScript type is `ComponentAppearance` (full 11). This is fine — but the JSDoc comment should be updated so it doesn't read like a constraint:

```ts
// Replace:
* appearance: auto | neutral | primary | secondary | sparkle | negative | positive | warning | informative
// With:
* appearance: full canonical 11-role ComponentAppearance set. Figma spec only enumerates 9; the extra 2 (tertiary, quaternary) are surfaced for API consistency.
```

---

## What Is Done Well

- ✓ Uses `BaseDialog` headlessly — no forking of primitive behavior
- ✓ All Base UI sub-components composed correctly (`Root`, `Portal`, `Backdrop`, `Popup`, `Title`, `Description`, `Close`)
- ✓ Token usage is comprehensive — `Surface-Elevated`, `Scrim`, `Border-Subtle`, `Z-Index-Modal` all resolve correctly
- ✓ Intermediate CSS variable pattern (`--_modal-bg`, `--_modal-radius`) is correct and overridable via `--Modal-*` boundary
- ✓ Typography uses role-specific tokens (`--Title-M-*`, `--Body-S-*`) — RFC compliant
- ✓ Animation uses Base UI's `data-starting-style` / `data-ending-style` pattern — correct v1 approach
- ✓ Scroll listener uses `{ passive: true }` and is cleaned up on unmount
- ✓ `dismissible` correctly maps to `disablePointerDismissal`
- ✓ `useModalState` separation makes the component logic testable
- ✓ `Modal.showcase.tsx` reused by both Storybook and platform docs — matches established pattern
- ✓ `index.shared.ts` properly separates type-only exports for React Native consumers
- ✓ Registered correctly in `componentRegistry.ts` with both PascalCase name and slug
- ✓ `BaseDialog.Title` / `BaseDialog.Description` used for semantic markup, not raw `<h2>`/`<p>`
- ✓ `BaseDialog.Close` used for the close button (correctly tied to the dialog state)
- ✓ Focus halo uses `--Surface-Halo-Gap` correctly (even if the implementation belongs in IconButton)
- ✓ Token manifest declares correct `locked` + `lockReason` on `scrimColor` and typography tokens
- ✓ `dismissible`, `defaultOpen`, `open`/`onOpenChange` controlled/uncontrolled pattern is correct

---

## Quality Gates To Run After Fixes

```bash
pnpm check:literals     # Should remain green after token fixes
pnpm validate:tokens    # After #2 fix
pnpm check:metadata     # After #5 fix — currently blocks on slot drift
pnpm typecheck          # After #3, #4, #6 type additions
pnpm test               # After #12 — coverage ≥90%
pnpm test:a11y          # Zero critical violations
pnpm check:parity       # When native counterpart is added
pnpm chromatic          # Visual regression
```

---

## Priority Summary

| # | Severity | Issue | Effort |
|---|---|---|---|
| 1 | 🔴 Blocking | Close button must use `<IconButton>` | M |
| 2 | 🔴 Blocking | `--Dialog-Height-*` used as modal widths | XS |
| 3 | 🔴 Blocking | No accessible name fallback when header hidden | S |
| 4 | 🔴 Blocking | `onOpenChange` drops Base UI event details | S |
| 5 | 🔴 Blocking | Slot system violates RFC 0001 (3 sub-issues) | M |
| 6 | 🟡 Should fix | 7 Base UI props not exposed (focus, container, etc.) | M |
| 7 | 🟡 Should fix | Recipe references non-existent token | XS |
| 8 | 🟡 Should fix | Token manifest category count off | XS |
| 9 | 🟡 Should fix | Cannot disable Escape key dismissal | XS |
| 10 | 🟡 Should fix | `footer` + `footerContent` coupling undocumented | XS |
| 11 | 🟡 Should fix | Design-time props have no runtime effect — undocumented | XS |
| 12 | 🟡 Should fix | No accessibility tests despite the claim | M |
| 13 | 🔵 Minor | Dialog component already exists — clarify relationship | XS |
| 14 | 🔵 Minor | `--Dialog-Header-MinHeight` token reference unclear | XS |
| 15 | 🔵 Minor | Center-align offset hardcoded to close button size | XS |
| 16 | 🔵 Minor | Scroll listener misses content size changes | S |
| 17 | 🔵 Minor | `<div role="separator">` → `<hr>` | XS |
| 18 | 🔵 Minor | `Interactive` play function never asserts modal opened | XS |
| 19 | 🔵 Minor | No story demonstrates `<ModalTrigger>` pattern | XS |
| 20 | 🔵 Minor | JSDoc says "9 roles" but API surfaces 11 | XS |

---

## Base UI Alignment — Verdict

**Headless contract preserved:** ✅ The Modal correctly uses `BaseDialog.Root`, `BaseDialog.Portal`, `BaseDialog.Backdrop`, `BaseDialog.Popup`, `BaseDialog.Title`, `BaseDialog.Description`, `BaseDialog.Close` as composable primitives. No forking of behavior, no internal state duplication for what Base UI already handles (open state, focus trap, scroll lock, escape handling are all delegated).

**Capability exposed:** ⚠️ Partial. The wrapper hides legitimate Base UI features (issues #4, #6, #9). These are not bugs — they are scope decisions — but production consumers will hit them within weeks. Better to expose them now with `@public` JSDoc than to add them piecemeal under pressure.

**Render-prop pattern:** ❌ Not used. The close button manually replicates IconButton CSS instead of using `<BaseDialog.Close render={<IconButton ... />} />` (issue #1). The render-prop pattern is already established in `Tooltip.tsx:170,193` and is the canonical way to compose styled design system components into Base UI primitives.
