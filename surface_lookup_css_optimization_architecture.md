# Surface-Step Lookup CSS — Size Optimization Architecture

> Branch: `feat/arbitrary-nesting`
> Reference: RFC-0003 Surface Step Cascade · `docs/rfcs/0003-surface-step-cascade/`
> Goal: reduce **declaration count and CSSOM complexity** of the per-brand step-lookup stylesheet without changing the surface algorithm, the cascade contract, or the public token API.

---

## 0. Mental model — CSS as a sparse matrix

Frame the problem as a 2-D matrix:

```
M[step][token] = value
```

- **Rows** = surface steps (1..25)
- **Columns** = tokens (`--Primary-Bold`, `--Primary-High`, …, ~331 columns)
- **Cells** = resolved hex values produced by the surface algorithm

The matrix is dense (every cell has a value) but **structurally sparse in distinct values**: most columns repeat the same value across many rows. Today's emission is row-major and unfactored — one CSS rule per row, every cell re-emitted. The compression opportunity is **column-pattern dedup**: tokens whose row patterns coincide (same set of rows take the same value) can share rules.

This framing makes the constraint envelope feel inevitable rather than arbitrary:

| Why X is rejected               | Matrix interpretation                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Inter-step delta chains         | Reconstructing row N from row N-1 + diff requires ordered traversal — every row must remain **independently addressable**. |
| Reachable-step pruning          | Removing rows assumes the surface graph has bounded reach; under arbitrary nesting it is fully connected, so every row must be present. |
| Runtime color derivation (calc) | Requires the matrix to be expressible as `f(row, col)`; the algorithm picks values via contrast guards and palette walks, not a closed-form function. |
| Lossy / interpolated rows       | Cells are not on a perceptually smooth gradient; values are algorithmically distinct. |

Selector-list grouping by `(token, value)` pattern is the matrix-native operation: **column-pattern compression**. `:root` extraction is its degenerate case — a column whose entire pattern is constant. Everything else in this document follows from that observation.

---

## 1. Current state, measured

Snapshot from `temp/surface-step-lookup/surface-step-lookup--full-injected--jio-default.css` (post-Option-C, both themes pre-baked into one stylesheet):

| Metric                                              | Value           |
| --------------------------------------------------- | --------------- |
| Raw bytes                                           | **308,408 B**   |
| gzip                                                | 31,087 B (10.0%)|
| brotli                                              | 17,911 B (5.8%) |
| Step-keyed selectors emitted (rules)                | 75 (= 25 × 3 [theme-agnostic + light overlay + dark overlay]) |
| Distinct `data-surface-step` values                 | **25** (every 100 from 100 → 2500) |
| Appearance roles                                    | 11 (Primary, Secondary, Tertiary, Quaternary, Neutral, Sparkle, Brand-Bg, Positive, Negative, Warning, Informative) |
| Distinct hex values across whole file               | 1,114           |
| Total CSS declarations                              | ~8,275          |
| **Distinct (token, value) pairs**                   | **5,120**       |
| **Distinct stepSets** (under co-location grouping)  | **177**         |
| Most-repeated value                                 | `#FFFFFF` (871×), `#000000` (851×) |

**Per-token redundancy across the 25 step blocks** (how many distinct values each `--Token` actually takes):

| distinct values | # tokens |
|----------------:|---------:|
| 2               | 46       |
| 3               | 1        |
| 5               | 1        |
| 6               | 2        |
| 7–14            | 99       |
| 17–24           | 161      |
| **25** (step-unique) | **22** |

**StepSet size distribution** (how many step blocks each unique value reuse pattern spans):

| stepSet size | # distinct stepSets |
|-------------:|--------------------:|
| 1            | 25                  |
| 2            | 58                  |
| 3            | 15                  |
| 4            | 15                  |
| 5            | 12                  |
| 6            | 8                   |
| 7–14         | 27                  |
| 15–22        | 14                  |
| 23           | 1                   |
| 24           | 1                   |
| **25** (token, value) pair spans every step | **2** |

