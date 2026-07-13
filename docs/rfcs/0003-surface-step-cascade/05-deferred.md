# RFC-0003 — Deferred Work Register

> Items scoped out of the active completion round (`02-completion-plan.md`).
> None of these block today's architecture — the system *works correctly*
> without them. Each entry names the gating constraint (what would make
> us pick it up) and the architectural improvement it would unlock.
>
> Don't action anything in this file without explicit re-scoping.

## How to read this doc

Every entry has the same five fields:

- **Source** — where it came from in the doc set (`01-pending-work.md` §,
  `03-design-deltas.md` Delta, etc.).
- **Status today** — what currently happens.
- **Why it's deferred** — the team's call.
- **What landing it would buy** — the architectural improvement.
- **Pickup trigger** — the consumer / metric / event that should make
  us reschedule it.

---

## A. Cross-role bold-on-bold reset — **LANDED 2026-05-07**

- **Source**: `03-design-deltas.md` Delta 2.
- **Spec confirmed**: When two bold Surfaces nest with *different*
  appearances, the inner Surface treats itself as root — anchoring to
  the theme default step (2500 light / 200 dark) so bold resolves to
  the inner role's own `baseStep`. Same-appearance bold-on-bold keeps
  parent-relative behavior unchanged.
- **Implementation**: `SurfaceStepContext` now carries `{step, mode,
  appearance}`; `Surface` adds an optional `appearance` prop and
  detects the cross-role bold case. New tests cover both branches.
- **Note**: Studio's spec differs from OneUIColourTool's
  `differentAppearance` parameter — Studio resets the inner anchor to
  root rather than threading a flag through `resolveSurface`. Same
  visible outcome for bold-on-bold; simpler call site.

---

## B. Dark default step reconciliation — **LANDED 2026-05-07**

- **Source**: `03-design-deltas.md` Delta 1.
- **Spec confirmed**: Dark-mode default surface anchors at step `200`
  (matches OneUIColourTool reference). Was `100`.
- **Implementation**: `resolveSurface('default', _, _, _, true)` and
  `Surface.tsx`'s `ROOT_STEP_DARK` both updated. Engine's root-content
  emission already used `200`; this aligns the surface step with it.
  Test fixtures updated; `clampStep` now floors at the palette range
  (100–2500) instead of the root anchor.

---

## C. Decommission legacy `[data-surface="<mode>"]` role-token blocks

- **Source**: `01-pending-work.md` § 6 + RFC § 7 step 7
  (originally completion-plan Phase 4).
- **Status today**: Engine emits role/content/state tokens in BOTH
  the per-mode `[data-surface="<mode>"]` blocks AND the per-step
  `[data-surface-step="N"]` blocks. The step blocks win at depth ≥ 2
  via source order, so behaviour is correct, but the per-mode emission
  is now dead weight. Halo-gap and focus-outline still need per-mode
  emission and would stay.
- **Why deferred**: Team needs to confirm no consumer is relying on
  the per-mode role-token emission. Behaviour-equivalent transition
  but invasive.
- **What landing it would buy**: **~10 KB per theme reduction in
  brand-CSS size**. Currently the role-token tables are duplicated
  (5 mode blocks × 11 roles × 30 declarations ≈ 1,650 declarations
  duplicating what the step blocks already emit). This is the single
  largest CSS-size win on the table.
- **Pickup trigger**: CSS budget pressure (currently ~50KB soft
  limit; we sit comfortably below) OR confirmation that no component
  CSS module reads role tokens from the per-mode blocks.

---

## D. Per-appearance Surface fills

- **Source**: `01-pending-work.md` § 2 (originally completion-plan
  Phase 3).
## D. Per-appearance content tokens — **LANDED 2026-05-07**

- **Status today**: Engine emits `[data-appearance="<role>"]` redirect
  blocks at root scope, once per non-primary role. Each block remaps
  `--Text-*` aliases to the role's per-step content tokens:
  ```css
  [data-appearance="secondary"] {
    --Text-High: var(--Secondary-High);
    --Text-Medium: var(--Secondary-Medium-Text);
    --Text-Low: var(--Secondary-Low);
    --Text-Medium-Stroke: var(--Secondary-Stroke-Medium);
    --Text-Low-Stroke: var(--Secondary-Stroke-Low);
    --Text-OnBold-High: var(--Secondary-Bold-High);
  }
  ```
  Theme-independent, ~3 KB total for the full role set. Since
  `--{Role}-*` is already emitted per step, descendants reading
  `--Text-High` inside an `appearance="secondary"` Surface get
  secondary's content at the active step — depth-N safe.
