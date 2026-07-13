# Pitfalls Research

**Domain:** Jio-native AI Experience Builder Lab — Mastra-orchestrated, IR-based, design-system-constrained AI generation with validation + repair loops, sandboxed previews, and campaign/social output, isolated inside an existing Next.js/Convex monorepo.
**Researched:** 2026-05-30
**Confidence:** MEDIUM-HIGH (domain-specific reasoning from the two execution docs + CONCERNS.md, cross-checked against current Mastra/AI-SDK/tldraw/iframe-security sources; some forward-looking risks are MEDIUM/LOW and flagged inline)

> Severity = likelihood × impact. The 12 numbered pitfalls below are the questions asked, ordered by severity. Phase references map to PROJECT.md phases: **P1** isolated foundation, **P2** real-source integration, **P3** preview/eval/repair, **P4** campaign/social, **P5** production readiness.

---

## Critical Pitfalls

### Pitfall 1: Mastra ↔ Vercel AI SDK v6 version mismatch (the repo is ahead of Mastra's support)

**Severity:** HIGH (likelihood HIGH × impact HIGH)

**What goes wrong:**
The repo already pins `ai@^6` and `@ai-sdk/anthropic`/`@ai-sdk/react` (PROJECT.md Validated section). Mastra, the one brand-new dependency, **officially supports AI SDK v4 and v5 only** — v6 support is an open, unimplemented feature request (GitHub issue #10602). AI SDK v6 is still in beta. Installing Mastra against an `ai@6` workspace produces: peer-dependency warnings, duplicate `ai`/`@ai-sdk/provider` copies hoisted by pnpm, type incompatibilities between Mastra's expected v5 message/stream shapes and v6 types, and runtime stream-format mismatches (`toAISdkStream()` / `toAISdkMessages()` need an explicit `version: 'v6'` arg that is easy to forget).

**Why it happens:**
The execution docs were written assuming "use the existing AI SDK." But the existing version (v6) is *newer* than what the orchestration layer supports. Teams assume "newer is fine" and discover the gap only after wiring real model calls.

**How to avoid:**
- In **P1**, before writing any agent, run a dependency-compatibility spike: install Mastra in an isolated package and record the exact `ai`/`@ai-sdk/*` versions Mastra's current release depends on. Decide explicitly: (a) pin the Lab's model layer to AI SDK v5 (Mastra-blessed) even though the rest of the repo is on v6, isolating it inside `packages/experience-builder-agents`, or (b) accept v6 and budget for adapter shims + `version: 'v6'` flags everywhere.
- Pin Mastra and `ai` to **exact** versions (no `^`) in the Lab packages; Mastra is pre-1.0-velocity and ships breaking changes frequently.
- Centralize every model call behind one thin adapter module so a version bump touches one file, not every agent.
- Add a CI check that fails if `pnpm why ai` shows more than one resolved `ai` version in the Lab packages.

**Warning signs:**
TypeScript errors on `streamVNext`/`generateVNext` return types; `pnpm install` peer warnings naming `ai`; streamed agent deltas arriving in the wrong shape on the canvas event bus; tool-call arguments parsed as `undefined`.

**Phase to address:** P1 (compatibility spike + version pinning), revisited at every Mastra/AI-SDK bump through P5.

---

### Pitfall 2: LLM free-builds raw JSX instead of producing/validating the IR

**Severity:** HIGH (likelihood HIGH × impact HIGH)

**What goes wrong:**
The single most common failure for "AI builds UI" systems: the model, given a hard task, bypasses the structured IR and emits a JSX/HTML blob directly — or emits IR that is really just a `rawHtml: "<div>…"` escape hatch. The Core Value ("AI cannot bypass the Jio Design System") collapses, because raw JSX is not validatable against the registry/token boundary the way structured IR is.

**Why it happens:**
JSX is in the model's training distribution far more than a bespoke `JioExperienceIR`. Under-specified IR schemas, prompts that show JSX examples, or a compiler that *accepts* arbitrary children create a path of least resistance. A single `string`-typed `children`/`content` field becomes a JSX smuggling channel.

**How to avoid:**
- Make IR the **only** accepted output: the IR Generator agent uses structured output (Zod/JSON-Schema constrained) with **no** free-text/HTML field anywhere in the tree. `slots` accept only `JioIRComponentInstance[]` or plain text strings that are escaped, never markup.
- The compiler (IR → React) is the *only* code that emits JSX. The LLM never sees or writes JSX. Treat any LLM-produced string containing `<`/`className`/`style=` as a hard validation failure.
- Add a schema-level invariant test: feed adversarial prompts ("just give me the HTML") and assert the pipeline either produces valid IR or a gap report — never raw markup.
- Keep IR examples (not JSX examples) in the system prompt.

**Warning signs:**
IR nodes with `componentId: 'raw'`/`'html'`/`'custom'`; string fields containing angle brackets; the compiler needing a `dangerouslySetInnerHTML` path; eval scores high but validation can't explain *which* registry components were used.

**Phase to address:** P1 (IR schema design forbids markup fields), enforced in P2 (compiler) and P3 (validator).

---

### Pitfall 3: Isolation leakage — accidental coupling breaks the existing Builder

**Severity:** HIGH (likelihood MEDIUM-HIGH × impact HIGH)

**What goes wrong:**
The hard constraint from both docs is "do not modify or break the existing `ExperienceCanvas` Builder, ToV agent, or DCA." Leakage happens through shared, mutable surfaces: (1) editing a shared file in `packages/shared/engine` or `packages/ui` that the existing Builder also imports; (2) bumping a shared dependency (tldraw `^4.5.3`, `ai`) repo-wide to satisfy the Lab; (3) registering a second tldraw editor/global store that conflicts with the existing one; (4) adding routes/providers in `apps/platform` that wrap or re-order the existing `FoundationStyleProvider` (CONCERNS.md flags this as fragile — `injectionMode: 'none'` silently nukes all tokens).

**Why it happens:**
Monorepos make cross-package edits frictionless. "Just one small fix to `surfaceNew.ts`" affects all brands/components/themes simultaneously (CONCERNS.md "Fragile Areas"). Shared singletons (Convex client, tldraw store, style provider) are easy to collide with.

**How to avoid:**
- New code lives **only** in `packages/experience-builder-*` + one isolated route segment. Treat existing ToV/DCA/engine packages as **read-only contracts** — call their public APIs, never edit them.
- Pin the Lab's tldraw to its own version if a bump is needed; do not bump the repo-wide tldraw `^4.5.3` to serve the Lab.
- Mount the Lab's tldraw editor and any Zustand/Jotai store in a self-contained provider scoped to the Lab route; never reuse the existing `ExperienceCanvas` store instance.
- Do **not** touch `FoundationStyleProvider`; if the Lab needs brand CSS, instantiate its own scoped provider per `docs/surface-context-awareness.md` Theme Scope rules. Never set `injectionMode: 'none'`.
- Add a CI guard (dependency-cruiser / eslint `no-restricted-imports`) that forbids the existing Builder from importing anything under `experience-builder-*`, and forbids Lab packages from deep-importing existing-Builder internals.
- Smoke-test the existing Builder route in CI on every Lab PR.

**Warning signs:**
Git diff touches files outside `experience-builder-*`; `pnpm why tldraw` shows a changed root version; the existing Builder's surface colors shift; CONCERNS.md's known-fragile files appear in PRs.

**Phase to address:** P1 (set up isolation guards + CI before any feature), enforced every phase.

---

### Pitfall 4: Sandbox/iframe preview lets generated code reach auth/session, or CSP gaps

**Severity:** HIGH (likelihood MEDIUM × impact HIGH)

**What goes wrong:**
Generated artifacts run as real DOM in iframes (spec §15). The classic, dangerous mistake: serving the preview from the **same origin** as the platform app while granting `sandbox="allow-scripts allow-same-origin"`. As current iframe-security sources stress, that combination makes the sandbox a *very weak boundary* — the child can reach `parent`, read cookies/`localStorage`, and exfiltrate Convex auth tokens / session. Other gaps: missing CSP on the preview document, `postMessage` with `targetOrigin: '*'` or no origin check, missing `frame-ancestors`, and Playwright screenshot workers (P3) running generated code with ambient credentials.

**Why it happens:**
`allow-same-origin` is often added to "make the preview work" (fonts, fetch, storage) without realizing it dissolves isolation. Same-origin preview hosting is the convenient default in a single Next.js app.

**How to avoid:**
- Serve previews from a **separate origin** (distinct subdomain, ideally a distinct deployment), never the platform origin. Then `allow-scripts` *without* `allow-same-origin` keeps the boundary real.
- Set a strict CSP on the preview document: lock `default-src`/`script-src`/`connect-src`; only allow the Jio CSS/asset origin; set `frame-ancestors` to the Lab origin; add `frame-src 'none'`/`object-src 'none'`. Add COOP/COEP for cross-origin isolation on the preview host.
- All canvas↔iframe messaging via `postMessage` with an explicit `targetOrigin` and origin verification on every inbound message; never `*`.
- Inject **zero** auth/session/Convex tokens into preview context. The preview gets only the compiled artifact bundle + Jio CSS.
- Run Playwright screenshot workers in an isolated, credential-free environment (separate process/container), loading only the preview origin.
- Compiled artifact code is data, not trusted — never `eval`/`new Function` it in the parent window.

**Warning signs:**
`sandbox` attribute contains both `allow-scripts` and `allow-same-origin` on a same-origin preview; preview can read `document.cookie`; `postMessage('*')` in code; no CSP header on preview responses; Playwright worker has the user's session cookie.

**Phase to address:** P3 (preview/sandbox), security-hardened again in P5. Decide the **separate-origin hosting model in P1** so it isn't retrofitted.

---

### Pitfall 5: Compliance-validator false negatives — non-Jio styling slips through despite the validator

**Severity:** HIGH (likelihood HIGH × impact HIGH)

**What goes wrong:**
The whole product promise rests on the validator. False negatives — Tailwind classes, arbitrary hex/px values, non-Jio imports, or unregistered components passing as "compliant" — silently break the Core Value. Common evasions: inline `style={{}}` with literal values (regex looks at `className`), CSS-in-JS, `var(--made-up-token)` that *looks* like a Jio token but isn't in the manifest, aliased imports (`import { Button as JioButton } from 'shadcn'`), dynamic/string-built class names, or arbitrary values inside otherwise-valid Jio component props.

**Why it happens:**
Validators built on shallow regex/substring scanning miss the long tail. The repo's own gates (CONCERNS.md) already let **1467 legacy-token violations** pass the lenient mode and fail only in `--strict` — proof that "looks validated" ≠ validated here. A token *allowlist* derived from the live manifest is the only sound approach, but teams start with denylists ("block `tailwind`").

**How to avoid:**
- Validate on the **AST**, not strings: parse the compiled output, walk imports (resolve aliases), JSX elements, and style values.
- Use **allowlists, not denylists**: every import must be in the registry's `importPath` set; every CSS custom property must be in the live token manifest (reuse `tokenBoundary.ts`/`tokenManifest.ts` — already the source of truth for the 22-family boundary); every component must have a registry entry; every prop/variant must match the registry `propsSchema`/`allowedVariants`.
- Block **all** literal color/px/font/radius/shadow/motion values wherever a token exists — reuse the repo's existing `check:literals` philosophy and zero-tolerance literal gate; do not reinvent it weaker.
- Build a **red-team corpus**: a fixture set of known-evasion artifacts (aliased shadcn import, inline hex, fake `var()`, dynamic className) and assert the validator catches every one. Treat any new evasion found in the wild as a regression test.
- Make validation the gate before an artifact is ever marked `passed`/shown as ready; a warning is not a pass.

**Warning signs:**
Validator passes but rendered preview shows non-Jio visuals; `style={{}}` literals in compiled output; registry has no entry for a component the artifact uses; the validator is regex-only with no AST step.

**Phase to address:** P1 (basic AST allowlist validator: blocks Tailwind/non-Jio imports/unregistered components), full pipeline + red-team corpus in P3.

---

### Pitfall 6: Infinite / non-converging repair loops + cost blowup

**Severity:** HIGH (likelihood HIGH × impact MEDIUM-HIGH)

**What goes wrong:**
The repair loop (validate → repair → recompile → validate; eval → critique → repair → re-render → re-eval) can oscillate forever: repair A fixes violation X but reintroduces Y; the LLM-as-judge gives a non-deterministic score that never crosses threshold; or a *truly impossible* request (component genuinely missing) loops instead of emitting a gap report. Each iteration spends tokens + a Playwright screenshot + an eval call — cost and latency blow up, and Mastra retries compound it.

**Why it happens:**
No hard iteration ceiling, no convergence detection, no distinction between "fixable violation" and "system gap." Patch-based repair (spec §13) is harder than full regen to bound. LLM-as-judge variance (Pitfall 12) means the stopping condition itself is noisy.

**How to avoid:**
- Hard cap repair iterations (e.g. 3) per artifact, enforced by Mastra workflow state, not by the agent's discretion.
- **Convergence detection:** track the violation set across iterations; if the same violation persists or the set stops shrinking, stop and surface the best version + remaining issues rather than looping.
- Route "missing component / missing foundation profile" to an immediate **gap report**, never the repair loop (the docs explicitly require this — make it a workflow branch, not a soft prompt instruction).
- Per-run **token + screenshot + wall-clock budget**; abort and return best-so-far when exceeded. Surface cost per run on the canvas (P5 cost tracking, but instrument from P3).
- Score stopping on validation (deterministic) before eval (non-deterministic); only invoke the LLM judge when validation already passes.
- Make repair patch-based with a diff that's validated *before* re-render, so a bad patch is rejected cheaply.

**Warning signs:**
Same violation in iterations N and N+1; eval score sawtooths around the threshold; generation runs with no upper bound on cost; a single artifact consuming many model calls; users waiting >30s with no terminal state.

**Phase to address:** P3 (loop design with caps + convergence + gap-branching), cost tracking hardened in P5.

---

### Pitfall 7: IR drift vs the real component registry / props schema

**Severity:** HIGH (likelihood HIGH × impact MEDIUM-HIGH)

**What goes wrong:**
The IR references `componentId`, `props`, `variants`, `slots` that no longer match the real components. CONCERNS.md documents this is *already happening in the base repo*: `check:metadata` fails (Modal's `body` slot not in `ModalProps`; Text meta lists `variant`/`size` not in `TextProps`), `check:jio-alpha-catalog` has 21 missing slug entries, machine docs have 15 drifts, and 25/72 components lack required files. If the Lab's registry is mocked in P1 with a shape that diverges from the real component metadata, P2 integration will surface a flood of "valid IR, invalid against real components" failures, or worse, compile to broken React.

**Why it happens:**
Two sources of truth (the IR's notion of a component vs the actual `propsSchema`) drift the moment either side changes. The repo already has multiple drifting registry contracts (CONCERNS.md "Registry/Metadata/Catalog Out of Sync"). Mocks in P1 freeze an assumption that the real metadata then contradicts.

**How to avoid:**
- Derive the registry from the **single existing source of truth** — the same metadata that powers `check:metadata` / machine docs — rather than authoring a parallel one. Reuse, don't reinvent.
- In P1, shape the **mock registry contract to exactly match the real metadata schema** (production-shaped, per PROJECT.md), so swapping mock→real is a data swap, not a schema migration.
- The compiler must validate every IR component instance against the registry `propsSchema`/`allowedVariants`/`slots` *before* emitting React; mismatches become validation violations (Pitfall 5), not runtime crashes.
- Add a registry-freshness CI check for the Lab analogous to `check:machine-docs-fresh`: fail if the registry snapshot drifts from live component metadata.
- Fix or explicitly exclude the components with known metadata gaps (Modal, Text) before relying on them in generation.

**Warning signs:**
Compiled artifact passes prop types the real component rejects at runtime; registry lists variants the component doesn't render; P2 integration produces many "unknown prop"/"unknown slot" violations that P1 never saw.

**Phase to address:** P1 (production-shaped registry contract derived from real metadata schema), P2 (real metadata wiring + freshness gate).

---

### Pitfall 8: Foundation Resolver fails on non-web profiles or invents dimensions

**Severity:** HIGH (likelihood HIGH × impact MEDIUM-HIGH)

**What goes wrong:**
The resolver must produce dimensions/aspect-ratio/type-scale/spacing/safe-area for Instagram square/portrait/story/carousel, outdoor displays, slides, banners (spec §8, §14). The Jio foundations were built for **web platforms/density/viewport** (CLAUDE.md: 3 breakpoints via `data-Breakpoint`). There is no evidence the foundations define a 1080×1080 Instagram profile or an outdoor-display type scale. The likely failure: the resolver either (a) **invents** a 1080×1080 + arbitrary large type scale (directly violating "must not invent dimensions"), or (b) returns nothing and the whole campaign path dead-ends. Either way the campaign phase is built on sand.

**Why it happens:**
The execution docs *assume* Jio foundations already cover non-web output profiles. The repo's foundation engine is web/density/viewport-shaped. The gap between assumption and reality is discovered only when P4 tries to resolve a carousel.

**How to avoid:**
- **In P1**, run a foundation-coverage audit: enumerate which output profiles the real Jio foundations actually define vs which the docs *assume*. Document the delta as a first-class **foundation gap report** deliverable — this is exactly what the system is supposed to emit instead of inventing.
- Design `FoundationResolveResult` so "profile not found" is a **first-class typed result** that stops generation with a gap report, never a silent default.
- Do **not** let any agent synthesize dimensions/type scales for missing profiles. If a profile is missing, the correct output is a gap report, full stop.
- Sequence P4 (campaign) to depend on a verified set of resolvable non-web profiles; don't promise carousel output before the foundation defines it.
- If Jio genuinely needs new output profiles, that is a *foundation* change owned by the design-system team — out of scope for the Lab to invent (PROJECT.md Out of Scope).

**Warning signs:**
Resolver returns dimensions for profiles with no foundation backing; campaign frames render at suspiciously round numbers (1080) that don't trace to a token; no gap reports ever emitted despite obvious missing profiles; P4 blocked at the first carousel attempt.

**Phase to address:** P1 (coverage audit + gap-report-first contract), P4 (campaign generation depends on it).

---

### Pitfall 9: Registry retrieval quality — LLM picks wrong or nonexistent components

**Severity:** MEDIUM-HIGH (likelihood HIGH × impact MEDIUM)

**What goes wrong:**
Even with a correct registry, the retrieval/selection step can feed the IR generator the wrong components, or the generator can hallucinate a plausible-sounding component (`JioHero`, `JioPricingTable`) that isn't registered. With ~50–72 components, naive "dump all components in the prompt" causes selection errors and token bloat; pure vector retrieval can miss the right component or return semantically-near-but-wrong ones.

**Why it happens:**
LLMs confabulate component names that "should" exist. Retrieval tuned for recall returns noise; tuned for precision misses options. The registry's `usageRules`/`antiPatterns`/`category` fields (spec §9) are often left unpopulated, so the model has no grounding to choose well.

**How to avoid:**
- Selection is **constrained, not generative**: the IR generator may only reference `componentId`s present in the retrieved candidate set; anything else is a hard validation failure → gap report.
- Populate registry `category`, `usageRules`, `antiPatterns`, and `exampleCode` (spec §9) — retrieval quality is bounded by metadata quality.
- Use hybrid retrieval (category filter + semantic) and pass a bounded candidate set with usage rules, not the whole catalog, into the generator.
- Add an eval metric specifically for "component selection correctness" and a regression set of prompts→expected-component-families.
- Because the catalog is small (~72), consider deterministic category-based shortlists over heavy vector infra in early phases (avoid over-engineering retrieval).

**Warning signs:**
IR references `componentId`s not in the registry; the model invents component names; generated layouts misuse components against their `antiPatterns`; eval shows good visuals but wrong component choices.

**Phase to address:** P2 (real registry retrieval + selection constraint), eval metric in P3.

---

### Pitfall 10: Structured-output unreliability — schema validation failures / partial IR

**Severity:** MEDIUM-HIGH (likelihood MEDIUM-HIGH × impact MEDIUM)

**What goes wrong:**
The IR is a deep, nested schema. Even with structured outputs, models produce partial IR (truncated on token limit), missing required fields, renamed keys, type mismatches, or JSON wrapped in prose. Industry data: JSON-mode fails 5–10%; even constrained structured outputs fail ~0.1%; deep/recursive schemas (nested `slots` of `JioIRComponentInstance[]`) raise failure and truncation risk. A partial IR that *parses* but is semantically incomplete is the nastier case — it flows downstream and breaks the compiler.

**Why it happens:**
Large nested IR + long content frequently exceeds output token budgets → truncation. Recursive slot trees stress schema-constrained decoding. Teams rely on a single attempt with no retry-with-error-feedback.

**How to avoid:**
- Use the strictest structured-output mode available (Zod/JSON-Schema constrained generation via the AI SDK), not free-form JSON mode.
- Validate parsed IR against the **full** schema (including required fields, enums, recursive node validity) before accepting; on failure, retry **with the validation error fed back** (Instructor-style), capped at a small N.
- Decompose generation: generate layout/section skeleton first, then fill component instances per section — keeps each call within token limits and bounds truncation.
- Monitor format-failure rate (alert >1%) and average retry count (alert >2) as first-class metrics from P3.
- Treat a partial-but-parseable IR as a failure: add semantic-completeness assertions (every section has ≥1 component, every referenced `sectionId` exists, every slot child is valid).

**Warning signs:**
Compiler receives IR missing `target`/`brand`/`components`; truncated JSON; retry counts climbing; intermittent "cannot read property of undefined" in the compiler (mirrors CONCERNS.md `Object.keys()` on undefined return).

**Phase to address:** P2 (constrained generation + retry-with-feedback + decomposition), metrics in P3.

---

### Pitfall 11: tldraw performance with many live iframes on the infinite canvas

**Severity:** MEDIUM-HIGH (likelihood MEDIUM-HIGH × impact MEDIUM)

**What goes wrong:**
tldraw hides off-screen shapes (`display:none`) but **live iframes are heavyweight**: each is a full document with its own JS/layout/paint context. A board with many artifact cards, each a live preview iframe, will stutter on pan/zoom, exhaust memory, and (with separate-origin previews from Pitfall 4) spawn many cross-origin documents. tldraw also has known frame-rendering perf regressions (issue #5245: `measureTextSpans` in frame headings tanks fps when many frames are visible) and low fps panning with ~1000+ shapes zoomed out.

**Why it happens:**
The natural implementation makes every artifact card a live iframe always. Iframes don't get cheaper when off-screen unless explicitly suspended. The spec's own lifecycle guidance (far=thumbnail, near=lightweight, selected=live, offscreen=suspended) is easy to skip in early phases.

**How to avoid:**
- Implement the spec §15 **preview lifecycle** as a hard rule from the first preview work: static thumbnail (PNG) when far/zoomed-out, lightweight/static when near, **live iframe only when selected or editing**, suspended/unmounted when offscreen.
- Cap the number of concurrently-live iframes (e.g. 1–3); virtualize the rest to thumbnails.
- Use tldraw's visibility/culling; avoid expensive custom shape work in the render path (heed #5245 — keep frame-heading/measure work out of hot paths).
- Generate thumbnails server-side via the same Playwright workers used for eval (P3) so the canvas shows images, not documents.
- Budget-test with 50+ artifact cards early; measure pan/zoom fps before campaign mode (P4) multiplies card counts (carousels = many frames).

**Warning signs:**
Pan/zoom fps drops below ~30 with a dozen previews; browser memory climbs with card count; fans spin on the canvas; carousel groups (many frames) make the board unusable.

**Phase to address:** P3 (preview lifecycle + thumbnailing), stress-tested before/within P4 (campaign multiplies frames).

---

### Pitfall 12: Evaluation unreliability — LLM-as-judge variance for visual scoring

**Severity:** MEDIUM (likelihood HIGH × impact MEDIUM)

**What goes wrong:**
The visual evaluator scores compliance/hierarchy/a11y/responsiveness/export-readiness (spec §13). LLM-as-judge scores are **non-deterministic and miscalibrated**: the same artifact scores differently across runs, scores drift with prompt phrasing, and the judge is biased toward verbose/confident outputs. If the repair loop's stopping condition depends on a noisy score (Pitfall 6), the loop never reliably converges and "quality" is illusory.

**Why it happens:**
Visual quality is subjective and vision-model judging is immature. Teams use a single judge call with a 1–10 score and treat it as ground truth. Compliance (objective) gets conflated with aesthetics (subjective) in one score.

**How to avoid:**
- **Separate deterministic from subjective**: compliance, a11y (contrast ratios), dimensions, token usage are checked by the **validator** (deterministic, repeatable), not the LLM judge. The judge only scores genuinely subjective dimensions (hierarchy, composition).
- Use rubric-based scoring with explicit criteria and few-shot anchors rather than a bare 1–10; lower temperature; consider self-consistency (sample N, take median) for the subjective score.
- Make the repair stopping condition depend primarily on **deterministic validation passing**, and use the subjective score only as a soft "best-of-N" selector, never the sole gate.
- Track judge variance: re-score a fixed artifact periodically; alert if score variance is high.
- Keep a human-in-the-loop checkpoint (Mastra supports it) for high-stakes campaign assets rather than trusting the judge alone.

**Warning signs:**
Same artifact gets materially different scores across runs; repair loop driven purely by the judge oscillates; a11y "passes" the judge but fails real contrast math; stakeholders disagree with scores frequently.

**Phase to address:** P3 (split deterministic vs subjective scoring; rubric + best-of-N), human checkpoint reinforced in P4/P5.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Mock registry with an ad-hoc shape (not real metadata schema) | Faster P1 demo | P2 schema migration + IR drift (Pitfall 7) | Never — mock must be production-shaped per PROJECT.md |
| Regex-only validator | Quick to write | False negatives, broken Core Value (Pitfall 5) | P1 placeholder only; AST allowlist mandatory by P3 |
| Same-origin preview iframe | Preview "just works" | Auth/session exfiltration (Pitfall 4) | Never for code that runs untrusted generated JS |
| Every artifact card = always-live iframe | Simple canvas code | Canvas unusable at scale (Pitfall 11) | Tiny demos only; lifecycle required by P3 |
| `ai@^6` + Mastra without compat spike | No upfront work | Type/stream breakage, churn (Pitfall 1) | Never — pin exact + spike first |
| Letting IR have a `rawHtml`/`children: string` markup field | Model "just works" on hard prompts | Total bypass of DS guarantee (Pitfall 2) | Never |
| Repair loop with no iteration/cost cap | Higher pass rate per artifact | Cost blowup, hangs (Pitfall 6) | Never in shared/prod env |
| LLM judge as sole repair gate | One simple score | Non-convergence, false quality (Pitfall 12) | Never as the *only* gate |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Mastra + AI SDK | Assuming repo's `ai@6` is supported | Pin to Mastra-blessed version; isolate model layer; pass `version:'v6'` to AI-SDK adapters if forced onto v6 (Pitfall 1) |
| Existing ToV / DCA agents | Editing their internals to fit the Lab | Call public API contracts only; treat as read-only (Pitfall 3) |
| Convex | Reading stale V4-era token table / injecting auth into preview | Compute from live engine, not stale `api.tokens.list`; never pass auth into preview (CONCERNS.md, Pitfall 4) |
| `FoundationStyleProvider` | Wrapping/reordering it or `injectionMode:'none'` | Scope a separate provider to the Lab route; never `none` (CONCERNS.md fragile area) |
| tldraw `^4.5.3` | Bumping repo-wide for the Lab | Pin the Lab's tldraw independently (Pitfall 3) |
| Storybook metadata | Authoring a parallel registry | Derive from the existing `check:metadata`/machine-docs source of truth (Pitfall 7) |
| Playwright screenshot workers | Running with ambient session creds | Isolated, credential-free worker loading only the preview origin (Pitfall 4) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Many live iframes on canvas | Pan/zoom stutter, high memory | Preview lifecycle + thumbnails + live-iframe cap | ~10+ live previews; worse with carousels |
| Whole-catalog in every prompt | Token bloat, slow/expensive runs, worse selection | Category-filtered candidate shortlist | Catalog growth + many runs |
| Unbounded repair loop | Latency spikes, cost spikes | Iteration + token + wall-clock caps (Pitfall 6) | Any hard prompt |
| Deep IR in one model call | Truncation, partial IR | Decompose generation per section (Pitfall 10) | Large/complex artifacts |
| Per-artifact eval screenshots | Slow runs, worker contention | Validate (deterministic) before eval; batch workers | Many artifacts / campaign batches |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `allow-scripts` + `allow-same-origin` on same-origin preview | Generated code reads cookies/Convex token, exfiltrates session | Separate preview origin; drop `allow-same-origin` (Pitfall 4) |
| Missing CSP on preview document | XSS, data exfiltration, clickjacking | Strict `script-src`/`connect-src`/`frame-ancestors`/`object-src`; COOP+COEP |
| `postMessage('*')` / no origin check | Cross-origin message injection | Explicit `targetOrigin`; verify `event.origin` every message |
| Injecting auth/env into preview | Credential leak via generated code | Preview gets only artifact bundle + Jio CSS, never secrets |
| `eval`/`new Function` on compiled artifact in parent | Arbitrary code execution in app context | Render only inside isolated iframe; never execute in parent |
| Playwright worker with user session | Server-side request forgery / data leak | Credential-free isolated worker |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Silent repair loop with no terminal state | User stares at a spinner, no idea of progress/cost | Stream AG-UI events; show iteration count, violations, cost; always reach a terminal state |
| Inventing dimensions instead of gap report | User ships off-brand campaign asset unknowingly | Emit visible foundation-gap report; block, don't fake (Pitfall 8) |
| Showing "passed" on a warning-level result | False confidence in compliance | `passed` only when zero blocking violations (Pitfall 5) |
| Non-deterministic eval scores shown as truth | User distrusts the whole tool | Separate objective (validator) from subjective; rubric + human checkpoint (Pitfall 12) |

## "Looks Done But Isn't" Checklist

- [ ] **Validator:** Often missing AST-level aliased-import + inline-literal detection — verify against a red-team evasion corpus (Pitfall 5)
- [ ] **IR contract:** Often missing a markup-field ban — verify no field can carry JSX/HTML; run adversarial "give me HTML" prompts (Pitfall 2)
- [ ] **Preview sandbox:** Often missing separate-origin hosting — verify preview cannot read `document.cookie`/Convex token (Pitfall 4)
- [ ] **Repair loop:** Often missing iteration/cost caps + gap branching — verify it terminates on impossible requests (Pitfall 6)
- [ ] **Foundation resolver:** Often missing non-web profile coverage — verify it returns a gap report (not invented dims) for Instagram/outdoor (Pitfall 8)
- [ ] **Registry:** Often missing freshness vs real component metadata — verify a `check:metadata`-style gate exists for the Lab (Pitfall 7)
- [ ] **Isolation:** Often missing CI import guards — verify the existing Builder still boots and no shared file/dep changed (Pitfall 3)
- [ ] **Mastra/AI-SDK:** Often missing version pin — verify `pnpm why ai` resolves one version; adapters pass correct `version` (Pitfall 1)
- [ ] **Canvas:** Often missing preview lifecycle — verify live-iframe cap + thumbnails with 50+ cards (Pitfall 11)
- [ ] **Structured output:** Often missing retry-with-error-feedback — verify partial/truncated IR is rejected, not passed downstream (Pitfall 10)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Isolation leakage broke existing Builder | HIGH | Revert Lab PR; add CI import guards + existing-Builder smoke test; re-land isolated |
| Validator false negatives shipped | HIGH | Treat as security incident; add AST allowlist + red-team corpus; re-validate all stored artifacts |
| Same-origin preview leaked session | HIGH | Move preview to separate origin; rotate any exposed tokens; audit access logs |
| Mastra/AI-SDK version break | MEDIUM | Pin exact versions; add adapter shim in one module; lock until next blessed combo |
| IR drift vs registry | MEDIUM | Regenerate registry from real metadata; add freshness gate; re-validate stored IR |
| Repair loop cost blowup | LOW-MEDIUM | Add caps + convergence detection + per-run budget; ship best-of-N |
| Raw-JSX bypass | MEDIUM | Remove markup fields from IR schema; add adversarial tests; recompile via IR only |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Mastra/AI-SDK version mismatch | P1 | `pnpm why ai` = one version; compat spike documented |
| 2. LLM free-builds raw JSX | P1 (schema), P2/P3 (enforce) | Adversarial prompts yield IR or gap, never markup |
| 3. Isolation leakage | P1 (guards), all phases | Existing Builder boots; no shared file/dep diff |
| 4. Sandbox/iframe security | P1 (hosting decision), P3 (impl), P5 (harden) | Preview can't read cookies; CSP present; separate origin |
| 5. Validator false negatives | P1 (basic), P3 (full) | Red-team evasion corpus 100% caught |
| 6. Repair loop blowup | P3 | Loop terminates ≤3 iters; per-run budget enforced |
| 7. IR drift vs registry | P1 (contract), P2 (wire) | Lab registry-freshness gate passes |
| 8. Foundation resolver non-web/invention | P1 (audit), P4 (campaign) | Missing profile → gap report, never invented dims |
| 9. Registry retrieval quality | P2 | Selection-correctness eval set passes; no hallucinated IDs |
| 10. Structured-output reliability | P2 (gen), P3 (metrics) | Format-failure <1%; partial IR rejected |
| 11. tldraw iframe perf | P3, stress before P4 | ≥30fps with 50+ cards; live-iframe cap enforced |
| 12. Eval LLM-judge variance | P3 | Objective via validator; subjective rubric + best-of-N |

## Open Questions

- **Does the real Jio foundation layer define any non-web output profiles** (Instagram 1080², story 1080×1920, outdoor, slide)? PROJECT.md/CLAUDE.md show only web platform/density/viewport. If none exist, P4 campaign work depends on a foundation-team deliverable outside this milestone's scope (Pitfall 8). **Resolve in P1 audit.**
- **Which exact `ai`/`@ai-sdk/*` versions does the current Mastra release require**, and is the team willing to pin the Lab to AI SDK v5 while the repo stays on v6? (Pitfall 1) — needs a concrete install spike, not docs.
- **Is there a single canonical component-metadata source** the Lab registry can derive from, given CONCERNS.md shows multiple drifting registry contracts? If not, the Lab inherits the drift problem on day one (Pitfall 7).
- **Will previews be deployable to a genuinely separate origin** within this infra (separate subdomain/deployment), or is same-origin the only option? This determines whether the secure sandbox model (Pitfall 4) is even achievable — decide in P1.
- **Cost ceiling per generation run** — needed to size repair-loop caps and budgets (Pitfall 6). Not specified in the docs.

## Sources

- Mastra docs — Using AI SDK UI / Vercel AI SDK frameworks: https://mastra.ai/guides/build-your-ui/ai-sdk-ui , https://mastra.ai/docs/v0/frameworks/agentic-uis/ai-sdk
- Mastra AI SDK v5 support announcement: https://mastra.ai/blog/announcing-mastra-improved-agent-orchestration-ai-sdk-v5-support
- Mastra streaming (streamVNext/generateVNext): https://mastra.ai/blog/mastra-streaming
- GitHub issue — Feature Request: AI SDK v6 Support (open, unimplemented): https://github.com/mastra-ai/mastra/issues/10602
- `@mastra/ai-sdk` package: https://www.npmjs.com/package/@mastra/ai-sdk
- tldraw performance docs + frame-render regression (#5245): https://tldraw.dev/sdk-features/performance , https://github.com/tldraw/tldraw/issues/5245
- Handling thousands of cards on an infinite canvas: https://dev.to/alanscodelog/handling-thousands-cards-on-an-infinite-canvas-4gea
- iframe isolation + postMessage security: https://medium.com/@muyiwamighty/building-a-secure-code-sandbox-what-i-learned-about-iframe-isolation-and-postmessage-a6e1c45966df , https://romaincoupey.com/posts/iframe-sandbox/
- CSP sandbox directive (MDN): https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox
- LLM structured-output failure rates & validation: https://eastondev.com/blog/en/posts/ai/20260506-llm-structured-output/ , https://dasroot.net/posts/2026/05/structured-output-llms-json-breaks-analyzed/ , https://scientyficworld.org/json-schema-to-validate-llm-structured-outputs/
- Project docs (internal): `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `jio_ai_experience_builder_mvp_tech_specs.md`, `jio_experience_builder_full_execution_prompt.md`, `CLAUDE.md`

---
*Pitfalls research for: Jio-native AI Experience Builder Lab*
*Researched: 2026-05-30*
