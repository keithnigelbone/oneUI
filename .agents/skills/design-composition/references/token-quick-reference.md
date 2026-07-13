# Token Quick Reference

Compact lookup tables for the most commonly needed design tokens. All values shown are S (mobile) / default density. Values scale automatically per breakpoint and density.

---

## Spacing Tokens

All spacing aliases map to dimension f-steps. `Spacing-M` (f0) = base unit.

| Token | F-Step | Mobile Default | Common Use |
|-------|--------|----------------|------------|
| `--Spacing-None` | -- | 0px | Zero gap |
| `--Spacing-6XS` | f-7 | 2px | Hairline gaps |
| `--Spacing-5XS` | f-6 | 4px | Icon-to-text, micro gaps |
| `--Spacing-4XS` | f-5 | 6px | Tight internal padding |
| `--Spacing-3XS` | f-4 | 8px | Between chips, small gaps |
| `--Spacing-2XS` | f-3 | 10px | Compact component padding |
| `--Spacing-XS` | f-2 | 12px | Small component padding |
| `--Spacing-S` | f-1 | 14px | Between related items |
| `--Spacing-M` | f0 | 16px | Standard padding, grid gap |
| `--Spacing-L` | f1 | 18px | Between components |
| `--Spacing-XL` | f2 | 20px | Comfortable component gap |
| `--Spacing-2XL` | f3 | 24px | Between component groups |
| `--Spacing-3XL` | f4 | 28px | Section internal padding |
| `--Spacing-4XL` | f5 | 32px | Between card groups |
| `--Spacing-5XL` | f6 | 36px | Section gap |
| `--Spacing-6XL` | f7 | 40px | Major section gap |
| `--Spacing-7XL` | f8 | 48px | Page section separator |
| `--Spacing-8XL` | f9 | 56px | Large separator |
| `--Spacing-9XL` | f10 | 64px | Major page separator |
| `--Spacing-10XL` | f11 | 72px | Hero padding |
| `--Spacing-11XL` | f12 | 80px | Large hero padding |
| `--Spacing-12XL` | f13 | 96px | Extra-large spacing |
| `--Spacing-13XL` | f14 | 112px | Cinematic spacing |
| `--Spacing-14XL` | f15 | 128px | Maximum section spacing |
| `--Spacing-15XL` | f16 | 160px | Extreme spacing |
| `--Spacing-Margin` | Grid | 16px (mobile) | Page margin (auto per platform) |
| `--Spacing-Gutter` | Grid | 8px (mobile) | Column gutter (auto per platform) |

---

## Typography Tokens

### Display (3 sizes) — Decorative headlines, hero text

| Token | F-Step | Mobile Default | Weight |
|-------|--------|----------------|--------|
| `--Display-L-FontSize` | f7 | 40px | 900 (`--Display-L-FontWeight`) |
| `--Display-M-FontSize` | f6 | 36px | 900 (`--Display-M-FontWeight`) |
| `--Display-S-FontSize` | f5 | 32px | 900 (`--Display-S-FontWeight`) |

Line height offset: 0 (tight). Example: `--Display-L-LineHeight: var(--Dimension-f7)` = 40px

### Headline (3 sizes) — Page titles, major section headings

| Token | F-Step | Mobile Default | Weight |
|-------|--------|----------------|--------|
| `--Headline-L-FontSize` | f4 | 28px | 900 |
| `--Headline-M-FontSize` | f2 | 20px | 900 |
| `--Headline-S-FontSize` | f0 | 16px | 850 (optical sizing on) |

Line height offset: 0 (tight).

### Title (3 sizes) — Section headings, card titles

| Token | F-Step | Mobile Default | Weight |
|-------|--------|----------------|--------|
| `--Title-L-FontSize` | f2 | 20px | 800 |
| `--Title-M-FontSize` | f0 | 16px | 800 |
| `--Title-S-FontSize` | f-2 | 12px | 750 (optical sizing on) |

Line height offset: +1. Example: `--Title-M-LineHeight: var(--Dimension-f1)` = 18px

### Body (7 sizes) — Paragraphs, descriptions, helper text

