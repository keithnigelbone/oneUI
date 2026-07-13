# Platform Component + Token Audit — 2026-05-14

Scope: platform component section, component edit mode, Convex-backed component token pipeline, package component contracts, generated docs, and Storybook/component coverage.

## Executive Summary

The core token layer is healthy, but the end-to-end component pipeline is not fully consistent yet.

- `pnpm validate:tokens` passes: 484 defined tokens, 177 references, all resolved.
- `pnpm check:spacing-tokens` passes: source CSS is mostly on numeric `--Spacing-*` tokens.
- The component editor still generates old T-shirt spacing token options in `ComponentTokenEditorContext.tsx`, so the UI can present/persist values that the source-code spacing gate does not catch.
- Component package coverage is incomplete: `pnpm audit:component-files` reports 40 fully standard components out of 72, with 25 missing required files and 7 exempt.
- Metadata/docs/catalog synchronization is failing across multiple gates, meaning platform, generated docs, registry, and Storybook are drifting.
- The component editor and component docs pages still use many legacy typography/surface aliases and raw controls around DS previews.

## Gate Results

| Gate | Result | Notes |
| --- | --- | --- |
| `pnpm validate:tokens` | Pass | Core token graph resolves. |
| `pnpm check:spacing-tokens` | Pass | Numeric spacing token check passed over 2354 files. |
| `pnpm check:literals` | Fail | 1 hard-coded literal: `packages/ui/src/components/Platform/Shell/Shell.module.css` uses `1200px`. |
| `pnpm check:legacy-tokens` | Pass lenient | Lenient mode only scans styled component set. |
| `pnpm exec tsx scripts/check-legacy-tokens.ts --strict` | Fail | 1467 legacy V1/V3 references in styled components. |
| `pnpm audit:component-files` | Fail | 40/72 fully standard; 25 components missing required files. |
| `pnpm check:metadata` | Fail | Modal/Text meta drift from public props. |
| `pnpm check:jio-alpha-catalog` | Fail | 21 missing slug-map entries reported. |
| `pnpm check:machine-docs-fresh` | Fail | 15 generated docs drifts/missing files. |
| `pnpm docs:machine:check` | Fail | Generated component docs/meta are stale. |
| `pnpm check:support-matrix` | Fail | ChatComposer and Modal missing matrix artifacts. |
| `pnpm check:layers` | Pass | Layer import/order check passes. |
| `pnpm check:parity` | Fail | Native parity not yet implemented for most web components. |

Note: commands emitted Node engine warnings because this shell is on Node `18.20.8` while the repo requests Node `>=20.0.0`.

## Main Findings

### 1. Component edit mode still exposes old spacing naming

`apps/platform/src/design-tools/ComponentTokenEditor/ComponentTokenEditorContext.tsx` still uses T-shirt spacing ordering and fallback generation:

- `SIZE_ORDER` is keyed by `6XS` through `15XL`.
- `generateSpacingTokens()` returns `Spacing-0-5` through `Spacing-40` when foundation data is absent.
- When `foundationData.spacing.config.scale` exists, it sorts arbitrary scale keys by that same T-shirt order and emits `Spacing-${step}`.

This is the clearest gap from the spacing refactor. The source CSS can pass the numeric spacing gate while the editor still presents legacy token choices.

Expected direction:

- spacing editor options should come from the canonical numeric token list (`Spacing-0`, `Spacing-0-5`, `Spacing-1`, ..., `Spacing-40`, plus `Spacing-Margin`/`Spacing-Gutter` where appropriate);
- persisted old values should be normalized through the existing alias mapping before saving or generating override CSS;
- labels may show friendly values, but token IDs should be numeric.

### 2. DS-first preview is partial, but editor chrome is not DS-first

The actual preview cells often render package DS components (`Button`, `Avatar`, `Checkbox`, `Radio`, etc.), and `ButtonEditorCanvas` renders the DS `Button` directly.

But editor chrome still contains raw controls:

- ComponentTokenEditor: 28 raw `<button>/<select>/<input>/<textarea>` matches in 13 files.
- Highest hotspots: `DecorationSection.tsx`, `EditorToolbar.tsx`, `PropertyPanel.tsx`, `ActionsMenu.tsx`, `GranularTargetSelector.tsx`, `TokenSelector.tsx`.

This means the editor is not consistently validating the design system against itself. Raw controls may be acceptable for invisible infrastructure, but visible editor UI should prefer DS primitives such as `Button`, `IconButton`, `Select`, `SegmentedControl`, `Switch`, and `Surface`.

### 3. Legacy surface/text aliases are still heavy in platform editor and docs

Quick source scan:

