# Typography Tokens — Consolidated Map

A single reference so any engineer can locate where each piece of typography lives.

> **Updated 2026-05-05.** The legacy `typographyConfigs` and `typographyV2Configs` tables have been **removed from the schema**. All typography data lives in the `foundations` table. See § H for the actual JSON shape from a live brand.

---

## A. The 4 Layers (Where Tokens Exist)

```
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1 — Convex (source of truth, per brand)                       │
│   foundations table, type='typography'                              │
│   config: { ...V1 fields, typographyV2: { ...V2 fields } }          │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 2 — Engine (pure functions, generate CSS strings)             │
│   @oneui/shared + @oneui/ui                                         │
│   Reads V2 config → emits override tokens (only what changed)       │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 3 — Static CSS defaults (@layer base)                         │
│   @oneui/tokens/css/typography/typography.css                       │
│   Defines ALL 27 aliases pointing at var(--Dimension-fN)            │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 4 — Component CSS Modules (@layer components)                 │
│   packages/ui/src/components/*/*.module.css                         │
│   Reads var(--{Role}-{Size}-FontSize) — never literals              │
└─────────────────────────────────────────────────────────────────────┘
```

CSS cascade order: `base < semantic < theme < density < brand` — brand layer (engine output) always wins.

---

## B. Convex Tables (current)

Only one table holds typography:

| Table | Role |
|---|---|
| **`foundations`** (`type='typography'`) | ✅ Single source of truth. The `config` blob holds V1 fields *and* V2 fields nested at `config.typographyV2`. One row per brand. |

The legacy `typographyConfigs` and `typographyV2Configs` tables were dropped on 2026-05-05 (both were empty). Live queries (`getBrandOverviewData`, `getAvailablePlatforms`) now derive platform availability from `dimensionConfigs` only.

---

## C. Token Families (What Tokens Exist)

| Family | Pattern | Example | Defined in |
|---|---|---|---|
| **Font size** | `--{Role}-{Size}-FontSize` | `--Body-M-FontSize` | typography.css base; brand override per f-step |
| **Line height** | `--{Role}-{Size}-LineHeight` | `--Body-M-LineHeight` | typography.css base; brand override via `lineHeightOffsets` |
| **Emphasis weight** | `--{Role}-FontWeight-{Tier}` | `--Body-FontWeight-High` | typography.css base; brand override via `weightOverrides` |
| **Fixed weight** | `--{Role}-{Size}-FontWeight` | `--Display-L-FontWeight` | typography.css base (Display/Headline/Title only) |
| **Font family slots** | `--Typography-Font-{Slot}` | `--Typography-Font-Text`, `--Typography-Font-Heading`, `--Typography-Font-Code` | brand layer (engine emits); base has Inter fallback |
| **Per-role family** | `--{Role}-FontFamily` | `--Body-FontFamily` | typography.css base; brand override via `roleFontSlots` |
| **Letter spacing** | `--{Role}-LetterSpacing` | `--Display-LetterSpacing` | typography.css base; brand override |
| **Optical sizing** | `--{Role}-FontOpticalSizing`, `--{Role}-OpszVariation` | `--Display-OpszVariation` | typography.css base; brand override |
| **Features** | `--Typography-Features-{Slot}` | `--Typography-Features-Primary` | brand layer only (default unset) |
| **Legacy aliases** | `--Typography-Size-*`, `--Typography-Weight-*`, `--Typography-Font-Primary/Secondary/Display/Body` | `--Typography-Size-M` | typography.css base (alias to V2 token); kept for migration |

**Roles (6):** `Display`, `Headline`, `Title`, `Body`, `Label`, `Code`

**Sizes:**
- Display: L / M / S
- Headline: L / M / S
- Title: L / M / S
- Body: 2XL / XL / L / M / S / XS / 2XS
- Label: 2XL / XL / L / M / S / XS / 2XS / 3XS
- Code: L / M / S

**Total = 27 sizes**

**Weight tiers:** `High`, `Medium`, `Low` (used by Body, Label, Code)

---

## D. Where Each Piece Lives (File Map)

### Convex

| Path | Role |
|---|---|
| `convex/schema.ts:146` | `foundations` table — **the only typography source** |
| `convex/foundations.ts:158` | `upsertByType` mutation (write) |
| `convex/foundations.ts:508` | `getBrandOverviewData` query (read + customFonts resolution) |
| `convex/foundations.ts:104` | `getByType` query (used by editor page) |

### Engine (CSS Generation)

