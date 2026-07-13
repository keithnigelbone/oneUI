# RFC-0004 — Fill-bearing container components establish their own surface context

> **Status:** Draft / Deferred — to be re-evaluated when nested fill-on-fill cases become a documented frequency, not a one-off edge case.
> **Owner:** TBD
> **Depends on:** RFC-0003 (step-keyed surface cascade) — already landed in `feat/arbitrary-nesting`.
> **Replaces (potentially):** the `surfaceShield` escape hatch in `Badge.module.css`.

## 1. Problem

RFC-0003 unlocked arbitrary depth for `<Surface>` boundaries. Token resolution at any depth is now correct, because each `<Surface>` writes its own `data-surface-step="N"` and children resolve against it.

A separate seam remains: **fill-bearing components that are *not* `<Surface>` instances inherit their parent's surface context but paint their own visual fill.** A nested fill-bearer (badge inside badge, accordion inside accordion using the same surface mode, card inside card with same mode) reads the same `[data-surface-step]` cascade block as its parent and therefore the same role tokens — yielding an identical colour and an indistinguishable visual stack.

Concrete instances:

- **Badge slot** with `CounterBadge`/`IndicatorBadge` rendered inside a `bold` or `subtle` parent badge. Inner pip uses `--Primary-Bold` resolved at the outer surface's step → collapses into the parent fill. Today this is patched by a `surfaceShield` class that re-anchors role tokens to root-only `--{Role}-Fill-*` values, detaching the inner pip from the cascade entirely.
- **Accordion containing Accordion** where both levels use the same surface mode (e.g. both `subtle`). The inner Accordion's content area reads tokens at the same parent step, producing the same tint as the outer.
- **Card containing Card** or **Drawer body holding a nested fill-bearing panel** — same pattern.

The current workarounds are:

1. **Consumer wraps the inner level in `<Surface>` manually.** Correct but easy to forget. Burdens the API.
2. **`surfaceShield` class on the inner component.** Detaches from cascade, reads root-anchored fills. Works for tiny decorative pips. *Conceptually weird* — the inner element loses context-awareness entirely and may visually collide with the immediate parent at certain steps.

Neither workaround scales. We want a clean, automatic rule.

## 2. Proposal

> **Fill-bearing container components that hold compositional children must internalize a surface-step boundary on their own root element.** They write `data-surface-step="N"` for the step their fill resolves at, and provide that step via React context to descendants. No extra DOM element, no separate `<Surface>` wrapper.

This makes the component's own fill act as the new surface context for its children. Inner fill-bearers naturally read tokens at a shifted step → distinct colour. Arbitrary depth nests correctly because each level establishes its own context the same way `<Surface>` does.

### Implementation sketch

```tsx
function AccordionItem({ children, surfaceMode = 'ghost', appearance = 'primary' }) {
  const parentStep = useParentSurfaceStep();
  const ownStep = useMemo(
    () => resolveSurface({ mode: surfaceMode, appearance, parentStep }),
    [surfaceMode, appearance, parentStep],
  );

  // Short-circuit when the component's mode does not shift the cascade
  // (ghost = same step, default = root reset only at top level).
  const provided = surfaceMode === 'ghost' ? parentStep : ownStep;

  return (
    <SurfaceStepContext.Provider value={provided}>
      <div
        className={styles.item}
        data-surface-step={provided}
        data-appearance={appearance}
      >
        {/* component's own subtree */}
      </div>
    </SurfaceStepContext.Provider>
  );
}
```