→ The redundancy is **structural**: 5,120 distinct (token, value) pairs explain all 8,275 declarations. Of the ~331 tokens, only 22 take a different value at every step; the other ~309 are piecewise-constant. Fully invariant pairs (a single value across all 25 steps) are essentially absent — only **2** stepSet=25 cases exist, so `:root` extraction of true invariants is a near-zero lever in this fixture. The real compression opportunity is **partial invariance**.

### 1.1. Generality validation — N=200 randomized palettes

The numbers above are from one fixture. To test whether the redundancy is fixture-specific or **structural to the surface algorithm itself**, the analysis was extended to randomized "Convex-like" palettes generated through the same `buildAvailableScales` → `buildNewPaletteData` → step-lookup pipeline the production engine uses.

Setup (offline, no live Convex calls):
- 9 custom accent bases (Brand → Informative)
- Random `#rrggbb` for each role
- Random `baseStep` selected from the engine's 25-step ladder (`STEPS`)
- Deterministic seeding via `mulberry32` for reproducibility
- Helpers: `buildConvexLikePalette`, `randomHex6`, `mulberry32` in `scripts/verify-theme-redundancy.ts`
- Aggregator: `scripts/analyze-surface-step-lookup.ts` with `--sample=N --seed=<int> --with-fixtures`; large runs suppress stdout but persist full detail to `temp/surface-step-lookup-analysis/report.json`

Run: `pnpm analyze:surface-step-lookup --sample=200 --seed=42`

| Metric                                       | Range          | Mean   | σ    |
| -------------------------------------------- | -------------- | ------ | ---- |
| Reduction vs whole-file distinct pairs       | ~39.6 – 45.0%  | ~42.2% | ~1.5 |
| Agnostic-only dedup                          | ~35.8 – 41.5%  | —      | —    |
| Distinct `(token, value)` count              | 4,719 – 5,176  | —      | —    |
| Projected Approach B grouped rule count      | 122 – 190      | ~153   | ~15  |

Interpretation:
- **Declaration totals stay structurally constant** across fully randomized accent colors, base anchors, and palette topology.
- **Redundancy ratios cluster tightly** (σ=1.5 on a 42% mean — tight enough that any future brand falls into the same band).
- **Grouping opportunities are stable** — the projected post-grouping rule count is bounded (122–190) regardless of palette variation.

The redundancy is therefore a property of the **surface algorithm**, not of any specific seeded fixture, low-chroma corner case, or semantic palette. This retires the "is the redundancy generalizable?" risk for Approach B. The remaining unknown is browser runtime behavior under grouped emission — addressed by the §5.1 gate.

---

## 2. What "300 KB" actually costs

Wire is not the bottleneck. Brotli already compresses the file 17×. Real costs, in priority order:

1. **CSS parse + CSSOM allocation** on stylesheet swap (brand switch, Storybook story remount).
2. **Style invalidation and recalculation**: every time a `[data-surface-step]` ancestor changes, descendants re-resolve all custom properties declared at that step block. **Cost scales with declaration count per element, not rule count.**
3. **Selector matching**: for attribute selectors browsers index by attribute key — additional rules with the same attribute key are ~free. Matching cost scales weakly with rule count, strongly with selector specificity / combinator complexity (we have neither).
4. **Memory footprint** of the parsed CSSOM in long-lived sessions (Storybook iframes, brand editor).

→ The optimization target is **declaration count and CSSOM complexity**. Rule count matters mostly through CSSOM iteration during recalc, and is a secondary metric. Raw bytes are a useful proxy because they track declarations + selectors but should not be the success criterion.

---

## 3. Constraint envelope (binding)

What cannot change:

1. **Cascade-correctness from cascade alone.** Every `[data-surface-step="N"]` rule must be **independently complete and directly resolvable**. No inter-step delta chains (i.e. step 200 must not depend on step 100 having been "applied first"). This rules out:
   - Encodings that emit a base step then deltas for neighbors.
   - Schemes that require source-order assumptions among step blocks.
   - Any approach that breaks under arbitrary subtree mounting, portals, SSR streaming, or detached DOM trees.
