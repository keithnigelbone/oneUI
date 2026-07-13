# Phase 1: Isolated Foundation - Pattern Map

**Mapped:** 2026-05-30
**Files analyzed:** 24 new/modified files (6 new packages + isolated route + Convex schema + CI guard)
**Analogs found:** 22 / 24 (2 net-new: Mastra workflow + ExperienceBuilderEvent — no in-repo analog)

> **Reuse-by-contract reminder (LAB-03 / Pitfall 3):** Every analog below is a **pattern to copy into `experience-builder-*` / `(experience-lab)`**, NOT a file to import or edit. The existing `ExperienceCanvas`, `(builder)` route, and `FoundationStyleProvider` are read-only references. Lab packages deep-import the public `@oneui/*` APIs only; they NEVER import `ExperienceCanvas` internals or reuse its tldraw store singleton.

> **Import-alias note:** Inside `apps/platform`, the existing canvas imports `@oneui/ui` via the internal alias `@oneui/ui-internal/...` (e.g. `@oneui/ui-internal/registry/componentRegistry`, `@oneui/ui-internal/components/Select/Select`). New `experience-builder-*` **packages** import the public deep path `@oneui/ui/components/...` / `@oneui/shared` / `@oneui/shared/codegen`. The `(experience-lab)` route (in `apps/platform`) may use either form consistent with its neighbours — confirm the alias resolution during package scaffolding. The barrel `@oneui/ui` is forbidden (eslint `no-restricted-imports`).

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/experience-builder-core/src/ir/schema.ts` | model (Zod contract) | transform | `packages/shared/src/types/componentAST.ts` | role-match (AST is markup-bearing; IR must NOT be) |
| `packages/experience-builder-core/src/ir/artifactTypes.ts` | model (union enum) | transform | `packages/shared/src/types/componentAST.ts` (`ASTNode` union) | role-match |
| `packages/experience-builder-core/src/ir/irToAst.ts` | utility (mapper) | transform | `packages/shared/src/codegen/astToReact.ts` | exact (same shape: typed-tree → typed-tree, pure Node fn) |
| `packages/experience-builder-core/src/ir/patch.ts` | utility | transform | `packages/shared/src/codegen/astToReact.ts` (pure-fn module conventions) | partial (no JSON-patch analog in repo) |
| `packages/experience-builder-core/src/profiles/outputProfileTable.ts` | config (lookup table) | transform | `packages/ui/src/registry/jioAlphaCatalog.ts` (typed const table) | role-match |
| `packages/experience-builder-core/src/contracts/foundationResolve.ts` | model (result type + gap variant) | transform | `packages/shared/src/engine/buildThemeConfig.ts` (`ThemeConfig` shape) | exact (mock output MUST match `ThemeConfig`) |
| `packages/experience-builder-core/src/contracts/registryItem.ts` | model | transform | `packages/ui/src/registry/jioAlphaCatalog.ts` (`JioAlphaComponentCatalogEntry`) | exact |
| `packages/experience-builder-core/src/contracts/validation.ts` | model | transform | `apps/platform/src/app/api/composition/{critique,verify}/*` result shapes | role-match |
| `packages/experience-builder-core/src/contracts/events.ts` | model (event union) | event-driven | — (AG-UI-inspired; no in-repo analog) | NO ANALOG |
| `packages/experience-builder-registry/src/queryRegistry.ts` | service (adapter) | CRUD/read | `packages/ui/src/registry/jioAlphaCatalog.ts` + `componentRegistry.ts` + `meta/generateAIContext.ts` | exact |
| `packages/experience-builder-validation/src/astValidator.ts` | service (validator) | transform | `packages/ui/src/runtime/ASTRenderer.tsx` (allowlist enforcement) | role-match |
| `packages/experience-builder-agents/src/workflow.ts` | service (Mastra workflow) | event-driven | — (Mastra net-new; nearest is `api/agent/executors/*`) | NO ANALOG |
| `packages/experience-builder-agents/src/foundationResolver.ts` | service (mock tool) | transform | `packages/shared/src/engine/buildThemeConfig.ts` | role-match (mock matches its output shape) |
| `packages/experience-builder-preview/` (stub) | — | — | `apps/platform/src/app/internal/render-ast/page.tsx` | exact (P3 basis; decision doc only in P1) |
| `packages/experience-builder-export/` (stub) | — | — | — | stub (P4/P5) |
| `apps/platform/src/app/(platform)/(experience-lab)/layout.tsx` | route (layout) | request-response | `apps/platform/src/app/(platform)/(builder)/canvas/page.tsx` (route-group conventions) | role-match |
| `.../(experience-lab)/page.tsx` | route (page) | request-response | `apps/platform/src/app/(platform)/(builder)/canvas/page.tsx` | exact (dynamic ssr:false canvas page) |
| `.../_canvas/ExperienceLabCanvas.tsx` | component (canvas shell) | event-driven | `apps/platform/src/design-tools/ExperienceCanvas/{useCanvasEditor,ExperienceCanvas}.tsx` | role-match |
| `.../_canvas/shapes/PromptCardShape.tsx` | component (tldraw ShapeUtil) | event-driven | `apps/platform/src/design-tools/ExperienceCanvas/ComponentShape.tsx` | exact |
| `.../_canvas/shapes/ArtifactCardShape.tsx` | component (tldraw ShapeUtil) | event-driven | `ComponentShape.tsx` | exact |
| `.../_canvas/shapes/FoundationProfileCardShape.tsx` | component (tldraw ShapeUtil) | event-driven | `ComponentShape.tsx` (+ gap state) | exact |
| `.../_canvas/frames/RunGroupFrame.tsx` | component (tldraw FrameShapeUtil) | event-driven | `apps/platform/src/design-tools/ExperienceCanvas/OneUIFrameShapeUtil.tsx` | exact |
| `.../_panels/RequestPanel.tsx` | component (docked panel) | request-response | `apps/platform/src/design-tools/ExperienceCanvas/PropPanel.tsx` | exact |
| `.../_panels/RunInspectorPanel.tsx` | component (event timeline) | event-driven | `PropPanel.tsx` (panel structure) + `events.ts` | role-match |
| `apps/platform/src/app/api/experience-lab/run/route.ts` | route (API, Node) | streaming | `apps/platform/src/app/api/agent/route.ts` | exact (POST + `maxDuration`) |
| `packages/convex/convex/experienceRuns.ts` (+ schema tables) | model + service | CRUD | `packages/convex/convex/schema.ts` + `brands.ts` | exact |
| `eslint.config.mjs` (modify) | config (CI guard) | — | `eslint.config.mjs` existing `no-restricted-imports` | exact (extend in place) |

---

## Pattern Assignments

### `packages/experience-builder-core/src/ir/schema.ts` (model, transform)

**Analog:** `packages/shared/src/types/componentAST.ts` — but as a **counter-pattern**. The IR must NOT reuse `ElementASTNode`.

**The vector to avoid** (`componentAST.ts` lines 42-52) — this is the markup-smuggling channel (IR-02, Pitfall 2):
```ts
/** A raw HTML element wrapper */
export interface ElementASTNode {
  id: string;
  kind: 'element';
  /** HTML tag name (e.g., 'div', 'span', 'section') */
  tag: string;          // ← arbitrary HTML tag = the smuggling vector. NEVER in the IR.
  props: Record<string, ASTSerializableValue>;
  children: ASTNode[];
}
```

**Safe AST node shapes the IR DOES target** (`componentAST.ts` lines 29-60):
```ts
export interface ComponentASTNode {       // registered component, type ∈ registry
  id: string; kind: 'component'; type: string;
  props: Record<string, ASTSerializableValue>; children: ASTNode[];
}
export interface TextASTNode { id: string; kind: 'text'; text: string; }   // escaped text only
```

**Markup-free slot pattern** (from RESEARCH.md Code Examples — the IR-02 invariant):
```ts
const SlotValue = z.union([
  z.array(z.lazy(() => JioIRComponentInstance)),  // nested instances
  z.string(),                                      // escaped text; validator rejects </ < /style=
]);
// FORBIDDEN fields (never add): rawHtml, html, tag, dangerouslySetInnerHTML, children:string-of-markup
```

**Required IR field set** (IR-04): artifact type, target profile, brand, foundation refs, layout sections, component instances, content, a11y requirements, validation status. `version` literal for forward-compat — mirror `ASTRoot.version: 1` (`componentAST.ts` line 71).

---

### `packages/experience-builder-core/src/ir/irToAst.ts` (utility, transform)

**Analog:** `packages/shared/src/codegen/astToReact.ts` — pure Node function, typed tree in → typed tree out, no React dependency.

**Module-header + pure-fn convention** (`astToReact.ts` lines 1-21):
```ts
/**
 * Pure function: AST → React/JSX source code.
 * No React dependency — runs in Node, browser, or worker.
 */
