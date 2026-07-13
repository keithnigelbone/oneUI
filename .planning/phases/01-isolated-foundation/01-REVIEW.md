---
phase: 01-isolated-foundation
reviewed: 2026-05-30T00:00:00Z
depth: standard
files_reviewed: 42
files_reviewed_list:
  - packages/experience-builder-core/src/ir/schema.ts
  - packages/experience-builder-core/src/ir/artifactTypes.ts
  - packages/experience-builder-core/src/ir/irToAst.ts
  - packages/experience-builder-core/src/ir/patch.ts
  - packages/experience-builder-core/src/profiles/outputProfileTable.ts
  - packages/experience-builder-core/src/contracts/foundationResolve.ts
  - packages/experience-builder-core/src/contracts/registryItem.ts
  - packages/experience-builder-core/src/contracts/validation.ts
  - packages/experience-builder-core/src/contracts/events.ts
  - packages/experience-builder-core/src/index.ts
  - packages/experience-builder-registry/src/queryRegistry.ts
  - packages/experience-builder-registry/src/index.ts
  - packages/experience-builder-validation/src/astValidator.ts
  - packages/experience-builder-validation/src/fixtures/redteam.ts
  - packages/experience-builder-validation/src/index.ts
  - packages/experience-builder-agents/src/modelAdapter.ts
  - packages/experience-builder-agents/src/foundationResolver.ts
  - packages/experience-builder-agents/src/mockGeneration.ts
  - packages/experience-builder-agents/src/workflow.ts
  - packages/experience-builder-agents/src/index.ts
  - packages/convex/convex/schema.ts
  - packages/convex/convex/experienceRuns.ts
  - apps/platform/src/app/(platform)/(experience-lab)/layout.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/lab/page.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/frames/RunGroupFrame.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/cardChrome.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ComponentReferenceCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/FoundationProfileCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/GenericPlaceholderShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_panels/RunInspectorPanel.tsx
  - apps/platform/src/app/api/experience-lab/run/route.ts
  - apps/platform/src/config/navigation.tsx
  - scripts/check-single-ai-version.ts
  - scripts/smoke-existing-builder.ts
  - apps/platform/src/middleware.ts
findings:
  critical: 6
  warning: 7
  info: 3
  total: 16
status: issues_found
---

# Phase 01: Isolated Foundation — Code Review Report

**Reviewed:** 2026-05-30
**Depth:** standard
**Files Reviewed:** 42
**Status:** issues_found

## Summary

Phase 01 establishes the IR schema, AST validator, registry adapter, mock agent workflow, Convex persistence layer, and the isolated tldraw canvas shell. The security boundary work (markup-free IR, structural AST validator) is architecturally sound and correct in its core invariants. The isolation gate (LAB-03) is intact: the experience-lab route imports nothing from `(builder)`, and the CI scripts encode the boundary correctly.

Several concrete defects were found, ranging from a hardcoded production credential to a security boundary gap in the literal/token-reference classifier that could suppress warnings on mixed-content prop values. The `applyPatch` function does not re-validate the patched document against the IR schema, which would let a crafted patch smuggle markup back into a previously-valid IR. The run route lacks an explicit Node.js runtime declaration, which is fragile in certain Next.js deployment configurations. Convex persistence mutations are defined but never called, so run history is silently lost.

---

## Critical Issues

### CR-01: `applyPatch` does not re-validate the patched IR — markup can be smuggled back in

**File:** `packages/experience-builder-core/src/ir/patch.ts:193-199`

**Issue:** `applyPatch` applies arbitrary JSON-patch operations to a cloned `JioExperienceIRT` document and returns the result with a raw type-cast — `doc as unknown as JioExperienceIRT`. There is no Zod re-parse step. A `replace` operation at `/sections/0/instances/0/props/label` can inject `<div>malicious markup</div>` into a previously-valid IR. The result passes the TypeScript type boundary without triggering any of the `MarkupFreeString` refinements defined in `schema.ts`. The comment in `mockGeneration.ts` (line 139) shows that `JioExperienceIR.safeParse` is called after mock generation specifically to prevent this class of drift — but `applyPatch` has no equivalent guard. In P3, when the repair loop will call this function, every patched IR bypasses the entire IR-02 / T-01-01 trust boundary.

