# Phase 02: Real Source Integration - Pattern Map

**Mapped:** 2026-05-31
**Files analyzed:** 11 (4 edits, 7 new)
**Analogs found:** 11 / 11 (every file has a concrete in-repo analog — this is a "reuse by contract" phase)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `experience-builder-agents/src/foundationResolver.ts` `[EDIT]` | service (resolver) | transform / request-response | self (mock success arm) + `packages/shared/src/engine/buildThemeConfig.ts` | exact (body swap, frozen shape) |
| `experience-builder-agents/src/foundationResolver.test.ts` `[EDIT]` | test | transform | self (existing P1 test) | exact |
| `experience-builder-agents/src/adapters/voiceAdapter.ts` `[NEW]` | service (Mastra tool/adapter) | request-response (LLM) | `mockGeneration.ts` (gate+assemble) + `compileVoiceRules`/`runToneGuard` + `apps/platform/.../executors/voice.ts` (model-call shape ONLY) | role-match |
| `experience-builder-agents/src/adapters/designAdapter.ts` `[NEW]` | service (Mastra tool/adapter) | request-response (LLM) | `compileCompositionRules`/`getDefaultCompositionConfig` + voiceAdapter sibling | role-match |
| `experience-builder-agents/src/agents/plannerAgent.ts` `[NEW]` | agent (Mastra) | request-response (structured LLM) | `modelAdapter.ts` seam + voice executor `generateText` shape | role-match (net-new, no planner exists) |
| `experience-builder-agents/src/irGenerator.ts` `[NEW]` | service (commit step) | transform + retry loop (structured LLM) | `mockGeneration.ts` (the mock it replaces) + RESEARCH GEN-05 example | exact (1:1 replacement of mock) |
| `experience-builder-agents/src/compiler.ts` `[NEW]` | service (compile) | transform (pure) | `workflow.ts` `irToArtifactAst` + `astToReactComponent` + `validateAst` | exact (all callees frozen) |
| `experience-builder-agents/src/cache.ts` `[NEW]` | utility | memoization | repo `cacheKey`/`computeInputHash` pattern (`packages/shared/src/engine/__tests__/cacheKey.test.ts`) | partial (pattern only) |
| `experience-builder-agents/src/modelAdapter.ts` `[EDIT]` | service (model seam) | request-response (LLM) | self (`callModel` stub) + voice executor `anthropic(model)` + `Output.object` | exact (implement the stub) |
| `experience-builder-agents/src/workflow.ts` `[EDIT]` | orchestration | event-driven (pipeline) | self (existing `.then(...)` spine + `createStep`) | exact |
| `experience-builder-registry/src/queryRegistry.freshness.test.ts` `[NEW]` | test (CI gate) | derive-equals-live assertion | `queryRegistry.test.ts` (derivation-traceability block) | exact |
| `packages/convex/convex/schema.ts` `experienceArtifactVersions` `[EDIT]` | model (schema) | CRUD (additive field) | self (existing `experience*` table defs) | exact |

---

## Pattern Assignments

### `foundationResolver.ts` (service, transform) — FND-04 body swap `[EDIT]`

**Analog:** the file's own success arm (mock) + `packages/shared/src/engine/buildThemeConfig.ts`.

The return contract `FoundationResolveResult` and the `ThemeConfig` shape are FROZEN. FND-04 swaps `mockTheme()` for the real call — same shape, so it is a data swap, not a migration. Delete `mockScaleDefinition`/`mockTheme`; keep `isCoveredProfile` and the gap arm verbatim.

**The success arm to replace** (`foundationResolver.ts` lines 99-119):
```typescript
export function resolveFoundation(
  input: FoundationResolveInputT,
): FoundationResolveResult {
  if (!isCoveredProfile(input)) {
    return foundationGap({ artifactType: input.artifactType, outputProfile: input.outputProfile, reason: ... });
  }
  // Covered (web) profile → ThemeConfig-shaped success. P2 swaps this body.
  return foundationResolved(mockTheme());   // <-- swap this line
}
```

