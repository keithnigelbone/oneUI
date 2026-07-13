# DCA Playground Agent Setup

Last audited: 2026-05-18

## Executive Summary

The Design Composition Agent playground currently has a reliable transport and validation path for generating TSX into Sandpack, but it does not yet have a strong visual-quality loop.

That distinction matters:

- `TSX · Model · Clean 100` means the generated code parsed, used allowed imports/components, avoided banned tokens/literals after deterministic repair, and passed the strict render gate.
- It does not mean the screen is visually good, on-brand, well-composed, or faithful to the requested product pattern.

The poor Settings example is therefore not surprising from the current architecture. The system can produce valid React using OneUI components while still choosing terrible hierarchy, oversized icons, weak layout structure, and non-product-like composition. The missing piece is not another syntax validator; it is a visual design loop with pattern grounding, rendered screenshot critique, and automatic repair before the result is shown as successful.

## Model And Provider

The default model is centralized in:

- `packages/shared/src/agent/models.ts`

Current value:

```ts
export const CLAUDE_MODEL = 'claude-sonnet-4-6' as const;
export const CLAUDE_VISION_MODEL = CLAUDE_MODEL;
```

The platform calls Anthropic through the Vercel AI SDK:

- Provider package: `@ai-sdk/anthropic`
- Runtime package: `ai`
- Executor import: `anthropic(selectedModel)` in `apps/platform/src/app/api/agent/executors/design.ts`

The selected model is:

```ts
const selectedModel = modelId || DEFAULT_MODEL;
```

So unless the request body passes `model`, DCA uses `claude-sonnet-4-6`.

## Frontend Entry Point

Main playground page:

- `apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/page.tsx`

The playground uses:

- `useAgentChat({ mode: 'design' })`
- `renderer` to choose AST vs Sandpack TSX mode
- `context` such as `mobile-app`
- `useReferences` to include reference retrieval
- revision payloads when iterating on an existing canvas selection

The request goes to:

- `apps/platform/src/app/api/agent/route.ts`

That route dispatches by `mode`:

```ts
case 'design':
  return handleDesign(body);
```

The unified `/api/agent` route currently has:

```ts
export const maxDuration = 120;
```

## Backend Generation Flow

Main executor:

- `apps/platform/src/app/api/agent/executors/design.ts`

High-level flow:

1. Extract the last user message.
2. Resolve context, vertical, brand config, rules, skills, references, and optional DESIGN.md.
3. If hybrid RAG is enabled and `brandId` exists, retrieve relevant rules/references.
4. Compile the rule prompt with `compileCompositionRules`.
5. In Sandpack mode, compile as TSX, not AST:

```ts
outputFormat: useCode ? 'tsx' : 'ast'
```

6. Build the TSX system prompt with `buildTSXSystemPrompt`.
7. Stream the model response with `streamText`.
8. Extract the latest TSX fenced block or partial TSX.
9. Deterministically repair common strict-gate issues.
10. Annotate JSX with `data-oneui-loc`.
11. Validate TSX.
12. Emit `data-composition-code` into the chat stream.

Important timeouts:

```ts
const DESIGN_GENERATION_TIMEOUT_MS = 75_000;
const DESIGN_REPAIR_TIMEOUT_MS = 25_000;
```

In TSX mode, the executor no longer sends visual reference images as multimodal input:

```ts
const MAX_CODE_REFERENCE_IMAGE_BLOCKS = 0;
```

This was done because the multimodal request path was a major contributor to timeout/fallback behavior. References are still emitted and included as text/context, but the TSX call itself is text-only for reliability.

## Prompt Construction

Core files:

- `packages/shared/src/engine/compositionCompiler.ts`
- `packages/shared/src/engine/compositionCodePrompt.ts`
- `packages/shared/src/engine/compositionSeedRules.ts`
- `packages/shared/src/meta/storyExemplars.generated.ts`

`compileCompositionRules` builds the design-system rule prompt from:

- seed rules or brand-specific rules
- brand config
- component reference text
- brand summary
- active skills
- composition context
- references
- optional Storybook exemplars

In TSX mode, AST/JSON output instructions are stripped:

```ts
function stripASTOnlySections(prompt: string): string {
  const astSectionIndex = prompt.indexOf('\n## AST Output Format');
  const next = astSectionIndex >= 0 ? prompt.slice(0, astSectionIndex) : prompt;
  return next
    .replace(/\n?- Output ONLY valid JSON, no markdown, no explanation/g, '')
    .replace(/\n?Output ONLY the JSON AST\./g, '');
}
```

`buildTSXSystemPrompt` adds:

- allowed imports
- allowed OneUI playground components
- allowed semantic icon names
- forbidden raw literals
- local image registry
- bottom-nav safe-area rules
- surface context rules
- strict render gate warnings
- Storybook prop exemplars