**Fix:**
```typescript
// In applyPatch (patch.ts), after applying all ops:
export function applyPatch(ir: JioExperienceIRT, patch: IrPatch): JioExperienceIRT {
  let doc = deepClone(ir) as unknown as JsonValue;
  for (const op of patch) {
    doc = applyOne(doc, op);
  }
  // Re-parse through the frozen schema so every patched IR is provably markup-free.
  // Mirrors the guard in mockGeneration.ts (line 139).
  const parsed = JioExperienceIR.safeParse(doc);
  if (!parsed.success) {
    throw new Error(
      `applyPatch produced an IR that failed the JioExperienceIR schema: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}
```

---

### CR-02: Token-reference classifier in `checkLiteralHook` suppresses literal warnings for mixed-content prop values

**File:** `packages/experience-builder-validation/src/astValidator.ts:273-276`

**Issue:** The `isTokenRef` check at line 273 uses two conditions: `value.includes('var(--')` and `BRAND_ALLOWED_REGEX.test(value.replace(/^.*var\(/, ''))`. The regex is anchored to the start of the string (`^`), so it matches when the string STARTS with an allowed token prefix. For a mixed value like `"var(--Primary-Bold) #ff0000"`, the `.replace(/^.*var\(/, '')` yields `"--Primary-Bold) #ff0000"`, and `BRAND_ALLOWED_REGEX` matches because the result starts with `--Primary-`. This sets `isTokenRef = true` and the subsequent `if (isTokenRef) continue` skips the `VISUAL_LITERAL_RE` check entirely, making the embedded hardcoded hex value `#ff0000` completely invisible to the validator. An LLM generating `style="var(--Primary-Bold) #ff0000"` on a prop would not be flagged.

**Fix:**
```typescript
// Replace the isTokenRef check with one that requires the ENTIRE value to be a token ref,
// not merely prefixed by one:
const isTokenRef =
  /^var\(--[\w-]+\)$/.test(value.trim()) &&
  BRAND_ALLOWED_REGEX.test(value.trim().slice(4)); // strips 'var(' prefix

// OR, more robustly, only skip literal check when the value is a pure single var() call:
const isTokenRef = /^var\(--[^)]+\)$/.test(value.trim());
if (isTokenRef) continue;
```

---

### CR-03: Hardcoded default site password in middleware

**File:** `apps/platform/src/middleware.ts:30`

**Issue:** The middleware falls back to the hardcoded string `'oneui2026'` when `SITE_PASSWORD` is not set: `const sitePassword = process.env.SITE_PASSWORD ?? 'oneui2026'`. Any deployment that forgets to configure the environment variable — including staging, preview branches on Vercel, or local Docker images — uses this well-known default credential. The entire platform is then accessible to anyone who reads the code.

**Fix:**
```typescript
// Remove the fallback; fail loudly if the environment variable is missing:
const sitePassword = process.env.SITE_PASSWORD;
if (!sitePassword) {
  // In production, fail hard. In development, you could allow localhost.
  console.error('SITE_PASSWORD environment variable is not set');
  return new Response('Server configuration error', { status: 500 });
}
if (authCookie?.value !== sitePassword) {
  // ... redirect to login
}
```

---

### CR-04: Run route does not declare `export const runtime = 'nodejs'`

**File:** `apps/platform/src/app/api/experience-lab/run/route.ts:37-38`

**Issue:** The route only has a comment saying "do NOT set `export const runtime = 'edge'`" and sets `maxDuration = 120`. Without an explicit `export const runtime = 'nodejs'`, the route inherits the project's default runtime. While the Next.js App Router defaults to Node.js for API routes, this is fragile: a project-wide `experimental.serverActions` or a Vercel deployment preset that defaults to Edge would silently run Mastra (which requires Node.js) in an incompatible environment, causing mysterious runtime failures rather than a clear deploy-time error. `maxDuration` alone does not pin the runtime.

**Fix:**
```typescript
// Add an explicit runtime export so the contract is enforced at build time,
// not discovered at deploy time:
export const runtime = 'nodejs';
export const maxDuration = 120;
```

---

### CR-05: `GapEvent` schema allows both `foundationGap` and `componentGap` to be absent

**File:** `packages/experience-builder-core/src/contracts/events.ts:63-71`

**Issue:** Both `foundationGap` and `componentGap` fields are `optional()` in `GapEvent`. A conforming `GapEvent` with neither field is structurally valid per the schema. In `flipToGapState` (`useExperienceLabRun.ts:229`), when the event carries neither kind of gap, the function falls through to create a `FoundationProfileCardShape` with an empty `gapReason` string. The result is a gap card that says "Foundation gap" and an empty body — a misleading signal that something failed even though no gap was actually emitted. The fix is to require at least one of the two fields in the schema.

**Fix:**
```typescript
// In events.ts, add a Zod refinement:
export const GapEvent = z
  .object({
    type: z.literal('gap'),
    runId: z.string().min(1),
    foundationGap: FoundationGap.optional(),
    componentGap: ComponentGap.optional(),
    at: z.number(),
  })
  .strict()
  .refine(
    (d) => d.foundationGap !== undefined || d.componentGap !== undefined,
    { message: 'A gap event must carry at least a foundationGap or a componentGap.' },
  );
```

---

### CR-06: `useExperienceLabRun` does not check `response.ok` before consuming the stream

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts:133-153`

**Issue:** After `doFetch` resolves, the code immediately passes `response` to `readNdjson` regardless of the HTTP status code. When the route returns a `400 Bad Request` (e.g., invalid `artifactType`/`outputProfile` pair) or a `500` error, `readNdjson` attempts to parse the JSON error body as NDJSON event frames. `parseRunStreamLine` calls `JSON.parse` on every line of the error body. The single-line error payload `{"error":"Invalid run request","issues":[...]}` would parse to an object whose `kind` is neither `'event'` nor `'result'`, so `result` stays `null`, and the final branch sets the prompt status to `'error'` with no useful message surfaced to the user. More critically, if the error body contains a multi-line JSON-formatted string, partial-parse exceptions propagate uncaught out of the `for await` loop, leaving `isRunning` permanently `true` and the Run button forever disabled.

**Fix:**
```typescript
response = await doFetch(RUN_ENDPOINT, { ... });
if (!response.ok) {
  const errorText = await response.text().catch(() => `HTTP ${response.status}`);
  console.error('[ExperienceLab] run route error:', response.status, errorText);
  setPromptStatus(editor, promptId, 'error');
  setIsRunning(false);
  return null;
}
// proceed to readNdjson(response)
```

---

## Warnings

### WR-01: `MARKUP_PATTERN` produces false positives for common English text

**File:** `packages/experience-builder-core/src/ir/schema.ts:40`

**Issue:** The pattern `style\s*=` (without word-boundary anchors) will match the substring `style=` inside ordinary words like `lifestyle=`, `hairstyle=`, `textile=`, `freestyle=`. Similarly, `class\s*=` matches inside `world-class=`, `first-class=`, `subclass=`. These false positives would silently reject valid user-supplied copy in `MarkupFreeString`-typed fields (slot text, content records, a11y notes). The pattern was designed to catch HTML/JSX attributes, but it does so by substring matching rather than by detecting `\bstyle\s*=` or `\bclass\s*=` with word boundaries.

**Fix:**
```typescript
// Add word-boundary anchors to prevent substring matches in prose:
const MARKUP_PATTERN =
  /<\s*\/?\s*[a-zA-Z]|\bclassName\s*=|\bclass\s*=|\bstyle\s*=|dangerouslySetInnerHTML/;
```

---

### WR-02: Module-level `_counter` in `irToAst.ts` is reset inside `irToAst()` but shared globally — concurrent calls corrupt each other's IDs

**File:** `packages/experience-builder-core/src/ir/irToAst.ts:37-41, 93`

**Issue:** `_counter` is a module-level mutable variable. `irToAst()` resets it to `0` on every call. If two concurrent callers invoke `irToAst` simultaneously (server-side in Node.js where the module is a singleton), their resets and increments interleave: caller A resets to 0, caller B resets to 0, caller A calls `nextId` → `text-1`, caller B calls `nextId` → `text-2`, but both expected `text-1`. Node.js is single-threaded for JS execution, but async boundaries (Promises) could allow interleaving if `irToAst` is ever made async in a future phase. More concretely, tests that exercise `irToAst` more than once in a single run will observe globally-incrementing IDs that render snapshot assertions fragile.

**Fix:**
```typescript
// Replace the module-level counter with a closure-local counter:
export function irToAst(ir: JioExperienceIRT, options: IrToAstOptions = {}): ASTRoot {
  let counter = 0;
  function nextId(prefix: string): string {
    counter += 1;
    return `${prefix}-${counter}`;
  }
  // ... rest of function uses local nextId
}
```

---

### WR-03: `listRunsByBrand` and `getArtifactHistory` use unbounded `.collect()` with no pagination

**File:** `packages/convex/convex/experienceRuns.ts:147-155, 161-172`

**Issue:** Both queries call `.collect()` with no `.take(n)` or pagination limit. In a real deployment, a brand running hundreds of experiments will return the entire run history in one query, loading all `events: v.array(v.any())` arrays (each containing the full workflow event stream) into memory simultaneously. Convex has a 16MB document limit and a query time limit; an unbounded collect over large `events` arrays will hit those ceilings and start throwing errors for the most active brands — precisely when the system is most in use.

**Fix:**
```typescript
// Add a sensible limit to both queries:
export const listRunsByBrand = query({
  args: { brandId: v.id('brands'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('experienceRuns')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .order('desc')
      .take(args.limit ?? 50);
  },
});
```

---

### WR-04: Convex persistence mutations are defined but never called — run history is silently lost

**File:** `packages/convex/convex/experienceRuns.ts:30-132` / `apps/platform/src/app/api/experience-lab/run/route.ts:78-107`

**Issue:** `createRun`, `recordRunEvents`, and `persistArtifact` are defined and documented as the VER-03 persistence layer, but the run route (`route.ts`) never calls any of them. The route executes `runExperienceWorkflow`, streams events to the client, and returns without writing anything to Convex. Every run is ephemeral: refresh the page and all run history is gone. The schema is designed for durable runs (the `experienceRuns` table even has a `by_brand_status` index for querying by terminal outcome), but none of it is populated. This is not a "future phase" issue — it is noted in the plan description for P1 as D-08 / VER-03 and the mutations were built in this phase specifically to be called.

**Fix:** In `route.ts`, after `runExperienceWorkflow` completes, call the Convex mutations via the server-side Convex client:
```typescript
// After runExperienceWorkflow:
const convexRunId = await convex.mutation(api.experienceRuns.createRun, {
  brandId: input.brandId as Id<'brands'>,
  request: { artifactType: input.artifactType, outputProfile: input.outputProfile },
});
await convex.mutation(api.experienceRuns.recordRunEvents, {
  runId: convexRunId,
  events: run.events,
  status: run.outcome as 'artifact' | 'gap' | 'error',
});
if (run.outcome === 'artifact' && run.ir) {
  await convex.mutation(api.experienceRuns.persistArtifact, { ... });
}
```

---

### WR-05: `DEFAULT_BRAND_ID = 'jio'` is not a valid Convex document id — the default prompt card cannot run successfully

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx:64-108`

**Issue:** `DEFAULT_BRAND_ID` is hardcoded as the string `'jio'`. Convex document IDs are 32-character base32-encoded strings (e.g., `"k175p9me5fmvmk9tg4r1cjz3t16j5vj7"`). When a user adds a prompt card and attempts to run generation before selecting a brand, the route receives `brandId: "jio"`. The Zod schema (`z.string().min(1)`) accepts it, but any downstream code that uses this as a `v.id('brands')` lookup will either return `null` or throw a Convex type error. The `canRun` guard in `RequestPanel.tsx` (line 173) only checks `Boolean(brandId)`, which is truthy for `"jio"`, so the Run button enables even with an invalid brand.

**Fix:**
```typescript
// Use an empty string as default so canRun correctly blocks the Run CTA:
const DEFAULT_BRAND_ID = '';
// The RequestPanel's canRun = Boolean(brandId) will correctly disable Run until
// the user selects a real brand from the Convex-populated dropdown.
```

---

### WR-06: `readNdjson` does not flush the `TextDecoder` after the stream ends — trailing non-ASCII characters can be silently corrupted

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts:68-84`

**Issue:** The `TextDecoder` is instantiated with default UTF-8 encoding and `{stream: true}` on each `decode()` call, which tells the decoder to buffer incomplete multi-byte sequences and wait for the next chunk. After the `for (;;)` loop exits (`done === true`), the decoder's internal buffer is never flushed with a final `decoder.decode()` call (no arguments, which flushes). Any NDJSON frame ending with a multi-byte character that happened to be split across the last two chunks will be truncated in the `buffer` variable, causing the final `parseRunStreamLine(buffer)` call to throw a `SyntaxError` on malformed JSON — an exception that propagates uncaught out of the generator.

**Fix:**
```typescript
// After the for-loop, flush the TextDecoder before processing the tail:
if (done) {
  buffer += decoder.decode(); // flush — no {stream} arg = end of stream
  break;
}
```

---

### WR-07: The `smoke-existing-builder.ts` isolation check uses line-level text matching, which is bypassable with multi-line import syntax

**File:** `scripts/smoke-existing-builder.ts:140-148`

**Issue:** The isolation scan splits source by `'\n'` and checks each line. A developer who writes:
```typescript
import {
  someUtil
} from '@oneui/experience-builder-core';
```
would have `from '@oneui/experience-builder-core'` on its own line. The filter `!line.trimStart().startsWith('*') && !line.trimStart().startsWith('//')` does not filter this line out, so it would be caught. However, the check `line.includes("'${forbidden}")` requires the quote-and-prefix to appear on the same line as an `import/from/require` keyword. A multi-line import like the one above has `from` on the third line only — which is the only line that would trigger the forbidden-string check — so it IS caught. However, the variant:
```typescript
const x = require(
  '@oneui/experience-builder-' + 'core'
);
```
would entirely escape detection because no single line contains both `require` and the forbidden prefix. This is a low-probability bypass for an internal CI gate, but it leaves a gap in the documented isolation invariant.

**Fix:** Replace the line-by-line scan with an AST-level import analysis using the already-imported `typescript` compiler, mirroring the `hasDefaultComponentExport` function already present in the same file. This is the structural approach consistent with the rest of the script.

---

## Info

### IN-01: `className` is in `ALWAYS_ALLOWED_PROP_KEYS` — a generated component could carry an arbitrary CSS class, bypassing token-only styling

**File:** `packages/experience-builder-validation/src/astValidator.ts:157`

**Issue:** `className` is unconditionally allowed on any component. In a generated artifact, `<Button className="text-white bg-blue-500">` would pass the validator despite using Tailwind utility classes (which violate the token-only constraint). The intent is to allow `data-ast-*` instrumentation and accessibility props, not arbitrary class names. This is noted as a P3 tightening item but the `className` entry is a design system violation vector today.

**Fix:** Consider removing `className` from `ALWAYS_ALLOWED_PROP_KEYS`. If instrumentation class names are needed, scope them to a specific prefix (e.g. `data-oneui-` is already in the prefix allowlist). Alternatively, add a check that `className` values may only contain tokens starting with a known Lab prefix.

---

### IN-02: `surfaceMode` in `JioIRSection` and `JioIRComponentInstance` accepts any string — invalid modes are not caught at schema parse time

**File:** `packages/experience-builder-core/src/ir/schema.ts:109-121, 138`

**Issue:** `surfaceMode: z.string().optional()` accepts arbitrary strings. A generated IR with `surfaceMode: "nonexistent-mode"` parses cleanly, maps to an AST node with an invalid `surfaceMode` prop, and would be emitted to a `Container` or `Surface` component with that prop — producing a runtime no-op or a CSS miss in the surface cascade. The valid values are a known enum (`'default' | 'ghost' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated'`). Validating this at schema parse time enforces the 7-token vocabulary before it reaches the validator or compiler.

**Fix:**
```typescript
// In schema.ts:
const SURFACE_MODES = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
const SurfaceModeSchema = z.enum(SURFACE_MODES);

// Then in JioIRSection and JioIRComponentInstance:
surfaceMode: SurfaceModeSchema.optional(),
```

---

### IN-03: Inconsistent import path style between panel files and shape files

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx:29-31` / `_panels/RunInspectorPanel.tsx:21-23`

**Issue:** The panel files import from `@oneui/ui-internal/components/...` (a tsconfig path alias that resolves to `packages/ui/src/...`), while the shape files and `ExperienceLabCanvas.tsx` import from `@oneui/ui/components/...` (the public package export path). Both resolve to the same code in the monorepo, but `@oneui/ui-internal` is a dev-only tsconfig alias that does not exist in the published package. If any of these files were ever extracted or consumed outside the monorepo, the `@oneui/ui-internal` imports would fail. The CLAUDE.md instruction is "deep-path imports (never the `@oneui/ui` barrel)" — which is satisfied by both styles, but consistency requires one style throughout the Lab.

**Fix:** Align all Lab files to use `@oneui/ui/components/<Component>` (the public API path). Replace `@oneui/ui-internal/components/X/X` with `@oneui/ui/components/X` in `RequestPanel.tsx` and `RunInspectorPanel.tsx`.

---

_Reviewed: 2026-05-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