import type { ASTRoot, ASTNode, ASTSerializableValue } from '../types/componentAST';
export interface AstToReactOptions { /* options object, defaulted */ }
```

**The compile target** (`astToReact.ts` line 8) — `irToAst.ts` emits `ComponentASTNode`/`TextASTNode` only. Critically, it must NOT emit the `element`-kind branch that `renderNode` handles at `astToReact.ts` lines 70-79 (raw `<${node.tag}>` JSX). Layout primitives map to **registry components** (Container/Grid/Surface), never raw tags.

**Recursive node-switch shape to mirror** (`astToReact.ts` lines 58-79): switch on `node.kind`; for IR→AST there are only `component` and `text` cases — the absence of an `element` case is the enforcement.

---

### `packages/experience-builder-core/src/contracts/foundationResolve.ts` + `agents/src/foundationResolver.ts` (model + mock service)

**Analog:** `packages/shared/src/engine/buildThemeConfig.ts` — the mock resolver's success output MUST match the `ThemeConfig` shape so P2 is a data swap (FND-01/FND-04).

**Permissive-input shape to mirror** (`buildThemeConfig.ts` lines 26-51):
```ts
export interface ThemeConfigAppearanceInput {
  accentCount?: number;
  background?: { scaleName?: string; backgroundStep?: { light?: number; dark?: number; dim?: number } };
  accents?: Array<{ role: string; label?: string; scaleName: string; baseStep: number }>;
  logo?: { scaleName: string; baseStep: number };
}
```
`ThemeConfig` / `ScaleDefinition` import from `../engine/surfaceNew`. The mock returns a `ThemeConfig`-shaped value; the contract type wraps it in a discriminated union with a **first-class gap variant** (FND-03):
```ts
type FoundationResolveResult =
  | { ok: true; theme: /* ThemeConfig-shaped */ ... }
  | { ok: false; gap: { artifactType; outputProfile; reason } };  // short-circuits to gap-report card