| Path | Role |
|---|---|
| `packages/shared/src/data/typography-roles.ts` | `DEFAULT_FSTEP_ASSIGNMENTS`, `DEFAULT_LINE_HEIGHT_OFFSETS`, `FONT_WEIGHTS`, role/size enums |
| `packages/shared/src/utils/typography/v2.ts:156` | `generateTypographyCSSV2` — emits override tokens only |
| `packages/shared/src/utils/typography/v2.ts:353` | `generateFullTypographyCSSV2` — emits all 27 (export use) |
| `packages/ui/src/utils/foundationCSS.ts:110` | `buildFontFamilyDeclarations` — resolves font IDs |
| `packages/ui/src/utils/foundationCSS.ts:288` | `generateTypographyFontCSSV2` — composes families + V2 overrides |
| `packages/ui/src/hooks/useBrandCSS.ts:246` | V2/V1 detection + pipeline routing |

### Static CSS

| Path | Role |
|---|---|
| `packages/tokens/src/css/layers.css` | `@layer base, semantic, theme, density, brand` declaration |
| `packages/tokens/src/css/typography/typography.css` | All 27 relational aliases + weights + family slots + legacy aliases (in `@layer base`) |
| `packages/tokens/src/css/scale.css` | `--Dimension-f0..f16` with platform/density remapping |

### Injection Bridge

| Path | Role |
|---|---|
| `apps/platform/src/components/FoundationStyleProvider.tsx` | Convex subscription → `useBrandCSS` → `<style id="oneui-foundation-tokens">` |
| `apps/platform/src/app/layout.tsx` | Imports `@oneui/tokens/css/typography` (loads layer base) |

### Editor UI

| Path | Role |
|---|---|
| `apps/platform/src/app/(platform)/(studio)/foundations/typography/page.tsx` | V2 editor — calls `upsertByType` with V1+V2 merged into one config blob (line 119–122) |

### Components (Consumers)

| Path | Pattern |
|---|---|
| `packages/ui/src/components/*/*.module.css` | `font-size: var(--{Component}-fontSize, var(--{Role}-{Size}-FontSize))` |

---

## E. Resolution Chain for One Token

When a Button renders `font-size: var(--Label-M-FontSize)`:

```
1. Browser looks up --Label-M-FontSize
2. @layer brand   → does brand CSS define it?  (only if labelFSteps.M was overridden)
                    YES → var(--Dimension-f1)   ← wins
                    NO  → fall through
3. @layer base    → typography.css: --Label-M-FontSize: var(--Dimension-f0)
4. Browser looks up --Dimension-f0
5. scale.css [data-Breakpoint="L"][data-6-Density="default"] → 14px
6. Final computed value: 14px
```

- Change platform → step 5 returns a different px → all 27 sizes shift simultaneously.
- Change brand f-step → step 2 wins → only that one role/size shifts.
- Change density → step 5 returns a shifted px → all sizes scale.

---

## F. Convex Document Shape (V2)

Stored at `foundations[type='typography'].config.typographyV2`:

```ts
{
  fontSelection: {
    textFontId: string,        // canonical (body/UI font)
    headingFontId: string,     // canonical (display/headlines)
    codeFontId?: string,
    // legacy aliases still accepted: bodyFontId, displayFontId,
    // primaryFontId, secondaryFontId, fallbackFontIds
  },
  displayFSteps?:  { L?: 'f7', M?: 'f6', S?: 'f5' },
  headlineFSteps?: { L?, M?, S? },
  titleFSteps?:    { L?, M?, S? },
  bodyFSteps?:     { '2XL'?, XL?, L?, M?, S?, XS?, '2XS'? },
  labelFSteps?:    { '2XL'?, XL?, L?, M?, S?, XS?, '2XS'?, '3XS'? },
  codeFSteps?:     { L?, M?, S? },
  lineHeightOffsets?: {
    display: number,   // default 0
    headline: number,  // default 0
    title: number,     // default 1
    body: number,      // default 3
    label: number,     // default 0
    code: number       // default 2
  },
  weightOverrides?: Record<string, number>,
    // e.g. { 'Label-FontWeight-High': 600 }
  roleFontSlots?: {
    display?: 'primary' | 'secondary',
    headline?: 'primary' | 'secondary',
    title?: 'primary' | 'secondary',
    body?: 'primary' | 'secondary',
    label?: 'primary' | 'secondary',
    code?: 'primary' | 'secondary'
  },
  fontFeatures?: { primary?: {...}, secondary?: {...}, code?: {...} },
  letterSpacing?: Record<role, string>,    // em values per role
  opticalSizing?: Record<role, { mode, opszValue? }>,
  rendering?: { textRendering?, webkitFontSmoothing?, fontSynthesis? }
}
```

