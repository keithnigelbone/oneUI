# Design System Audit

Date: 2026-04-20

## Scope

This was a scoped first-pass audit of:

- `packages/ui`
- the multi-brand styling engine around `useBrandCSS`
- the platform bridge paths most directly responsible for brand CSS generation and injection

This was not a full audit of every `apps/platform` consumer.

## Verification Notes

- I ran a targeted verification on `Stepper` to confirm an API/behavior mismatch.
- I did not run the full monorepo test suite.
- The targeted `Stepper` run showed `20` passing tests and `1` failing test, confirming drift between implementation and expectations.

## Executive Summary

The overall direction is strong. The design system has a good architectural foundation: Base UI wrappers instead of primitive forks, a shared engine separated from the React bridge, a meaningful surface-context model, and a registry/meta/token-manifest strategy that can scale.

The biggest issues are not foundational mistakes. They are mostly consistency, contract, and scaling problems:

1. repeated brand CSS generation work in multi-brand flows
2. public API drift in some components, especially `Stepper`
3. slot-system vocabulary drift across components and metadata
4. uneven stories/tests coverage for a few important primitives
5. metadata and benchmark/documentation drift that weakens trust in tooling

If the goal is "world class", the next phase should focus less on inventing new patterns and more on tightening contracts, reducing duplicated work, and making the docs/metadata/test layers impossible to drift apart.

## Prioritized Findings

### 1. High: Sub-brand rendering multiplies the full brand-CSS pipeline

Affected files:

- `packages/ui/src/components/ExperienceCanvas/ArtboardSubBrandStyleTags.tsx`
- `packages/ui/src/hooks/useBrandCSS.ts`

What is happening:

- `ArtboardSubBrandStyleTags` creates one `SubBrandStyleChunk` per active sub-brand.
- Each chunk calls `useBrandCSS`.
- Each chunk then scopes, regex-rewrites, and injects a separate stylesheet.

Why this matters:

- This turns one brand-CSS pipeline into `N` full pipelines for `N` sub-brands.
- CPU cost, string churn, and style-tag count all grow with the number of active frame variants.
- For a multi-brand authoring tool, this is the most important performance risk in the audited surface.

Improvement direction:

- cache brand CSS by foundation hash + theme + sub-brand delta
- emit smaller delta patches instead of full scoped CSS per sub-brand
- reduce post-generation regex/string rewriting where possible

Key evidence:

- `packages/ui/src/components/ExperienceCanvas/ArtboardSubBrandStyleTags.tsx`
- `packages/ui/src/hooks/useBrandCSS.ts`

### 2. High: `Stepper` has a broken or misleading public API contract

Affected files:

- `packages/ui/src/components/Stepper/Stepper.tsx`
- `packages/ui/src/components/Stepper/Stepper.shared.ts`
- `packages/ui/src/components/Stepper/Stepper.meta.ts`
- `packages/ui/src/components/Stepper/Stepper.test.tsx`

What is happening:

- `Stepper` exposes `slots`, `formatValue`, and `parseValue` in its public props.
- Those props are destructured but not implemented in the render path.
- The test suite expects `appearance="auto"` to resolve to `primary`, while implementation resolves to `secondary`.

Why this matters:

- This is exactly the kind of contract drift that erodes trust in a design system.
- Consumers, docs, tests, and generated metadata no longer describe the same behavior.
- This is more dangerous than a simple bug because it creates uncertainty in the public API.

Improvement direction:

- either implement `slots`, `formatValue`, and `parseValue` fully
- or remove/deprecate them immediately
- align implementation, tests, Storybook docs, and metadata around one `auto` resolution rule

Verification:

- targeted run of `Stepper.test.tsx`
- result: `20` passing, `1` failing
- failing expectation: test expects `data-appearance="primary"` while runtime resolves to `secondary`

### 3. High: The platform bridge still fans out more live styling work than ideal

Affected files:

- `apps/platform/src/components/FoundationStyleProvider.tsx`

What is happening:

- separate subscriptions exist for editing brand, injection brand, and platform brand
- component overrides are also queried separately
- Convex deduplication helps only when IDs happen to match

