# Foundation Coverage Audit (FND-01)

> **P1 HIGH-severity deliverable.** Resolves Risk A3 / Pitfall 6 ("Foundation resolver invents non-web dimensions") and Open Question #4. This audit enumerates which output profiles the Jio Design System foundations **actually DEFINE** versus which the Experience Builder docs **ASSUME** (and therefore gate behind a typed gap report until a later phase lights them up).
>
> **The one rule this audit exists to enforce:** an output profile whose foundation coverage is not real must resolve to a **typed gap report** — never a fabricated dimension. The foundation resolver must never invent a "1080×1080" or any other round number that does not trace to a Jio token.

---

## What Jio foundations actually define

The Jio Design System is **web/density/viewport-shaped**. Its responsive contract is the dimension f-step cascade selected by the `data-Breakpoint` attribute across **3 discrete web breakpoints** (verified in `packages/shared/src/data/dimension-scales.ts`):

| Breakpoint id | Width (px) | Notes |
|-------------|-----------|-------|
| `S` | 360 | Mobile |
| `M` | 768 | Tablet |
| `L` | 1440 | Desktop |

Layered on top: **3 densities** (compact / default / open, each a ±1 f-step shift) and the full token system (OkLCH color scales, 25-step f-scale spacing, relational typography, shape, motion, elevation). Every value adapts through CSS tokens — there are **no fluid clamp breakpoints** and **no media queries** in component CSS.

**Conclusion:** Jio foundations natively define **web layout surfaces** — screen-shaped artifacts whose dimensions trace to the 3 breakpoints + density. There is **no foundation concept** today for fixed-aspect raster canvases (Instagram square/portrait/story), print/slide aspect ratios, or outdoor/billboard safe areas.

---

## Coverage matrix: DEFINED vs ASSUMED

The source of truth is `src/profiles/outputProfileTable.ts`. Each profile carries a `coverage` field: `'real'` (foundation-backed) or `'assumed'` (structurally present for a later phase, but its dimension/aspect/safe-area values are explicit placeholders, never invented round numbers presented as fact).

### DEFINED — foundation-backed web profiles (`coverage: 'real'`)

| Artifact type | Output profile | Dimensions | Coverage |
|---------------|----------------|------------|----------|
| `web-ui` | `web-desktop` | 1440 × 1024 | **real** — traces to `L` |
| `web-ui` | `web-mobile` | 390 × 844 | **real** — mobile, `S` family |
| `web-ui` | `web-responsive` | fluid (`null`) | **real** — the full breakpoint cascade |
| `app-screen` | `app-phone` | 390 × 844 | **real** — web-rendered phone screen |
| `app-screen` | `app-tablet` | 834 × 1194 | **real** — web-rendered tablet screen |
| `dashboard` | `dashboard-desktop` | 1440 × 1024 | **real** — `L` |
| `dashboard` | `dashboard-wide` | 1920 × 1080 | **real** — `L` |

These profiles are what P1 actually exercises. Their dimensions trace to real platform breakpoints, so the foundation resolver can produce a `ThemeConfig`-shaped result for them today.

### ASSUMED — non-web profiles, gap-until-P4 (`coverage: 'assumed'`)

| Artifact type | Output profile | Aspect | Coverage | Status |
|---------------|----------------|--------|----------|--------|
| `social-post` | `ig-square` | 1:1 | **assumed** | gap-until-P4 |
| `social-post` | `ig-portrait` | 4:5 | **assumed** | gap-until-P4 |
| `social-post` | `ig-story` | 9:16 | **assumed** | gap-until-P4 |
| `social-post` / `instagram-carousel` | `ig-carousel` | 1:1 | **assumed** | gap-until-P4 |
| `instagram-carousel` | `ig-portrait` | 4:5 | **assumed** | gap-until-P4 |
| `outdoor-display` | `billboard-landscape` | 16:9 | **assumed** | gap-until-P4 |
| `outdoor-display` | `digital-portrait` | 9:16 | **assumed** | gap-until-P4 |
| `slide` | `slide-16x9` | 16:9 | **assumed** | gap-until-P4 |
| `slide` | `slide-4x3` | 4:3 | **assumed** | gap-until-P4 |
| `image` | `image-freeform` | fluid | **assumed** | gap-until-P4 |

**These profiles have no real Jio foundation coverage.** They are structurally present in the table so that P4 only needs to light up renderers (not migrate the schema), but their pixel dimensions are deliberately `null` (placeholders) — the table never asserts a fabricated dimension for them.

---

## The gap-report contract (FND-03 / Pitfall 6)

Because non-web profiles are uncovered, the foundation resolver MUST treat them as a typed first-class gap, not a silent default:

1. **`FoundationResolveResult` is a discriminated union** with an explicit `{ ok: false, gap: {...} }` variant (`src/contracts/foundationResolve.ts`). "Profile not found / not covered" resolves to this variant.
2. **A gap short-circuits the run** before any artifact card is created (FND-03). The canvas flips the foundation-profile card to its typed gap state and produces **zero** artifact cards.
3. **The resolver never returns a round number that does not trace to a token.** A `1080 × 1080` IG dimension would be a Pitfall-6 violation: it is invented, not foundation-backed. The honest output for an uncovered profile is the gap report.
4. **The user-facing gap copy** (UI-SPEC Copywriting Contract) frames a gap as the system *correctly refusing to invent*: _"No Jio foundation profile is defined for {artifactType} → {outputProfile}. Generation stopped — no dimensions were invented. Pick a covered profile, or file this as a Jio system gap."_

### Warning signs (audit failure modes to watch for in later phases)

- The resolver returns round numbers (e.g. `1080`) for a non-web profile that do not trace to a Jio token.
- No gap reports are ever emitted for `social-post` / `outdoor-display` / `slide` / `image` — implying invented coverage.
- A non-web profile's `coverage` flips to `'real'` without a corresponding new foundation concept landing in `@oneui/shared`/`@oneui/tokens`.

---

## Roadmap implication

| Phase | Foundation-coverage action |
|-------|---------------------------|
| **P1 (now)** | Web profiles **defined**; non-web profiles **assumed** and gated behind the gap path. Only the web + gap paths are exercised. |
| **P4 (campaign/social)** | Decide the real non-web foundation concept (fixed-aspect raster canvas + safe-area model). Either extend the Jio foundations to define these profiles (flipping `coverage` to `'real'`), or keep them as documented gaps. Until then, every non-web run honestly returns a gap report. |

**Bottom line:** P1 proves the gap path works. The Lab will never invent a non-web dimension — it will say so.