```
**Pitfall 6 guard:** never return invented round numbers (1080×1080). "Profile not found" is the typed gap variant, never a silent default.

---

### `packages/experience-builder-core/src/contracts/registryItem.ts` + `experience-builder-registry/src/queryRegistry.ts` (model + service)

**Analog:** `packages/ui/src/registry/jioAlphaCatalog.ts` — the single source of truth; derive `JioComponentRegistryItem` from it, never hand-author a parallel (Pitfall 5).

**Production-shaped entry type to mirror** (`jioAlphaCatalog.ts` lines 10-25):
```ts
export type JioAlphaSupportStatus = 'alpha' | 'experimental' | 'internal';
export interface JioAlphaComponentCatalogEntry {
  name: string;
  status: JioAlphaSupportStatus;
  importPath?: string;      // ← validator allowlist source for VAL-02 (non-Jio import block)
  storyPath?: string;
  docsPath?: string;
  surfaceAware: boolean;
  multiAccent: boolean;
  notes?: string;
}
```
`importPath` is `@oneui/ui/components/<Folder>` (lines 23-24, `componentImport`). The Lab registry adapter joins this catalog with `componentRegistry.ts` (component refs, meta) and `@oneui/shared/meta` `generateAIContext`. **Membership is exact lookup** — no embeddings (Pitfall 6 / REG-05 deferred). Exclude known-drift components (Modal, Text) from the generatable set per CONCERNS.md.

---

### `packages/experience-builder-validation/src/astValidator.ts` (service, transform)

**Analog:** `packages/ui/src/runtime/ASTRenderer.tsx` — the existing renderer already enforces a prop allowlist; the validator complements it AST-side (VAL-01/02/03, Pitfall 4 = must be AST-based, never regex).

**Allowlist-enforcement pattern to mirror** (`ASTRenderer.tsx` lines 16-86):
```ts
// Per-component prop allow-lists for leaves. The renderer drops any AST prop
// not listed here before spreading. An LLM emitting <Badge style={{width}}/>
// or className="w-full" CANNOT stretch a component.
const LEAF_COMPONENT_ALLOWED_PROPS: Record<string, ReadonlyArray<string>> = {
  Badge: ['variant', 'size', 'appearance', 'start', 'end', 'children'],
  Button: ['variant','size','appearance','attention','start','end', ...],
  // ...
};
const ALWAYS_ALLOWED_PREFIXES = ['data-ast-', 'aria-', 'data-oneui-'] as const;
```
**Validator allowlists (VAL-02/03):** every import path ∈ catalog `importPath` set; every component `type` ∈ `jioAlphaCatalog`; every prop/variant ∈ meta. Walk the AST, resolve aliased imports (`import { Button as X }`) — parse, never substring. Returns `JioValidationResult` (passed + blocking + warnings + repair suggestions + gaps). Reuse `tokenManifest.ts`/`tokenBoundary.ts` (engine) for the literal/token-boundary check (defer full scan to P3, build the walk skeleton now).

---

### `apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx` (component, tldraw ShapeUtil)

**Analog:** `apps/platform/src/design-tools/ExperienceCanvas/ComponentShape.tsx` — copy the `ShapeUtil` pattern; do NOT import this file.

**Imports + class skeleton to mirror** (`ComponentShape.tsx` lines 10-19, 356-428):
```tsx
import { ShapeUtil, HTMLContainer, Rectangle2d, T,
  type Geometry2d, type RecordProps, useEditor, type TLShapeId } from 'tldraw';

