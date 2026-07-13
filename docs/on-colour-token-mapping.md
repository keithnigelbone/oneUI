# On-Colour Token Mapping — V4 → Unified

<!-- INTENTIONAL-LEGACY-VOCAB: this document is a V4→unified migration reference; legacy `fg-*`/`bg-*`/`-FG-*`/`-BG-*` strings appear deliberately in the rename tables. Private intermediate variable names inside components were also renamed (2026-04-26) to drop the legacy `fg-`/`bg-` prefix. -->

Reference for the rename + role-separation that happened when we collapsed
V4's BG/FG split into the unified 7-surface vocabulary. Targeted at the
Avatar / Chip / Button / Badge wiring discussion.

## Surface fills

| V4 name (before) | Unified name (now) | Notes |
| --- | --- | --- |
| `default` | `default` | Page surface. 2500 light / 200 dark. |
| `ghost` | `ghost` | Same step as parent. |
| `bg minimal` | `minimal` | parent ± 1. |
| `bg subtle` | `subtle` | parent ± 2. |
| — | `moderate` | **New.** parent ± 3. |
| `elevated` | `elevated` | parent + 1 (capped 2500). |
| `fg minimal` | `minimal` | Collapsed — no longer split. |
| `fg subtle` | `subtle` | Collapsed. |
| `fg bold` | `bold` | Collapsed. Anchors to role baseStep. |

The V4 `bg` vs `fg` split is gone. Every component that used `fg-bold` now
just uses `bold`; the "is this a container background or a component fill"
question is settled by **where** you apply the token (the Surface component
vs. the component itself), not by a different token name.

## Content tokens — on-parent (component text sitting on its own parent)

| Token | Resolves to | 4.5:1 WCAG? |
| --- | --- | --- |
| `--{Role}-High` | Pure `#fff` / `#000` (neutral override) | yes |
| `--{Role}-Medium-Text` | Contrasting extreme, 50-60% alpha | yes |
| `--{Role}-Low` | Contrasting extreme, alpha-solved for 4.5:1 | exact |
| `--{Role}-Tinted` | Scale walked from base until ≥ 3.0:1 | 3.0 only |
| `--{Role}-TintedA11y` | Scale walked from base until ≥ 4.5:1 | yes |
| `--{Role}-Stroke-Medium` | Derived stroke step, 24-32% alpha | — |
| `--{Role}-Stroke-Low` | Derived stroke step, 12-16% alpha | — |

`High / Medium / Low` are **achromatic** (pure black/white). `Tinted` /
`TintedA11y` are **branded** (scale hex, not neutral). This is the key
distinction the Avatar discussion hinges on.

## Content tokens — on-bold (text / icons sitting on a `bold` fill)

| V4 name (before) | Unified name (now) |
| --- | --- |
| `--{Role}-FG-Bold-High` | `--{Role}-Bold-High` |
| `--{Role}-FG-Bold-Medium` | `--{Role}-Bold-Medium` |
| *(not emitted)* | `--{Role}-Bold-Tinted` **← added 2026-04-24** |
| `--{Role}-FG-Bold-TintedA11y` | `--{Role}-Bold-TintedA11y` |
| `--Text-OnBold-High` | `--Text-OnBold-High` (kept as legacy alias) |

`Bold-High` stays achromatic (pure white/black). `Bold-Tinted` and
`Bold-TintedA11y` are branded — scale walked from role `base` against the
bold fill step until 3.0:1 / 4.5:1.

Same pattern for `--{Role}-Subtle-*` (content sitting on a subtle fill).

## What the Avatar reads now

### Before — bug
```css
.appearancePrimary {
  --_av-bold-high:   var(--Primary-Bold-High, var(--Text-OnBold-High));
  --_av-bold-accent: var(--Primary-Bold-High, var(--Text-OnBold-High));
}
```
Both icon and text resolved to `--Primary-Bold-High`, which is neutral
(pure black or pure white via the engine's `NEUTRAL_TEXT_TOKENS` override).
For a saturated brand on a bold fill, that reads as pure-extreme — not
branded — and inside `<Surface mode="bold">` the inner bold step drifts to
a mid-scale value where pure-black/white feels visually disconnected.

### After — fix (2026-04-24)
```css
.appearancePrimary {
  --_av-bold-high:
    var(--Primary-Bold-TintedA11y,
    var(--Primary-TintedA11y,
    var(--Text-OnBold-High)));
  --_av-bold-accent:
    var(--Primary-Bold-Tinted,
    var(--Primary-Bold-TintedA11y,
    var(--Primary-TintedA11y,
    var(--Text-OnBold-High))));
}
```
Icon uses `Bold-Tinted` (branded, 3.0:1). Text uses `Bold-TintedA11y`
(branded, 4.5:1). Matches the Figma reference in node 7077:8337 and the
Avatar's own header comment:
```
Icon: Colour/on-Colour/tinted    → --{Role}-Tinted
Text: Colour/on-Colour/tinted A11y → --{Role}-TintedA11y
```
On `<Surface mode="bold">` context, these tokens get remapped by the
`[data-surface="bold"]` block so they resolve against the inner bold step
— producing light-lavender-on-dark-indigo (and vice versa) without the
component needing any awareness of the surrounding context.

## Where to validate

Foundations → Surfaces → **Validation tab**. The 25-step grid now shows
three content sections per column:
- **content (on parent)** — what `--{Role}-High/Medium/Low/Tinted/…` resolve to.
- **on bold** — what `--{Role}-Bold-*` resolve to (rendered on the role's bold fill).
- **on subtle** — what `--{Role}-Subtle-*` resolve to (rendered on the role's subtle fill).

Cross-check any of these cells against OneUIColourTool's own surfaces view.
