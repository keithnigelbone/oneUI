# Phase 3: Preview / Eval / Repair - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 18 (new + modified)
**Analogs found:** 18 / 18 (every file has an in-repo analog — RESEARCH.md's "70% integration" finding confirmed)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/experience-builder-preview/src/PreviewExecutor.ts` | interface/contract | request-response | `experience-builder-agents/src/modelAdapter.ts` (`CallModelArgs` seam) | role-match (seam idiom) |
| `packages/experience-builder-preview/src/DaytonaExecutor.ts` | service | file-I/O + request-response | `apps/platform/src/lib/playwrightRenderer.ts` (`capturePath`) | role-match (screenshot capture) |
| `packages/experience-builder-preview/src/IframeCspExecutor.ts` | service | file-I/O + request-response | `apps/platform/src/lib/playwrightRenderer.ts` (`captureASTScreenshots` + token handoff) | **exact** |
| `packages/experience-builder-preview/src/lifecycle.ts` | utility | transform/state-machine | `apps/.../_canvas/shapes/ArtifactCardShape.tsx` (card render-state) | partial |
| `packages/experience-builder-preview/src/index.ts` | barrel | — | `experience-builder-validation/src/index.ts` | exact |
| `packages/experience-builder-preview/src/*.test.ts` | test | — | `experience-builder-agents/src/workflow.test.ts` + `testModelMock.ts` seam | role-match |
| `packages/experience-builder-agents/src/steps/evaluate.ts` (NEW) | service (workflow step) | request-response (model) | `composition/verify/route.ts` (vision judge) + `workflow.ts` `validateStep` (step shape) | **exact** (two analogs combined) |
| `packages/experience-builder-agents/src/steps/repair.ts` (NEW) | service (workflow step) | transform (IR patch) | `composition/repair/route.ts` (prompt) + `patch.ts` (`diffIr`/`applyPatch`) | **exact** |
| `packages/experience-builder-agents/src/evaluatorRubric.ts` (NEW) | model/schema | structured-output | `irGenerator.ts` `SectionFillSchema` (Zod-4 gotcha pattern) | **exact** |
| `packages/experience-builder-agents/src/workflow.ts` (EXTEND) | service (orchestrator) | event-driven / bounded-loop | itself (existing `.then` chain + `ORDERED_STEPS` runner) | self |
| `packages/experience-builder-agents/src/modelAdapter.ts` (EXTEND) | service (model seam) | request-response (vision) | itself (`callModel` / `CallModelArgs`) | self (add image-message path) |
| `packages/experience-builder-validation/src/astValidator.ts` (EXTEND) | validator | transform | itself (`checkLiteralHook` skeleton, line 265) | self |
| `packages/experience-builder-validation/src/fixtures/redteam.ts` (EXTEND) | test fixture | — | itself (`REDTEAM_FIXTURES`, 6 entries) | self |
| `packages/convex/convex/schema.ts` (EXTEND) | model/migration | CRUD | itself (`experienceArtifacts` / `experienceArtifactVersions`) | self (additive `v.optional`) |
| `packages/convex/convex/experienceRuns.ts` (EXTEND) | service (mutation/query) | CRUD | itself (`persistArtifact` mutation + `getArtifactHistory` query) | self |
| `apps/.../_canvas/shapes/ArtifactCardShape.tsx` (EXTEND) | component (tldraw shape) | event-driven (canvas) | itself (ShapeUtil pattern) | self (add live-iframe + timeline) |
| `apps/.../_canvas/frames/VariantGroupFrame.tsx` (NEW) | component (tldraw frame) | event-driven (canvas) | `_canvas/frames/RunGroupFrame.tsx` (`FrameShapeUtil` extend) | **exact** |
| `apps/.../_panels/VersionTimelinePanel.tsx` (NEW) | component (panel) | request-response (useQuery) | `_panels/RunInspectorPanel.tsx` + `getArtifactHistory` query | role-match |

## Pattern Assignments

### `packages/experience-builder-preview/src/PreviewExecutor.ts` (interface, seam)

**Analog:** `packages/experience-builder-agents/src/modelAdapter.ts` — the `CallModelArgs<TSchema>` seam idiom. The PreviewExecutor is the same "narrow async interface + swappable impl + test override" pattern.

**Seam idiom to copy** (`modelAdapter.ts:73-114`):
```typescript
export interface CallModelArgs<TSchema extends z.ZodType> { schema: TSchema; prompt: string; system?: string; model?: string; }
// production impl is module-level + swappable for tests:
let _callModelImpl = callModelReal;
export function callModel(args) { return _callModelImpl(args); }
export function __setCallModelImpl(impl) { /* returns restore fn */ }
```
Apply this exact shape: define `PreviewExecutor` interface + a `setPreviewExecutor(impl)` test seam so the workflow `previewStep` is testable credential-free with a mock executor (RESEARCH Wave-0 gap `PreviewExecutor.test.ts`). The interface shape itself is given verbatim in RESEARCH Pattern 1 (`RenderInput`/`RenderResult`/`render()`).

**Invariant:** NO `@daytonaio/sdk` or `playwright` import in this file — only the impls import vendors (RESEARCH Pattern 1).

---

### `packages/experience-builder-preview/src/IframeCspExecutor.ts` (service, file-I/O — the MVP de-risk path)

**Analog:** `apps/platform/src/lib/playwrightRenderer.ts` — **exact**. This is the verified token-handoff + headless capture harness. The IframeCspExecutor wraps/relocates this.

**Token-handoff pattern to copy** (`playwrightRenderer.ts:42-70`): in-memory `Map` cache keyed by `randomUUID()`, 60s TTL, `publish*ForRender` → token, `consume*ForRender(token)` server-side. Nothing sensitive in the URL — satisfies PREV-01 token-handoff.
```typescript
const renderCache = new Map<string, { payload: RenderPayload; expiresAt: number }>();
const TOKEN_TTL_MS = 60_000;
export function publishASTForRender(ast: unknown): string {
  const token = randomUUID();
  renderCache.set(token, { payload: { kind: 'ast', ast }, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}
```

**Capture pattern to copy** (`playwrightRenderer.ts:145-200`): dynamic `import('playwright')` (keeps Edge builds alive), per-viewport `browser.newContext({ viewport, deviceScaleFactor: 2 })`, `goto(url, { waitUntil: 'networkidle' })`, **double-rAF transition-suppression wait + `document.fonts.ready` wait** (FOUC settle — load-bearing for brand-CSS correctness), then `page.screenshot({ type: 'png', fullPage: false })`. Returns `CaptureResult[]` = `{ viewport, png: Buffer }`.

**Viewport profiles to reuse** (`playwrightRenderer.ts:25-29`): `DEFAULT_VIEWPORTS` (`mobile` 390×844, `desktop` 1440×900, `tablet` 834×1194). PREV-03 desktop/mobile/fixed maps onto this; extend with a `fixed` profile.

**Render-target page to reuse:** `apps/platform/src/app/internal/render-ast/page.tsx` (mounts `ASTRenderer` inside the real brand CSS cascade, resolves AST via `consumeASTForRender(token)`, `force-dynamic`). The separate-origin variant + CSP headers are spec'd in `packages/experience-builder-preview/PREVIEW-DECISION.md` (sandbox=`allow-scripts` WITHOUT `allow-same-origin`, strict CSP, `frame-ancestors` pinned, `postMessage` origin checks).

---

### `packages/experience-builder-preview/src/DaytonaExecutor.ts` (service, sandbox + screenshot — MVP prod path D-01)

**Analog:** `playwrightRenderer.ts` `capturePath` for the screenshot semantics (per-profile loop, font/transition settle, PNG buffer return) — re-implemented INSIDE the Daytona sandbox.

**Skeleton given in RESEARCH Pattern 2** (the only module importing `@daytonaio/sdk`):
```typescript
import { Daytona } from '@daytonaio/sdk';
const sandbox = await this.daytona.create({ networkBlockAll: true }); // PREV-01 zero-egress
try { /* write bundle, render+screenshot INSIDE box, getSignedPreviewUrl(port, ttl) */ }
finally { await sandbox.delete(); }
```
**Constraints from RESEARCH:** set `networkBlockAll` at **create** time (Open Q4 — works on all account tiers); run Playwright *inside* the sandbox or use Daytona's native screenshot API — do NOT connect external CDP (Pitfall 1, GitHub issue #4456); inline fonts/CSS into the bundle or pin a `networkAllowList` CIDR (Open Q2 / Assumption A4). Install gated behind `checkpoint:human-verify` (`[ASSUMED]` package, RESEARCH Package Audit).

---

### `packages/experience-builder-agents/src/steps/evaluate.ts` (NEW — workflow step, two-track scoring D-06)

**Analog A (step shape):** `workflow.ts` `validateStep` (lines 532-556) — the `createStep` + `ctxSchema` + `emit(...)` + halted-guard convention every Lab step follows:
```typescript
const validateStep = createStep({
  id: 'validate', inputSchema: ctxSchema, outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.ir) return { ctx };          // gap-branch guard
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'validate', status: 'started', at: now() });
    /* … */
    ctx.outcome = result.passed ? 'artifact' : 'gap';
    return { ctx };
  },
});
```
`evaluateStep` follows this verbatim: guard on `ctx.halted`, emit started/completed events, write the composite score onto `ctx`. **Objective track short-circuits straight to repair using the existing `ctx.validation` (D-06) — no model call when blocking violations exist.**

**Analog B (vision judge — the subjective track):** `apps/platform/src/app/api/composition/verify/route.ts:207-228` — the verified multimodal call shape:
```typescript
const { text } = await generateText({
  model: anthropic(CLAUDE_VISION_MODEL),
  system: JUDGE_SYSTEM_PROMPT,                       // analytic rubric, 0–5 per criterion
  messages: [{ role: 'user', content: [
    { type: 'text', text: `Generated screen at viewport ${profile}:` },
    { type: 'image', image: `data:image/png;base64,${png.toString('base64')}` },
    { type: 'text', text: 'Score against the rubric and return JSON.' },
  ]}],
});
```
**Critical adaptation (ORCH-04):** in the Lab this MUST route through the `callModel` seam, NOT a direct `ai` import in the step (RESEARCH Pattern 6 + Code Examples). See the `modelAdapter.ts` extension below.

`CLAUDE_VISION_MODEL` import source: `@oneui/shared/agent` (per verify route line 22).

---

### `packages/experience-builder-agents/src/modelAdapter.ts` (EXTEND — add a vision/image-message path)

**Analog:** itself, `callModelReal` (lines 84-97). The current seam only sends `prompt`. Add an optional image-content path so the vision judge stays inside the single ORCH-04 seam:
```typescript
async function callModelReal({ schema, prompt, system, model = CLAUDE_MODEL }) {
  const result = await generateText({
    model: anthropic(model),
    ...(system ? { system } : {}),
    prompt,
    experimental_output: Output.object({ schema }),
  });
  return result.experimental_output;
}
```
Extend `CallModelArgs` with an optional `images?: Array<{ png: Buffer }>` (or `messages` content parts), and when present build the `messages:[{role:'user', content:[…image…]}]` form from the verify-route excerpt above instead of `prompt`. Keep `experimental_output: Output.object({ schema })` for the structured rubric. This is the only file allowed to import `ai`/`@ai-sdk/*`.

---

### `packages/experience-builder-agents/src/evaluatorRubric.ts` (NEW — Zod rubric schema, D-07)

**Analog:** `irGenerator.ts:111-126` `SectionFillSchema` — the **canonical Zod-4 ↔ Anthropic gotcha solution**:
```typescript
const SectionFillSchema = z.object({
  instances: z.array(z.object({
    id: z.string().min(1),
    // NOT z.record(z.string(), …): Zod 4 emits `propertyNames`, Anthropic 400s.
    props: z.object({}).catchall(z.unknown()).optional(),
  })),
});
```
**Rules to copy:** plain `z.number()` for 0–5 scores (NO `.int()/.min()/.max()` — Anthropic rejects integer min/max); `z.object({}).catchall(...)` for any bag; clamp the 0–5 range AFTER parse + state the range in the prompt (RESEARCH Pitfall 2 + Pattern 6). The `VisualRubric` skeleton is given in RESEARCH Pattern 6 (`hierarchy`/`spacing`/`density`/`brandFit`/`notes`). Composite formula + threshold + epsilon are config-tunable (D-07).

---

### `packages/experience-builder-agents/src/steps/repair.ts` (NEW — IR-patch repair, D-09 / EVAL-02)

**Analog A (patch contract — FROZEN, reuse directly):** `packages/experience-builder-core/src/ir/patch.ts`:
```typescript
import { applyPatch, diffIr, type IrPatch } from '@oneui/experience-builder-core';
// op: 'add' | 'remove' | 'replace'; path: JSON Pointer e.g. '/sections/0/instances/2/props/appearance'
const repairedIr = applyPatch(failingIr, patch);   // pure — returns a NEW IR
```
`PatchOperation` / `IrPatch` types are exported from `patch.ts:25-33`. Repair emits **targeted ops against failing nodes only** — never whole-IR regen, never JSX (D-09 / anti-pattern in RESEARCH).

**Analog B (repair prompt shape):** `apps/platform/src/app/api/composition/repair/route.ts:116-142` — re-prompt with the full design-system contract + the failing artifact + the validator/error feedback, then re-validate the response and gate on `validation.valid`:
```typescript
const systemPrompt = buildTSXSystemPrompt(compiled, { storybookExemplars: STORY_EXEMPLARS });
const userPrompt = buildTSXRepairPrompt({ previousCode, error: errorText });
const { text } = await generateText({ model: anthropic(CLAUDE_MODEL), system: systemPrompt, prompt: userPrompt });
const validation = validateCompositionCode(code);
// status 200 iff validation.valid, else 422
```
Adapt: emit an `IrPatch` (via `callModel` + a patch-op Zod schema, same gotcha rules), apply it with `applyPatch`, then **re-enter compile → validate → evaluate** (mirror `compileStep`/`validateStep` from `workflow.ts`). The repair step body must set `ctx.halted = true` + a gap event on a missing-component/profile (reuse the `generateStep` gap branch shape, `workflow.ts:481-497`).

---

### `packages/experience-builder-agents/src/workflow.ts` (EXTEND — insert preview → evaluate → bounded repair → version-freeze)

**Analog:** itself. Two things must stay in sync (the file already does this for `intent…validate`):
1. The committed `.then(...)` chain (lines 562-576).
2. The `ORDERED_STEPS` array (lines 592-602) driven by the deterministic `runExperienceWorkflow` runner (lines 609-663).

Insert `previewStep → evaluateStep → repairStep(bounded) → versionFreezeStep` after `validateStep` in BOTH. The bounded loop uses Mastra `.dountil` (RESEARCH Pattern 4) for the committed workflow; the runner mirrors it with a bounded `for` (≤3) exactly as the current runner drives `ORDERED_STEPS`.

**Termination predicate (returns true to STOP — Pitfall 6 polarity):**
```typescript
return ctx.halted              // gap short-circuit (D-11)
  || ctx.attempt >= 3          // hard cap N=3 (D-11)
  || ctx.composite >= ctx.threshold  // passed
  || ctx.scoreDelta < ctx.epsilon    // no improvement (D-10)
  || ctx.sameValidationError;        // repeated error (D-10)
```
Add `attempt`, `composite`, `threshold`, `scoreDelta`, `sameValidationError`, `previewState`, `screenshots`, `evaluation` to the `RunContext` interface (lines 201-221) and to `RunExperienceResult` (lines 184-199). Preview is invoked through the injected `PreviewExecutor` (same injection idiom as `foundationsLoader`, lines 163-182 — an opaque function/interface passed on `RunExperienceInput`, keeping the agents package vendor-free).

---

### `packages/experience-builder-validation/src/astValidator.ts` (EXTEND — VAL-04 literal blocking)

**Analog:** itself, `checkLiteralHook` skeleton (lines 265-286), explicitly marked "Full literal scan lands in P3":
```typescript
const VISUAL_LITERAL_RE = /(#[0-9a-fA-F]{3,8}\b|\b\d+(?:px|rem|em)\b|\brgb\(|\bhsl\()/;
function checkLiteralHook(node: ComponentNode): ViolationT[] {
  const isTokenRef = value.includes('var(--') && BRAND_ALLOWED_REGEX.test(value.replace(/^.*var\(/, ''));
  if (isTokenRef) continue;
  if (VISUAL_LITERAL_RE.test(value)) warnings.push({ code: 'literal-value-hook', severity: 'warning', … });
}
```
**Changes for VAL-04:** promote `severity: 'warning'` → `'blocking'` (use the existing `blocking()` builder, lines 163-169, and push into `acc.blocking` at the call site `walkNode` line 368); extend `VISUAL_LITERAL_RE` to also catch radius/elevation/motion literals + unapproved fonts/icons; keep classifying token refs via `BRAND_ALLOWED_REGEX` (the ONE sanctioned regex, imported from `@oneui/shared/engine/tokenBoundary`, line 59). Result still flows through `JioValidationResult.parse(result)` (line 431) for auditability.

---

### `packages/experience-builder-validation/src/fixtures/redteam.ts` (EXTEND — VAL-05 corpus)

**Analog:** itself, `REDTEAM_FIXTURES` (lines 29-109), 6 entries today, each a `RedTeamFixture` = `{ name, description, ast: ArtifactAst, expectedBlockingCode }`. Add entries that should now hit `'literal-value-hook'` (after promotion to blocking): inline hex on a real visual prop, fake `var()`, dynamic className, aliased non-Jio font/icon. Test asserts the validator blocks 100% of the corpus.

---

### `packages/convex/convex/schema.ts` (EXTEND — additive, D-12/D-13)

**Analog:** itself, `experienceArtifacts` (schema.ts:2007) and `experienceArtifactVersions` (schema.ts:2025). The `compiledBundle` field already demonstrates the **additive `v.optional` no-migration pattern** (lines 2042-2052 + comment):
```typescript
// Additive v.optional so existing rows (no bundle) round-trip — no data migration, append-only (D-07).
compiledBundle: v.optional(v.object({ code: v.string(), meta: v.optional(v.any()) })),
```
**Add (all `v.optional`):** `variantGroupId: v.optional(v.string())` on `experienceArtifacts` (D-12 — NO new variant table); on `experienceArtifactVersions` add `previewState`, `thumbnail` (`v.optional(v.id('_storage'))`), `evaluation: v.optional(v.any())`, `originRunId` (D-13). `parentVersionId` + `by_artifact` index already exist. Optionally add a `by_variant_group` index on `experienceArtifacts`.

---

### `packages/convex/convex/experienceRuns.ts` (EXTEND — VER-01/02)

**Analog:** itself. `persistArtifact` mutation (lines 89-144) is the insert pattern — extend its args + the `experienceArtifactVersions` insert (lines 128-136) with the new D-13 fields, and accept `variantGroupId` on the artifact insert (lines 116-123). `getArtifactHistory` query (lines 173-184) is the VER-02 read — add a sibling `listVariantGroup` query that scans `experienceArtifacts` by `variantGroupId` (mirror `listRunsByBrand`'s `withIndex` scan, lines 159-167). Follows the brands.ts query/mutation conventions; all changes append-only.

---

### `apps/.../(experience-lab)/_canvas/frames/VariantGroupFrame.tsx` (NEW — CANVAS-05, D-14)

**Analog:** `_canvas/frames/RunGroupFrame.tsx` — **exact**. Extend tldraw's `FrameShapeUtil` WITHOUT importing `OneUIFrameShapeUtil` (LAB-03 isolation), patch the frame body fill to a surface token via `patchFrameBodyFill`:
```typescript
const RUN_FRAME_FILL = 'var(--Surface-Fill-Subtle, var(--Surface-Subtle))';
export class RunGroupFrameShapeUtil extends FrameShapeUtil {
  override component(shape: unknown) { return patchFrameBodyFill(super.component(shape as never), RUN_FRAME_FILL); }
}
```
The variant frame groups sibling artifact cards sharing a `variantGroupId` (D-14); copy `patchFrameBodyFill` verbatim and the `name`-prop "Run #N"→"Variant Group" label convention.

---

### `apps/.../(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx` (EXTEND — CANVAS-06 live iframe + PREV-03 lifecycle)

**Analog:** itself. The ShapeUtil pattern (lines 56-91) is the template: static `type`, `props: RecordProps` (use `T.number`/`T.string`/`T.jsonValue`), `getDefaultProps`, `getGeometry` (`Rectangle2d`), `component()` → body, `indicator()`. Body uses `HTMLContainer` with `var(--Surface-Main)` + `var(--Shape-4)`, `onPointerDown={editor.markEventAsHandled}`, `<Surface mode="subtle">` for chrome (never raw `<div style={{background}}>` — LAB-02 / CLAUDE.md Surface rule).

**CANVAS-06 change:** replace/augment the IR-summary body with a real-DOM **live iframe** (the separate-origin preview URL from `previewState`, PREV-02) — NOT raster, NOT `dangerouslySetInnerHTML`. Add the PREV-03 lifecycle state (thumbnail → lightweight → live) as card render-state; thumbnail reads the `_storage` thumbnail, live embeds the sandbox `getSignedPreviewUrl`. Keep the existing `ToggleGroup` IR/JSON inspector.

---

### `apps/.../(experience-lab)/_panels/VersionTimelinePanel.tsx` (NEW — VER-02, D-14)

**Analog:** `_panels/RunInspectorPanel.tsx` (panel structure) + the `getArtifactHistory` Convex query. Read versions via `useQuery(api.experienceRuns.getArtifactHistory, { artifactId })`, render a per-card timeline of versions chained by `parentVersionId`. Token-only chrome + Jio components (`@oneui/ui`), `<Surface>` containers per CLAUDE.md.

## Shared Patterns

### Single model seam (ORCH-04) — applies to: evaluate.ts, repair.ts
**Source:** `packages/experience-builder-agents/src/modelAdapter.ts:110-114` (`callModel`)
All model calls (vision judge, repair patch generation) route through `callModel`. NO `ai`/`@ai-sdk/*` import outside `modelAdapter.ts`. Branching/sequencing/retry live in `workflow.ts`, never in a model callback.
```typescript
export function callModel<TSchema extends z.ZodType>(args: CallModelArgs<TSchema>): Promise<z.infer<TSchema>> {
  return _callModelImpl(args);
}
```

### Zod-4 ↔ Anthropic structured output — applies to: evaluatorRubric.ts, repair.ts (patch schema)
**Source:** `packages/experience-builder-agents/src/irGenerator.ts:111-126`
Plain `z.number()` (no `.int()/.min()/.max()`); `z.object({}).catchall(...)` (never keyed `z.record`); clamp ranges after parse + state them in the prompt. (RESEARCH Pitfall 2.)

### Mastra step convention — applies to: evaluate.ts, repair.ts, workflow.ts edits
**Source:** `packages/experience-builder-agents/src/workflow.ts:532-556` (`validateStep`) + `237-247` (`intentStep`)
`createStep({ id, inputSchema: ctxSchema, outputSchema: ctxSchema, execute })`; `if (ctx.halted) return { ctx };` guard; `emit(ctx, { type:'step', step, status:'started'|'completed', at: now() })`; mutate `ctx`; return `{ ctx }`. Keep `ORDERED_STEPS` + the `.then` chain in sync.

### Dependency-injection-for-tests seam — applies to: PreviewExecutor.ts, workflow.ts (PreviewExecutor injection)
**Source:** `modelAdapter.ts:121-128` (`__setCallModelImpl`) + `workflow.ts:163-182` (`foundationsLoader` opaque-function injection)
Vendors (Daytona/Playwright) are injected as an opaque interface on the run input; production wires the real impl, tests pass a mock. Keeps the agents package vendor-free (CI import guards).

### Append-only Convex persistence — applies to: schema.ts, experienceRuns.ts
**Source:** `schema.ts:2042-2052` (`compiledBundle` additive `v.optional` + comment)
New fields are `v.optional`; existing rows round-trip; no destructive migration (D-07/D-08/D-12/D-13).

### Token-handoff isolation — applies to: IframeCspExecutor.ts, the preview render route
**Source:** `apps/platform/src/lib/playwrightRenderer.ts:42-70` + `render-ast/page.tsx` + `PREVIEW-DECISION.md`
`randomUUID()` token → in-memory 60s TTL cache → server-side `consume(token)`; nothing sensitive in the URL; separate origin, `allow-scripts` WITHOUT `allow-same-origin`, strict CSP, `frame-ancestors` pinned, `postMessage` origin checks, zero auth/Convex tokens in preview (PREV-01).

### tldraw ShapeUtil / FrameShapeUtil extend-without-import — applies to: ArtifactCardShape.tsx, VariantGroupFrame.tsx
**Source:** `_canvas/shapes/ArtifactCardShape.tsx:56-91` (ShapeUtil) + `_canvas/frames/RunGroupFrame.tsx:67-74` (FrameShapeUtil)
Extend tldraw base utils directly (LAB-03: never import the existing `OneUI*ShapeUtil` from the builder — isolation). Token-only chrome, `<Surface>` containers, `HTMLContainer` + `editor.markEventAsHandled`.

## No Analog Found

None. Every Phase 3 file maps to a verified in-repo analog (RESEARCH's "~70% integration of existing assets" is confirmed by direct read). The only NET-NEW vendor surface is `@daytonaio/sdk` inside `DaytonaExecutor.ts`, whose screenshot semantics still mirror `playwrightRenderer.ts` and whose install is gated behind `checkpoint:human-verify`.

## Metadata

**Analog search scope:**
- `apps/platform/src/lib/` (playwrightRenderer)
- `apps/platform/src/app/api/composition/` (verify, repair routes)
- `apps/platform/src/app/internal/render-ast`, `render-code`
- `apps/platform/src/app/(platform)/(experience-lab)/_canvas/`, `_panels/`
- `packages/experience-builder-{core,validation,agents,preview,registry}/src/`
- `packages/convex/convex/` (schema.ts, experienceRuns.ts)

**Files scanned (read in full or targeted):** 13
- playwrightRenderer.ts, verify/route.ts, repair/route.ts, patch.ts, astValidator.ts, redteam.ts, workflow.ts, experienceRuns.ts, render-ast/page.tsx, ArtifactCardShape.tsx, RunGroupFrame.tsx, PREVIEW-DECISION.md, schema.ts (§2007-2052), modelAdapter.ts (§55-129), irGenerator.ts (§95-135)

**Pattern extraction date:** 2026-06-01