Key properties:
- **Zero extra DOM.** The component's existing root element carries the attribute.
- **Cost is opt-in.** Components with `surfaceMode='ghost'` (the default for components that don't paint a fill) short-circuit and pay no cascade cost.
- **Identical primitive to `<Surface>`.** Same `data-surface-step` attribute + `SurfaceStepContext` provider that `<Surface>` uses internally. No new mechanism.

## 3. Component classification

| Class | Establishes surface context? | Examples |
| :--- | :--- | :--- |
| Pure layout | No. Pure passthrough. | Stack, Grid, Flex, VisuallyHidden |
| Leaf with fill | No. Inherits, reads role pair. | Button, Chip, Tag, Pill |
| Compositional container with optional/conditional fill | **Yes**, when fill is active. | Card (with `surfaceMode` prop), Tabs panel, ListItem |
| Compositional container with required fill | **Yes**, always. | Accordion item (when expanded), Drawer body, Modal body, Popover content |
| Tiny decorative brand-anchored slot | Special case — see § 7. | Badge counter/indicator |

## 4. Migration scope

Components to retrofit, with estimated impact:

| Component | Why it qualifies | Risk |
| :--- | :--- | :--- |
| Accordion (item content area) | Holds compositional children, painted fill when expanded | Low |
| Card (when `surfaceMode` non-ghost) | Common pattern | Low |
| Drawer (body) | Holds full content area | Low |
| Modal / Dialog (body) | Holds full content area | Low |
| Popover (content) | Often dark/tinted | Low |
| Tabs (panel body) | Holds compositional children | Low |
| Alert (when rich content allowed) | Tinted fill | Medium — verify Alert's content slot is intended to compose |
| Tooltip body | Tinted fill, usually no nesting | Skip unless concrete case appears |
| Badge slot | Discussed § 7 | High — needs design review |

Roughly 6–8 components in scope. Each is a single internal `<div>` → adds `data-surface-step` attribute + `SurfaceStepContext.Provider`. No public API change.

## 5. Performance budget

From the per-instance benchmark in conversation prep:

| Operation | Cost |
| :--- | :--- |
| `useContext` read | ~50 ns |
| `useMemo` first run | ~500 ns – 1 µs |
| `resolveSurface` switch + math | ~200 ns |
| `<Provider>` reconciliation | ~200 ns |
| **Per instance, mount** | **~1.5–2 µs** |
| **Per instance, stable re-render** | **~200 ns** |

At expected counts (10–50 compositional containers per page), aggregate mount overhead lands in the **20–100 µs range** — three orders of magnitude below a frame. Concern only at virtualized lists of 10 000+ items, which is outside the target scope (these are leaves like Buttons/ListItems, not compositional containers).

Decision: **acceptable as-is**, no further perf gating required for the components in § 4. If a list-of-Cards rendering 10 000 entries appears in profiling, that specific component can revert to ghost-only behaviour or accept a flag to skip cascade establishment.

## 6. Trial plan

1. **Pick the most painful case first.** Likely Accordion-in-Accordion at depth 2, since it's the cleanest "same-mode same-context" repro and is on the design-team roadmap.
2. **Prototype on `feat/rfc-0004-accordion` branch.** Internalize the boundary on `<AccordionItem>` content area. Add a Storybook story `Accordion → Nested same-mode (RFC-0004)` showing depth-2 and depth-3.
3. **Visual regression vs `feat/arbitrary-nesting` baseline.** Confirm:
   - Single-level Accordion renders identically (no regression).
   - Nested same-mode Accordion now has visually distinct levels (the bug is fixed).
4. **Benchmark the page.** Run the existing perf harness (`pnpm bench:pipeline`) and a flame-graph capture on a page with 50 Accordions. Confirm mount overhead matches the § 5 estimate.
5. **If green:** roll to the next 1–2 components (Card, Drawer). Land each in its own PR for atomic review.
6. **Spread to remaining compositional containers** once the pattern is proven across three components.

## 7. Open question — does this replace `surfaceShield`?

Probably yes, but **needs design verification**.

`surfaceShield` was created with a specific design intent in the Badge case:

> *"CounterBadge and IndicatorBadge carry their own role colours (e.g. negative = red) and must stay visually distinct on bold / subtle Badges."*

The shield achieves this by reading root-anchored `--{Role}-Fill-Bold` etc. — the brand's canonical accent colour, regardless of context. So a negative indicator always looks like "the brand's canonical red."

With the RFC-0004 approach instead:
- Badge would establish a new surface context on its slot area.
- CounterBadge inside reads `--{Role}-Bold` resolved at Badge's own step (not root, not outer).
- The colour would still be brand-correct (driven by the role) but **context-adapted** to where Badge sits.

The result is functionally similar — inner pip is still distinct from outer fill — but the exact shade differs:
- `surfaceShield` → always the canonical brand red.
- RFC-0004 → brand red shifted by however many steps the Badge's fill shifted from root.

Which is correct depends on design intent:
- *"Decorative pips should always look like the brand's canonical accent."* → keep `surfaceShield`.
- *"Pips should adapt to nesting depth like everything else."* → RFC-0004 replaces it cleanly.

**Action required:** before removing `surfaceShield`, run a Storybook comparison page side-by-side (canonical vs context-adapted) and get a design call. If design picks context-adapted, `surfaceShield` and its associated `.start`/`.end` slot-shielding CSS can be deleted as part of the Badge migration. If design picks canonical, keep `surfaceShield` localized to Badge slots and rename it (`surfaceDetach` / `brandAnchor`) so its semantics are explicit.

## 8. Trade-offs

### Pros
- Solves nested-fill-on-fill at arbitrary depth, mirroring how RFC-0003 solved nested `<Surface>`.
- Eliminates a class of bugs that consumers currently work around manually.
- Likely retires `surfaceShield` (pending § 7 design call) — fewer escape hatches in the system.
- Sets a clear, narrow rule for component authors: *"if your component paints a fill and holds compositional children, internalize the boundary."*
- Uses existing primitives (`data-surface-step` attribute + `SurfaceStepContext`). No new abstractions.

### Cons
- Touches 6–8 components. Each is small, but the surface area means non-zero migration cost.
- Adds one `useContext` + one `useMemo` per affected component instance. Sub-microsecond cost, not measurable in typical UI.
- Risk of subtle visual regressions in existing single-level uses of the touched components if the resolved step doesn't match what the prior implementation rendered. Mitigated by visual regression tests before each PR lands.
- The `surfaceShield` design intent question (§ 7) is unresolved until design weighs in.

## 9. Decision criteria — when to actually pull the trigger

Re-open this RFC when **any** of the following becomes true:

1. A real product surface reports a depth-2+ same-mode fill collision (Accordion-in-Accordion, Card-in-Card) that consumers can't or won't manually wrap.
2. A new compositional container ships that has the issue in its core use case.
3. `surfaceShield` proliferates beyond Badge — i.e. someone reaches for it on a non-decorative component because they don't know about manual `<Surface>` wrapping.
4. Design asks for context-adapted pips (would settle § 7 in favour of RFC-0004 replacing the shield).

Until then: document the manual `<Surface>` wrap pattern in `docs/surface-context-awareness.md` as the consumer workaround, ship the matching Storybook story showing how to apply it, and leave the auto-internalization unimplemented. The cost of building it now exceeds the documented pain.

## 10. References

- **RFC-0003** (`docs/rfcs/0003-surface-step-cascade/`) — the step-keyed cascade this RFC builds on.
- **`packages/ui/src/components/Surface/Surface.tsx:226`** — reference implementation of `data-surface-step` attribute write + context provider. The pattern to internalize.
- **`packages/ui/src/components/Badge/Badge.module.css:446`** — `surfaceShield` class. Candidate for removal pending § 7.
- **`packages/shared/src/engine/surfaceNew.ts:resolveSurface`** — the step-resolution function components would call.
- **Conversation history** — surface-nesting analysis chain that produced this RFC. Specifically: the Accordion depth-3 question, the `surfaceShield` semantics deep-dive, the per-instance perf estimate that led to the trial plan in § 6.
