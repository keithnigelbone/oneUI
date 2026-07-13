---
status: resolved
trigger: Generated experience IR renders as unusable garbage even though the run completes with outcome=artifact and the validate step passes. Two linked suspected causes — (1) generate-ir emits prop-incomplete/nonsensical component instances; (2) the validate step passes invalid IR because it does not enforce component prop contracts, so the bounded-repair loop is never triggered.
created: 2026-06-03
updated: 2026-06-03
---

# Debug: invalid-ir-passes-validation

## Symptoms

### Expected behavior
A generation run for a prompt like "build a charging credit mobile plan flow" should produce an IR that compiles to a real, usable Jio UI — components with valid required props, real text content, coherent layout — and renders that way in the preview.

### Actual behavior
The rendered artifact is unusable garbage: black content boxes, vertical rows of `PaginationDots` with no count, no real text, ~225 component instances for a simple prompt. Yet the run completes with `outcome=artifact` and every quality gate in the timeline reports green: `IR produced (valid)`, `compile completed`, `Validation passed` (twice, incl. after repair), `evaluate completed`, `version-freeze completed`, `Run completed (artifact)`.

### Error messages
- React runtime error from the rendered tree: `Encountered two children with the same key, NaN` at `packages/ui/src/components/PaginationDots/PaginationDots.tsx:141` — `absIdx` is `NaN` because the generated `PaginationDots` instance has no valid `count` prop. (A defensive guard was added to `PaginationDots.shared.ts` so it no longer crashes, but the underlying invalid IR remains.)

### Timeline
Surfaced while validating Phase 4 of the Jio AI Experience Builder Lab. Preview-layer issues (wrong executor, buried thumbnail, AST-not-found, missing brand cascade) were fixed first; once the preview rendered correctly it exposed that the generated content itself is invalid.

### Reproduction
1. `pnpm dev` (platform on localhost:3001), Lab at `/lab`.
2. Add a prompt card: brand Jio / sub-brand MyJio / artifact `Web UI` / profile `Desktop`, prompt "please build a charging credit mobile plan flow mobile".
3. Run generation → completes as `artifact`.
4. Open the artifact's full preview (`/internal/render-ast?token=…&brandId=…`).
5. Observe: black boxes, rows of count-less PaginationDots, no text.

## Confirmed (not the cause)
- NOT a preview/plumbing issue: `render-ast` now injects the artifact brand cascade and the ASTRenderer threads IR props into the real components (`convertProps` → `sanitizePropsForComponent` → spread).
- `generate-ir` is REAL (model-backed via `callModel` per section in `packages/experience-builder-agents/src/irGenerator.ts`), NOT a mock.

## Investigation focus
1. Why does the model-backed `generate-ir` emit prop-incomplete / nonsensical component instances?
2. Why does the `validate` step PASS this invalid IR — does it enforce component prop contracts against component metadata?

## Current Focus

- hypothesis: CONFIRMED then FIXED. The composition validator (`validateAst`) checked structure + registry membership + present-prop allowlisting + literal-boundary, but NEVER enforced per-component *required* props, so prop-incomplete instances passed and starved the in-gen retry + bounded-repair loop. Separately, the IR-generation prompt gave the model only a bare registry-id allowlist with no per-component prop contract / text-copy guidance / instance budget, so it emitted degenerate compositions.
- next_action: (done) both fixes applied + tested.

## Evidence