2. **Arbitrary-nesting safety.** The surface graph is **fully connected under recursive nesting** — any step can transition to any other via a sequence of ±N moves. Step pruning (emitting only "reachable" steps) is therefore not safe; every legal `data-surface-step` value the algorithm can produce must be resolvable to a complete declaration set. This kills the "reachable-step pruning" approach explored in earlier drafts.
3. **Public API**: token names emitted (`--Primary-Bold`, `--Surface-Halo-Gap`, etc.) must remain identical.
4. **Token-boundary allowlist** in `tokenBoundary.ts` continues to validate.
5. **No JS at runtime** beyond the existing CSS injection. Surface awareness stays CSS-only.
6. **Algorithm fidelity**: TintedA11y is contrast-picked; Hover/Pressed walk the palette with role-aware guards. Replacing them with `color-mix()` formulas is a behavior change, not a representation change.
7. **One brand stylesheet at a time.** Brand switch replaces the stylesheet wholesale; cross-brand value sharing has no value.

What is allowed:

- **Selector-list grouping** — emit one rule with a multi-step LHS, e.g. `[data-surface-step="100"], [data-surface-step="200"], ... { … }`. Each matched element resolves directly from that single rule; no cross-block reference; specificity unchanged (still 0,1,0).
- **Token co-location within a rule** — multiple tokens that share the same exact stepSet can live in the same rule body.
- **`:root`-extraction for fully-invariant tokens** — if a (token, value) pair spans all 25 steps, declare it once at `:root`. Inheritance from `:root` is not "inter-step" — it is normal cascade base. Caveat: in this fixture the count is ~2 pairs, so the lever is small.

What is forbidden:

- Inter-step inheritance/delta chains.
- Lossy perceptual compression / step bucketing / interpolation.
- Runtime procedural color reconstruction (calc, color-mix derivations).
- Binary LUT projection or attribute-substring matching tricks.
- Step-coverage pruning based on assumed-typical depths.

---

## 4. Approach catalog (re-prioritized under §3 constraints)

### B. Selector-list grouping by `(token, value)`  ★★ primary lever

Emit one rule per `(value, stepSet)` group, with the LHS being the union of step selectors that share that exact stepSet, and the body containing **every** (token, value) pair that maps to that exact stepSet (token co-location).

Example output:

```css
/* spans 23 steps where Primary-High = white, Primary-Subtle-High = white, etc. */
[data-surface-step="100"],
[data-surface-step="200"],
…
[data-surface-step="2200"] {
  --Primary-High: #ffffff;
  --Primary-Subtle-High: #FFFFFF;
  /* … other tokens that share the exact same stepSet */
}

/* spans the 2 steps where Primary-High flips */
[data-surface-step="2300"], [data-surface-step="2500"] {
  --Primary-High: #000000;
  /* … */
}
```

**Empirical numbers (from fixture analysis):**

| Quantity                                         | Today | After B (co-located) | Δ      |
| ------------------------------------------------ | ----- | -------------------- | ------ |
| Total declarations                               | 8,275 | **5,120**            | **−38%** |
| Total rules                                      | 75    | 177                  | +136%  |
| Avg declarations per rule                        | 110   | ~29                  | −74%   |
| Avg selectors per rule (rough)                   | 1     | ~5                   | +4×    |

Trade-off: **fewer declarations, but more rules with longer LHS**. The win is on declaration count and per-element style invalidation (the dominant cost). Rule count goes up but each rule is small. Selector matching is bounded by attribute-index lookup (not rule count), so the +136% rule count is unlikely to translate to a matching-cost regression.

- **Cascade safety**: each `(token, value)` pair maps to exactly one rule — by construction no two grouped rules can compete for the same `(element, token)`. Specificity unchanged. Source-order independence holds (no overlap).
- **Self-sufficiency**: every step block's tokens are fully resolvable from the rules whose LHS matches that step. No inter-step references.
- **Savings**: ~38% declaration reduction. Raw bytes ~30–40% reduction (selector LHS overhead partially offsets). Gzip win is small (was already compressing the repetition); brotli win is even smaller.
- **Risk**: Low. Pure compression of identical output values.
- **Complexity**: Medium. Rewrite emission in `cssGenNew.ts` as a two-pass pipeline (build `Map<stepSet, Map<token, value>>`, then emit one rule per stepSet).

### B.1. `:root` extraction for fully-invariant tokens (companion to B)

