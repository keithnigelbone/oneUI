# RFC-0003 — Active Completion Plan

> Sequenced plan for the items we're shipping in this round. Items the
> team scoped out are tracked in `05-deferred.md`; revisit those when
> the underlying constraint changes (consumer asks for native parity,
> CSS budget tightens, cross-role bold pattern surfaces in Storybook,
> etc.).
>
> Two active phases: **Phase 1 — `BrandFoundationContext`**, then
> **Phase 9 — perf gate**. That's it.

## Phase 1 — `BrandFoundationContext` (closes pending-work § 1)

### Why this is the only meaningful phase right now

Currently `<Surface mode="bold">` writes `data-surface-step = 700`
(light) / `1900` (dark) regardless of the brand's actual `baseStep`.
A brand whose primary baseStep is 1300 paints from
`--Surface-Fill-Bold = palette[1300]` (the engine, root-only, knows
the real baseStep) but tells descendants "your parent is at step
700." Tokens in the lookup block at step 700 are computed for "child
of a parent at step 700," so on-bold contrast tokens drift. Visible
as a small but real off-brand colour for `--Primary-Bold-High`,
`--Text-OnBold-High`, etc.

Phase 1 closes the gap: surface a React context carrying the brand's
`themeConfig.appearances`, have `<Surface>` call the real
`resolveSurface()` from `@oneui/shared/engine`, JSX writes the brand's
actual bold step.

### Scope

| File | Change |
| --- | --- |
| `packages/ui/src/contexts/BrandFoundationContext.tsx` (new) | Context carrying `themeConfig: ThemeConfig \| null`. Default `null`. Tiny `<BrandFoundationProvider>` wrapper for ergonomics. |
| `packages/ui/src/hooks/useBrandCSS.ts` | Return `themeConfig` alongside `cssContent` so callers can pass it into the provider without re-running the resolver. |
| `apps/storybook/.storybook/BrandStyleDecorator.tsx` | Wrap children in `<BrandFoundationProvider value={themeConfig}>`. |
| `apps/platform/src/components/FoundationStyleProvider.tsx` | Same provider wrap at the layout level. |
| `packages/ui/src/components/Surface/Surface.tsx` | When `themeConfig` is available via context, call `resolveSurface(mode, parentStep, scale, dir, darkMode)` from the shared engine. Keep `approxResolveStep` only as the no-context fallback (Storybook with no brand selected, SSR pre-hydration). |
| `packages/ui/src/components/Surface/Surface.test.tsx` | New test renders inside a fixture provider with `baseStep = 1300`, asserts `data-surface-step="1300"`. Existing tests continue to pass via the no-context fallback path. |

### Acceptance

- A brand whose primary `baseStep = 1300` makes `<Surface mode="bold">`
  write `data-surface-step="1300"` (verified via DOM attribute + Surface
  test).
- No-context fallback (no brand selected, SSR pre-hydration) still
  walks the canonical 700/1900 — existing 29 Surface tests stay green.
- Story `Surface/Bugs · Surface Fills` "Bold › Subtle › Minimal"
  shows the inner subtle resolved against the brand's actual bold step,
  not against canonical 700.

### Risk / rollback

If the provider plumbing surfaces unexpected consumers of
`useBrandCSS` we missed, gate the real-resolveSurface path behind a
`useBrandResolution` prop on `<Surface>`. Strip the gate once rollout
is clean. Approximation remains the default until then.

### Out of Phase-1 scope

- **Cross-role bold (`differentAppearance`)** — `03-design-deltas.md`
  Delta 2. Deferred. Phase 1 only fixes single-role bold resolution.
- **Per-appearance Self-Color** — Surface still paints from the
  primary scale regardless of `appearance` prop. Deferred — see
  `05-deferred.md` Item D.

---

## Phase 9 — Perf gate (closes pending-work § 9)

### Why now

The step lookup multiplies role-token resolution calls per theme by
~5× compared to the pre-RFC mode-keyed blocks (25 steps × 11 roles
≈ 275 calls vs the previous 5 mode blocks × 11 roles ≈ 55 calls).
Cold pipeline budget is `<10ms`. Worth confirming we still fit before
the architecture goes wider.

### Scope

| File | Change |
| --- | --- |
| `perf-baseline.json` | Re-blessed via `pnpm bench:pipeline --bless`. |
| `packages/shared/src/engine/cssGenNew.ts` (`getOccupiedSteps`) | If cold pipeline overruns budget, prune to reachable-only via a graph walk: from each role's start steps (root + every baseStep) apply each surface mode, collect reached steps, return the set. Currently returns all 25. |
| `docs/perf-harness.md` | Update commentary if numbers move. |

### Acceptance

- Cold pipeline `<10ms`, warm `<5ms` (existing budget).
- New baseline committed.
- If pruning was needed, `getOccupiedSteps()` documented as "reachable
  subset" with a comment explaining the graph walk.

### Risk

Low. Pruning is local to one function with a self-contained test.

---

## Sign-off / sequencing

```
Phase 1 (BrandFoundationContext)
    │
    └── Phase 9 (perf re-bless)
```

Phase 9 runs after Phase 1 because Phase 1 changes the JSX-side cost
profile (one extra `useContext`, plus a real `resolveSurface` call
instead of a switch). Both within margin, but worth measuring once.

## Deferred work

Everything else from the original 10-phase plan was scoped out of
this round. See `05-deferred.md` for the full list, the consumer
constraint that gates each, and the architectural improvement each
would unlock when we eventually pick it up.

## References

- `README.md` — original RFC.
- `00-analysis.md` — the analysis that motivated RFC-0003.
- `01-pending-work.md` — the open-items list this plan closes a
  subset of.
- `03-design-deltas.md` — the two reference deltas (both deferred
  per design-team call).
- `04-buildtime-alternative.md` — context for the deferred calc
  cascade and native parity items.
- `05-deferred.md` — the deferred-work register.
- `OneUIColourTool/packages/core/src/surfaceLogic.ts` — designer-side
  reference for `resolveSurface`.