## Sandpack Runtime

Main files:

- `packages/ui/src/playground/template.ts`
- `packages/ui/src/playground/entry.tsx`
- `apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/SandpackCanvas.tsx`
- `apps/platform/src/app/internal/render-code/RenderCodeClient.tsx`

`buildPlaygroundFiles` creates Sandpack virtual files:

- `/App.tsx`
- `/index.tsx`
- `/foundation.css`
- `/oneui-bundle.css`
- `/node_modules/@oneui/playground/index.mjs`
- local public image assets
- optional Jio icon catalog

The playground bundle is built from `packages/ui/src/playground/entry.tsx` and copied to:

- `apps/platform/public/sandpack/oneui-playground.mjs`
- `apps/platform/public/sandpack/oneui-playground.css`

Rebuild command:

```bash
pnpm --filter @oneui/ui build:playground
```

## Local Image Setup

Shared registry:

- `packages/shared/src/engine/playgroundImageAssets.ts`

Public assets:

- `apps/platform/public/playground-assets/images/ecommerce-hero.svg`
- `apps/platform/public/playground-assets/images/product-card-1.svg`
- `apps/platform/public/playground-assets/images/product-card-2.svg`
- `apps/platform/public/playground-assets/images/product-card-3.svg`
- `apps/platform/public/playground-assets/images/lifestyle-1.svg`
- `apps/platform/public/playground-assets/images/finance-card.svg`
- `apps/platform/public/playground-assets/images/media-card.svg`
- `apps/platform/public/playground-assets/images/placeholder.svg`
- `apps/platform/public/playground-assets/images/manifest.json`

Loader:

- `apps/platform/src/lib/playgroundPublicFiles.ts`

The loader mirrors assets into Sandpack as both:

- `/public/playground-assets/images/...`
- `/playground-assets/images/...`

The playground Image export also resolves local asset URLs back to the parent platform origin when running inside the cross-origin Sandpack iframe:

- `packages/ui/src/playground/entry.tsx`

## Validator And Repair Gate

Main validator:

- `packages/shared/src/engine/compositionCodeValidator.ts`

The validator checks:

- TSX parses
- default export exists
- imports are only `react` and `@oneui/playground`
- PascalCase components are in the playground allowlist
- root Surface exists
- Surface modes are valid
- raw colors/dimensions/numeric style values are rejected
- legacy token aliases are rejected
- typography token pairing exists when text styles set font size
- raw SVG icons are rejected
- unknown semantic icons are rejected
- image URLs are local registry URLs or accepted legacy placeholder
- manual background containers around interactive controls are rejected
- unsupported `fullWidth` props are rejected

Deterministic repair currently handles:

- legacy token aliases
- V4 surface/text aliases
- image placeholder/remote/unknown URLs
- missing image alt text
- raw section layout containers converted to OneUI layout primitives
- manual background containers converted to Surface
- unsupported `fullWidth`
- unitless numeric styles
- common raw dimensions such as `160px`, `180px`, `390px`
- numeric string styles such as `zIndex: "10"`
- raw `rgba()` shadows converted to elevation tokens

This gate is necessary, but it is not a visual-quality gate.

## Chat Card Metadata

Composition code parts include:

```ts
source?: 'model' | 'stream-partial' | 'fallback';
promptSize?: number;
durationMs?: number;
fallbackReason?: string;
```

The UI label maps these as:

- `Model`: normal model output passed the gate.
- `Recovered`: partial stream was salvaged and repaired.
- `Fallback`: validator-safe fallback TSX was shown instead of model output.

Important: `Model · Clean 100` still only means code validity, not design quality.

## Why The UI Can Still Be Poor

The current system asks a general-purpose model to write full UI TSX directly from a large prompt. That is not enough to guarantee good product UI.

The Settings screenshot exposes several current gaps:

1. **No visual design acceptance gate**
   The server validates TSX semantics, not the rendered screenshot. A huge notification icon can pass if it uses allowed components/tokens.

2. **No automatic screenshot critique and repair loop**
   The playground can render and verify, but generation is not blocked on a visual score. The result is shown as successful once TSX validation passes.

3. **No screen-pattern templates**
   A Settings screen should come from a known mobile settings recipe: app bar, account card, grouped list sections, rows with leading icons and trailing toggles, restrained icon scale, bottom safe area. Today the model improvises.

4. **Component allowlist is too broad without composition contracts**
   `Icon`, `Surface`, `Container`, and `Grid` are legal, but the prompt does not enforce how they should combine for each archetype.

5. **Icon scale is not constrained strongly enough**
   The screenshot has oversized symbolic icons because the validator does not yet reject giant decorative icons, icon-only hero sections, or icons that dominate a functional settings screen.