For (token, value) pairs that span **all 25 steps** in the theme-agnostic block, emit once at `:root` and skip from per-step bodies. Cascade-correct because `:root` is always the inheritance base for any rendered element (including portals, SSR boundaries, shadow DOM via inheritable custom properties).

- **Empirical numbers**: only **2 stepSet=25 cases** in the jio-default fixture. ~2 declarations saved out of 5,120 in B's grouped output. **Negligible.**
- **Verdict**: Implement for completeness and correctness clarity, but do not expect measurable savings. The histogram will look different on lower-chroma brands or after legacy alias cleanup; re-measure after H lands.

### H. Legacy alias audit + removal  ★ independent cleanup

The engine still emits backward-compat aliases (`--Surface-Bold`, `--{Role}-FG-Bold`, `--{Role}-BG-Subtle`, `--Text-High`, etc.) for components mid-migration. Cross-package grep of `packages/ui` + `apps/*` to identify which aliases still have references; drop the rest.

- **Savings**: 5–15% of declarations depending on how many aliases remain unused.
- **Risk**: Low if the grep is thorough. Worth a CI grep guard added at the same time.
- **Complexity**: Low. Codemod-style.
- **Stacks with B**: cleanly orthogonal. Apply B over the post-cleanup token set.

### E. Hex shortening (`#RRGGBB` → `#RGB`)  ★ free byproduct

Roughly 15% of values qualify (palindromic hex). Apply during emission.

- **Savings**: 2–4% raw bytes; near-zero on parsed declaration count (just shorter values).
- **Risk**: Zero.
- **Complexity**: Trivial.

### C. State-token derivation via `color-mix()`  ☆ deferred

Replace algorithm-derived state tokens (Hover/Pressed/Bold-Hover/etc.) with `color-mix()` expressions referencing base tokens.

- **Savings**: Up to ~20%, but TintedA11y is contrast-picked and Hover/Pressed are role-aware — they cannot be expressed in CSS without re-deriving the algorithm to match.
- **Verdict**: **Defer.** This is an algorithm-spec change, not a representation optimization. Worth a separate RFC if pursued.

### D. Two-tier palette indirection (`var()` redirection)  ☆ deferred

`:root` declares `--Primary-100..--Primary-2500`; per-step blocks redirect via `var()`.

- **Savings**: ~30–40% raw bytes, near-zero parsed-declaration savings (declarations remain — just values shorten).
- **Cost**: Adds one level of `var()` indirection per token resolution per styled descendant. Empirically negligible in modern engines but worth measuring before committing.
- **Why deferred**: With one brand stylesheet at a time, palette indirection's primary purpose (sharing values across brands) is moot. The remaining benefit is purely byte size, which is already brotli-compressed away. Skip.

### Approaches removed under §3 constraints

| Approach (earlier draft)                          | Why removed                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| **A. Reachable-step pruning**                     | Step graph is fully connected under arbitrary nesting (constraint §3.2). Cannot safely omit any step. |
| **G. Production-only step coverage**              | Same as A — relies on bounded depth that the model does not guarantee.   |
| **F. `@property` + numeric step encoding**        | CSS cannot construct `var(--Name-N)` from a calc'd index.                |
| **Inter-step delta emission**                     | Violates self-sufficiency (constraint §3.1).                             |
| **Banded encoding via `:where()` / specificity tricks** | Risks unintended override behavior; specificity must remain 0,1,0.       |

---

## 5. Recommended path

**Phase 1 — single PR**: B + B.1 + H + E.

1. **H first** (legacy alias removal). Run codemod + grep audit; drop aliases with zero references. Reduces token count entering B.
2. **B** (selector-list grouping by `(token, value)` with token co-location). Two-pass emitter in `cssGenNew.ts`. Deterministic output (sort stepSets canonically; sort tokens within a rule canonically).
3. **B.1** (`:root` extraction for stepSet=25 cases). Fall-out of B's grouping pass — any (token, value) pair whose stepSet contains all 25 steps moves to `:root`.
4. **E** (hex shortening). Apply during value emission.