**Real call target — `buildThemeConfig` signature** (`packages/shared/src/engine/buildThemeConfig.ts` lines 102-138):
```typescript
export function buildThemeConfig(
  availableScales: EngineAvailableScale[],
  appearanceConfig: ThemeConfigAppearanceInput | null,
): ThemeConfig | null {
  if (!availableScales.length) return null;
  // ...accent loop...
  synthesizeBrandBgIfMissing(appearances, configuredRoles, appearanceConfig as any, availableScales);
  ensureNeutralRole(appearances, configuredRoles, availableScales);   // <-- D-09 system defaults
  if (Object.keys(appearances).length === 0) return null;
  return { appearances };
}
```

**D-09 partial-brand rule:** `synthesizeBrandBgIfMissing` + `ensureNeutralRole` ARE the engine's system defaults. A partially-configured brand resolves; the ONLY gap arm for FND-04 is a `null` return / genuinely unresolvable profile. Map it as:
```typescript
const theme = buildThemeConfig(availableScales, appearanceConfig);
if (!theme) return foundationGap({ artifactType, outputProfile, reason: '...unresolvable...' });
return foundationResolved(theme);
```

**Input mapping — OPEN (RESEARCH A2 / Open Q1):** `availableScales: EngineAvailableScale[]` + `appearanceConfig: ThemeConfigAppearanceInput` must come from the brand's Convex foundations. `ThemeConfigAppearanceInput` is the permissive shape at `buildThemeConfig.ts` lines 31-51 (`accentCount`, `background`, `accents[{role, scaleName, baseStep}]`, `logo`). The live platform already builds these near `FoundationStyleProvider`/`useBrandCSS` — locate and reuse the node-safe mapping; do NOT import `FoundationStyleProvider` (forbidden file).

---

### `foundationResolver.test.ts` (test) — FND-04 extension `[EDIT]`

**Analog:** the existing P1 test (this same file, lines 1-86).

Keep the gap-arm assertions verbatim (the Pitfall-6 "no numeric dimensions" block lines 61-72 still holds). Add: a configured-brand → `{ ok: true, theme }` case asserting `theme.appearances.primary` shape (lines 28-39 already show the assertion idiom), and a partial-brand case asserting it resolves (not gaps) because `ensureNeutralRole` fills the default (D-09). Mock the Convex foundations input, not the model (resolver has no model). The determinism assertion (lines 78-85) carries over.

---

### `adapters/voiceAdapter.ts` (Mastra tool/adapter, LLM request-response) — GEN-02 `[NEW]`

**Analog (structure):** `mockGeneration.ts` (gate-then-assemble + discriminated result). **Analog (reused engine pieces):** `compileVoiceRules` + `runToneGuard`. **Analog (model-call shape ONLY, do NOT import):** `apps/platform/.../executors/voice.ts`.

**CRITICAL (Pitfall A):** do NOT import the route executor. It returns an HTTP `Response`, imports `ai` directly, reads `process.env.ANTHROPIC_API_KEY`, and uses `@/lib/*`. Reuse only the node-safe engine functions and route the model call through `modelAdapter`.

**Reused engine signatures** (`packages/shared/src/engine` barrel lines 267-268):
```typescript
// compileVoiceRules — voiceCompiler.ts L233
export function compileVoiceRules(
  resolvedRules: VoiceRule[], config: VoiceConfig,
  channel?: string, skills?: VoiceSkill[], context?: VoiceContext,
): CompiledVoicePrompt;
// runToneGuard — voiceToneGuard.ts L519
export function runToneGuard(response: string, config: VoiceConfig, channel?: string): ToneGuardResult;
```

**Model-call shape to mirror** (from `executors/voice.ts` lines 111-145, but the call must live in/through `modelAdapter`, NOT here):
```typescript
const firstPass = await generateText({ model: anthropic(model), system: systemPrompt, messages });
let content = firstPass.text;
let guard = runToneGuard(content, config, channel);   // <-- reuse this validation loop
```

