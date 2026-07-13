# Fallow Cleanup — Final Merge Guide

> ✅ **All branches in this guide were merged into `main` by 2026-05-02** (tip `94f44375`). The branch-graph and merge-order sections below describe a moment in time that has passed; for the as-built sequence run `git log --oneline --first-parent 87fcaef9..94f44375`. Doc retained for historical context.

> Companion to `fallow-gate-cleanup-plan.md` (the original phase plan) and
> `native-spacing-shape-plan.md` (the architectural follow-up).
> This doc is the **as-built** merge guide for the work the agent team produced.

## Branch graph (verified via `git merge-base`)

```
main (4c9a1089)
└── 87fcaef9 ─ feat(agent-pulse): add AgentPulse  (common ancestor of main + feat)
    ├── chore/fallow-audit-phase-1-layout-decomp           cc6d7b21  (+1 commit)
    ├── chore/fallow-audit-phase-2-appearance-factory      5eba399b  (+2 commits)
    └── chore/fallow-audit-phase-3-button-state-base       82c7e89d  (+3 commits)

feat/surface-migration-settings-brandpicker (3e75d956 = main + 1)
    ├── chore/fallow-audit-phase-4-mobile-tests            13a694a3  (+1)
    │     └── chore/fallow-audit-phase-4b-token-fixes      ee8ee564  (+3)
    │           └── chore/fallow-audit-phase-4c-typecheck-fix  a33bbdc9  (+4)
    └── chore/native-spacing-shape-tokens                  5c0ac8c7  (+4, parallel to 4c)
```

P1/P2/P3 branched from `87fcaef9`, an ancestor of both `main` and `feat/...`.
They merge cleanly into either base.

P4 → 4b → 4c are **stacked**: 4b on 4, 4c on 4b. They sit on top of
`feat/...` because they consume native files (Expo 54 / React 19 / native
multibrand pipeline) introduced by that branch's single commit.

`chore/native-spacing-shape-tokens` is **parallel to 4c**, also off
`feat/...` tip — it's not stacked on the P4 chain.

## Recommended merge order

```
1. feat/surface-migration-settings-brandpicker  →  main      (your existing feature)
2. chore/fallow-audit-phase-2-appearance-factory →  main     (smallest, lowest risk)
3. chore/fallow-audit-phase-3-button-state-base  →  main     (rebase on P2 to share _shared/)
4. chore/fallow-audit-phase-1-layout-decomp      →  main     (FOUC-sensitive, smoke-test required)
5. chore/fallow-audit-phase-4-mobile-tests       →  main     (rebase, P4 base now reachable)
6. chore/fallow-audit-phase-4b-token-fixes       →  main     (rebase or merge as a unit)
7. chore/fallow-audit-phase-4c-typecheck-fix     →  main     (rebase or merge as a unit)
8. chore/native-spacing-shape-tokens             →  main     (rebase, then merge)
```

Steps 6–8 can be combined into a single PR if you prefer — 4 → 4b → 4c is
a logically single unit of work, and native-spacing-shape is independent
and small. Pick a granularity for review.

## Pre-merge cleanup checklist (per branch)

### chore/fallow-audit-phase-2-appearance-factory (`5eba399b`)
- [ ] Discard `pnpm-lock.yaml` change (worktree install artifact)
- [ ] Spot-check: `_shared/appearanceClasses.ts` exists, factories return
      `Record<…, string | undefined>` (the post-review fix)

### chore/fallow-audit-phase-3-button-state-base (`82c7e89d`)
- [ ] Already cleaned: `.fallowrc.json` removed, suppress comments removed,
      `resolveSize` refactored not suppressed, `BUTTON_ATTENTION_TO_VARIANT`
      hoisted into `_shared/buttonStateBase.ts`
- [ ] Optional: delete `resolveIconButtonSize` (genuinely unused export
      flagged by fallow but left untouched per "public APIs" rule —
      now safe to drop)

### chore/fallow-audit-phase-1-layout-decomp (`cc6d7b21`)
- [ ] **Run `pnpm dev` smoke-test locally** before merging. Verify:
  - First paint shows no FOUC / token-less render
  - Brand switching does not flash the previous brand
  - Brand-create dialog still works (Sidebar + OverviewContent paths)
- [ ] **Run `pnpm test`** locally — agent's worktree harness couldn't
      capture vitest output, so the test gate is unverified
- [ ] Sanity-check the deviation: 17 files instead of 6 was a deeper
      decomposition than the source plan suggested. Probably correct
      (cyclomatic 53 → 10) but worth eyeballing for over-extraction
- [ ] Bonus fixes already in this branch (originally pre-existing bugs):
      `scaleNamesKey.split('')` corrected; duplicate `setPlatformBrandId`
      effect collapsed