| Token | F-Step | Mobile Default |
|-------|--------|----------------|
| `--Body-2XL-FontSize` | f3 | 24px |
| `--Body-XL-FontSize` | f2 | 20px |
| `--Body-L-FontSize` | f1 | 18px |
| `--Body-M-FontSize` | f0 | 16px |
| `--Body-S-FontSize` | f-1 | 14px |
| `--Body-XS-FontSize` | f-2 | 12px |
| `--Body-2XS-FontSize` | f-3 | 10px |

Emphasis weights: `--Body-FontWeight-High: 700`, `--Body-FontWeight-Medium: 500`, `--Body-FontWeight-Low: 400`
Line height offset: +3 (relaxed reading). Example: `--Body-M-LineHeight: var(--Dimension-f3)` = 24px

### Label (8 sizes) — Buttons, chips, tabs, navigation, form labels

| Token | F-Step | Mobile Default |
|-------|--------|----------------|
| `--Label-2XL-FontSize` | f3 | 24px |
| `--Label-XL-FontSize` | f2 | 20px |
| `--Label-L-FontSize` | f1 | 18px |
| `--Label-M-FontSize` | f0 | 16px |
| `--Label-S-FontSize` | f-1 | 14px |
| `--Label-XS-FontSize` | f-2 | 12px |
| `--Label-2XS-FontSize` | f-3 | 10px |
| `--Label-3XS-FontSize` | f-4 | 8px |

Emphasis weights: `--Label-FontWeight-High: 700`, `--Label-FontWeight-Medium: 500`, `--Label-FontWeight-Low: 400`
Line height offset: 0 (compact). Example: `--Label-M-LineHeight: var(--Dimension-f0)` = 16px

### Code (3 sizes) — Monospace text

| Token | F-Step | Mobile Default |
|-------|--------|----------------|
| `--Code-M-FontSize` | f0 | 16px |
| `--Code-S-FontSize` | f-1 | 14px |
| `--Code-XS-FontSize` | f-2 | 12px |

Font: `--Typography-Font-Code` (JetBrains Mono). Line height offset: +2.

### Font Families

| Token | Default |
|-------|---------|
| `--Typography-Font-Primary` | JioType Var (Jio brand) / Inter (platform default) |
| `--Typography-Font-Code` | JetBrains Mono, Fira Code, SF Mono, Consolas |

### Letter Spacing

| Token | Value | Use |
|-------|-------|-----|
| `--Typography-LetterSpacing-Tight` | -0.02em | Display headlines |
| `--Typography-LetterSpacing-Normal` | 0 | Default |
| `--Typography-LetterSpacing-Wide` | 0.025em | Uppercase labels |
| `--Typography-LetterSpacing-Wider` | 0.05em | Small caps |

---

## Shape Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--Shape-Pill` | 9999px | Buttons, chips, avatars, toggles |
| `--Shape-0` | 0px | Sharp edges, full-bleed |
| `--Shape-0-5` | f-7 = 2px | Minimal rounding |
| `--Shape-1` | f-6 = 4px | Subtle rounding |
| `--Shape-1-5` | f-5 = 6px | Small element rounding |
| `--Shape-2` | f-4 = 8px | Input fields, small containers |
| `--Shape-2-5` | f-3 = 10px | Medium-small containers |
| `--Shape-3` | f-2 = 12px | Small cards |
| `--Shape-3-5` | f-1 = 14px | Medium cards |
| `--Shape-4` | f0 = 16px | Standard cards, FAB |
| `--Shape-4-5` | f1 = 18px | Large cards, modals |
| `--Shape-5` | f2 = 20px | Large containers |
| `--Shape-5-5` | f2-5 = 22px | Large containers (half-step) |
| `--Shape-6` | f3 = 24px | Extra-large containers |
| `--Shape-7` | f4 = 28px | Hero sections |
| `--Shape-8` | f5 = 32px | Large panels |
| `--Shape-9` | f6 = 36px | Full-width cards |
| `--Shape-10` | f7 = 40px | Maximum scale rounding |

---

## Elevation Tokens