- **Companion change**: `<Surface>` default `appearance` switched from
  `'primary'` to `'auto'`. Implicit nested Surfaces now inherit parent's
  effective role. Root-level fallback is still `'primary'` (no parent).
- **Companion change**: `[data-surface="ghost"]` now reads
  `--Surface-Self-Color` instead of being hard-coded transparent. Ghost
  with same effective role as parent → matches parent (looks
  transparent). Ghost with different appearance → paints that role's
  colour at the parent step.
- **Residual**: branded role-explicit tokens (`--Primary-Tinted`,
  `--Secondary-TintedA11y`) intentionally don't redirect — those are
  role-explicit by design.

---

## E. Component CSS sweep

- **Source**: `01-pending-work.md` § 6 (originally completion-plan
  Phase 5).
- **Status today**: Component modules like `Input.module.css:482+`
  use `[data-surface]:not([data-surface="default"])` selectors for
  visual decisions. They work, but they're "any non-default mode" —
  step-conditional information would be more accurate (the
  step-cascade now provides it).
- **Why deferred**: Behaviour is correct today; the rules are stable.
  Mechanical sweep across many components — risk vs. reward.
- **What landing it would buy**: Removes `[data-surface]` selectors
  that are no longer load-bearing — those that exist purely to
  hand-roll role-token remapping. Cleanup; not a behaviour change.
  Necessary precursor to Item C (decommission legacy mode blocks).