Why this matters:

- The architecture is optimized for correctness and flexibility, but not yet fully optimized for world-class scaling in multi-brand authoring scenarios.
- Worst-case screens can still pay for multiple live foundation streams at once.

Improvement direction:

- consider a single batched style-bundle query for the shell
- reduce provider-level subscription fan-out
- measure and track the worst-case "3 brand IDs all different" path

### 4. Medium-High: The slot system is conceptually sound but operationally inconsistent

Affected files:

- `packages/shared/src/types/componentMeta.ts`
- `packages/ui/src/components/Button/Button.meta.ts`
- `packages/ui/src/components/Slider/Slider.meta.ts`
- `packages/ui/src/components/TouchSlider/TouchSlider.shared.ts`
- `packages/ui/src/components/Stepper/Stepper.shared.ts`
- `packages/ui/src/components/ChatComposer/ChatComposer.shared.ts`
- `packages/ui/src/components/Platform/TopBar/TopBar.shared.ts`

What is happening:

- "slot" currently describes several different concepts:
  - content slots like `start` and `end`
  - primitive part props like `slotProps`
  - editor metadata via `SlotDescriptor`
- naming varies across components:
  - `start` / `end`
  - `startSlot` / `endSlot`
  - `leading` / `trailing`
  - `centerSlot` / `rightSlot`

Why this matters:

- This makes the system harder to teach, harder to document, and harder to scale across tooling.
- The problem is not rendering quality. The problem is vocabulary drift and inconsistent public semantics.

Improvement direction:

- standardize `start` / `end` for common content slots
- reserve layout-specific names like `leading` / `trailing` for composite components where directionality is the real concept
- stop overloading "slot" for Base UI internal part overrides
- consider renaming internal override APIs to `parts` or another clearer term

### 5. Medium-High: Metadata does not always match the real public API

Affected files:

- `packages/ui/src/components/TouchSlider/TouchSlider.meta.ts`
- `packages/ui/src/components/TouchSlider/TouchSlider.shared.ts`
- `packages/ui/src/components/Stepper/Stepper.meta.ts`
- `packages/ui/src/components/ComponentTokenEditor/AdvancedEditor/ComponentDocsPanel.tsx`

What is happening:

- `TouchSlider` publicly supports `startSlot` and `endSlot`, but metadata says `slots: []`
- `Stepper` metadata does not reflect its richer override surface
- docs/editor UI trust `ComponentMeta.slots` as truth

Why this matters:

- Once metadata becomes unreliable, every system built on top of it becomes partially unreliable:
  - docs
  - property panels
  - AI context
  - editor scaffolding

Improvement direction:

- add a CI-level metadata audit for public props vs `ComponentMeta`
- make component metadata part of the public contract, not optional documentation

### 6. Medium: `useBrandCSS` performs full validation in the client render pipeline

Affected files:

- `packages/ui/src/hooks/useBrandCSS.ts`
- `packages/shared/src/engine/validateBrandCSS.ts`

What is happening:

- `validateBrandCSS()` runs inside the theme-dependent memo path
- the validator scans declarations, required tokens, interdependencies, and value validity

Why this matters:

- Structural validation is good, but full validation inside the client hot path adds cost exactly where the system promises reactive styling.
- This is more noticeable once the number of brands, sub-brands, or recomputation triggers increases.

Improvement direction:

- move full validation to server precompute, publish, or CI paths
- keep only lightweight runtime checks if necessary
- or memoize validation by final CSS hash

### 7. Medium: Coverage is uneven for important primitives and exported components

Affected areas:

- `packages/ui/src/components/Surface`
- `packages/ui/src/components/SegmentedControl`
- overlay primitives such as `Dialog` and `Popover`

What is happening:

- `Surface` has no co-located story or test file in its component folder
- `SegmentedControl` has tests but no Storybook story
- some exported overlay primitives are test-heavy but story-light

Why this matters:

- `Surface` is central to the surface-context system and deserves explicit protection
- Storybook is part of the product surface here, not just a developer convenience