Expected outcome: **−38% declarations**, **−30 to −40% raw bytes**, **CSSOM** reduced by similar margin in declaration nodes (rule count rises but each is small). The Storybook story-switch latency regression introduced by Option C should resolve **if and only if** the gate below holds — see §5.1.

**Functional validation checklist (necessary, not sufficient):**

- All 1,006 engine tests pass unchanged (token output value identity check — same token resolves to same value at same step).
- Snapshot the 8 brand fixtures byte-for-byte; CI fails on unintentional baseline drift.
- Visual regression: render the 8 brand fixtures × all surface stories; chromatic diff must be empty (algorithm unchanged, only representation changed).
- Bench: `pnpm bench:pipeline` — generator JS time may increase slightly from the grouping pass; offset by smaller string concat output. Re-bless `perf-baseline.json`.

### 5.1. Performance gate (Phase 1 ship/revert criterion)

**The risk**: declaration count is a proxy for runtime cost, not a guarantee. Browser engines internally:

- Cache matched property sets per element (Chromium `MatchedPropertiesCache`, WebKit `RuleSet` indexing, Servo style cache).
- Intern declarations and canonicalize style maps.
- Optimize repeated rule bodies internally.

A −38% declaration reduction may translate to anywhere between ~5% and ~38% recalc improvement depending on how cache-hit rates shift after the layout change. Conversely, the +136% rule count could regress parse time or selector-matching cost on engines whose RuleSet indexing scales poorly with rule count. **B is a measurable performance hypothesis, not a proof.**

**Mandatory before merge — capture pre/post numbers across the full pipeline:**

| Metric                                 | How to measure                                                   | Pass condition |
| -------------------------------------- | ---------------------------------------------------------------- | -------------- |
| 1. Stylesheet parse time               | DevTools Performance panel, `Parse Stylesheet` event             | not regressed |
| 2. CSSOM construction time             | `Recalculate Style` first paint after stylesheet swap            | not regressed |
| 3. Style recalc duration (story switch)| `Recalculate Style` event during Storybook story-to-story switch | **≥ 10% improvement** vs pre-Phase-1 baseline |
| 4. Story switch end-to-end latency     | Wall-clock from story-link click to next story's first paint     | not regressed; ideally improved |
| 5. Memory footprint                    | DevTools Memory snapshot of the iframe after 50 story switches   | not regressed |

**Decision matrix:**

- **All 5 pass with ≥ 10% improvement on (3)** → ship.
- **(3) improves but < 10%, (1)/(2)/(4)/(5) flat** → ship, but document as "modest representation win, primary motivator weaker than expected."
- **(3) improves but (1) or (2) regresses materially** → **revert B**, keep H + E (which carry no engine-internal risk).
- **(3) flat or regresses** → **revert B entirely**. The +136% rule count is not justified without the recalc payoff, and the elegance of column-pattern compression is no substitute for a measured improvement.

This matters because grouping may improve some metrics while hurting others. Browser engines are not symmetric — a representation that wins on declaration count can lose on rule-count-bounded indexing. Full pipeline visibility is non-negotiable.

### 5.2. DevTools recipe — running the gate

Goal: capture the five §5.1 metrics under both emitters with the same DOM and the same interaction.

**Setup (run twice — once with each emitter):**

1. Cold-start Storybook in incognito (eliminates extension noise + prior CSSOM state):
   ```bash
   pnpm storybook                                  # grouping ON  (default)
   ONEUI_STEP_LOOKUP_GROUPING=0 pnpm storybook     # grouping OFF (legacy emitter)
   ```
2. Pick a representative pair of stories whose surfaces nest deeply enough to exercise the cascade. Surface stories with multiple `<Surface mode="...">` ancestors are ideal. Note their URLs so the same pair is used for both runs.
3. Open DevTools → Performance panel. CPU throttle: **4× slowdown** (normalises across hardware). Network: no throttle (stylesheet swap is local).

**Per metric — what to read off the trace:**

