# Surface Decision Procedure & Validation

The rigorous version of the quick decision in SKILL.md. Use this when you want to be thorough, or when auditing a screen someone else built.

## Per-region decision

Run this for every distinct region as you lay out a screen — page, section, card, row, banner, control group.

1. **Assume default.** Standard content (text, lists, forms, data, normal cards) stays on the default neutral surface. Most regions end here.

2. **Demand a purpose.** To leave default, state the reason in one concrete phrase. Valid reasons fall into exactly these buckets:
   - **Guidance** — toast, alert, onboarding callout, empty-state guidance, important next-step prompt, critical journey state.
   - **Promotion** — marketing card, campaign banner, offer card, rewards moment, celebration.
   - **Interaction** — a region that is genuinely clickable/selectable and needs affordance.
   - **Local separation** — two adjacent areas that truly need distinction and that spacing/type couldn't separate.
   - **Elevation** — the element floats above the page (overlay, sheet, menu, popover).

   If you can't name the bucket, the surface is decoration. Return to default.

3. **Try cheaper hierarchy first.** Before committing a surface, ask whether **spacing, grouping, type scale, weight, or position** would create the needed structure. Surfaces are not the first hierarchy tool — they're for when meaning (promo/alert/elevation) is involved or when layout genuinely isn't enough.

4. **Map purpose → level** (see SKILL.md table for the full mapping):
   - separation → `minimal` / `subtle` / `moderate`, **component-level only**
   - alert / high guidance / promo banner → `bold`
   - marketing / campaign / celebration → `brand-bg` or `sparkle`
   - floats above page → `elevated`

5. **Attention-budget check.** Will this surface compete with the primary action or with another attention surface already on the screen? A screen should have **one clear focal point**. If you're adding a second loud thing, demote one.

6. **Scope check.** Is this screen-level or component-level? Non-default surfaces are component-level by default. Screen-level color is reserved for: campaign landing, full-screen celebration, onboarding, strong empty-states, and brand-storytelling pages. Standard app screens stay default.

7. **Nesting check.** Avoid more than ~2 visible nested surface levels (e.g. page-default → card → one small nested surface). Deeper nesting reads as clutter even though the engine resolves it correctly.

When any step is unclear: **default.**

## When NOT to use a non-default surface

Stop yourself if the surface:
- has no nameable purpose, or exists "to make it look designed"
- only adds color the layout already communicates through spacing/type/imagery
- makes the page feel more complex
- competes with the primary action
- creates a second simultaneous attention point
- tints text or strokes with no semantic/contextual reason
- turns the screen into a patchwork of cards

## Pre-ship validation checklist

Before considering a screen done, verify:

- [ ] The screen starts from a default neutral surface; the page background is **not** tinted.
- [ ] Every non-default surface has a one-phrase purpose (guidance/promotion/interaction/separation/elevation).
- [ ] `minimal` / `subtle` / `moderate` appear only at component level, never page/large-section.
- [ ] `bold` is used only for genuine high-attention moments, and there's at most one focal point.
- [ ] `brand-bg` / `sparkle` appear only on marketing/promo/celebration, never standard product UI.
- [ ] `primary` is used for actions/navigation; `secondary` only for non-interactive support.
- [ ] Text is neutral except links, action labels, nav states, semantic states, or on-color foreground.
- [ ] Strokes are neutral except semantic/focus/selected states or where a component spec requires.
- [ ] Buttons follow the button component's hierarchy — not a surface appearance pretending to be a button level.
- [ ] Interactive surfaces have a real, clear interaction model (and no ambiguous nested click targets).
- [ ] Dark mode uses neutral surfaces — no tinted/branded dark backgrounds.
- [ ] Nested surfaces are limited (~2 visible levels).
- [ ] No hardcoded `background:` colors — every surface is a `<Surface mode>` (or `data-surface`) so adaptation works.
- [ ] The screen has one clear attention path and reads as calm and structured.

## Quick mental model

> **Calm by default. Loud on purpose. Color is automatic — meaning is your job.**