- **Pickup trigger**: Item C gets scheduled, OR a maintainer is
  refactoring an affected component for unrelated reasons (do it
  while you're in there).

---

## F. Validator hardening

- **Source**: `01-pending-work.md` § 7 (originally completion-plan
  Phase 6).
- **Status today**: `validateBrandCSS` and
  `validateSurfaceContextCSS` pass, but don't enforce the new
  RFC-0003 invariants — no assertion that
  `[data-surface-step="N"]` blocks exist for every step, no
  assertion that they don't leak `--Surface-Fill-*`, no detection
  of orphaned `[data-surface=]` rules in component modules.
- **Why deferred**: Today the data-surface selectors still exist
  legitimately; the assertion would have to discriminate between
  "valid mode-conditional rule" and "orphaned token-remap rule." Not
  cheap to encode without a manual audit pass first.
- **What landing it would buy**: CI-level catch for regressions when
  someone adds a new role / removes a step / authors a brand with
  malformed config. Catches the next foot-gun before it ships.
- **Pickup trigger**: Item C lands (orphaned rules become
  unambiguous), OR a brand-config bug ships to production
  (post-mortem fix).

---

## G. `--parent-step` calc cascade for non-React consumers

- **Source**: RFC § 3 ("optional decorative cascade") +
  `04-buildtime-alternative.md` § 4.1.
- **Status today**: Not emitted. Raw markup like
  `<div data-surface="minimal">` outside React gets no step
  adaptation — `data-surface-step` is never written.
- **Why deferred**: No consumer. Bold can't be expressed in pure CSS,
  so the cascade gives only partial adaptation, and we'd be shipping
  a half-fix that designers might mistake for the full solution.
- **What landing it would buy**: Approximate adaptation for
  non-React HTML consumers (static pages, email templates, MJML).
  Six lines of CSS, ~200 bytes per stylesheet.
- **Pickup trigger**: A specific non-React consumer asks for
  step-aware surfaces. Could ride along with Item H (build script).

---

## H. Static brand CSS export + `loadBrandCSS` helper

- **Source**: `01-pending-work.md` § 8 (originally completion-plan
  Phase 8) + RFC § 6.
- **Status today**: `@oneui/ui` ships components but no per-brand
  stylesheet. Consumers must connect to Convex and run `useBrandCSS`
  at runtime, OR roll their own static CSS pipeline.
- **Why deferred**: Studio (the runtime consumer) is the only
  consumer right now. Library distribution path isn't an immediate
  ship.
- **What landing it would buy**: `pnpm export:brand-css` produces
  one stylesheet per brand. Library consumers import a `<link>` and
  ditch the Convex dependency. Mirrors layers v4's
  `dist/themes/<brand>.css` model.
- **Pickup trigger**: First external consumer of `@oneui/ui` who
  doesn't want a Convex deployment.

---

## I. ReactNative parity

- **Source**: `01-pending-work.md` § 10 (originally completion-plan
  Phase 10) + `04-buildtime-alternative.md` § 4.3.
- **Status today**: Native `Surface` doesn't have a step cascade.
  Tokens come from a static JS object, not a step-keyed lookup.
  Depth-N issues at native parity haven't been characterised.
- **Why deferred**: Native isn't the immediate target. The
  structural model is known (JS context + per-step lookup table from
  `buildNativeStepLookup`); the engineering work is real but
  contained.
- **What landing it would buy**: Native ↔ web parity for surface
  context. `pnpm check:parity` clean. Depth-N safe surface adaptation
  in RN apps.
- **Pickup trigger**: A native app surfaces a depth-N nesting bug,
  OR `pnpm check:parity` is added to the CI gate.

---

## J. Cold-pipeline perf optimization (post-Phase-9 finding)

- **Source**: Phase 9 perf re-bless (2026-05-07). Cold pipeline
  measured at ~28ms p50; new step lookup is 22.7ms of that.
- **Status today**: baseline re-blessed at the new number. No CI
  regression gate fails. Brand switches are ~30ms slower than
  pre-RFC-0003 but still hidden by the existing transition
  suppression.
- **Why deferred**: Cold cost only hits on brand-load / brand-switch /
  theme-toggle. Warm path (memo 2 cache hit) is unchanged. Real-user
  impact is small.
- **What landing it would buy**: Faster brand switching in
  Storybook authoring + platform Studio. Cold path back under 10ms.
- **Three independent optimizations**, each can land separately:
  1. Prune `getOccupiedSteps()` to a depth-bounded reachable subset.
     Realistic ~50% saving.
  2. Memoize `resolveTokenSet(scale, step, darkMode)` keyed on scale
     identity inside the engine. Wins when roles share scales
     (uncommon today, expected with sub-brands).
  3. Skip onBold / onSubtle content resolution per block when the
     role doesn't surface those tokens — each `resolveTokenSet` runs
     ~34 token resolutions today; not all are emitted.
- **Pickup trigger**: Brand-switch latency surfaces as a designer
  complaint, OR Storybook authoring becomes painful.

---

## Summary

| ID | Item | Effort | Buys you |
| --- | --- | --- | --- |
| ~~A~~ | ~~Cross-role bold~~ | LANDED 2026-05-07 | Inner bold of differing appearance anchors to root |
| ~~B~~ | ~~Dark default reconciliation~~ | LANDED 2026-05-07 | Dark anchor 200; bit-for-bit reference alignment |
| C | Decommission legacy mode blocks | Medium (sequenced after E) | **~10 KB / theme CSS reduction** |
| ~~D~~ | ~~Per-appearance content tokens~~ | LANDED 2026-05-07 | `--Text-*` aliases redirect per `data-appearance`; ghost paints role colour |
| E | Component CSS sweep | Medium (many files) | Removes dead selectors; precursor to C |
| F | Validator hardening | Small | CI catches future regressions |
| G | Calc cascade for non-React | Trivial (six rules) | Approximate adaptation outside React |
| H | Static brand CSS export | Medium | Library distribution without Convex |
| I | RN parity | Large | Surface context across platforms |
| J | Cold-pipeline perf | Medium | Brand-switch latency back under 10ms |

**Biggest single architectural win**: Item C. **Cheapest item**: B
(one constant change). **Most-customer-facing**: H. Everything else is
incremental polish.

## How to revive an item

1. Confirm the pickup trigger has fired.
2. Re-scope as a focused RFC-0003-followup (or a new RFC if shape has
   changed).
3. Move the item from this register to `02-completion-plan.md` with
   updated scope.
4. Land it.
5. Mark closed here with a link to the merge commit.

## References

- `README.md` — original RFC.
- `01-pending-work.md` — full enumeration of every open item before
  scope-down.
- `02-completion-plan.md` — what's actually being built right now.
- `03-design-deltas.md` — the two reference-vs-Studio deltas
  (deferred as items A and B above).
- `04-buildtime-alternative.md` — context for items G (calc cascade)
  and I (RN parity).