Improvement direction:

- add `Surface` stories and tests first
- add Storybook coverage for `SegmentedControl`
- ensure exported primitives have at least one meaningful visual contract story

### 8. Medium-Low: Benchmarking and documentation still carry stale architecture language

Affected files:

- `packages/shared/src/engine/benchmark.ts`
- `packages/shared/src/engine/precompute.ts`
- `packages/ui/src/engine/computeNewStacking.ts`

What is happening:

- benchmark and precompute comments still reference older V4 terminology or flows
- benchmark guidance does not fully match the active client execution path

Why this matters:

- stale architecture language increases onboarding time
- performance work becomes less precise because people measure the wrong abstraction

Improvement direction:

- align benchmark docs and function references with the active "new" pipeline
- ensure the measured path matches what actually runs in `useBrandCSS`

## Slot System Assessment

## What Is Strong

- the core composition pattern is good: explicit `ReactNode` content slots, not magical composition
- `Tabs`, `ListItem`, `Input`, and `ChatComposer` show healthy composition over configuration
- `Input` has a justified special case with `start2` and `end2`
- metadata-backed documentation is the right long-term direction

## What Is Confusing

- the same word "slot" means different things in different layers
- names drift across very similar components
- metadata does not always reflect the real slot surface
- internal primitive override points and content regions are not clearly separated conceptually

## What Should Be Standardized

- `start` / `end` as the default public content-slot vocabulary
- explicit exception rules for composite layout components
- a separate naming scheme for primitive internal overrides
- CI validation for props vs metadata vs stories

## Component Architecture Assessment

Overall assessment: good foundation, not yet fully hardened.

What is working well:

- strong Base UI wrapping discipline
- component APIs generally remain thin
- shared engine vs UI bridge separation is a strong architectural choice
- surface-context-aware styling is differentiated and valuable
- token-only styling direction is correct for a multi-brand system

What needs hardening:

- API contract discipline
- public naming consistency
- metadata accuracy
- coverage consistency
- multi-brand runtime scaling under repeated variation

## Coverage and Operational Readiness

Observed gaps from the audited surface:

- `Surface` is critical but lacks co-located stories/tests
- `SegmentedControl` lacks Storybook coverage
- some overlay components are not represented in Storybook despite being exported primitives

Recommendation:

- define a minimum support matrix for exported components:
  - implementation
  - metadata
  - tests
  - story
  - registry entry if editor-facing

## Strengths Worth Preserving

- Base UI wrapper approach
- shared engine in `@oneui/shared`
- `useStyleInjection` and anti-FOUC bridge pattern
- surface-context architecture via `Surface` + token remapping
- registry/meta/token-manifest direction

These are all strategically correct and should be preserved while tightening the rough edges.

## Recommended Priority Order

### P0

- reduce repeated CSS generation for sub-brand rendering
- fix `Stepper` public contract drift
- define and publish slot-system naming rules

### P1

- add `Surface` stories/tests
- align metadata with actual public props across audited components
- reduce subscription fan-out in styling/provider flows

### P2

- clean benchmark/doc naming drift
- add CI checks for metadata, docs, and API consistency
- expand visual coverage for exported primitives

## Suggested Team Validation Questions

Use these with the team when reviewing the audit:

1. Do we want `ComponentMeta` to be treated as a strict source of truth, or only best-effort documentation?
2. Should content slots and primitive part overrides use different terminology across the system?
3. Is sub-brand rendering expected to scale to many simultaneous frames, or only a few at a time?
4. Do we want to support the full `Stepper` override/formatting API, or simplify it now before wider adoption?
5. Which exported primitives should be mandatory Storybook citizens?

## Closing Assessment

This design system is already architected better than many component libraries because it has a real multi-brand model, a serious token strategy, and a thoughtful styling engine.

The biggest gap is not architectural imagination. It is architectural discipline at the contract edges:

- one source of truth
- one vocabulary
- one measured runtime path
- one reliable coverage standard

If those are tightened, the system can move much closer to the "world class" bar you are aiming for.