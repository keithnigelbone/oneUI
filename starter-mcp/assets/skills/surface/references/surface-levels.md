# Surface Levels — Deep Rules & The Automation Underneath

This file backs the summary table in SKILL.md. It has two parts: (1) the per-level *judgment* rules, and (2) the *mechanism* — the real step math the engine runs so you can trust that picking a level is enough. The mechanism is grounded in `OneUIColourTool7/packages/core/src/surfaceLogic.ts` and the monorepo's `packages/shared/src/engine/surfaceNew.ts`.

---

## Part 1 — Per-level rules

### default — the base of almost everything
The neutral page surface. Resolves to the lightest step in light mode and a near-darkest step in dark mode, **ignoring its parent** — it's the anchor, not a relative offset. Use for page backgrounds, standard sections, normal cards, lists, forms, content areas, and essentially all utility/finance/account/profile/settings UI. **Never tint it.** Attention on a default screen comes from content hierarchy, spacing, type, and the primary action.

### minimal — barely-there local separation
One step of contrast from the parent. So quiet it's almost invisible. Only for a tiny nested area inside a component that needs a whisper of separation. **Never at screen or large-section level.** Should be genuinely rare — if you can't tell it's there, you probably didn't need it.

### subtle — gentle local distinction
Two steps from parent. A soft grouping for a secondary container nested inside a larger section, or low-priority supporting content. Still low attention, still **component-level only**, still rare. Not for main page sections.

### moderate — contained, noticeable emphasis
Three steps from parent. The point where a local area becomes clearly distinct — a component state that needs visibility, a guided step inside a flow, a small info block where `bold` would be too loud. **Not** a page or large-area background. Rare.

### bold — high attention, used sparingly
Jumps to the brand's base color step (a large, deliberate contrast jump — see Part 2). This is the loud one: alerts, toasts, important guidance, promotional banners, marketing cards, critical journey moments. Bold can appear a bit more often than the numeric tints, but it must still be **rare** and must never become the default way to make UI "look designed." **One bold focal point per screen** — competing bolds cancel each other out.

### elevated — spatial layering
Always one step *lighter* than its parent (capped at the top of the scale), regardless of contrast direction — that consistent lift is what reads as "floating above." For overlays, sheets, dialogs, menus, popovers, and floating cards. It communicates *layer*, not importance. Don't elevate static content just to make it feel weightier.

### brand-bg — marketing only
A pinned brand background color. Reserve entirely for marketing cards, promo cards, campaign moments, celebration, and brand storytelling. **Never** for standard product UI, account/finance screens, forms, normal list items, or page backgrounds. It must never replace the product's default surface.

### sparkle — celebration & delight
A role (not a numeric level) for promotion, celebration, rewards, campaigns, and special highlights. Not for normal product UI. Like brand-bg, it's a *moment*, not a baseline.

### ghost — participate without changing color
Same step as the parent, but still emits a surface context so children adapt. Use when a region must be part of the surface cascade (so nested components resolve correctly) without visually changing the background.

---

## Part 2 — The mechanism: why picking a level is enough

The engine works on a **25-step color scale** (steps 100–2500). Every surface resolves **relative to its parent's step** — there is no precomputed matrix, no BG/FG split, no manual dark-mode branch. This is the whole reason you only choose a level.

### Contrast direction (`dir`)
Computed **once at the parent step** by comparing WCAG contrast of the scale's extremes (2500 vs 200) against the parent color. `dir = +1` offsets toward lighter; `dir = -1` toward darker — whichever maximizes contrast. The parent's `dir` is then reused for all its children. This is what makes adaptation automatic across light/dark and across nesting.

### Surface offsets (from `resolveSurface`)
| Level | Resolved step |
|-------|---------------|
| default | 2500 (light) / 200 (dark) — ignores parent |
| ghost / blend | parent step (unchanged) |
| minimal | parent + dir × 100 |
| subtle | parent + dir × 200 |
| moderate | parent + dir × 300 |
| elevated | min(parent + 100, 2500) — always lighter |
| bold | brand `base` step if parent ≥ 1300, else `darkerBase`. If that candidate is < 7 steps from the parent, fall back to parent − 700 (or parent + 700 if that would drop below 500). Clamped 100–2500. |

That bold rule is why bold "just works" whether it sits on a light page or already-dark area: it targets the brand color, but guarantees a minimum visual jump so the bold area never blends into its parent.

### Content tokens (from `resolveContent`) — text, accent, stroke
All are computed to be **WCAG-safe automatically**:
- **high** — the contrasting extreme (pure white or pure black), full opacity. Primary text.
- **low** — same color, opacity binary-searched (24 iterations) to land exactly at 4.5:1 AA contrast. Tertiary/placeholder.
- **medium** — same color, opacity at the midpoint between `low` and full. Secondary text.
- **tinted** — walks from the brand base step until it hits ≥3:1 contrast. Colored-but-legible accent.
- **tintedA11y** — same walk to ≥4.5:1. Accessible colored text/accent.
- **stroke medium / low** — fixed offsets at 12–32% opacity depending on direction.

Text tokens (high/medium/low) deliberately use **neutral black/white, not the brand's palette extreme**, so saturated brands don't produce tinted body text. This is the engine enforcing the "text stays neutral" rule for you.

### On-bold / on-subtle content
Because text on a bold fill must be read *at the bold step*, the engine also resolves a parallel set (`--{Role}-Bold-High`, `--{Role}-Subtle-High`, …) at those steps. That's how a bold button gets white text while the same button on the page gets dark text — same token name, resolved in two contexts.

### Interaction states
Hover and pressed are a translucent overlay at `surfaceStep ± dir × 800` (clamped 200–2000), same color for both, differing only in opacity (most surfaces 0.16/0.24; bold 0.24/0.32). Focus is a separate ring drawn from the **informative** scale (a system signal, not the brand). You don't compute any of this — choosing the level wires it.

### Appearance roles wired in the engine
`neutral`, `primary`, `secondary`, `sparkle`, `brand-bg`, `positive`, `negative`, `warning`, `informative`. Each has a full token set resolved at every surface context.

### The token names you actually reference
`--{Role}-Default|Minimal|Subtle|Moderate|Bold|Elevated` (fills), `--{Role}-High|Medium-Text|Low|Tinted|TintedA11y|Stroke-Medium|Stroke-Low` (content), `--{Role}-Bold-High` etc. (on-fill content), `--{Role}-Hover|Pressed` (states). Plus legacy aliases (`--Text-High`, `--Surface-Bold`) for components mid-migration.

### Choosing which role fills a Surface
A Surface defaults to the primary/neutral role. To render it in another role while keeping context adaptation, override the fill token inline and let children opt in via `appearance`:

```tsx
<Surface mode="subtle" style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}>
  <Slider appearance="secondary" />
</Surface>
```

The Surface reads `--Surface-Fill-*` (root-only, never remapped) for its own background, so it never reads its own inverted value — which is why the override is safe.

---

## The takeaway for judgment
The engine guarantees the colors are correct and accessible at every level and every nesting depth. It encodes **no** opinion about *when* a level is appropriate — that judgment is entirely yours, and it's what SKILL.md and `decision-tree.md` are for. Pick the level that carries the right *meaning*; trust the system for everything downstream of that.