6. **Reference retrieval is advisory, not binding**
   References are shown and can enter prompt context, but the model is not forced to copy the structure of the closest reference or choose a known recipe.

7. **Storybook exemplars are prop hints, not full screen examples**
   They teach component props, not full product page composition.

8. **No design rubric score is tied to pass/fail**
   There is no required minimum for hierarchy, density, product realism, surface use, viewport fit, or component appropriateness.

9. **The “clean 100” label is misleading**
   It reads like a quality score but is only a validator score. It should be renamed or paired with a separate visual score.

## What Is Missing For Consistently Good UI

The next phase should add a real design-quality pipeline:

### 1. Intent Classification

Before TSX generation, classify the prompt into an archetype:

- settings screen
- e-commerce home
- product listing
- checkout
- login/auth
- media home
- finance dashboard
- profile/account
- notification/preferences
- onboarding

The archetype should select allowed recipes, required sections, and forbidden patterns.

### 2. Recipe-First Generation

Instead of asking the model to invent a screen from scratch, provide a canonical TSX recipe for each archetype.

For Settings:

- root `Surface`
- fixed-width mobile `Container`
- compact app bar
- account summary card
- section heading
- grouped setting rows
- leading icon max size
- trailing controls
- no decorative oversized icon sections
- bottom safe area

The model should fill copy/content and minor variations, not invent structure.

### 3. Visual Screenshot Gate

After rendering the Sandpack output, run automated visual checks:

- viewport overflow
- clipped content
- giant icons or images
- empty-looking sections
- overlapping pinned/selection overlays
- excessive whitespace
- missing expected sections
- no component larger than a defined viewport percentage unless it is an image hero
- minimum/maximum number of controls for the archetype

This should produce a separate `visualScore`.

### 4. Vision Critique Loop

Use the vision-capable model on the rendered screenshot:

- score hierarchy, surface use, brand fit, realism, density, accessibility
- identify the top 3 visual defects
- send a targeted repair prompt with the screenshot critique
- repeat up to a bounded limit

Do not display as successful until the screenshot score passes threshold.

### 5. Stronger Validator Rules

Add hard validator checks for:

- `Icon` size/style larger than allowed thresholds in functional screens
- icon-only large hero areas unless the archetype allows it
- raw `width`/`height` on icons that dominate screen space
- settings rows not using row-like layout
- missing section grouping on settings screens
- e-commerce prompts without at least one local image asset
- placeholder images in model output unless repair fallback is required

### 6. Better Local Assets

The seeded SVGs are useful as a bridge, but they are not enough for production-looking screens. We need:

- richer product imagery
- category thumbnails
- profile/account illustrations
- media posters
- finance cards
- service/lifestyle images

Later this can move to the image-generation agent, but the current local corpus should still be broad enough for common playground prompts.

### 7. Debuggable Prompt And Result Trace

The UI should expose:

- model id
- prompt size
- selected archetype
- selected recipe
- retrieved rules
- retrieved references
- repair attempts
- validator issues repaired
- visual score
- fallback reason

This makes it clear whether the model ignored rules, the prompt lacked rules, or the validator accepted a bad layout.

## Recommended Implementation Backlog

### P0: Make The Score Honest

Rename the current card label:

- from `Clean 100`
- to `Code gate 100`

Add a second visual status:

- `Visual pending`
- `Visual 72`
- `Visual failed`

### P0: Add A Settings Recipe And Giant Icon Guard

The screenshot failure can be prevented immediately by:

- settings archetype detection
- canonical settings TSX recipe
- validator rule that rejects large decorative Icons in settings screens

### P0: Block Success On Rendered Visual Failures

If visual verification finds overflow, giant icons, or missing expected sections, the card should not show as successful. It should run repair or show `Needs repair`.

### P1: Recipe Library

Create curated recipes for the top prompts:

- settings
- e-commerce home
- login
- profile
- media home
- finance dashboard
- notification preferences
- search/results

### P1: Two-Pass Generation

Use:

1. plan JSON: archetype, sections, components, assets, hierarchy
2. TSX implementation from the approved plan
3. screenshot critique
4. targeted repair

### P1: Reference-Structure Grounding

When a reference screen is selected, extract and pass its structural skeleton:

- number of sections
- section order
- component roles
- density
- attention levels

The model should preserve that skeleton unless the user asks otherwise.

### P2: Better Asset System

Expand local assets and later replace or augment with the image generation agent.

## Practical Definition Of Done

For this playground to meet the expected bar, a generated screen should not be considered successful until:

- TSX passes the code gate.
- Sandpack renders without runtime errors.
- The screenshot passes automated visual checks.
- A vision/design critique score passes a threshold.
- The output uses the right recipe for the prompt archetype.
- The model id, prompt size, recipe, references, repair attempts, and final scores are visible in debug UI.

Only then should the result be presented as a “good” composition rather than just a valid draft.
