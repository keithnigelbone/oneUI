---
name: surface
version: 1.0.1
description: "Decide WHEN, WHICH, and WHY to use a surface in OneUI — the focused design-judgment layer for surface, background, and attention-level choice. A surface is a choice about meaning and attention, not color: you pick a level (default/minimal/subtle/moderate/bold/elevated/brand-bg/sparkle) and the engine computes every fill, text, stroke, contrast, and state automatically. Use this skill specifically when choosing a section/card/hero/banner/toast background or attention level, when placing components on colored/dark/brand areas, when someone asks 'what surface should I use', 'should this be bold/tinted/branded', 'why does this screen feel busy/loud', or wants a screen to feel calm and uncluttered, and when reviewing or repairing surface misuse (tinted default backgrounds, too many colored cards, competing bold areas, decorative color, tinted dark mode, hardcoded backgrounds). Reach for it even when the user doesn't say 'surface' — any time a UI background, emphasis, or visual-hierarchy decision is in play, surface choice is the question. SCOPE BOUNDARY: this skill owns surface-level choice only. For overall page composition — layout, grid, navigation/app structure, typography, color roles, component selection, spacing — use the `oneui-design-composition` skill (it hands surface decisions back to this one). For the underlying [data-surface] token-remapping mechanism, building surface-aware components, or debugging adaptation, use the `surface-context` skill."
---

# Surface Usage — Choosing Surfaces with Intent

## The one idea that drives everything

**A surface is a decision about meaning and attention — not about color.**