export const PROMPT_CARD_SHAPE_TYPE = 'exp-lab-prompt' as const;   // own type, distinct namespace

export type PromptCardShapeProps = { w: number; h: number; /* IR-on-card config (D-04) */ };

export class PromptCardShapeUtil extends ShapeUtil<any> {
  static override type = PROMPT_CARD_SHAPE_TYPE;
  static override props: RecordProps<any> = { w: T.number, h: T.number, /* T.jsonValue for config */ };
  getDefaultProps() { return { w: 320, h: 180, /* ... */ }; }
  override canEdit() { return true; }
  getGeometry(shape: any): Geometry2d { return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true }); }
  component(shape: any) { /* HTMLContainer with Jio-token-styled card chrome */ }
  indicator(shape: any) { return <rect width={shape.props.w} height={shape.props.h} />; }
}
```

**HTMLContainer + token-styled chrome** (`ComponentShape.tsx` lines 819-830, 968-987 fallback) — all HTML inside `HTMLContainer` uses Jio tokens (`var(--Shape-3-5)`, `var(--Body-S-FontSize)`, `var(--Surface-Elevated)`, `var(--Text-High)`), NEVER literals (UI-SPEC § Spacing exception: tldraw geometry is exempt, the HTML chrome is not). Use `<Surface mode="...">` for any non-default card fill, never `<div style={{ background }}>` (CLAUDE.md mandate).

**Dynamic size-from-DOM (optional)** if card height is content-driven: `ComponentShape.tsx` lines 279-350 (`_measuredSizes` LRU map + `useDynamicComponentSize` ResizeObserver) is the proven pattern.

`ArtifactCardShape.tsx`, `FoundationProfileCardShape.tsx` (incl. typed gap-report state, D-06), `ComponentReferenceCardShape.tsx`, and `GenericPlaceholderShape.tsx` all follow this same `ShapeUtil` template, each with its own `*_SHAPE_TYPE` constant.

---

### `.../_canvas/frames/RunGroupFrame.tsx` (component, tldraw FrameShapeUtil)

**Analog:** `apps/platform/src/design-tools/ExperienceCanvas/OneUIFrameShapeUtil.tsx` — extends tldraw's `FrameShapeUtil` for the labeled "Run #N" frame (D-07).

**Extend-FrameShapeUtil pattern** (`OneUIFrameShapeUtil.tsx` lines 7-8, 59-74):
```tsx
import { FrameShapeUtil } from 'tldraw';
export class RunGroupFrameUtil extends FrameShapeUtil {
  override component(shape: any) {
    const el = super.component(shape);   // reuse tldraw's frame body + heading
    // optionally patch fill / label ("Run #N", Label-XS typography per UI-SPEC)
    return el;
  }
}
```
The Lab's run frame does NOT need the brand-fill SVG-export machinery (`toSvg`, lines 77-113) in P1 — that is artboard-export-specific. Keep the override minimal: a labeled container with a `bg-subtle` Surface fill (UI-SPEC Color § Secondary).

---

### `.../_panels/RequestPanel.tsx` (component, request-response)

**Analog:** `apps/platform/src/design-tools/ExperienceCanvas/PropPanel.tsx` — the docked, Jio-`Select`-driven editor for the selected shape (D-01). Reuse the UX pattern, not the file.

**Jio-component-only panel imports** (`PropPanel.tsx` lines 9-33):
```tsx
'use client';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import type { Editor } from 'tldraw';
import { Select } from '@oneui/ui-internal/components/Select/Select';     // deep path, NOT barrel
import { InputField as Input } from '@oneui/ui-internal/components/Input';
import { Switch } from '@oneui/ui-internal/components/Switch/Switch';
import styles from './RequestPanel.module.css';   // CSS Modules, token-only
```
**Selection-driven editing** (`useCanvasEditor.ts` lines 31-55, `getSelectedComponentInfo`): the panel reads `editor.getSelectedShapeIds()`, edits the currently-selected prompt card, persists config back onto the shape via `updateShapeProp` (lines 61-70). Mirror this for brand/type/profile config persisted on the prompt card (D-04).

**D-02/D-03 specifics:** brand `Select` populates from `useQuery(api.brands.list)` (read-only Convex). Output-profile `Select` options are filtered by selected artifact type via `outputProfileTable.ts` — invalid pairings unselectable at the UI. Run CTA = `<Button variant="bold" appearance="primary">Run generation</Button>` (UI-SPEC: the single accent moment). All controls draw the focus halo (`--Surface-Halo-Gap` + `--Focus-Outline`).

---

### `.../page.tsx` + `layout.tsx` (route)

**Analog:** `apps/platform/src/app/(platform)/(builder)/canvas/page.tsx` — full-bleed tldraw page via dynamic import.

**Dynamic-import (ssr:false) canvas-page pattern** (entire `canvas/page.tsx`):
```tsx
'use client';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';
const CanvasContent = dynamic(() => import('./_canvas/ExperienceLabCanvas'), {
  ssr: false,                       // tldraw needs browser APIs
  loading: () => <PageLoader />,
});
export default function ExperienceLabPage() { return <CanvasContent />; }
```
`layout.tsx` is an **isolated** layout for the `(experience-lab)` group — does NOT share the `(builder)` layout, does NOT wrap/reorder `FoundationStyleProvider`. Nav entry "Experience Lab" added to platform nav, visibly distinct from "Builder" (Claude's-discretion entry-point).

---

### `apps/platform/src/app/api/experience-lab/run/route.ts` (route, API, Node + streaming)

**Analog:** `apps/platform/src/app/api/agent/route.ts` — POST handler with `maxDuration`, Node runtime, body-mode dispatch.

**Route skeleton to mirror** (`api/agent/route.ts` lines 20, 31-49):
```ts
export const maxDuration = 120;                 // Mastra needs Node runtime — do NOT set Edge
export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try { parsed = await request.json(); }
  catch { return new Response('Invalid JSON body', { status: 400 }); }
  // validate body → delegate to the Mastra workflow in experience-builder-agents
  // → stream ExperienceBuilderEvents back via @mastra/ai-sdk toAISdkStream(stream, { version: 'v6' })
}
```
The streaming/forwarding pattern mirrors how `composition/generate/route.ts` (lines 12-16) thinly forwards to an executor. This route is the only place Mastra is invoked (ORCH-04: orchestration is backend, never browser).

---

### `packages/convex/convex/experienceRuns.ts` + new `schema.ts` tables (model + service)

**Analog:** `packages/convex/convex/schema.ts` (table-definition conventions) + `brands.ts` (query conventions).

**Table-definition pattern** (`schema.ts` lines 4-24): `defineTable({ ... fields ..., createdAt: v.number(), updatedAt: v.number() }).index('by_x', ['x'])`. Add `experienceRuns`, `experienceArtifacts`, `experienceArtifactVersions` (VER-03 / D-08) — **append only; do not modify existing table defs.** Run `npx convex dev` to regenerate `_generated`.

**Read-only query pattern** (`brands.ts` lines 24-26 — the D-02 brand list, reused as-is, NOT modified):
```ts
export const list = query(async (ctx) => { return await ctx.db.query('brands').collect(); });
```
New run/IR persistence queries+mutations follow `brands.ts` lines 13-49 conventions (`query`/`mutation` with `args` validators).

---

### `eslint.config.mjs` (config, CI guard — MODIFY IN PLACE)

**Analog:** the existing `no-restricted-imports` rule (`eslint.config.mjs` lines 201-212).

**Extend the existing rule** (do not add a custom script — Pitfall 3 / LAB-03):
```js
'no-restricted-imports': ['error', {
  paths: [
    { name: '@oneui/ui', message: 'Import from a deep path...' },  // existing
  ],
  patterns: [   // ADD: Lab↔Builder isolation boundary
    // (builder)/ExperienceCanvas must NOT import experience-builder-*
    // experience-builder-* must NOT deep-import (builder)/ExperienceCanvas internals
  ],
}],
```
Pair with: an existing-Builder smoke test (boots the `(builder)` canvas route in CI) + `pnpm why ai` single-version gate (must resolve one `ai@6.x` in the Lab resolution tree — repo currently has 6.0.111 + 6.2.2).

---

## Shared Patterns

### Surface Context (CLAUDE.md MANDATORY — applies to ALL Lab UI + every card's HTML chrome)
**Source:** CLAUDE.md § Surface Context; `jioAlphaCatalog.ts` lines 30-37 (`Surface` is the required wrapper).
**Apply to:** every shape `component()` render, both panels, the run-group frame.
Any non-`default` background uses `<Surface mode="...">`, NEVER `<div style={{ background }}>`. Inside a Surface use generic role tokens (`--Primary-High`, `--Text-High`) that remap per `[data-surface]`. UI-SPEC: cards = `default`, run frame + inspector = `bg-subtle`.

### Token-only styling / zero literals (LAB-02)
**Source:** CLAUDE.md § Zero Tolerance; `ComponentShape.tsx` lines 944-957 (token-only inline styles inside `HTMLContainer`).
**Apply to:** all Lab CSS Modules + all HTML rendered inside tldraw `HTMLContainer`.
Use `var(--Token-Name)` only. Typography pairs size + line-height + `font-family: var(--Typography-Font-Primary)`; use role-explicit V2 tokens (`--Body-S-FontSize`, `--Label-FontWeight-Medium`), never legacy `--Typography-Size-*`. tldraw shape *geometry* (`Rectangle2d`) is the only exemption.

### Deep-import boundary (eslint `no-restricted-imports`)
**Source:** `eslint.config.mjs` lines 201-212.
**Apply to:** every import of `@oneui/ui` across all Lab files.
Never import the `@oneui/ui` barrel — use `@oneui/ui/components/<Name>` (packages) or `@oneui/ui-internal/components/<Name>` (apps/platform, matching neighbours).

### Focus Halo (interactive controls)
**Source:** CLAUDE.md § Focus Halo Pattern; UI-SPEC Interaction Contract.
**Apply to:** every interactive control in both panels + canvas toolbar.
2-layer: inner gap `var(--Surface-Halo-Gap, var(--Surface-Main))` + outer `var(--Focus-Outline)`. Never `--Surface-Main` directly (creates a hole inside Surfaces).

### Pure-function module convention (`-core`, `-validation`, `-registry`)
**Source:** `astToReact.ts` lines 1-8; `componentAST.ts` lines 1-11.
**Apply to:** all `-core`/`-validation`/`-registry` modules.
Framework-agnostic, JSON-compatible values only, `import type` for cross-package types, runs in Node/browser/worker. Vitest node env per RESEARCH.md Validation Architecture.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `experience-builder-core/src/contracts/events.ts` | model (event union) | event-driven | `ExperienceBuilderEvent` is AG-UI-inspired; no event-stream model exists in the repo. Design fresh per RESEARCH.md (internal model, rides `@mastra/ai-sdk` transport). |
| `experience-builder-agents/src/workflow.ts` | service (Mastra workflow) | event-driven | Mastra is the one net-new dependency; no in-repo orchestration-graph analog. Nearest reference is `api/agent/executors/*` for the executor *boundary* shape, but the workflow graph (`createWorkflow().then/.branch/.dountil`) is net-new. Gate install behind `checkpoint:human-verify` (RESEARCH.md Package Audit). |

---

## Metadata

**Analog search scope:** `apps/platform/src/design-tools/ExperienceCanvas/`, `apps/platform/src/app/(platform)/(builder)/`, `apps/platform/src/app/api/`, `apps/platform/src/app/internal/`, `packages/shared/src/{types,codegen,engine,meta}/`, `packages/ui/src/{registry,runtime}/`, `packages/convex/convex/`, `eslint.config.mjs`.
**Files scanned:** 13 analog files read in full or targeted.
**Pattern extraction date:** 2026-05-30