- ComponentTokenEditor: 271 legacy surface/text alias matches in 25 files.
- Component docs pages: 209 legacy surface/text alias matches in 43 files.
- UI package components/stories: 2638 legacy surface/text alias matches in 162 files.

The strict legacy-token gate reports 1467 references in styled components, concentrated in core components such as Button, Stepper, SingleTextButton, Chip, IconButton, ListItem, Input, and SelectableButton.

Impact: multi-brand and nested surface previews can behave differently depending on whether a component references unified role tokens first or falls back to legacy aliases.

Expected direction:

- component CSS should prefer `--Primary-Bold`, `--Primary-Subtle`, `--Primary-High`, `--Primary-Bold-High`, `--Primary-TintedA11y`, etc.;
- use fallbacks only as a transitional compatibility layer;
- platform docs/editor pages should avoid `--Text-*`, `--Surface-*`, and legacy typography aliases in new code.

### 4. Typography token migration is incomplete in platform docs/editor surfaces

Quick source scan:

- ComponentTokenEditor: 14 legacy typography alias matches.
- Component docs pages: 199 legacy typography alias matches in 38 files.
- UI package components/stories: 274 legacy typography alias matches in 47 files.

The biggest platform docs hotspots include `preview-card/page.tsx`, `separator/page.tsx`, `IconPageContent.tsx`, `RadioPageContent.tsx`, `IconContainedPageContent.tsx`, `form/page.tsx`, and `CheckboxPageContent.tsx`.

Expected direction: every visible text style should use role-specific typography tokens with paired line-height and `--Typography-Font-Primary`.

### 5. Storybook/package artifact coverage is incomplete

`pnpm audit:component-files` reports:

- 72 total components.
- 40 fully standard.
- 25 missing required files.
- 7 exempt.

High-impact missing stories/tests/shared artifacts:

- Missing stories: Accordion, ChatSurface, CheckboxGroup, Collapsible, Dialog, Fieldset, Form, Link, Menu, Meter, NavigationMenu, NumberField, Popover, PreviewCard, Progress, ScrollArea, SegmentedControl, Separator, Toast, Toggle, ToggleGroup, Toolbar.
- Missing tests: ChatSurface, Fieldset, Form, Meter, NavigationMenu, PreviewCard, ScrollArea, Toast, Toolbar.
- Missing shared files: SegmentedControl and Surface are notable because they are contract-level components.

### 6. Registry, catalog, metadata, and docs are out of sync

Failing checks show this is an end-to-end pipeline issue:

- `check:metadata`: Modal lists `body` slot not present in `ModalProps`; Text meta lists `variant` and `size` not present in `TextProps`.
- `check:jio-alpha-catalog`: 21 alpha components reported as missing slug-map entries.
- `check:machine-docs-fresh` / `docs:machine:check`: generated docs are stale or missing, including SingleTextButton docs and generated docs for CircularProgressIndicator, IconButton, Spinner, Text.
- `check:support-matrix`: ChatComposer lacks meta/tokens/recipe/schema; Modal lacks schema registration.

This affects platform docs, Storybook discoverability, generated machine docs, and AI/AST composition because each reads a slightly different registry contract.

## Remediation Order

1. Fix the component editor spacing source of truth.
   Replace T-shirt spacing option generation with canonical numeric spacing options, add normalization for old persisted values, and add a regression test around `generateTokenOptionsFromFoundation(..., 'spacing')`.

2. Bring the pipeline gates back to green in this order:
   `check:metadata`, `docs:machine`, `check:machine-docs-fresh`, `check:jio-alpha-catalog`, `check:support-matrix`.

3. Convert visible component editor chrome to DS primitives.
   Start with `EditorToolbar`, `DecorationSection`, `ActionsMenu`, `GranularTargetSelector`, `TokenSelector`, and `PropertyPanel`.

4. Migrate platform component docs pages from legacy typography/surface aliases.
   Use role-specific typography tokens and unified role color tokens. Prioritize pages that users see in the component section.

5. Triage strict legacy token findings component-by-component.
   Begin with components most used in multi-brand previews: Button, IconButton, Chip, Input, ListItem, Stepper, SingleTextButton, SelectableButton.

6. Fill Storybook/test gaps for supported alpha components first, then experimental components.
   The component cannot be considered end-to-end ready until implementation, metadata, docs, Storybook, and platform editor all agree.

## Current Risk Assessment

The design system itself is directionally sound, but the platform does not yet enforce one consistent component/token contract across editing, docs, generated metadata, and stories. The largest practical risk is not that tokens fail to resolve; it is that the editor can discover or persist legacy choices while the component package and Storybook are moving toward newer numeric spacing and role-explicit surface/typography tokens.