You never pick a hex, compute a contrast, or invert text for dark mode. You pick a *level* (`<Surface mode="bold">`), and the OneUI engine automatically resolves the fill, the text color, the stroke, the hover/pressed states, and the WCAG-safe contrast — all relative to whatever surface sits behind it. A button on a white page gets dark text; the same button on a bold purple surface gets white text, with zero extra code. (How that automation works is the `surface-context` skill's job; *that it works* is why this skill can focus purely on judgment.)

Because the colors are automatic and always safe, the only thing that can go wrong is **using the wrong level, or using a non-default surface when none was needed.** That is what this skill protects against.

So every surface decision reduces to two questions:

1. **Does this area deserve a non-default surface at all?** (Usually: no.)
2. **If yes, which level carries exactly the right amount of attention — no more?**

## The default is default

> Start every screen on the **default neutral surface**. Introduce another surface only when it has a clear purpose: guidance, promotion, alerting, interaction, or elevation.

This is not a stylistic preference — it's how the system stays legible. Attention is a budget. If many areas shout, the user can't tell where to look, and the screen feels busy and untrustworthy. **When everything is highlighted, nothing is.** Most real product screens — finance, account, settings, forms, lists, dashboards — are almost entirely default, and get their hierarchy from *spacing, type scale, weight, and a single primary action*, not from tinted boxes.

Before reaching for any surface, try to solve the hierarchy with **layout, spacing, and typography first.** A surface is the right tool only when those genuinely aren't enough, or when the *meaning* (promotion, alert, elevation) calls for it.

## The surface levels, by attention

Listed from calmest to loudest. The numeric tints (minimal→moderate) are **component-level only** — never page or large-section backgrounds. Detailed per-level rules and the exact step math live in `references/surface-levels.md`; read it when you need to justify a borderline call.

| Level | Attention | Use it for | Hard limits |
|-------|-----------|------------|-------------|
| **default** | base / calm | Page backgrounds, standard sections, normal cards, lists, forms, most product UI | Never tint it. Neutral, always. |
| **minimal** | very low | Tiny nested separation inside a component | Rare. Never at screen/section level. |
| **subtle** | low | Gentle distinction between two local areas, secondary nested containers | Rare. Component-level only. |
| **moderate** | medium | A component state or small block that needs more visibility | Rare. Not a page or large-area background. |
| **bold** | high | Alerts, toasts, important guidance, promotional banners, marketing cards, critical journey moments | Rare. Not a default way to make UI "look designed." Avoid competing bolds on one screen. |
| **elevated** | spatial | Overlays, sheets, dialogs, menus, popovers, floating cards — things that sit *above* the page | Communicates layering, not decoration. |
| **brand-bg** | brand | Marketing/promo/campaign/celebration cards only | Very rare. Never for standard product UI, forms, finance, or page backgrounds. |

`ghost` exists too: same step as its parent but still inside the surface cascade — use it when a region needs to participate in context (so its children adapt) without changing color.

**Appearance roles** ride on top of levels and carry *semantic* color: `primary` (actions/navigation), `secondary` (non-interactive support), `neutral` (achromatic), `sparkle` (celebration/reward/delight), `brand-bg`, and the semantic states `positive` / `negative` / `warning` / `informative`. A role never substitutes for a button's own hierarchy — see "Things people get wrong" below.

## The decision, in practice

For each region you're about to build, walk this quickly. The full version with the validation checklist is in `references/decision-tree.md`.

1. **Default first.** Is this standard content? → keep default. Stop.
2. **Name the purpose.** If you want a non-default surface, say *why* in one phrase: "promo card," "error toast," "floating menu," "onboarding callout." No clear phrase → it's decoration → keep default.
3. **Could layout/spacing/type solve it instead?** If yes, do that. Surfaces are not the first hierarchy tool.
4. **Match purpose to level:**
   - Standard separation that type/spacing couldn't fix → `minimal`/`subtle`/`moderate`, *component-level only*.
   - Alert / high-attention guidance / promo banner → `bold`.
   - Marketing / campaign / celebration → `brand-bg` or `sparkle`.
   - Floats above the page → `elevated`.
5. **Will it compete with the primary action or another attention surface?** If yes, pull back — one clear focal point per screen.
6. **Scope check.** Non-default surfaces are component-level by default. Screen-level color is reserved for campaign/onboarding/celebration/empty-state/brand-storytelling screens.

When the answer is ever unclear: **use default.**

## Let the system do the color — your job is the level

Because adaptation is automatic, the correct way to place anything on a non-default area is to wrap it in `<Surface mode="...">` (or set `data-surface`) and let children read generic role tokens. You do **not** style around it.

```tsx
// CORRECT — pick the level; the engine computes fill, text, stroke, contrast, states.
<Surface mode="bold">
  <Heading>Limited-time offer</Heading>   {/* text auto-flips to readable */}
  <Button variant="bold">Claim</Button>    {/* fill stays distinguishable */}
</Surface>

// WRONG — a raw background bypasses the cascade. Nothing adapts; text breaks; it's hardcoded.
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button variant="ghost">Dark text on dark = broken</Button>
</div>
```

Three things travel together whenever you put content on a tinted/colored/dark area: (1) use `<Surface mode>`, not a styled `<div>`; (2) don't add a decorative border — the fill already is the boundary; (3) reference generic role tokens (`--Text-High`, `--Primary-TintedA11y`), never surface-specific hardcoded aliases. Detail and the role-override pattern: `references/surface-levels.md`.

## Text, strokes, and dark mode stay neutral

The system *can* tint these, but restraint is the rule:

- **Text** is neutral by default. Tint it only when it's a link, an action label, a navigation state, a semantic state (success/warning/error/info), or context-aware foreground required on a color surface. Never tint headings or body for decoration. Hierarchy comes from size/weight/spacing, not color.
- **Strokes** are neutral and context-aware. Tint only for a semantic state, a focus/selected state, or when the component spec requires it. No decorative colored borders.
- **Dark mode** defaults to neutral surfaces. Never build tinted dark backgrounds, brand-colored dark pages, or over-saturated dark surfaces. Dark mode should feel calm and legible, not branded.

## Things people get wrong (flag and fix these)

When generating or reviewing UI, watch for these — they're the common failure modes:

- A **tinted default/page background**. Defaults are neutral. Always.
- **Too many colored cards** / a screen that's a patchwork — collapse back to default, rebuild hierarchy with layout.
- **Multiple bold (or attention) surfaces competing** on one screen — keep one focal point.
- **brand-bg or sparkle on standard product UI** (forms, finance, account, normal lists). Those are for marketing/celebration only.
- **Tinted text or strokes with no semantic/contextual reason.**
- **Secondary appearance used as a "secondary button."** Button hierarchy is the button component's job; don't express it by tinting a surface. (A secondary *action* may still render as the primary appearance per the button spec.)
- **A card made interactive with no real interaction model**, or a clickable-looking surface that does nothing, or unclear nested click targets when a button already lives inside.
- **Hardcoded colors / raw `background:` divs** instead of `<Surface>` + tokens — this silently breaks adaptation.
- **Tinted dark mode.**

Each of these has a worked before/after in `references/patterns.md`.

## Reference material

Read these as needed — don't load them all up front:

- `references/surface-levels.md` — Per-level deep rules, the exact step-offset math the engine uses (minimal +100 … bold = brand base step), role overrides, and the "let the system compute it" mechanics. Read when justifying a borderline level choice or wiring a role into a surface.
- `references/decision-tree.md` — The full step-by-step decision procedure, the "when to use / when not to use" lists, and the pre-ship validation checklist. Read when you want to be rigorous or audit a screen.
- `references/patterns.md` — Surface playbook per UI pattern (page, card, toast, banner, list, navigation, finance, game, creative, wallet) with worked before/after examples. Read when building or fixing a specific screen type.
- `assets/surface-taxonomy.json` — Machine-readable level taxonomy (attention, allowed levels, use-for, avoid-for, rarity) for programmatic checks.

## The final rule

When in doubt, use the default neutral surface. A surface succeeds when it makes the UI *easier to understand*. If it only makes the UI more colorful, it shouldn't be there.