**Result-shape pattern** (mirror `mockGeneration.ts` lines 52-54 discriminated union): emit a structured, **markup-free** copy spec fragment per section (D-01 "advises"). Tool wiring uses `createTool({ id, description, inputSchema, outputSchema, execute })` (RESEARCH § Mastra tool, `@mastra/core/tools`).

---

### `adapters/designAdapter.ts` (Mastra tool/adapter, LLM request-response) — GEN-03 `[NEW]`

**Analog:** sibling `voiceAdapter.ts` (same structure) + `compileCompositionRules`/`getDefaultCompositionConfig`. Same Pitfall-A rule (do NOT import `executors/design.ts` — it adds a Convex HTTP client coupling).

**Reused engine signatures** (`packages/shared/src/engine` barrel line 309):
```typescript
// compositionCompiler.ts L361
export function compileCompositionRules(
  resolvedRules: CompositionRule[], config: CompositionConfig,
  componentRef?: string, brandSummary?: string,
  skills?: CompositionSkill[], context?: CompositionContext, options?: CompileCompositionOptions,
): CompiledCompositionPrompt;
// compositionCompiler.ts L546 — the default to seed config when brand has none
export function getDefaultCompositionConfig(): CompositionConfig;
```

Emits a layout/component spec fragment per section (D-01 "advises"). Constrain chosen components to the retrieved `queryRegistry()` ids (Pitfall #9 — no hallucinated components).

---

### `agents/plannerAgent.ts` (Mastra agent, structured LLM) — GEN-04 `[NEW]`

**Analog:** `modelAdapter.ts` model seam + the `generateText({ model: anthropic(model) })` shape from the voice executor. Net-new — no planner exists in the repo (D-02), so there is no exact analog; closest is the adapter siblings + the structured-output idiom.

Output schema (D-02): `{ sections[], messageHierarchy, primaryCTA, screenCount }` via `Output.object({ schema })` or `Agent.generate({ structuredOutput: { schema } })`. Model call MUST route through `modelAdapter` (the only `ai`/`@ai-sdk` touchpoint). Default to the most capable cost-appropriate model via the adapter (CLAUDE_MODEL = `claude-sonnet-4-6` per `@oneui/shared/agent`). Cache repeatable calls via `cache.ts` (D-05).

---

### `irGenerator.ts` (service, structured LLM + retry) — GEN-05 `[NEW]`

**Analog:** `mockGeneration.ts` — this file REPLACES the mock generator. Keep the discriminated result shape and the gate-then-assemble structure; swap the hand-shaping for an `Output.object` LLM call + in-gen retry.

**Mock result shape to preserve** (`mockGeneration.ts` lines 52-54):
```typescript
export type MockGenerateResult =
  | { ok: true; ir: JioExperienceIRT }
  | { ok: false; foundationGap?: FoundationGapT; componentGap?: JioComponentGap };
```
**Defensive-parse pattern to keep** (`mockGeneration.ts` lines 139-145): `JioExperienceIR.safeParse(ir)` before returning. Real version uses `parseIR` for the same guard.

**In-gen retry loop (D-06)** — implement per RESEARCH GEN-05 example (`02-RESEARCH.md` lines 369-389): loop cap ~2-3, re-prompt with the appended Zod error OR the `compile()` `validateAst` violations, then gap. Loop lives HERE (orchestration), never in an AI-SDK callback. Constrain IR `type` to retrieved `componentId`s (registry enum). Per-section decomposition (roadmap mandate) — generate section skeletons first, fill each section in a bounded call. **Confirm the `Output.object` result accessor** (`experimental_output` vs `output`) against installed `ai@6.0.111` (RESEARCH A4).

---

### `compiler.ts` (service, pure transform) — GEN-06 `[NEW]`

**Analog:** `workflow.ts` `irToArtifactAst` (lines 100-114) + `astToReactComponent` + `validateAst`. All callees are frozen; this is pure wiring.

**`irToAst` → ASTRoot** (`experience-builder-core/src/ir/irToAst.ts` lines 92-122): sections → `'Stack'` layout wrappers, root → `'Container'`. NOTE the `Stack`→`Container` remap the workflow already handles (`workflow.ts` lines 54-60, `LAYOUT_TYPE_REMAP`) — reuse `irToArtifactAst` for the validator path.

**Canonical string emitter** (`packages/shared/src/codegen/astToReact.ts` lines 132-164):
```typescript
export function astToReactComponent(
  tree: ASTRoot,
  options: AstToReactOptions & { componentName?: string } = {},
): string {
  const { importSource = '@oneui/ui', componentName = 'GeneratedComponent' } = options;
  // emits: import React + import { ... } from importSource + export function ...
}
```
`importSource` defaults to `@oneui/ui` — exactly the approved-import constraint (D-07). The codegen string is the **canonical persisted bundle**; `ASTRenderer` stays ephemeral/internal-only.

**Acceptance triad (D-08)** — mirror RESEARCH `compile()` (`02-RESEARCH.md` lines 285-298):
```typescript
const ast = irToAst(ir);
const bundle = astToReactComponent(ast, { importSource: '@oneui/ui', componentName: 'GeneratedArtifact' });
const validation = validateAst(irToArtifactAst(ir), ctx);   // allowlist (Pitfall #5)
return { bundle, validation };
```
Legs (1) tsc + import resolution, (2) `validateAst` passed, (3) `toMatchSnapshot()` on `bundle` for a fixed IR fixture — all credential-free, no jsdom.

---

### `cache.ts` (utility, memoization) — D-05 `[NEW]`

**Analog:** repo `cacheKey`/`computeInputHash` pattern (`packages/shared/src/engine/__tests__/cacheKey.test.ts`).

**NOT a prompt cache (Pitfall B):** `MastraServerCache`/`InMemoryServerCache` is a generic KV/list store, not an LLM-response cache. Build a thin Lab-owned deterministic memoization wrapper. Key = stable hash of canonical inputs `{ brandId, artifactType, outputProfile, prompt, requestedComponents, model }`. Backing store = `InMemoryServerCache` (dev) or Convex (durable). Wrap the planner/ToV/Design steps only (the deterministic/repeatable ones).

---

### `modelAdapter.ts` (service, model seam) — implement `callModel` `[EDIT]`

**Analog:** the file's own `callModel` stub (lines 61-66) + the voice executor's `anthropic(model)` model construction.

**Stub to implement** (`modelAdapter.ts` lines 61-66):
```typescript
export function callModel(): never {
  throw new Error('callModel is not available in P1 — ... wired in P2.');
}
```
Implement as the single seam wrapping `ai`'s `generateText`/`streamText` + `@ai-sdk/anthropic`'s `anthropic(model)` + `Output.object`. KEEP `AI_SDK_STREAM_VERSION = 'v6'` and `toV6WorkflowStream` untouched (lines 30, 44-50). This MUST remain the ONLY module importing `ai`/`@ai-sdk/*` (ORCH-04 / Pitfall #1). No sequencing/branching/retry here — those live in `irGenerator.ts`/`workflow.ts`.

---

### `workflow.ts` (orchestration, event-driven) — add real steps `[EDIT]`

**Analog:** the file's own `.then(...)` spine (lines 275-285) + `createStep` pattern (lines 163-269) + `ORDERED_STEPS` runner (lines 301-354).

**Step pattern to copy** (`workflow.ts` lines 175-200): each `createStep({ id, inputSchema: ctxSchema, outputSchema: ctxSchema, execute })` emits `started`/`completed` `ExperienceBuilderEvent`s. New step names `plan`/`design`/`copy`/`compile` need NO schema change — `ExperienceBuilderEvent.step` is open `z.string()` (RESEARCH lines 414-416).

**Spine to extend** (lines 280-285): insert plan → design → copy → compile between `retrieveStep` and `validateStep`, matching the D-01 assembler-last topology. Add each new step to `ORDERED_STEPS` (line 301). Gap short-circuit + `ctx.halted` branching (lines 220-236, 251-254) stays the workflow's job (ORCH-04). The `generate-ir` step swaps `mockGenerate` (line 210) for `irGenerator`.

---

### `queryRegistry.freshness.test.ts` (test, CI gate) — REG-04 `[NEW]`

**Analog:** `queryRegistry.test.ts` "derivation traceability" block (lines 118-149) — already asserts count traces to catalog-minus-exclusions and Button variants trace to generated meta. REG-04 hardens this into a deep-equality hard-fail gate.

**Pattern to follow** (RESEARCH lines 261-279 + existing test lines 119-148):
```typescript
import { queryRegistry, KNOWN_DRIFT_EXCLUSIONS } from './queryRegistry';
import { JIO_WEB_ALPHA_COMPONENTS } from '@oneui/ui/registry/jioAlphaCatalog';

const live = JIO_WEB_ALPHA_COMPONENTS.map(e => e.name)
  .filter(n => !KNOWN_DRIFT_EXCLUSIONS.includes(n)).sort();
const derived = queryRegistry().map(i => i.id).sort();
expect(derived).toEqual(live);   // D-10: hard-fail on ANY add/remove/change
// PLUS per-item props/variants/slots deep-equality vs *_GENERATED_PROPS to catch metadata drift.
```
`KNOWN_DRIFT_EXCLUSIONS` is already exported (`queryRegistry.ts` line 135) for the gate to read. Wire into `pnpm ci:gates`.

---

### `packages/convex/convex/schema.ts` — `experienceArtifactVersions.compiledBundle` `[EDIT]`

**Analog:** the existing `experienceArtifactVersions` table def (`schema.ts` lines 2025-2042).

**Existing table to extend** (lines 2025-2042):
```typescript
experienceArtifactVersions: defineTable({
  artifactId: v.id('experienceArtifacts'),
  runId: v.id('experienceRuns'),
  ir: v.any(),                          // canonical IR (structured JSON, markup-free)
  validation: v.optional(v.any()),
  parentVersionId: v.optional(v.id('experienceArtifactVersions')),
  createdAt: v.number(),
  // ADD: compiledBundle — the GEN-06 canonical codegen string + meta (D-07).
  //      v.optional(...) so existing rows (no bundle) round-trip — additive, append-only.
})
```
Follow existing conventions: additive `v.optional()` field, structured/text (the codegen string + meta), never raw markup as source of truth (CONTEXT discretion item A3). No data migration — existing rows validly lack the field.

---

## Shared Patterns

### Single model/transport seam (ORCH-04 / Pitfall #1)
**Source:** `experience-builder-agents/src/modelAdapter.ts`
**Apply to:** every file making a model call — `plannerAgent.ts`, `voiceAdapter.ts`, `designAdapter.ts`, `irGenerator.ts`.
All `ai`/`@ai-sdk/*` imports live in `modelAdapter.ts` ONLY. `version: 'v6'` is pinned in exactly one place (line 30). CI `pnpm why ai` must show one version.

### Gate-then-assemble + discriminated result
**Source:** `experience-builder-agents/src/mockGeneration.ts` lines 63-146
**Apply to:** `irGenerator.ts`, both adapters.
```typescript
const resolved = resolveFoundation(input.request);
if (!resolved.ok) return { ok: false, foundationGap: resolved.gap };
for (const id of requested) {
  const lookup = getRegistryItem(id);
  if (!lookup.ok) return { ok: false, componentGap: lookup };   // exact membership, never near-match
}
// ...assemble... then defensive safeParse before returning ok:true.
```

### Per-step event emission (tracing surface, D-05)
**Source:** `experience-builder-agents/src/workflow.ts` lines 149-151, 181-183
**Apply to:** every new workflow step.
```typescript
function emit(ctx, event) { ctx.events.push(event); }
emit(ctx, { type: 'step', runId: ctx.runId, step: '<name>', status: 'started', at: now() });
```
The existing `ExperienceBuilderEvent` stream IS the P2 trace surface (Pitfall C) — `@mastra/observability` is optional, defer to P5 unless richer spans are explicitly wanted.

### Markup-free IR string guard (Security V5 / Pitfall #2)
**Source:** `JioExperienceIR` Zod schema (`experience-builder-core`), used via `parseIR`
**Apply to:** `irGenerator.ts` output, both adapters' copy/spec strings.
Every IR string field is markup-free by Zod refinement; `.strict()` rejects smuggled JSX → gap, never compile.

### Derive-don't-copy (Pitfall #5 / REG-04)
**Source:** `experience-builder-registry/src/queryRegistry.ts` (whole module)
**Apply to:** the freshness gate + the IR Generator's component-id constraint.
No hand-maintained component list anywhere. The IR Generator references only `queryRegistry()` ids.

---

## No Analog Found

None. Every file maps to a concrete in-repo analog — this is a "reuse by contract" phase where new code wraps or swaps into frozen engine functions.

Two structures are net-new in *intent* but still have a structural analog:
| File | Role | Note |
|------|------|------|
| `agents/plannerAgent.ts` | agent | No planner exists (D-02); structural analog = adapter siblings + `modelAdapter` seam + voice executor `generateText` shape. |
| `cache.ts` | utility | Pattern-only analog (`cacheKey`/`computeInputHash` test); no runtime cache module exists yet. |

---

## Metadata

**Analog search scope:** `packages/experience-builder-{agents,registry,core,validation}/src`, `packages/shared/src/{engine,codegen,meta}`, `packages/convex/convex/schema.ts`, `apps/platform/src/app/api/agent/executors` (model-call shape reference only — NOT a reuse target).
**Files scanned:** ~14 source files read.
**Pattern extraction date:** 2026-05-31

## PATTERN MAPPING COMPLETE

**Phase:** 02 - real-source-integration
**Files classified:** 11 (4 edits, 7 new)
**Analogs found:** 11 / 11

### Coverage
- Files with exact analog: 8
- Files with role-match analog: 3 (voiceAdapter, designAdapter, plannerAgent)
- Files with no analog: 0

### Key Patterns Identified
- All model calls funnel through the single `modelAdapter.ts` seam (`callModel` stub → implement); `ai`/`@ai-sdk` touched nowhere else; `version: 'v6'` pinned once.
- Discriminated `{ ok: true } | { ok: false, gap }` result + gate-then-assemble + defensive `safeParse`/`parseIR` is the repo's generator/resolver idiom — `irGenerator.ts` and both adapters copy it from `mockGeneration.ts`.
- ToV/Design adapters reuse the node-safe engine prompt-compilers (`compileVoiceRules`+`runToneGuard`, `compileCompositionRules`+`getDefaultCompositionConfig`) — NEVER the `apps/platform` route executors (Pitfall A: those return HTTP `Response`, import `ai`, read env keys, couple to `@/lib`/Convex).
- GEN-06 is pure wiring of frozen callees: `irToAst` → `astToReactComponent` (canonical string, `importSource: '@oneui/ui'`) + `validateAst` via the existing `irToArtifactAst` bridge (`Stack`→`Container` remap reused).
- REG-04 freshness gate hardens the existing `queryRegistry.test.ts` derivation-traceability block into a deep-equality hard-fail using the already-exported `KNOWN_DRIFT_EXCLUSIONS`.
- Convex change is a single additive `v.optional()` `compiledBundle` field — append-only, no migration.

### File Created
`/Users/nunomarcelino/Documents/Code/OneUIStudio_BaseUI_v4/.planning/phases/02-real-source-integration/02-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog file paths + line ranges directly in PLAN.md action sections.