The engine emits **only the tokens that differ from defaults** — keeps brand CSS lean.

---

## G. Mental Model

- **Convex stores intent** — "Body M should map to f-step 6, with line-height offset 3"
- **Engine translates intent → CSS overrides** — emits only the diff vs defaults
- **Static CSS provides full default surface** — so missing brand data still renders
- **Components read role tokens, never literals or `--Dimension-fN` directly**
- **Relational chain** (`Role.Size → Dimension.fN → px`) is what makes platform/density/brand changes propagate without component edits

---

## H. Live Example — Jio Brand (verified 2026-05-05)

Pulled from production Convex via `npx convex run foundations:getByType`. This is the exact `foundations.config` for `brandId: Jio`, `type: 'typography'`:

```jsonc
{
  // ── V1 fields (legacy, still written but not the source of truth ──
  "baseSize": 16,
  "fontFamily": "'JioType Var', sans-serif",
  "fontSelection": {
    "textFontId":      "uploaded-ms7ctvv5s0zqxhca0mx8d25f1h7zbde0",
    "headingFontId":   <inherited>,
    "primaryFontId":   "uploaded-ms7ctvv5s0zqxhca0mx8d25f1h7zbde0",
    "secondaryFontId": null,
    "bodyFontId":      "uploaded-ms7ctvv5s0zqxhca0mx8d25f1h7zbde0",
    "fallbackFontIds": ["noto-sans"],
    "scope": "single"
  },
  "platform": "desktop", "ppi": 96, "pixelDensity": 1,
  "scaleFactor": 1.125, "viewingDistance": 60,
  "weightMapping": { "black": 900, "high": 700, "medium": 500, "low": 400 },
  "styles": [
    { "name": "Display-L", "fStep": "f6", "fontSize": 32, "fontWeight": 900, "lineHeight": 100, "letterSpacing": 0, "opticalSize": 20 },
    { "name": "Display-M", "fStep": "f5", "fontSize": 29, ... },
    // ... 14 entries total: Display L/M/S, Headline L/M, Title L/M/S, Label L/M/S, Body L/M/S
  ],

  // ── V2 fields (active source — engine reads this) ──
  "typographyV2": {
    "displayFSteps": { "L": "f7" },     // only L overridden; M/S use defaults
    "weightOverrides": {
      "Body-FontWeight-High":    600,
      "Code-FontWeight-High":    600,
      "Label-FontWeight-High":   600,
      "Display-L-FontWeight":    900
    },
    "letterSpacing": { "body": 0, "label": 0 },
    "opticalSizing": {
      "title": { "mode": "manual", "opszValue": 32 },
      "label": { "mode": "manual", "opszValue": 32 }
    },
    "fontFeatures": {
      "primary":   { "ligatures": false, "contextualAlternates": false },
      "secondary": { "ligatures": false, "contextualAlternates": false },
      "code":      { "ligatures": false, "contextualAlternates": false }
    }
  }
}
```

### Notes from the live data
- `typographyV2` only stores **deltas from defaults**. Most fields are absent (= use defaults).
- The V1 fields (`styles[]`, `scaleFactor`, etc.) are still being written by the editor for backward compat, but **the engine path uses `typographyV2` exclusively** when present (`useBrandCSS.ts:246`).
- `headlineFSteps`, `titleFSteps`, `bodyFSteps`, `labelFSteps`, `codeFSteps`, `lineHeightOffsets`, `roleFontSlots`, `rendering` are all unset on Jio → defaults apply.

### How to inspect any brand
```bash
# List brands
npx convex run brands:list '{}'

# Get typography config for a specific brand
npx convex run foundations:getByType \
  '{"brandId":"<brand_id>","type":"typography"}'
```

Or in the Convex dashboard: open the **`foundations`** table, filter `type = "typography"`, expand the `config` cell.

---

## I. Rules for New Code

1. ✅ Use role tokens: `var(--Body-M-FontSize)`, `var(--Body-M-LineHeight)`, `var(--Body-FontWeight-Medium)`
2. ✅ Always pair `font-size` + `line-height` tokens together
3. ✅ Always include `font-family: var(--Typography-Font-Primary)` (or per-role `--{Role}-FontFamily`)
4. ❌ Never use `--Typography-Size-*` or `--Typography-Weight-*` (legacy)
5. ❌ Never reference `--Dimension-fN` directly from a component — always go through a role token
6. ❌ Never hard-code px, weights, or line-height numbers
