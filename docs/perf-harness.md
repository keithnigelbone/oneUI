# Brand CSS Pipeline — Performance Harness

A benchmark + regression gate for the brand CSS pipeline. Makes the
performance targets in `CLAUDE.md` (`<5ms cached`, `<10ms cold`, etc.) verifiable
on every PR instead of aspirational.

## TL;DR

```bash
pnpm bench:pipeline            # measure — writes perf-current.json
pnpm check:perf                # compare current vs baseline, exit 1 on regression
pnpm bench:pipeline --bless    # overwrite perf-baseline.json with current numbers
```

CI runs both automatically on every PR. The gate is **report-only** until
CI has blessed its own baseline — see "Promoting the gate to blocking" below.

## Scenarios

| Scenario | What it measures | Why it matters |
|---|---|---|
| `buildAvailableScales` | Color config → resolved scales | First step of every brand render |
| `buildNewPaletteData` | Scales → ThemeConfig with role mappings | Memo 1 in `useBrandCSS` |
| `generateNewRootCSS-light` | ThemeConfig → root surface CSS | Memo 2, theme-dependent |
| `generateNewContextCSS-light` | ThemeConfig → `[data-surface]` blocks | Most expensive single step |
| `validateBrandCSSSignature` | Lightweight runtime gate | P1-3: must stay ~O(n) indexOf |
| `validateBrandCSS-full` | Full structural validation | Dev-only path; kept for CI + precompute |
| `full-pipeline-cold` | Everything composed, cache-miss shape | The "brand switch" user cost |
| `theme-toggle-light-to-dark` | Memo 2 rerun on same palette | Memo 1 stability guarantee |

Scenarios are pure functions over frozen synthetic inputs — no React, no DOM,
no I/O. Deterministic modulo CPU noise.

## Adoption Budgets

`bench:pipeline` also records CSS payload metrics that matter for adopters,
because every brand update writes complete `<style>` text through
`useStyleInjection`.

| Metric | Budget | Why it matters |
|---|---:|---|
| `rootCssBytes` | 50KB | Matches the brand CSS soft limit used by validation. |
| `contextCssBytes` | 75KB | Keeps `[data-surface]` remapping blocks from dominating style recalculation. |
| `injectedCssBytes` | 125KB | Caps the complete `@layer brand` stylesheet written on brand switch. |
| `storybookBrandStyleChannels` | 3 | Storybook should stay limited to foundation, dimension, and component override injectors. |

`check:perf` fails when these budgets are exceeded, even if runtime timings
still pass. Treat a breach as an adoption-readiness issue: reduce emitted CSS,
split fewer dynamic channels, or explicitly re-baseline after profiling.

## Files

| Path | Purpose |
|---|---|
| `scripts/bench-pipeline.ts` | Runs scenarios N times, computes p50/p95/p99, writes JSON |
| `scripts/check-perf.ts` | Compares current vs baseline; enforces tolerance + absolute budgets |
| `perf-baseline.json` | Committed source of truth. Only regenerated with `--bless`. |
| `perf-current.json` | Per-run output. Gitignored (never committed). |
| `.github/workflows/quality-gates.yml` | CI wiring |

## Tolerance

Default `15%` p95 regression allowed. Reasoning:

- GitHub Actions `ubuntu-latest` runners share CPU. Identical code benchmarks
  ±5-8% between runs for no real reason.
- A tolerance narrower than the noise floor produces false positives and the
  gate gets ignored within two weeks.
- `15%` is ~2× the noise floor — catches real regressions, not flakiness.
- Tighten to `10%` once two weeks of green CI runs show variance is smaller
  than expected.

Override with `pnpm check:perf --tolerance=10`.

## Absolute budgets

Each scenario has a hard ceiling in `scripts/check-perf.ts`
(`ABSOLUTE_BUDGETS_MS`). The gate fails if **either** the relative regression
exceeds tolerance **or** the absolute ceiling is breached. Belt-and-suspenders:
without this, repeated 10% regressions each individually passing tolerance can
drift the system arbitrarily slow.

Budgets are roughly 2× the current measured p95 — tight enough to protect
today's shape, loose enough to tolerate legitimate CI noise.

## When to bless a new baseline

Run `pnpm bench:pipeline --bless` and commit `perf-baseline.json` when:

1. You intentionally improved performance and want future PRs held to the
   better standard.
2. You intentionally accepted a regression (e.g., added a feature that costs
   real work) and the team agrees it's justified. **Mention it in the PR
   description** so reviewers see the intent.
3. Hardware / runtime changed (Node major version bump, new CI runner).

Never bless to silence a failing gate you don't understand. Always check what
regressed first.

## Hardware mismatch

`perf-baseline.json` records the platform it was generated on
(`darwin-arm64` / `linux-x64`). `check-perf` prints both baseline and current
platforms at the top of its output:

```
check-perf: baseline 2026-04-20T18:26:42.173Z  vs  current ...
            tolerance 15% · platform baseline=darwin-arm64 current=linux-x64
```

When platforms differ, absolute numbers aren't directly comparable — a Mac M-series
CPU is typically 1.5-2× faster than a standard GitHub Actions runner. This is why
the CI gate is **report-only** until a baseline has been blessed from CI itself.

## Promoting the gate to blocking

Two-step promotion:

1. **Bless baseline from CI.** Run this workflow (recommended: push to a
   throwaway branch, let CI execute the `bench:pipeline` step, download the
   `perf-current` artifact, rename to `perf-baseline.json`, commit to main):
   ```bash
   gh run download <run-id> --name perf-current
   mv perf-current.json perf-baseline.json
   git add perf-baseline.json && git commit -m "chore(perf): bless CI baseline"
   ```

2. **Flip `continue-on-error` to `false`** in
   `.github/workflows/quality-gates.yml` on the `check:perf` step. PRs will
   then block on perf regressions.

Until both steps are complete, CI reports regressions as warnings but does not
block merges.

## Local development

While iterating on brand CSS engine code, two useful workflows:

**Quick sanity check after a change:**
```bash
pnpm bench:pipeline --iterations=50    # faster, noisier, good for eyeballing
```

**Before opening a PR:**
```bash
pnpm bench:pipeline                    # 200 iterations, write perf-current.json
pnpm check:perf                        # compare to committed baseline
```

## Scenarios not covered (yet)

- Sub-brand cache hit-rate (`useBrandCSS` LRU). Needs React-hook harness.
  Deferred — add once the module-cache wins are verified in production.
- tldraw canvas re-render under 5 sub-brand styling load. Requires DOM
  + canvas mount. Candidate for a separate Playwright-based budget.
- Component-level render budgets (Button mount, Stepper mount). Consider
  alongside the Storybook performance addon, which covers runtime React metrics
  during story development.