| § | Metric                              | Where to find it in the trace                                                                        |
| - | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1 | Stylesheet parse time               | After story switch starts: filter Main thread for `Parse Stylesheet`. Sum its self-time.             |
| 2 | CSSOM construction time             | First `Recalculate Style` event after the new `<style>` mounts. Read its self-time.                  |
| 3 | Style recalc duration (story switch)| The `Recalculate Style` event(s) triggered by the DOM swap on story navigation. Sum across the swap. |
| 4 | Story switch end-to-end             | Wall-clock from the navigation event (click on story tree) to the next "First Paint" marker.        |
| 5 | Memory footprint                    | DevTools → Memory → Heap snapshot of the **iframe** (not the parent frame). Take after 50 story switches. |

**Procedure:**

1. **Warmup**: load the iframe, switch between the two stories twice. Discard.
2. **Record**: start Performance recording. Click story A → wait for paint → click story B → wait for paint → repeat 5 times.
3. **Stop, save trace**: Performance panel → Save profile (gives a `.json`).
4. **Read the 5 metrics** off the trace. For (3), report the **median** of the 5 swaps, not the mean — first swap usually has cold-cache noise.
5. **Repeat with the other emitter.** Same stories, same hardware, same browser session, fresh tab.
6. **Decide using the §5.1 matrix.** Don't average across runs — pick the median per metric.

**Quick sanity check before recording**: in the Console, `performance.getEntriesByType('resource').filter(e => e.name.includes('foundation-tokens'))` — confirms which stylesheet is loaded. The grouped output's first step-keyed rule has a multi-step LHS (commas) immediately after the `:root` block; the legacy output has `[data-surface-step="100"] {` directly. Eyeball this to confirm which emitter is actually live.

**If the gate fails, revert path:**

- Runtime: `ONEUI_STEP_LOOKUP_GROUPING=0 pnpm storybook` and the same in production. Zero code change required, just an env flip.
- Permanent: `git revert <grouped-emitter-commit>`. Tests still pass because the legacy path is intact.

**Phase 2 — defer, revisit only if Phase 1 is insufficient:**

- D (palette indirection) — measure `var()` indirection cost first; only worth doing if Phase 1 declarations-cost reduction is below target.
- C (state-token color-mix derivation) — algorithm RFC.

---

## 6. Implementation notes (Phase 1)

Files in scope:

- **`packages/shared/src/engine/cssGenNew.ts`** — main rewrite. The `computeStepLookupCSS(themeConfig)` function from Option C becomes a 3-stage pipeline:
  1. Resolve every `(step, token) → value` into a flat map (existing behavior, retained).
  2. Invert to `Map<token, Map<value, Set<step>>>`, then to `Map<stepSet, Map<token, value>>` for co-location.
  3. Emit:
     - One `:root { … }` block carrying any `(token, value)` whose stepSet equals the universe of steps (B.1).
     - One rule per remaining stepSet, LHS being the canonically-sorted selector list.
- **`packages/shared/src/engine/__tests__/cssGenNew.test.ts`** — extend Option C suite with: cascade-correctness tests (token at step N resolves to expected value), determinism (same input → identical bytes), `:root` extraction for stepSet=universe cases, no rule overlap for any `(element, token)` pair.
- **`packages/ui/src/engine/computeNewStacking.ts`** — no signature change.
- **`packages/ui/src/hooks/useBrandCSS.ts`** — no caller change.
- **`scripts/dump-step-lookup-css.ts`** — re-run on all 8 fixtures; commit new dumps.
- **`scripts/bench-pipeline.ts`** — re-bless after grouping is in.
- **`perf-baseline.json`** — new generator timings.

**Determinism guard**: byte-identical output for the same input. Sort stepSets canonically (descending size, then ascending min-step), sort tokens within each rule (canonical role order then token-name alpha), shorten hex. Snapshot all 8 fixtures; CI fails on unintentional drift.

**Selector LHS canonical order**: sort step values numerically. Ascending is friendliest to humans diffing the file.

**Co-location heuristic**: tokens with **identical stepSets** go in the same rule. Tokens whose stepSets differ by even one step go in separate rules — do not approximate. The 177-rule projection assumes exact co-location.

**`:root` overlay caveat**: when extracting an invariant pair to `:root`, ensure no overriding rule exists later in source order with broader LHS that would inadvertently win. For pure step-attribute selectors this can't happen (specificity 0,1,0 always beats `:root`'s 0,0,0); the per-step rules will still override `:root` if a per-step value differs. Behavior is correct by cascade rules.