- timestamp: 2026-06-03 — `astValidator.ts:checkComponentProps` only iterated `Object.entries(node.props)` — i.e. props that are PRESENT. It checked (a) unknown prop names, (b) out-of-range enumerated values, and a no-op skeleton slot check. It NEVER read `item.props[].required` and NEVER checked for missing required props. A component instance that OMITS a required prop had nothing to iterate and passed with zero blocking violations.
- timestamp: 2026-06-03 — The registry CARRIES required-prop data end-to-end: `PaginationDots.meta.ts` declares `{ name: 'count', type: 'number', required: true }`; `queryRegistry.ts:deriveProps` propagates `if (d.required) prop.required = true`; the contract `JioRegistryProp` defines `required: z.boolean().optional()`. `getRegistryItem(node.type).item.props` already in scope inside `checkComponentProps` as `item.props`.
- timestamp: 2026-06-03 — `irGenerator.ts:buildSectionPrompt` listed only the bare registry id allowlist + a "prefer these" list. No per-component prop contract, no text-slot guidance, no instance-count budget. `SectionFillSchema.props` was a fully-unconstrained OPTIONAL bag, so `{ id, type: 'PaginationDots' }` with zero props parsed cleanly → ~225 degenerate, count-less, text-less instances.
- timestamp: 2026-06-03 — Both validation seams call the SAME `validateAst`: the workflow `validateStep` (`workflow.ts:477`), the re-validate after repair (`workflow.ts:573`), AND the irGenerator in-gen retry Gate C (`irGenerator.ts:244`). Because `validateAst` reported `passed: true`, all three passed: run reported green, in-gen retry never re-prompted, bounded-repair loop never fired. One root gap manifested as three green-but-wrong gates.
- timestamp: 2026-06-03 — Data flow into the validator confirmed: IR componentInstance `props` → `irToAst` → `toValidatorNode` → validator `node.props`. The validator receives the real prop bag, so present/absent required props are observable at the `checkComponentProps` seam. No new plumbing required.
- timestamp: 2026-06-03 — VERIFICATION: after fix (1), `astValidator.test.ts` proves PaginationDots-without-count now blocks (`missing-required-prop`, offender `count`) and passes with `count` supplied; all-optional Button is unaffected. After fix (2), `irGenerator.test.ts` proves the section prompt declares the required prop + enum context for PaginationDots and the instance budget, and the system message instructs supplying required props + real copy. Suites: validation 55/55, agents 109/109. Only typecheck error is the pre-existing, unrelated `@oneui/shared/.../buildNativeTheme.ts:233` (`stateLayers`), not touched by either fix.

## Eliminated
- Preview / render plumbing (already fixed; confirmed not the cause).
- generate-ir being a mock (it is genuinely model-backed).

## Resolution

- root_cause: The composition validator `validateAst` (`packages/experience-builder-validation/src/astValidator.ts`) never enforced per-component REQUIRED-prop contracts — `checkComponentProps` only inspected props that were present, so an instance omitting a required prop (e.g. `PaginationDots` without `count`) passed with zero blocking violations. Because the same `validateAst` is the only validation seam for the workflow validate step, the post-repair re-validate, and the irGenerator in-gen retry Gate C, all three reported green and the bounded-repair loop never fired. Compounding this, `irGenerator.buildSectionPrompt` gave the model only a bare registry-id allowlist — no per-component prop contract (required props / allowed enum values), no real-copy guidance, no instance budget, and an unconstrained optional `props` bag in `SectionFillSchema` — so the model emitted structurally-valid-but-degenerate instances (~225 count-less, text-less components).
- fix:
  - (1) GUARDRAIL — `astValidator.ts:checkComponentProps` now iterates `item.props` and emits a blocking `missing-required-prop` violation + repair suggestion for any registry-`required` prop absent from `node.props`. This makes degenerate IR fail validation, which in turn arms the in-gen retry (Gate C), the workflow validate gate, and the bounded-repair loop.
  - (2) GENERATION — `irGenerator.ts` now builds per-component prop contracts (`buildComponentContracts`, sourced from the SAME `getRegistryItem` metadata the validator enforces: required props + enum value sets) and injects them into `buildSectionPrompt`, alongside explicit real-copy guidance and a `MAX_INSTANCES_PER_SECTION = 12` budget. The `callModel` system message was tightened to require supplying every required prop, only-allowed enum values, and real meaningful copy. `SectionFillSchema` left as-is (Anthropic structured-output rejects per-key `propertyNames`; the validator + retry loop is the safety net). No new ai/@ai-sdk touchpoints — still routed through the single `callModel` seam; Mastra orchestration unchanged.
- verification:
  - `pnpm --filter @oneui/experience-builder-validation test` → 55/55 pass (incl. 3 new required-prop tests).
  - `pnpm --filter @oneui/experience-builder-agents test` → 109/109 pass (incl. 4 new prompt-enrichment tests).
  - Typecheck: only error is the pre-existing, unrelated `@oneui/shared/src/engine/buildNativeTheme.ts:233` (`stateLayers`) — not touched by this work.
- files_changed:
  - `packages/experience-builder-validation/src/astValidator.ts` — required-prop enforcement in `checkComponentProps` + doc/header update.
  - `packages/experience-builder-validation/src/astValidator.test.ts` — 3 required-prop tests (PaginationDots).
  - `packages/experience-builder-agents/src/irGenerator.ts` — `buildComponentContracts`, `renderComponentContracts`, enriched `buildSectionPrompt`, tightened system message, `MAX_INSTANCES_PER_SECTION` budget + doc/header update.
  - `packages/experience-builder-agents/src/irGenerator.test.ts` — 4 prompt-enrichment tests.
- cycles: investigation 1 + fix 1 (this session)