| Token | CSS Value | Use |
|-------|-----------|-----|
| `--Elevation-0` | none | Flat UI (default) |
| `--Elevation-1` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Sticky header, card hover |
| `--Elevation-2` | `0 3px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Floating card, tooltip |
| `--Elevation-3` | `0 10px 20px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)` | FAB, popover, dropdown |
| `--Elevation-4` | `0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.08)` | FAB hover |
| `--Elevation-5` | `0 20px 40px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)` | Modal, sheet |

---

## Motion Tokens

### Durations

| Token | Value | Use |
|-------|-------|-----|
| `--Motion-Duration-Discreet-Micro` | 50ms | Micro interactions |
| `--Motion-Duration-Discreet-Short` | 100ms | Button press feedback |
| `--Motion-Duration-Discreet-Medium` | 150ms | Hover transitions |
| `--Motion-Duration-Discreet-Long` | 200ms | Toggle, check state |
| `--Motion-Duration-Expressive-Short` | 250ms | Panel slide |
| `--Motion-Duration-Expressive-Medium` | 350ms | Modal entrance |
| `--Motion-Duration-Expressive-Long` | 500ms | Page transition |
| `--Motion-Duration-Expressive-XLong` | 700ms | Complex reveal |

### Easing

| Token | Value | Use |
|-------|-------|-----|
| `--Motion-Easing-Standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `--Motion-Easing-Enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering view |
| `--Motion-Easing-Exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving view |
| `--Motion-Easing-Emphasized` | `cubic-bezier(0.4, 0, 0, 1)` | Emphasized motion |

---

## Color Role Tokens (11 Appearance Roles)

Each role generates tokens with this pattern: `--{Role}-{Mode}-{OnColour}`

| Role | CSS Prefix | Purpose |
|------|-----------|---------|
| Primary | `--Primary-*` | Main brand accent, action color |
| Secondary | `--Secondary-*` | Supporting accent, selection color |
| Tertiary | `--Tertiary-*` | Third accent (rarely used) |
| Quaternary | `--Quaternary-*` | Fourth accent (rarely used) |
| Neutral | `--Neutral-*` | Grayscale, de-emphasized UI |
| Sparkle | `--Sparkle-*` | Celebration, success, delight |
| Brand-Bg | `--Brand-Bg-*` | Brand background accent |
| Positive | `--Positive-*` | Success, confirmation (green) |
| Negative | `--Negative-*` | Error, destructive (red) |
| Warning | `--Warning-*` | Caution, attention (amber) |
| Informative | `--Informative-*` | Neutral info (blue) |

### Common Token Suffixes per Role

| Suffix | Token Example | Purpose |
|--------|--------------|---------|
| `-FG-Bold` | `--Primary-FG-Bold` | Bold fill (button bg, chip bg) |
| `-FG-Bold-High` | `--Primary-FG-Bold-High` | Text on bold fill |
| `-BG-Subtle` | `--Primary-BG-Subtle` | Subtle tinted background |
| `-Default-High` | `--Primary-Default-High` | Primary text on default surface |
| `-Default-Accent-A11y` | `--Primary-Default-Accent-A11y` | Accessible accent text (4.5:1) |
| `-Default-Low-Stroke` | `--Primary-Default-Low-Stroke` | Subtle border on default |
| `-Default-Hover` | `--Primary-Default-Hover` | Hover state overlay |
| `-Default-Pressed` | `--Primary-Default-Pressed` | Pressed state overlay |

---

## Stroke Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--Stroke-None` | 0px | No border |
| `--Stroke-S` | 0.5px | Hairline borders |
| `--Stroke-M` | 1px | Standard borders |
| `--Stroke-L` | 1.5px | Medium borders |
| `--Stroke-XL` | 2px | Emphasis borders, focus rings |

## Border Color Tokens

| Token | Use |
|-------|-----|
| `--Border-Subtle` | Subtle card borders, dividers |
| `--Border-Default` | Standard input borders |

## Text Color Tokens

| Token | Use |
|-------|-----|
| `--Text-High` | Primary text (near-black on light) |
| `--Text-Medium` | Secondary text (medium grey) |
| `--Text-Low` | Tertiary text, captions (light grey) |
| `--Text-OnBold-High` | Text on bold surfaces (white on dark) |