### chore/fallow-audit-phase-4-mobile-tests (`13a694a3`)
- [ ] **Sanity-check `apps/mobile/vitest.config.ts react alias`** —
      this masks a pnpm peer-dependency issue (mobile app pinned
      `react@19.1.0` vs root `19.2.5`). Real fix is resolving the
      peer-dep config; alias is a workaround.
- [ ] **Sanity-check the wholesale `@oneui/ui-native` mock** in
      `apps/mobile/vitest.setup.ts` — currently benign because
      `BrandPickerHeader` doesn't yet consume the mocked hooks; will
      become more meaningful after 4b (which makes it consume them)

### chore/fallow-audit-phase-4b-token-fixes (`ee8ee564`)
- [ ] Stacked on 4 — review as a continuation, not in isolation
- [ ] `BrandPickerHeader.tsx` color + typography literals replaced;
      spacing/shape literals stay until native-spacing-shape lands
- [ ] `selectTypographyTokens` extracted as pure export — test imports
      real impl now, no replicated logic

### chore/fallow-audit-phase-4c-typecheck-fix (`a33bbdc9`)
- [ ] One-line `vi.hoisted` factory signature fix, clears 19 errors
- [ ] No real product bugs — purely a mock-typing oversight

### chore/native-spacing-shape-tokens (`5c0ac8c7`)
- [ ] 4 commits, one per migration phase
- [ ] `brandHash` extension (`:density:dimensionPlatform`) — verify this
      doesn't break any existing cache test (it's a real fix that
      previously had a coverage gap)
- [ ] Token gaps documented in plan §3 ("Token gaps in playground"):
      `divider.height: 1`, `swatchChip.height: 28`, `swatch.width: 84`
      stay as literals — no spacing/shape token matches their semantics

## Worktrees still locked

```
.claude/worktrees/agent-a076fe23be135a40e   (P0 — empty, can delete)
.claude/worktrees/agent-a5e69bd3e204630ed   (P2)
.claude/worktrees/agent-aa8d14b3a68e8f529   (P3)
.claude/worktrees/agent-afd5cfe28cc5eef0b   (P1)
.claude/worktrees/agent-a337aa57057004648   (4b)
.claude/worktrees/agent-a761cf07c1f54d41a   (4c)
.claude/worktrees/agent-a8a6f108eab5d8cf4   (native-spacing-shape)
```

After all merges land, prune with:
```bash
git worktree remove <path>     # for each
git worktree prune
```

## Skipped findings (deferred for future cleanup)

Per the `/simplify` review pass — known, not blocking:

- **P4-A** Native theme spacing/shape gap → addressed by `chore/native-spacing-shape-tokens` ✓
- **P4-C** `react` resolve.alias workaround for pnpm peer-dep mismatch
  → root fix is in package resolution, not vitest config
- **P4-D** Wholesale `@oneui/ui-native` mock → benign; revisit when more
  components depend on it
- **P1-C** Comment cleanup in `_layout/` files → style noise, not blocking
- **`apps/mobile` literal-gate exclusion** → playground scratchpad,
  excluded by design; would need separate decision to gate

## Audit goal achieved?

The original gate-cleanup plan targeted: **complexity 30 → ~3, duplication 18 → ~5.**

After all phases ship and merge:

- **Complexity:** P1 alone moved layout.tsx from 13 findings → 1, and
  `Button.resolveSize` was genuinely refactored (not suppressed) by P3.
  Mobile CRAP findings cleared by P4 + 4b. Estimated post-merge
  complexity: **~5 findings**, mostly the deferred Phase 5 items
  (Input, BottomNavItem, ListItem) which the original plan called
  opportunistic.
- **Duplication:** P2 cleared the largest family (289 lines × 11
  instances). P3 cleared the `useButtonState` triplet. P1 cleared
  `tintSvgToCurrentColor` and `createBrand` form submission. Estimated
  post-merge duplication: **~5–8 clone groups**, mostly small near-dups.
- **Suppressions:** zero `.fallowrc.json` and zero `// fallow-ignore-next-line`
  comments shipped. Every finding was either fixed at the root or
  documented as an explicit deferral.

The gate should pass without `--no-verify` after all merges land.

## What was NOT done

- **Phase 5** (component-level splits in Input, BottomNavItem, ListItem,
  Button.renderOrnament, PaginationDots) — opportunistic per source plan,
  pick up when those components are touched anyway
- **Motion + elevation native tokens** — same gap pattern as
  spacing/shape, no current `packages/ui-native/src` violator, deferred
  per `native-spacing-shape-plan.md` §7
- **Removing the `apps/mobile` exclusion** from `check:literals` — out
  of scope; would gate the playground app