### 6.1. Permanent CI guard — structural-invariant analysis

The N=200 randomized validation (§1.1) demonstrated that surface-step redundancy is a **structural invariant** of the engine, not a fixture artifact. That property is worth protecting against future regressions.

Add to CI:

```bash
pnpm analyze:surface-step-lookup --sample=100 --seed=42
```

Failure conditions (regression signals worth surfacing even when functional tests pass):

| Signal                                       | Threshold (initial — tune as data accumulates) |
| -------------------------------------------- | ---------------------------------------------- |
| Mean reduction vs whole-file distinct pairs  | < 30%  (currently ~42%)                        |
| Projected grouped rule count                 | > 250  (currently ~153, σ=15)                  |
| Distinct `(token, value)` pairs              | > 6,500 (currently ~5,100)                     |
| σ of any of the above                        | > 3× current σ                                 |

If any threshold trips, an engine change has materially altered the surface algorithm's redundancy structure — possibly intentional, possibly not. The CI step forces a conscious decision (re-bless thresholds vs. investigate cause) rather than letting structural drift accumulate silently.

The deterministic `--seed=42` guarantees reproducibility; the `report.json` artifact is the audit trail.

---

## 7. Open questions to resolve before / during Phase 1

These are the investigations the next pass needs to nail down:

1. **Actual declaration-count reduction from B alone, on all 8 brand fixtures.** The 38% number is fixture-specific (jio-default). Run the same `Map<stepSet, Map<token, value>>` analysis on jiocinema, jiomart, jiohotstar, low-chroma, high-chroma, shallow-base, deep-base. Confirm Δ is consistent.
2. **CSSOM node-count change after grouping.** Empirically count CSSStyleRule + CSSStyleDeclaration nodes before/after via `getComputedStyle` profiling or a synthetic stylesheet inspector. Confirm the +136% rule count does not nullify the −38% declaration count in CSSOM allocation cost.
3. **Selector-matching cost change.** Use Chrome DevTools "Recalculate Style" trace on a representative DOM (e.g. Storybook surface story with 50 nested elements). Compare style-recalc time before vs. after Phase 1.
4. **Whether grouped-selector LHS length pessimizes attribute-index lookup.** Modern engines index `[attr="value"]` by `(attr, value)`; longer LHS lists are translated into multiple index probes. Verify on Chromium + WebKit + Gecko if any anomaly appears.
5. **Whether tokens can be safely co-located across the theme-agnostic block AND the light/dark overlays.** Today Option C splits emission into 3 contexts; B should respect that split (don't co-locate a non-overlay token with an overlay token). Test that overlay precedence holds (dark theme rule wins over light theme rule when both selectors match a step).
6. **Storybook story-switch regression** — confirm B resolves it. Profile pre/post, capture flame-graphs.
7. **Are there any non-Default tokens with stepSet=25 in some brands but not others?** If yes, B.1's value varies per brand; if no, it can be a static optimization. Worth confirming across the 8 fixtures.

---

## 8. Why this is *not* mostly a calc / advanced-CSS problem

Reaching for `oklch(from var(--base) calc(l + 0.05) c h)` or `@property` interpolation is tempting but unhelpful here:

1. **The values are not on a clean function.** TintedA11y is contrast-picked. Hover/Pressed walk the palette with role-aware guards. State tokens at the dark end behave differently from the light end. CSS `calc()` cannot reproduce this; the algorithm exists in JS for a reason.
2. **The redundancy is structural, not arithmetic.** ~309 of 331 tokens take fewer than 25 distinct values across all step blocks; many take only 2–3. Compression of that repetition is what selector-grouping does, and it does not need any new CSS feature.
3. **Wire size is already won.** Brotli compresses the file 17×. Any approach that targets raw bytes at the cost of parsed declaration count or CSSOM complexity is a regression on the metrics that actually matter.

The lever is **representation** (group identical (token, value) tuples under one rule), not **computation** (derive values at runtime). Phase 1 keeps the algorithm untouched, the cascade contract intact, and arbitrary nesting fully supported, while exploiting the structural redundancy that the algorithm itself produces.
