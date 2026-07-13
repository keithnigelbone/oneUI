# Design System — One UI (baseline)

> Machine-readable brand manifest. Generated from the One UI Studio engine.
> Assembled from: composition config + rules + skills + component registry + generated prop schemas.

- **Brand:** One UI (baseline)
- **Generated:** 2026-01-01T00:00:00.000Z
- **Context scope:** social-post

## 1. Identity

- Vertical: `general`
- Layout personality: `density=30`, `expressiveness=50`
- Default context: `mobile-app`
- Prefers minimal containers.

## 2. Composition Rules

### Layout Structure

- **Layout Structure** — Every screen should have clear sections. Use element nodes as section containers:

1. **Header section** — Avatar + title, or Image hero, or just a heading area
2. **Content section** — The main interactive area (forms, lists, cards)
3. **Action section** — Primary CTA at bottom, secondary actions above

Layout patterns for element nodes:
- **Vertical stack**: { "display": "flex", "flexDirection": "column", "gap": "var(--Spacing-4)" }
- **Horizontal row**: { "display": "flex", "flexDirection": "row", "gap": "var(--Spacing-4)", "alignItems": "center" }
- **Space between row**: { "display": "flex", "justifyContent": "space-between", "alignItems": "center" }
- **Centered content**: { "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "var(--Spacing-4-5)" }

### Spacing Rhythm

- **Spacing Rhythm** — Use the spacing token hierarchy consistently:
- Between major sections: var(--Spacing-5) or var(--Spacing-6)
- Between related items: var(--Spacing-4)
- Between tightly coupled elements: var(--Spacing-3-5) or var(--Spacing-3)
- Micro gap (icon to text): var(--Spacing-1)
- Small gap (between chips): var(--Spacing-2)
- Standard padding: var(--Spacing-4)
- Between card groups: var(--Spacing-7) to var(--Spacing-8)
- Section gap: var(--Spacing-9) to var(--Spacing-12)
- Page margins: var(--Spacing-Margin)
- Grid gutters: var(--Spacing-Gutter)

Whitespace philosophy: When in doubt, add more whitespace. The spacious, Apple-like aesthetic comes from generous breathing room between elements.

### Typography Hierarchy

- **Typography Hierarchy** — All typography sizes alias to dimension f-steps. Always include font-family: var(--Typography-Font-Primary) on every text element.

Context → role mapping:
- Hero/splash headline: Display L/M (f7/f5, weight 900)
- Page title: Headline L/M (f4/f2, weight 900)
- Section heading: Title L/M (f1/f0, weight 800)
- Card title: Title M/S (f0/f-1, weight 800/750)
- Body paragraph: Body M (f0, weight 400 low)
- Helper/caption: Body S/XS (f-1/f-2, weight 400)
- Button label: Label M/S (f0/f-1, weight 700 high)
- Input label: Label S/XS (f-1/f-2, weight 500 medium)
- Badge text: Label XS/2XS (f-2/f-3, weight 500)

Always pair a line-height token with every font-size token. Use role-specific tokens (--Body-M-FontSize) not legacy (--Typography-Size-M).

## Text colour rules (readability on default surface)

Secondary / supporting text on a default (white) card MUST use
`var(--Primary-Default-Medium-Text)` or `var(--Text-Medium)`. NEVER use
`--Text-Low` or `--Primary-Default-Low-Text` for copy the user is expected
to read (subtitles, field labels, helper text, SSO row labels).

Low-emphasis tokens are reserved for:
- Placeholder text already supplied by the component (don't restate).
- Disabled states only.
- Timestamps or metadata beside a primary label (never the primary line itself).

When in doubt: prefer Medium over Low. Washed-out copy reads as broken.

## Case rules (Jio brand)
- NEVER use UPPERCASE for section labels, badges, chips, table headers, or tab labels.
- NEVER apply CSS `text-transform: uppercase` or wide `letter-spacing` for "caps" effects.
- NEVER write headings in all caps ("ORDERS & DELIVERY" is wrong — use "Orders & delivery").
- Use Sentence case for section headings and card titles ("Orders and delivery", not "Orders And Delivery").
- Only proper nouns retain capitalisation (JioMart, JioCinema, Diwali).
- Button labels use Sentence case: "Enable notifications", not "ENABLE NOTIFICATIONS".
- Badge text uses lowercase or Sentence case: "new", "Featured", never "NEW".

### Attention Flow

- **Attention Flow** — Distribute visual emphasis like a pyramid:
- **High (5%)** — Primary CTA, hero branded moment. ONE per screen.
- **Medium (10%)** — Secondary CTAs, active states, emphasis cards
- **Low (25%)** — Cards with subtle fills, secondary actions
- **None (60%)** — Body text, lists, tables, navigation, headers

One focal point per viewport section. Never let two bold elements compete.

Appearances: primary for main actions, neutral for settings, positive for success, negative for destructive.

**Density inversion exception** — when the screen's purpose is data, intelligence, monitoring, inferred state, or copilot-style assistance (dashboards, IoT status, finance trackers, health monitors, alert centres), the pyramid does NOT apply. Use multiple medium-attention pivots instead of a single hero, and require ≥3 differentiation data points per region (number + label + inferred reason). See the `high-density-data-screen` skill for full guidance — invoke it whenever the brief implies a data-first surface rather than an action-first one.

### Surface Application

- **Surface Application** — 80-90% of any screen should be default surface. Content shines against a neutral backdrop.

Surface mode decision tree (one vocabulary, no BG/FG split):
- Page background → default
- Card or panel → default (content is hero)
- Alternating rows / sidebar → minimal
- Grouped section with boundary → subtle
- Stronger emphasis without going bold → moderate
- Hero or branded moment → bold
- Floating element (menu, popover, sheet) → elevated

To fill a Surface with a specific role colour, override --Surface-Fill-{Mode} inline:
`<Surface mode="subtle" style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}>`
Children with appearance="secondary" then resolve correctly via the [data-surface] cascade.

Bold surface is an event, not a default. ALWAYS use <Surface mode="..."> for non-default backgrounds. Never set background-color manually on containers with interactive children — tokens inside a raw div do not remap.

### Component Selection

- **Component Selection** — Common micro-patterns:

**Setting row** (label + switch):
{ kind: "element", tag: "div", props: { "style": { "display": "flex", "justifyContent": "space-between", "alignItems": "center" } },
  children: [text, Switch] }

**Button pair** (primary + secondary):
Vertical: high CTA (fullWidth) on top, low Button (contained=false) below. Gap: var(--Spacing-3-5).

**Profile header** (avatar + text):
Horizontal row with Avatar (xl) + text stack. Gap: var(--Spacing-4).

Action component selection (Figma attention level → Button variant):
- High attention / Primary CTA: variant="bold" appearance="primary" (one per viewport)
- Medium attention / Secondary: variant="subtle" appearance="primary" or "secondary"
- Low attention / Tertiary: variant="ghost" appearance="neutral"
- Icon-only: IconButton with aria-label
- Navigation: Button (contained=false) or Link
- Destructive: variant="bold" or "subtle" appearance="negative"

### Color Role Usage

- **Color Role Usage** — 4 brand color roles:
- **Primary**: Action color. Buttons, nav indicators, links. One primary action per viewport.
- **Secondary**: Accent. Checkboxes, toggles, chips. Complements primary.
- **Sparkle**: Celebration. Rare — max 1-2 per viewport.
- **Neutral**: Chrome. Gray buttons, dividers, tertiary actions.

Semantic roles (never for brand expression):
- positive: success (green)
- negative: error/destructive (red)
- warning: caution (amber)
- informative: info (blue)

### Navigation Patterns

- **Navigation Patterns** — Headers always use default background.

Mobile: Bottom tab bar (4-5 items), stack navigation, sheet/modal for contextual actions.
Web: WebHeader component, sidebar for deep hierarchies, breadcrumbs, tab groups.

Navigation should never compete with content for attention.

### Responsive Adaptation

- **Responsive Adaptation** — Grid: Mobile 4col, Tablet 8col, Desktop 12col.
Use var(--Spacing-Margin) and var(--Spacing-Gutter) — they auto-adapt.

Column transitions: 1 (mobile/focused), 2 (tablet/comparison), 3+ (desktop/grids).

### Motion Elevation

- **Motion & Elevation** — Motion: Discreet (quick, functional) for UI, Expressive (noticeable, branded) for emphasis.
Elevation: 0 (flat default), 1-2 (cards/dropdowns), 3 (dialogs), 4-5 (rare dramatic overlays).
Use elevation sparingly. Most elements level 0.

### Vertical Specifics

- **Vertical-Specific Rules** — Apply by brand vertical:
- **E-commerce**: Product grids, image-first cards, one CTA per card, sticky cart bar
- **Entertainment**: Immersive imagery, dark mode, horizontal scroll thumbnails
- **Finance**: Data-dense, tables, trust signals, conservative spacing, form-heavy
- **Governance**: Formal, high readability, conservative color, accessibility-first
- **Farm**: Simple, large touch targets, icon-heavy, offline-friendly
- **IoT**: Dashboard widgets, real-time data, compact density, color-coded states
- **Telecom**: Plan comparison, usage meters, promo heroes

### Accessibility Layout

- **Accessibility & Layout** — - Focus order follows visual reading order
- Touch targets: 44×44px mobile, 24×24px desktop minimum
- Color never the only way to convey information
- WCAG AA contrast (4.5:1 normal text, 3:1 large text)
- Sequential heading hierarchy (h1 → h2 → h3)
- Images need meaningful alt text
- IconButton needs aria-label
- Use semantic HTML (section, header, main, nav)

## 3. Composition Skills

_No skills configured._
## 4. Component Reference

The LLM MUST only emit components listed here. Any component type outside this catalog is invalid.

Active brand: **One UI (baseline)**

46 components available.

## Feedback

### Agent Pulse

Animated brand-coloured indicator that visualises the four canonical agent states (idle, listening, thinking, speaking) using the OneUI logo geometry. Recolours per brand and adapts on coloured surfaces.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `idle` \| `listening` \| `thinking` \| `speaking` | `idle` | Agent state — drives which animation loop plays. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent role — recolours the animation at runtime. |
| `size` | `sm` \| `md` \| `lg` \| `xl` | `md` | Diameter preset — backed by spacing dimension tokens. |
| `autoTransition` | `boolean` | `true` | Play a bridge animation between states when one exists. |
| `paused` | `boolean` | `false` | Pause animation playback. |
| `speed` | `number` | `1` | Playback rate (1 = normal, 2 = double, 0.5 = half). |
| `reducedMotionFallback` | `static` \| `pulse` \| `none` | `static` | Fallback when the user prefers reduced motion. |
| `label` | `string` | — | Accessible label override (defaults to "Agent is <state>"). |

*Surface-aware: adapts automatically on colored backgrounds.*

### Circular Progress Indicator

Circular progress arc. Determinate variant renders an arc proportional to `value`; indeterminate renders a spinning animation. Optional center content (icon or auto percentage). 10 t-shirt sizes. Multi-accent appearance roles.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `determinate` \| `indeterminate` | `determinate` | Determinate arc or indeterminate animation. |
| `size` | `2XS` \| `XS` \| `S` \| `M` \| `L` \| `XL` \| `2XL` \| `3XL` \| `4XL` \| `5XL` | `M` | Size preset (t-shirt). |
| `appearance` | `auto` \| `primary` \| `secondary` \| `sparkle` \| `neutral` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. |
| `content` | `none` \| `icon` \| `text` | `none` | Center content mode. `text` renders the percentage at L–5XL only (Label 3XS→M per Figma). |
| `value` | `number` | — | Current progress value (determinate only). |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `children` | `ReactNode` | — | Centre `<Icon />` when `content="icon"`. Omitted `size`/`appearance` merge from CPI maps (Figma spacing 2–6; XS/S use 6px via CSS). |
| `aria-label` | `string` | — | Accessible label for screen readers. |

*Surface-aware: adapts automatically on colored backgrounds.*

### Spinner

Indeterminate three-arc loading indicator. Renders three distinct role-colored arcs (primary + secondary + sparkle) and adapts on colored surfaces via the [data-surface] system.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `2XS` \| `XS` \| `S` \| `M` \| `L` \| `XL` \| `2XL` \| `3XL` \| `4XL` \| `5XL` | `M` | Spinner diameter — matches Figma 10-size scale. |
| `label` | `string` | `Loading` | Accessible label announced by screen readers. |

*Surface-aware: adapts automatically on colored backgrounds.*

## Display

### Avatar

User representation with image, icon, or initials text content, t-shirt sizing, and attention levels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `image` \| `icon` \| `text` | `image` | Display type |
| `size` | `2xs` \| `xs` \| `s` \| `m` \| `l` \| `xl` \| `2xl` \| `custom` | `m` | Avatar size (t-shirt scale) |
| `attention` | `high` \| `medium` \| `low` | `high` | Visual emphasis (high=filled, medium=tinted, low=transparent) |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `src` | `string` | — | Image source URL |
| `alt` | `string` | — | Alt text for accessibility |
| `disabled` | `boolean` | `false` |  |

*Surface-aware: adapts automatically on colored backgrounds.*

### Badge

Non-interactive display component used to highlight status, provide notifications, or categorize content. Supports start/end slots for icons and sub-badges.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `high` \| `medium` \| `low` | `high` | Emphasis level — high (bold fill), medium (tinted fill), low (transparent). |
| `size` | `xs` \| `s` \| `m` \| `l` \| `xl` | `m` | Badge size. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `children` | `string` | — | Text content displayed inside the badge |

**Brand-customizable:** `attention`

**Slots:**
- `start`: Content before the label (icon, avatar, counter badge, indicator badge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)
- `end`: Content after the label (icon, avatar, counter badge, indicator badge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)

*Surface-aware: adapts automatically on colored backgrounds.*

### Counter Badge

Non-interactive display component showing a numeric count with bold/subtle/ghost variants and multi-accent support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `high` \| `medium` \| `low` | `high` | Emphasis level — high (bold fill), medium (tinted fill), low (transparent). |
| `size` | `xs` \| `s` \| `m` \| `l` | `m` | CounterBadge size. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `value` | `number` | `5` | Numeric value to display |
| `max` | `number` | `99` | Maximum value before showing overflow (e.g., "99+") |
| `showZero` | `boolean` | `false` | Whether to show the badge when value is 0 |

**Brand-customizable:** `attention`

*Surface-aware: adapts automatically on colored backgrounds.*

### Icon

Design-system icon with token-based sizing, 8 appearance roles, and 5 emphasis levels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `2` \| `2.5` \| `3` \| `3.5` \| `4` \| `4.5` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `12` \| `14` \| `16` \| `18` \| `20` \| `24` \| `32` \| `40` | `5` | Icon size (spacing index) |
| `appearance` | `neutral` \| `primary` \| `secondary` \| `sparkle` \| `negative` \| `positive` \| `warning` \| `informative` | `neutral` | Colour role |
| `emphasis` | `high` \| `medium` \| `low` \| `tinted` \| `tintedA11y` | `high` | Colour prominence |
| `icon` | `string` | `star` | Semantic icon name (e.g., "star", "add", "search", "settings") |

### Icon Contained

Icon with a filled background container, high/medium attention levels, and multi-accent support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `xs` \| `s` \| `m` \| `l` \| `xl` | `m` | Container size |
| `attention` | `high` \| `medium` | `high` | Visual emphasis (high=solid bold, medium=subtle tinted) |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `icon` | `string` | `star` | Semantic icon name (e.g., "star", "add", "settings") |
| `disabled` | `boolean` | `false` |  |

*Surface-aware: adapts automatically on colored backgrounds.*

### Image

Responsive image with aspect ratio presets, object-fit controls, and optional interactive state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image source URL |
| `alt` | `string` | — | Alt text for accessibility |
| `aspectRatio` | `auto` \| `1:1` \| `1:2` \| `2:1` \| `2:3` \| `3:2` \| `3:4` \| `4:3` \| `9:16` \| `16:9` \| `9:21` \| `21:9` | `auto` | Aspect ratio preset |
| `fit` | `cover` \| `contain` \| `fill` \| `none` \| `scale-down` \| `inherit` \| `initial` \| `revert` \| `revert-layer` \| `unset` | — | Figma alias for object-fit; wins over `objectFit` when both are set |
| `objectFit` | `cover` \| `contain` \| `fill` \| `none` \| `scale-down` \| `inherit` \| `initial` \| `revert` \| `revert-layer` \| `unset` | `cover` | CSS object-fit for the inner image |
| `objectPosition` | `string` | `center` | CSS object-position (web); applied via token pipeline |
| `loading` | `auto` \| `lazy` \| `eager` | `lazy` | Native lazy loading hint (web). `auto` omits the HTML attribute. |
| `srcSet` | `string` | — | Responsive `srcSet` string (web `<img>` only) |
| `sizes` | `string` | — | `sizes` hint for `srcSet` selection (web only) |
| `crossOrigin` | `anonymous` \| `use-credentials` | — | CORS mode for the image request (web only) |
| `decoding` | `auto` \| `sync` \| `async` | — | Decode hint for the browser (web only) |
| `draggable` | `boolean` | — | Native drag behaviour (web only) |
| `lottieAttributes` | `object` | — | Optional Lottie/host payload — serialized to `data-oneui-lottie` on the root |
| `interactive` | `boolean` | `false` | Enable state layer + focus ring |
| `disabled` | `boolean` | `false` |  |
| `width` | `string` | — | Container width (px number or CSS length) |
| `height` | `string` | — | Container height (px number or CSS length) |
| `fallback` | `ReactNode` | — | Custom React node shown on load error (wins over `fallbackSrc`) |
| `fallbackSrc` | `string` | — | Fallback image URL when `src` fails and `fallback` is not set |
| `className` | `string` | — | Additional class name (web only) |
| `style` | `object` | — | Inline styles (`CSSProperties` on the web root) |
| `aria-label` | `string` | — | Accessible label when `interactive` (defaults to `alt`) |
| `testID` | `string` | — | Forwarded as `data-testid` on the root element |

### Indicator Badge

Non-interactive status/presence indicator dot. Supports multi-accent appearance roles and five sizes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `xs` \| `s` \| `m` \| `l` \| `xl` | `m` | Indicator dot size. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |

*Surface-aware: adapts automatically on colored backgrounds.*

### List Item

Single row in a list. Renders a title (Label-M) and optional supportText (Body-S) with start/end slots for icons/avatars/badges/chevrons. Supports 4 start slot sizes (S/M/L/XL), 2 end sizes (S/M), three selected levels (false / medium / high), multi-accent appearance roles, bottom divider (none/full/inset), and an inset rounded-card container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Primary line (Label-M-High). |
| `supportText` | `ReactNode` | — | Optional secondary line below the title (Body-S-Low). |
| `supportStart` | `ReactNode` | — | Small inline decorative slot rendered BEFORE the support text. Follows the support text colour. |
| `start` | `ReactNode` | — | Leading content (icon / avatar / badge). |
| `startSize` | `S` \| `M` \| `L` \| `XL` | `M` | Leading slot size. |
| `end` | `ReactNode` | — | Trailing content (chevron / icon). |
| `endSize` | `S` \| `M` | `M` | Trailing slot size. |
| `slotAlignment` | `centre` \| `top` | `centre` | Slot vertical alignment. When supportText is absent, the row single-lines regardless. |
| `container` | `fullWidth` \| `inset` | `fullWidth` | Row container style. |
| `selected` | `false` \| `medium` \| `high` | `false` | Selected emphasis. `high` re-anchors the row onto a bold surface via [data-surface]. |
| `divider` | `none` \| `full` \| `inset` | `none` | Bottom hairline style. Auto-suppresses on the last row via :last-child. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent appearance role. |
| `disabled` | `boolean` | `false` | Disable interaction and apply reduced-opacity token. |
| `href` | `string` | — | When set, renders as <a>. |
| `aria-label` | `string` | — | Accessible name — required when `title` is non-textual. |

**Slots:**
- `start`: Leading content slot (icon / avatar / badge). (accepts: Icon, Avatar, Badge, CounterBadge, IndicatorBadge)
- `end`: Trailing content slot (chevron / icon). (accepts: Icon, IconButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### List Item Group

Stacks <ListItem> children vertically. Optional top edge-to-edge hairline (sectionDivider), inset rounded-card framing (container="inset"), and a uniform inter-row divider style propagated to all children (per-row override wins).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | <ListItem> children. Optional — empty groups are valid. |
| `sectionDivider` | `boolean` | `true` | Top edge-to-edge hairline above the first row. |
| `container` | `fullWidth` \| `inset` | `fullWidth` | Container framing. |
| `divider` | `none` \| `full` \| `inset` | `inset` | Inter-row divider style injected into all <ListItem> children. Per-child `divider` prop overrides. |
| `role` | `group` \| `list` \| `menu` | `group` | Group landmark role. |
| `aria-label` | `string` | — | Accessible name for the group landmark. |

**Slots:**
- `children`: <ListItem> children. (accepts: ListItem)

*Surface-aware: adapts automatically on colored backgrounds.*

### Logo

A visual mark that identifies and reinforces brand identity throughout the interface. Transparent size container — the SVG content controls its own shape and colors. Inside a BrandProvider, `<Logo alt="…" />` renders the active brand's logo automatically; pass children / svgContent / src only to override it.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `mark` \| `full` | `mark` | Circular mark or full rectangular wordmark |
| `size` | `xs` \| `s` \| `m` \| `l` \| `xl` \| `custom` | `m` | Size preset |
| `customSize` | `number` | — | Custom size in pixels (only when size="custom") |
| `alt` | `string` | — | Accessible alt text describing the brand |
| `src` | `string` | — | Image source URL for raster/external logos |
| `svgContent` | `string` | — | Raw SVG markup string (e.g., from Convex brand.logoSvg) |

**Slots:**
- `children`: Logo content as React node (SVG element, icon, etc.)

### Text

Inline / block text. Six typography roles with role-specific size scales, canonical multi-accent appearance, attention levels, italic / underline / strikethrough, latin / multi-script font fallback, and line-clamp truncation. Defaults to `span`; set `as` for headings or anchors. When using the `text` prop with the `link` slot, avoid `aria-hidden` on the root unless the link is decorative — the slot remains focusable.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `display` \| `headline` \| `title` \| `body` \| `label` \| `code` | `body` | Typography role |
| `size` | `enum` | `M` | Size step — valid values depend on `variant` (matches foundation `TYPOGRAPHY_SIZES`). |
| `weight` | `high` \| `medium` \| `low` | `high` | Emphasis weight (body / label / code only) |
| `attention` | `none` \| `high` \| `medium` \| `low` \| `tintedA11y` | `none` | Colour prominence |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Colour role (multi-accent) |
| `italic` | `boolean` | `false` | Render in italic |
| `underline` | `boolean` | `false` | Underline text |
| `strikethrough` | `boolean` | `false` | Strike-through text |
| `language` | `latin` \| `others` | `latin` | Deprecated compatibility switch — prefer `lang` or `script` |
| `lang` | `string` | — | BCP 47 language tag; enables matching script typography context |
| `script` | `devanagari` \| `bengali` \| `gujarati` \| `gurmukhi` \| `kannada` \| `malayalam` \| `oriya` \| `tamil` \| `telugu` \| `arabic` | — | Explicit script typography profile |
| `scriptMode` | `ui` \| `reading` | `ui` | Script font profile: compact UI or roomier reading |
| `textAlign` | `left` \| `center` \| `right` | — | Block text alignment |
| `maxLines` | `number` | — | Truncate to N visual lines (1 = single-line ellipsis) |
| `as` | `string` | — | Polymorphic element (default `span`). Use `h1`–`h6` for headings, `a` with `href` for links, `code` for monospace semantics. |
| `href` | `string` | — | When `as="a"`, anchor destination |
| `text` | `string` | `` | Text content (alias for children) |

**Slots:**
- `link`: Optional link rendered inline after the text content

*Surface-aware: adapts automatically on colored backgrounds.*

## Navigation

### Bottom Navigation

App-level bottom navigation bar. Accepts 2–5 <BottomNavItem> children with a shared `labelType` (none / 1line / 2line). Supports controlled or uncontrolled active value, multi-accent appearance roles, and an optional top hairline divider.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | 2–5 <BottomNavItem> children. |
| `labelType` | `none` \| `1line` \| `2line` | `1line` | Label layout for all items. |
| `value` | `string` | — | Controlled active item value. Match `value` on a child <BottomNavItem>. |
| `defaultValue` | `string` | — | Uncontrolled initial active item value. |
| `showDivider` | `boolean` | `true` | Show the top edge-to-edge hairline divider. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent role applied to all child items. |
| `aria-label` | `string` | — | Accessible name for the <nav> landmark. |

**Slots:**
- `children`: 2–5 <BottomNavItem> children. (accepts: BottomNavItem)

*Surface-aware: adapts automatically on colored backgrounds.*

### Carousel

Multi-brand carousel micropattern. Wraps Embla Carousel under a compound API (Root / Viewport / Track / Slide / Controls / IndicatorList / Prev/Next/PlayButton). Slides are layered compositions: image + scrim + content (badge / headline / body / button group) + corner slots. Surface-context-aware so content remaps tokens on tinted or dark slides.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | — | Required region label for assistive tech (set on Carousel.Root). |
| `autoPlay` | `number` | `false` | Autoplay delay in ms; pass `false` to disable. |
| `fullWidth` | `boolean` | `false` | Render edge-to-edge, dropping container padding. |
| `aspectRatio` | `3:4` \| `9:16` \| `1:1` \| `4:3` \| `16:9` \| `flexible` | `16:9` | Per-slide aspect ratio |
| `alignment` | `startBottom` \| `startMiddle` \| `middleBottom` | `startBottom` | Slide.Content placement within the slide |
| `controls` | `below` \| `onMedia` | `below` | Carousel.Controls placement (omit Controls altogether for `none`) |

**Slots:**
- `image`: Slide.Image — primary media for a slide. Use `scrim` for legibility. (accepts: Image, Video)
- `content`: Slide.Content — overlay block for badge / headline / body / actions. (accepts: Badge, Headline, Body, ButtonGroup)
- `cornerStart`: Top-left slot for badges, icon buttons, etc. (accepts: Badge, IconButton)
- `cornerEnd`: Top-right slot — common host for the Carousel.PlayButton. (accepts: Badge, IconButton, PlayButton)
- `controls`: Carousel.Controls children — Prev, IndicatorList, Next, Play. (accepts: PrevButton, NextButton, IndicatorList, PlayButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### Pagination

Composite numbered page navigator. Renders prev/next + first/last buttons, a windowed list of page numbers, and ellipses where gaps exist — the standard MUI / shadcn / Ant Design pattern, adapted to OneUI tokens, surface-context-awareness, and the high/medium/low attention vocabulary. Uncontrolled by default (`defaultPage`); pass `page` + `onPageChange` for controlled mode. WAI-ARIA navigation landmark with roving-tabindex keyboard navigation and a polite live region announcing page changes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalPages` | `number` | — | Total number of pages. Required. Values < 1 render an empty navigation landmark. |
| `page` | `number` | — | Controlled current page (1-based). |
| `defaultPage` | `number` | `1` | Default current page (1-based) when uncontrolled. |
| `siblingCount` | `number` | `1` | Number of always-visible page numbers immediately around the current page. Higher = wider window between ellipses. |
| `boundaryCount` | `number` | `1` | Number of always-visible page numbers at the very start AND end of the sequence. |
| `showPrevNext` | `boolean` | `true` | Show the previous-page / next-page arrow buttons. |
| `showFirstLast` | `boolean` | `false` | Show first-page / last-page jump buttons (semantic `firstPage` / `lastPage` icons). |
| `attention` | `high` \| `medium` \| `low` | `medium` | Figma attention for the **selected** page chip only: high→bold fill, medium→subtle fill, low→ghost. Nav + ellipsis stay ghost + low attention; inactive page numerals stay ghost with high-emphasis colour. |
| `size` | `S` \| `M` \| `L` | `M` | T-shirt size for page chips, nav controls, and ellipsis. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent appearance role. `auto` resolves to `primary`. |
| `disabled` | `boolean` | `false` | Disable the entire control. |
| `aria-label` | `string` | `Pagination` | Accessible label for the navigation landmark. |

*Surface-aware: adapts automatically on colored backgrounds.*

### Pagination Dots

Windowed pagination indicator for carousels and multi-page content. Shows a fixed window of dots that scroll with the active index. Edge dots shrink to signal more content on either side. Supports loop (infinite) and non-loop (end-grow) modes. Fully accessible: roving tabindex, keyboard nav, aria-selected.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageCount` | `number` | — | Total number of pages / items to represent. |
| `activeIndex` | `number` | — | Controlled active index. |
| `defaultActiveIndex` | `number` | `0` | Default active index (uncontrolled). |
| `loop` | `boolean` | `false` | Loop mode. `true` = infinite windowed scroll; `false` = finite sequence with end-grow on the last dot. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent appearance role. `auto` resolves to `primary`. |
| `readOnly` | `boolean` | `false` | When true, dots are non-interactive and the root uses `role="status" aria-live="polite"` to mirror a parent carousel. |

*Surface-aware: adapts automatically on colored backgrounds.*

### Tabs

Accessible tabbed navigation. Uses Base UI Tabs primitive for keyboard navigation, arrow/Home/End keys, and automatic focus management. Three sizes (S/M/L), two orientations (horizontal/vertical). Matching Figma spec: selected tab gets an animated tinted indicator, tinted-accessible label color, and a surface-aware double-ring focus halo. Supports start + end content slots; icon + badge are legacy aliases.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `s` \| `m` \| `l` | `m` | TabGroup / TabItem size |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Layout orientation — horizontal (bottom indicator) or vertical (left-edge indicator) |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `primary` | Multi-accent appearance role |
| `activateOnFocus` | `boolean` | `false` | Change the active tab when a tab receives focus (Base UI). Default false = activate on Enter/Space. |
| `loopFocus` | `boolean` | `true` | Arrow-key focus loops from last to first tab (Base UI) |
| `disabled` | `boolean` | `false` | Disable a TabItem |

**Slots:**
- `start`: Leading content on a TabItem (Icon, Avatar, CounterBadge, IndicatorBadge). Alias: `icon`. (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)
- `end`: Trailing content on a TabItem (Icon, Avatar, CounterBadge, IndicatorBadge). Alias: `badge`. (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)

*Surface-aware: adapts automatically on colored backgrounds.*

### Web Header

Responsive web navigation header with primary nav bar, secondary nav tabs, mobile drawer, search, and scroll-based show/hide.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `default` \| `transparent` \| `glass` \| `hidden` \| `stickyHidden` | `default` | Visual style — default (sticky), transparent (fixed overlay), glass (frosted), hidden, stickyHidden |
| `type` | `homeBar` \| `contextBar` \| `searchBar` | `homeBar` | Bar purpose — homeBar (nav items), contextBar (simpler), searchBar (search-focused) |
| `middle` | `fluid` \| `centred` \| `none` | `fluid` | Middle section layout — fluid (fills space) or centred (absolute center) |
| `searchInput` | `none` \| `middle` \| `end` | `none` | Search input position — none (hidden), middle (with nav items), end (in actions area) |
| `showMenuButton` | `boolean` | `false` | Show hamburger menu icon button |
| `primaryNavItems` | `boolean` | `true` | Show/hide nav items in middle section |
| `divider` | `boolean` | `true` | Show/hide bottom divider |
| `breakpoint` | `S` \| `M` \| `L` | — | Responsive breakpoint (auto-detected by default) |

**Slots:**
- `logo`: Product logo in the start section (use Logo component) (accepts: Logo)
- `avatar`: User avatar in the end section (use Avatar component) (accepts: Avatar)
- `end`: End action buttons (use IconButton components) (accepts: IconButton)
- `children`: Navigation items (use WebHeader.Item) (accepts: HeaderItem)
- `start`: Start content on WebHeader.Item (Icon, Avatar, CounterBadge, IndicatorBadge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)
- `end`: End content on WebHeader.Item (Icon, Avatar, CounterBadge, IndicatorBadge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)

## Actions

### Button

Interactive button with high/medium/low attention levels, multi-accent support, and start/end content slots.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | — |  |
| `aria-pressed` | `object` | — |  |
| `aria-expanded` | `object` | — |  |
| `aria-controls` | `string` | — |  |
| `aria-describedby` | `string` | — |  |
| `aria-haspopup` | `object` | — |  |
| `children` | `ReactNode` | — |  |
| `attention` | `high` \| `medium` \| `low` | `high` | Emphasis level — high (bold fill), medium (subtle/tinted fill), low (ghost, text-only).
Drives the visual treatment; the component derives the internal variant + `data-variant` from this. |
| `size` | `xs` \| `s` \| `m` \| `l` \| `6` \| `8` \| `10` \| `12` | `10` | Button size — f-step number or t-shirt alias. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `contained` | `boolean` | `true` | Whether the button renders in its contained form (filled pill with a
state-layer wrapper) or its uncontained form (transparent, underlined,
text-link style). Mirrors the Figma `Contained` variant property on the
Button component set. Props that only make sense for the contained form
(`condensed`, `fullWidth`, `decoration`) are ignored when
`contained={false}`. |
| `condensed` | `boolean` | `false` | Condensed mode: reduces height and horizontal padding while keeping the same typography.
Use for dense layouts, inline actions, and compact UI areas. NOT the same as using a smaller size.
Only applies when `contained={true}`. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width. |
| `disabled` | `boolean` | `false` |  |
| `loading` | `boolean` | `false` |  |
| `start` | `ReactNode` | — | Content before the label. Pass a semantic icon name (string) for automatic color-inheriting
 icon rendering, or any ReactNode for custom content. |
| `end` | `ReactNode` | — | Content after the label. Pass a semantic icon name (string) for automatic color-inheriting
 icon rendering, or any ReactNode for custom content. |
| `decoration` | `object` | — | Direct decoration config — overrides DecorationContext.
 Use in Storybook stories or tests where context may not propagate. |
| `type` | `button` \| `submit` \| `reset` | — | HTML button type attribute |
| `data-testid` | `string` | — | Test selector passthrough |

**Brand-customizable:** `attention`, `contained`

**Slots:**
- `start`: Content rendered before the button label (icon, avatar, badge) (accepts: Icon, Avatar)
- `end`: Content rendered after the button label (icon, avatar, badge) (accepts: Icon, Avatar)

*Surface-aware: adapts automatically on colored backgrounds.*

### Chip

Interactive toggleable pill element for filtering, selection, and categorization. Uses Base UI Toggle for full accessibility (aria-pressed, keyboard nav). Supports start/end slots for icons, avatars, and badges.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `high` \| `medium` \| `low` | `high` | Emphasis level — high (filled when selected), medium (tinted when selected), low (outlined). |
| `size` | `s` \| `m` \| `l` | `m` | Chip size. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `secondary` | Multi-accent appearance role |
| `selected` | `boolean` | `false` | Whether the chip is selected (controlled) |
| `disabled` | `boolean` | `false` | Whether the chip is disabled |

**Brand-customizable:** `attention`

**Slots:**
- `start`: Content before the label (Icon, Avatar, CounterBadge, IndicatorBadge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)
- `end`: Content after the label (Icon, Avatar, CounterBadge, IndicatorBadge) (accepts: Icon, Avatar, CounterBadge, IndicatorBadge)

*Surface-aware: adapts automatically on colored backgrounds.*

### Chip Group

Groups multiple Chip components with shared selection state, keyboard navigation, and layout. Supports single-select (default) and multi-select modes. Propagates size, attention, and appearance to all child Chips.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple chips to be selected simultaneously |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Stack direction of the chip group |
| `wrap` | `boolean` | `true` | Whether chips wrap to the next line when they overflow |
| `size` | `s` \| `m` \| `l` | `m` | Size propagated to all child Chips (chip-level prop wins if set) |
| `attention` | `high` \| `medium` \| `low` | `high` | Emphasis level propagated to all child Chips — high (filled when selected), medium (tinted when selected), low (outlined). |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `secondary` | Appearance role propagated to all child Chips |
| `maxSelections` | `number` | — | Maximum number of chips that can be selected (multi-select only) |
| `required` | `boolean` | `false` | Prevent deselecting the last selected chip |
| `disabled` | `boolean` | `false` | Disable all chips in the group |
| `loopFocus` | `boolean` | `true` | Loop keyboard focus from last chip back to first |

**Brand-customizable:** `attention`

**Slots:**
- `children`: Chip components to group (accepts: Chip)

### FAB

Floating Action Button — elevated primary action that lifts above the page. Circular when no label is present; pill-shaped when extended with a label. Supports 3 sizes (small/medium/large), 3 variants (primary/secondary/surface), and optional on-screen fixed positioning.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | — | Icon displayed in the FAB. Accepts a semantic icon name (string) or any ReactElement. |
| `label` | `ReactNode` | — | Optional label text. When provided, the FAB renders as an extended pill. |
| `variant` | `primary` \| `secondary` \| `surface` | `primary` | Visual variant affecting colors. |
| `size` | `small` \| `medium` \| `large` | `medium` | Size affecting dimensions. |
| `position` | `bottom-right` \| `bottom-left` \| `bottom-center` | — | On-screen anchor. Only applies when the FAB is positioned fixed. |
| `disabled` | `boolean` | `false` | Disabled state. |
| `loading` | `boolean` | `false` | Loading state (shows spinner, disables interaction). |
| `aria-label` | `string` | — | Accessible label. Required when no `label` prop is provided. |

*Surface-aware: adapts automatically on colored backgrounds.*

### Icon Button

Icon-only button with contained/uncontained modes, bold/subtle/ghost attention, 6 sizes, 1:1 or 3:2 layout, and multi-accent support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `high` \| `medium` \| `low` | `high` | Attention level — high (bold), medium (subtle), low (ghost) |
| `size` | `4` \| `6` \| `8` \| `10` \| `12` \| `14` \| `2xs` \| `xs` \| `s` \| `m` \| `l` \| `xl` | `10` | Icon button size (f-step) |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `layout` | `1:1` \| `3:2` | `1:1` | Shape layout — square (1:1) or wide rectangle (3:2). Only when contained=true. |
| `contained` | `boolean` | `true` | When true (default), renders a contained icon chip with background and sized container. When false, icon only — no chip. condensed, fullWidth, and 3:2 layout only apply when contained=true. |
| `condensed` | `boolean` | `false` | Reduces container while keeping icon size. Only when contained=true. |
| `icon` | `string` | `star` | Semantic icon name (e.g., "star", "add", "close", "settings") |
| `disabled` | `boolean` | `false` |  |
| `loading` | `boolean` | `false` |  |

**Brand-customizable:** `attention`, `contained`

*Surface-aware: adapts automatically on colored backgrounds.*

### Selectable Button

Toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost with accent border. Supports contained (pill) and uncontained (inline text) modes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `boolean` | `false` | Whether the button is selected (controlled) |
| `attention` | `high` \| `medium` \| `low` | `high` | Attention level — drives the SELECTED visual. high=bold fill, medium=subtle fill, low=ghost+accent border. Default: high. |
| `size` | `xs` \| `s` \| `m` \| `l` | `m` | Button size. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. Default: primary. |
| `contained` | `boolean` | `true` | When true (default), renders a pill container. When false, renders inline text/icon only — no background, border, or padding. |
| `condensed` | `boolean` | `false` | Condensed mode: reduces height and padding. Only applies when contained=true. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width. Only applies when contained=true. |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Loading state — disables interaction |

**Slots:**
- `start`: Content before the label (Icon) (accepts: Icon)
- `end`: Content after the label (Icon) (accepts: Icon)

*Surface-aware: adapts automatically on colored backgrounds.*

### Selectable Icon Button

Icon-only toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost with accent border. 6 sizes (2XS-XL), condensed mode, 1:1/2:3 shape proportions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `boolean` | `false` | Whether the button is selected (controlled) |
| `attention` | `high` \| `medium` \| `low` | `high` | Attention level — drives the SELECTED visual. high=bold fill, medium=subtle fill, low=ghost+accent border. Default: high. |
| `size` | `4` \| `6` \| `8` \| `10` \| `12` \| `14` \| `2xs` \| `xs` \| `s` \| `m` \| `l` \| `xl` | `10` | Icon button size (f-step). Default: 10 (M). |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. Default: primary. |
| `shape` | `1:1` \| `2:3` | `1:1` | Shape proportion — square (1:1) or wide rectangle (2:3) |
| `contained` | `boolean` | `true` | When true (default), renders contained icon button. When false, icon only — no background, border, or fixed size. |
| `condensed` | `boolean` | `false` | Reduces container while keeping icon size. Only applies when contained=true. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width. Only applies when contained=true. |
| `icon` | `string` | `star` | Semantic icon name or React element |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Loading state — shows spinner, disables interaction |

*Surface-aware: adapts automatically on colored backgrounds.*

### Selectable Single Text Button

Circular single-text toggle button (max 2 characters, e.g. "Ag", "En"). Stays selected after click. Unselected state is always muted ghost. Selected appearance driven by attention: high=bold fill, medium=subtle fill, low=ghost+accent border. 3 sizes (S/M/L). Shape customisable per brand.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `boolean` | `false` | Whether the button is selected (controlled) |
| `attention` | `high` \| `medium` \| `low` | `high` | Attention level — drives the SELECTED visual. high=bold fill, medium=subtle fill, low=ghost+accent border. Default: high. |
| `size` | `s` \| `m` \| `l` | `m` | Button size. S/M/L only. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. Default: primary. |
| `condensed` | `boolean` | `false` | Condensed mode: reduces height and padding while keeping same typography. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width. |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Loading state — shows circular spinner and disables interaction |

*Surface-aware: adapts automatically on colored backgrounds.*

### Segmented Control

Mutually exclusive segmented control for switching between related views or filters. Wraps Base UI ToggleGroup. Supports track emphasis, attention-driven selected states, equal-width layout, text and icon-only segments, and start (icon) / end (CounterBadge) slots.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled selected segment value |
| `defaultValue` | `string` | — | Uncontrolled initial selected value |
| `size` | `s` \| `m` \| `l` | `m` | Segment size propagated to all items |
| `attention` | `high` \| `medium` \| `low` | `high` | Selected segment visual prominence. low uses auto(neutral): parent Surface appearance ?? neutral (same as track). |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Active segment colour role for high/medium attention. auto = parent Surface → primary. When attention is low, selected role follows auto(neutral): parent Surface ?? neutral. |
| `shape` | `pill` \| `rectangular` | `pill` | Track and segment corner shape |
| `equalWidth` | `boolean` | `true` | Distribute equal width to all segments |
| `trackEmphasis` | `high` \| `medium` \| `low` | `high` | Track (container) background prominence |
| `type` | `text` \| `icon` | `text` | Text labels or icon-only layout (`start` icon per item, labels hidden) |
| `disabled` | `boolean` | `false` | Disable the entire control |

**Brand-customizable:** `size`, `shape`

**Slots:**
- `children`: SegmentedControl.Item components (accepts: SegmentedControl.Item)

*Surface-aware: adapts automatically on colored backgrounds.*

### Single Text Button

Circular single-text action button (max 2 characters, e.g. "Ag", "En"). Attention level drives the visual: high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L). Shape customisable per brand.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `high` \| `medium` \| `low` | `high` | Attention level — drives the visual. high=bold fill, medium=subtle fill, low=ghost. Default: high. |
| `size` | `s` \| `m` \| `l` | `m` | Button size. S/M/L only. Default: m. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `tertiary` \| `quaternary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. Default: primary. |
| `condensed` | `boolean` | `false` | Condensed mode: reduces height and padding while keeping same typography. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width (overrides circular shape). |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Loading state — shows spinner and disables interaction |

*Surface-aware: adapts automatically on colored backgrounds.*

## Inputs

### Chat Composer

Controlled prompt composer with autosizing textarea, optional action slots, display-only model label, and suggestion actions. Enter submits; Shift+Enter inserts a newline.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled textarea value. |
| `placeholder` | `string` | `How can I help you today?` | Textarea placeholder. |
| `disabled` | `boolean` | `false` | Disables the textarea and suggestion actions. |
| `autoFocus` | `boolean` | `false` | Focuses the textarea on mount. |
| `modelLabel` | `string` | — | Display-only model label rendered in the action bar. |
| `suggestions` | `object` | — | Optional suggestion actions rendered below the composer. |

**Slots:**
- `leading`: Left-most action bar content, typically an attach button. (accepts: Button, IconButton)
- `leadingInline`: Inline content before the model label, such as a mode picker. (accepts: Button, Chip, custom)
- `trailing`: Right-most action bar content, typically mic and send controls. (accepts: Button, IconButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### Checkbox

Selection control with checked, unchecked, and indeterminate states; colour comes from the appearance role.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `s` \| `m` \| `l` | `m` | Checkbox size |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Appearance role (border, hover, and fill including checked) |
| `label` | `string` | — | Visible label beside the control |
| `description` | `string` | — | Supplementary copy below the label row |
| `checked` | `boolean` | — | Controlled checked state |
| `indeterminate` | `boolean` | `false` | Indeterminate (mixed) state |
| `disabled` | `boolean` | `false` |  |

*Surface-aware: adapts automatically on colored backgrounds.*

### Checkbox Field

`Field.Root` + **Checkbox** with integrated `Field.Label` / `Field.Description`, optional `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same composition contract as **InputField** (Figma `.DNA/InputField` stack; control DNA from Checkbox). Colour follows `appearance` on the inner Checkbox.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text (field header in multi-option mode; integrated label beside control when no children) |
| `description` | `string` | — | Description under the label row |
| `size` | `s` \| `m` \| `l` | `m` | S / M / L — scales Checkbox, label stack, InputFeedback |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Appearance role (forwarded to Checkbox) |
| `checked` | `boolean` | — | Controlled checked |
| `defaultChecked` | `boolean` | — | Uncontrolled default checked |
| `indeterminate` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |
| `disabled` | `boolean` | `false` |  |
| `required` | `boolean` | — | Required + asterisk when label is set |
| `invalid` | `boolean` | — | Invalid state for `Field.Root` + error chrome |
| `error` | `string` | — | Shorthand negative `InputFeedback` message |
| `id` | `string` | — | HTML id on the checkbox control |
| `name` | `string` | — | Form name |
| `value` | `string` | — | Checkbox value when grouped |
| `groupValue` | `object` | — | Multi-option controlled selected values (`string[]`). Use with `children`. |
| `groupDefaultValue` | `object` | — | Multi-option uncontrolled default values (`string[]`). Use with `children`. |

**Slots:**
- `feedback`: `InputFeedback` or custom node (accepts: InputFeedback)
- `infoIconSlot`: Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`) (accepts: IconButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### Input Field

Text input field: `Field.Root` + **Input** (`Field.Label` / `Field.Description` for label-stack copy, `Field.Control` for the `<input>`, 4-slot shell), then `InputFeedback` (including native `Field.Error` when there is no string `error` / custom `feedback`), and DynamicText. Default info uses `IconButton` + `Tooltip` (override with `infoIconSlot`). Optional `labelSlot` replaces string `label` / `description`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `xs` \| `s` \| `m` \| `l` | `m` | Component size — XS, S, M, L. |
| `appearance` | `auto` \| `secondary` \| `primary` \| `neutral` \| `sparkle` \| `positive` \| `negative` \| `warning` \| `informative` | `secondary` | Multi-accent appearance role |
| `shape` | `default` \| `pill` | `default` | Shape of the input container — default (rounded) or pill (fully rounded) |
| `invalid` | `boolean` | `false` | Marks the field invalid for `Field.Root` and error border on the control (pair with `error` or `feedback` for messaging). |
| `infoIcon` | `boolean` | `false` | When true with a string `label`, shows the default info `IconButton` + tooltip unless `infoIconSlot` is set. |
| `infoIconSlot` | `ReactNode` | — | Replaces the default info control when `infoIcon` is true. |
| `infoTooltipContent` | `ReactNode` | — | Tooltip content for the default info control. Ignored when `infoIconSlot` is set. |
| `infoIconAriaLabel` | `string` | `More information` | Accessible name for the default info `IconButton`. Ignored when `infoIconSlot` is set. |
| `dynamicTextSlot` | `ReactNode` | — | Dynamic text row slot — pass `<InputDynamicText … />`. When set, `dynamicText` and `helperButton` are ignored. |
| `label` | `string` | — | Label text for the field (ignored when `labelSlot` is set) |
| `description` | `string` | — | Description text below the label row (ignored when `labelSlot` is set) |
| `placeholder` | `string` | — | Placeholder text displayed when the input is empty |
| `type` | `text` \| `email` \| `password` \| `number` \| `tel` \| `url` \| `search` | `text` | HTML input type |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | Read-only state |
| `required` | `boolean` | `false` | Whether the field is required (adds * to label) |
| `error` | `string` | — | Error message (renders InputFeedback variant="negative") |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width |

**Slots:**
- `labelSlot`: Optional custom label row (`ReactNode`, same `Field.Root`); replaces string `label` / `description` (accepts: Field.Label, Text)
- `start`: Leading content — Icon, IconButton, Avatar, Image, ChipGroup, or Text (accepts: Icon, IconButton, Avatar, Image, ChipGroup, Text)
- `start2`: Second leading content — Text only (prefix, currency symbol) (accepts: Text)
- `end`: Trailing content — IconButton, Icon, Button, or Text (accepts: IconButton, Icon, Button, Text)
- `end2`: Second trailing content — Text, Icon, or IconButton (accepts: Text, Icon, IconButton)
- `feedback`: Feedback slot — pass `<InputFeedback />` or rely on `error` string (accepts: InputFeedback)
- `dynamicTextSlot`: Optional `<InputDynamicText />` replacing `dynamicText` / `helperButton` strings (accepts: InputDynamicText)
- `dynamicText`: Leading DynamicText copy (non-empty trimmed string) (accepts: Text)
- `helperButton`: Trailing action label (non-empty trimmed string); renders as `Button` attention low + condensed inside `InputDynamicText` (accepts: Text)

*Surface-aware: adapts automatically on colored backgrounds.*

### Radio

Selection control for a single choice within a group; colour comes from the appearance role.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `s` \| `m` \| `l` | `m` | Radio size |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Appearance role (border, hover, and fill including checked state) |
| `checked` | `boolean` | `false` | Accepted for documentation/tooling only; selection is determined by RadioGroup value matching `value`. |
| `value` | `string` | — | Value for the radio option |
| `disabled` | `boolean` | `false` |  |
| `label` | `string` | — | Visible label beside the control |
| `description` | `string` | — | Supplementary copy below the label row |

*Surface-aware: adapts automatically on colored backgrounds.*

### Radio Field

`Field.Root` + **RadioGroup** with optional `Field.Label` / `Field.Description`, `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same shell as **InputField** / **CheckboxField**. Integrated single mode has no `Radio` children; colour follows **`appearance`** on inner radios.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label (integrated single) or group legend (multi-option) |
| `description` | `string` | — | Description under the label row |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Appearance role (forwarded to each `Radio`) |
| `value` | `string` | — | Controlled selected value (group or integrated single string) |
| `defaultValue` | `string` | — | Uncontrolled default value |
| `checked` | `boolean` | — | Integrated single only — controlled on/off (`true` = selected `singleOptionValue`) |
| `defaultChecked` | `boolean` | — | Integrated single only — uncontrolled default on/off (overrides `defaultValue` when `value` unset) |
| `singleOptionValue` | `string` | — | Integrated single — submitted value when 'on' (default `on`) |
| `name` | `string` | — | Form name |
| `orientation` | `vertical` \| `horizontal` | — |  |
| `size` | `s` \| `m` \| `l` | — |  |
| `invalid` | `boolean` | — |  |
| `error` | `string` | — |  |
| `required` | `boolean` | — |  |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width. |
| `validationMode` | `onBlur` \| `onChange` | — | Validation timing for `Field.Root`. |

**Slots:**
- `children`: `Radio` options (omit for integrated single) (accepts: Radio)
- `feedback`: `InputFeedback` (accepts: InputFeedback)
- `infoIconSlot`: Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`) (accepts: IconButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### Slider

Precision range input. Multi-accent appearance, inside/outside knob styles, optional step ticks, and a value tooltip that follows the thumb.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. Drives fill + knob colours. |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Slider orientation |
| `knobStyle` | `outside` \| `inside` | `outside` | Knob placement. Outside = solid circle on thin rail; inside = white dot inside a thicker accent track. |
| `showTooltip` | `auto` \| `always` \| `false` | `auto` | Value tooltip visibility |
| `showSteps` | `boolean` | `false` | Render tick marks at every step |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `disabled` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |

**Slots:**
- `start`: Node rendered at the start of the slider (e.g. an IconButton).
- `end`: Node rendered at the end of the slider (e.g. an IconButton).

*Surface-aware: adapts automatically on colored backgrounds.*

### Stepper

Numeric stepper for increasing/decreasing values in small increments, with pill shape and multi-accent support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `s` \| `m` \| `l` | `m` | Stepper size |
| `attention` | `high` \| `medium` \| `low` | `medium` | Attention level (visual weight) |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. auto or omit: inherit nearest Surface effective role, else secondary at page root. |
| `value` | `number` | — | Controlled value |
| `condensed` | `boolean` | `false` | Use condensed height |
| `direction` | `ltr` \| `rtl` | `ltr` | Visual layout direction. ltr keeps decrement on the left and increment on the right; rtl mirrors the visual order. |
| `disabled` | `boolean` | `false` |  |
| `start` | `ReactNode` | — | Decrement control. Single IconButton element — receives NumberField props/ref via Base UI render. |
| `end` | `ReactNode` | — | Increment control. Single IconButton element — receives NumberField props/ref via Base UI render. |

**Slots:**
- `start`: Decrement control; icon-only slots typically `<IconButton variant="ghost" />`. (accepts: IconButton)
- `end`: Increment control; icon-only slots typically `<IconButton variant="ghost" />`. (accepts: IconButton)

*Surface-aware: adapts automatically on colored backgrounds.*

### Switch

Toggle control for on/off states, with pill shape default and multi-accent support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `s` \| `m` \| `l` | `m` | Switch size |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role. `auto` or omit → secondary. Sets checked fill, context tokens, and unchecked rail tint (`--{Role}-Subtle`). |
| `checked` | `boolean` | — | Controlled checked state |
| `disabled` | `boolean` | `false` |  |
| `children` | `ReactNode` | — | Label text |
| `data-testid` | `string` | — | Forwarded to the root switch element for QA / e2e |

*Surface-aware: adapts automatically on colored backgrounds.*

### Touch Slider

Chunky fingertip-friendly slider. The track is the tap target; the fill represents the value. Ideal for touch devices, TV remotes, and large-target contexts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Slider orientation |
| `progressStyle` | `rounded` \| `sharp` | `rounded` | Fill corner style |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `disabled` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |

**Slots:**
- `start`: Node rendered at the start of the slider (e.g. an IconButton).

*Surface-aware: adapts automatically on colored backgrounds.*

## Layout

### Container

Page-width shell (`fluid` / `fixed` / `full-bleed`) and declarative layout root. On web the node is always `<Surface>` (default `surface="ghost"`) so children get `[data-surface]` token context without an opaque page fill. Omit `layout` for normal block flow; set `layout` to `flex` or `grid` for token-backed flex/grid. Spacing props use spacing scale keys, not raw px.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Main content (default slot). |
| `variant` | `fluid` \| `fixed` \| `full-bleed` | `fluid` | `fluid`: viewport width + `--Grid-Margin`. `fixed`: centered cap at `--Grid-MaxWidth` (or `maxWidth`). `full-bleed`: edge-to-edge. |
| `maxWidth` | `string` | — | With `variant="fixed"`: number or string sets `--_container-max-width`; otherwise token size preset or CSS length on the element. See `resolveContainerMaxWidth`. |
| `as` | `string` | `div` | Polymorphic root element forwarded to `<Surface as>` (default `div`). |
| `surface` | `default` \| `ghost` \| `minimal` \| `subtle` \| `moderate` \| `bold` \| `elevated` | `ghost` | Root `<Surface mode>` — drives `[data-surface]` remapping for descendants. |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `brand-bg` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent role on the root `<Surface>`. |
| `layout` | `flex` \| `grid` | — | Omit for **block flow** (no `display` flex/grid). `flex` or `grid` sets display and layout props on the root. |
| `direction` | `row` \| `column` | `row` | `flex-direction` when `layout="flex"` (ignored for grid). |
| `wrap` | `boolean` | — | `flex-wrap: wrap` when true; `nowrap` when false (flex only). |
| `justify` | `start` \| `center` \| `end` \| `space-between` \| `space-around` \| `space-evenly` \| `stretch` | — | `justify-content` when `layout` is `flex` or `grid`. |
| `align` | `start` \| `center` \| `end` \| `stretch` \| `baseline` | — | `align-items` when `layout` is `flex` or `grid`. |
| `alignSelf` | `start` \| `center` \| `end` \| `stretch` \| `baseline` | — | `align-self` when this `Container` is a flex/grid child (e.g. center one column). |
| `columns` | `number` | — | `grid-template-columns: repeat(n, minmax(0, 1fr))` when `layout="grid"` and n > 0. |
| `rows` | `number` | — | `grid-template-rows: repeat(n, minmax(0, 1fr))` when `layout="grid"` and n > 0. |
| `padding` | `string` | — | Uniform padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `paddingX` | `string` | — | Horizontal padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) Used when `padding` is unset. |
| `paddingY` | `string` | — | Vertical padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) Used when `padding` is unset. |
| `paddingTop` | `string` | — | Per-side padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) Overrides that edge after `padding` / axis props. |
| `paddingRight` | `string` | — | Per-side padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `paddingBottom` | `string` | — | Per-side padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `paddingLeft` | `string` | — | Per-side padding (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `gap` | `string` | — | Flex/grid gap (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `rowGap` | `string` | — | Row gap (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `columnGap` | `string` | — | Column gap (`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.) |
| `width` | `string` | — | Width (`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.) |
| `height` | `string` | — | Height (`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.) |
| `minWidth` | `string` | — | Min width (`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.) |
| `minHeight` | `string` | — | Min height (`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.) |
| `maxHeight` | `string` | — | Max height (`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.) |
| `flex` | `string` | — | CSS `flex` shorthand on the root (number or string). Prefer this **or** `grow` / `shrink` / `basis`, not both. |
| `grow` | `number` | — | `flex-grow` when `flex` is omitted. |
| `shrink` | `number` | — | `flex-shrink` when `flex` is omitted. |
| `basis` | `string` | — | `flex-basis` when `flex` is omitted. |
| `position` | `static` \| `relative` \| `absolute` \| `fixed` \| `sticky` | — | CSS `position`. |
| `top` | `string` | — | Offset (token-backed length or valid CSS length string). |
| `right` | `string` | — | Offset (token-backed length or valid CSS length string). |
| `bottom` | `string` | — | Offset (token-backed length or valid CSS length string). |
| `left` | `string` | — | Offset (token-backed length or valid CSS length string). |
| `zIndex` | `number` | — | Stacking order. |
| `overflow` | `visible` \| `hidden` \| `clip` \| `scroll` \| `auto` | — | CSS `overflow`. |
| `fullWidth` | `boolean` | — | Deprecated; consumed so it is not forwarded to the DOM. |
| `className` | `string` | — | Additional class names on the root. |
| `style` | `object` | — | Inline styles merged after generated layout styles. |

**Slots:**
- `children`: Main content; in flex/grid layouts becomes direct flex/grid items unless wrapped.

*Surface-aware: adapts automatically on colored backgrounds.*

### Divider

Visual separator with size, attention, appearance, optional Icon/Text children, and round caps support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Component orientation |
| `size` | `s` \| `m` \| `l` | `m` | Stroke width — S (hairline), M (thin), L (medium) |
| `children` | `ReactNode` | — | Optional centre content — plain string (auto-wrapped in Label XS Medium `<Text />`), `<Icon />`, or `<Text />`. Divider merges `appearance`, `attention`, and Figma sizing (Icon `4`, Label XS) when those props are unset on the child. Omit for a bare separator. |
| `contentAlign` | `center` \| `start` \| `end` | `center` | Position of the centre content |
| `appearance` | `auto` \| `primary` \| `secondary` \| `neutral` \| `sparkle` \| `positive` \| `negative` \| `warning` \| `informative` | `auto` | Multi-accent appearance role |
| `attention` | `high` \| `medium` \| `low` | `low` | Prominence level — high, medium, low |
| `roundCaps` | `boolean` | `false` | Rounded stroke ends |

**Slots:**
- `children`: Centre (or start/end) content between line segments — design-system Icon or Text (accepts: ReactNode, Icon, Text)

*Surface-aware: adapts automatically on colored backgrounds.*

### Grid

Responsive CSS Grid primitive. Column count and gap resolve per-platform via --Grid-Columns and --Grid-Gutter. Children use <Column> with responsive span/start props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `object` | — | Column count override. Accepts a number or a ResponsiveValue<number> keyed by breakpoint. Defaults to --Grid-Columns (per-platform: 4/8/8/12/12). |
| `gap` | `string` | — | Gap override (CSS length). Defaults to --Grid-Gutter. |
| `as` | `string` | `div` | Polymorphic element type (default: "div"). |

### Surface

Container primitive that opts descendants into the OneUI surface cascade via [data-surface]. The `mode` prop maps to one of the 8 canonical surface tokens (default/ghost/minimal/subtle/moderate/bold/elevated/blend). Optional transparent material composites over arbitrary media.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `default` \| `ghost` \| `minimal` \| `subtle` \| `moderate` \| `bold` \| `elevated` \| `blend` | `ghost` | Surface mode — one of the 8 canonical surface tokens. Determines the background fill AND the data-surface context applied to descendants. |
| `material` | `solid` \| `transparent` | `solid` | Resolution pipeline. Omit to use the active Material foundation default. `solid` uses opaque tokens from brand palette. `transparent` pulls from the transparent-material CSS block for compositing over arbitrary media (photo/video hero). |
| `mediaContext` | `dynamic` \| `dark` \| `light` | — | Required when `material="transparent"` is explicit; otherwise inherited from the Material foundation default. Hints the CSS which lookup row to use: `dynamic` (unknown media), `dark`, or `light`. |
| `as` | `string` | `div` | Polymorphic element type (default: "div"). |

*Surface-aware: adapts automatically on colored backgrounds.*

## Overlays

### Modal

Focused overlay with structured header/body/footer layout and scroll management. The modal popup is role-neutral; per-role styling is applied to the slot children (footer buttons, headerStart, body content).

**Slots:**
- `headerStart`: Content rendered before the title in the header (icon or badge) (accepts: Icon, Badge)
- `children`: Main content area (the React children prop) — scrollable when it exceeds the size-specific max-height (S=50vh, M=70vh, L=85vh, FullWidth=100vh−margin; mobile collapses S/M/L to 85vh) (accepts: any)
- `footerStart`: Content rendered at the start of the footer (e.g., a link or checkbox) (accepts: any)
- `footerEnd`: Action buttons in the footer (typically Cancel + Primary action) (accepts: Button)

### Tooltip

Floating hover / focus label that attaches to a trigger element. Supports the Figma position alias (top/topStart/topEnd/...), Base UI side+align, controlled/uncontrolled open state, arrow, portal, and configurable delay.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `top` \| `topStart` \| `topEnd` \| `bottom` \| `bottomStart` \| `bottomEnd` \| `left` \| `leftStart` \| `leftEnd` \| `right` \| `rightStart` \| `rightEnd` | `bottom` | Figma position alias. Maps internally to side + align. If both `position` and `side` are provided, `side`/`align` take precedence. |
| `side` | `top` \| `bottom` \| `left` \| `right` | — | Which side of the trigger to position against. |
| `align` | `start` \| `center` \| `end` | — | Alignment along the chosen side axis. |
| `sideOffset` | `number` | — | Distance from the trigger, in pixels. |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `trigger` | `hover` \| `click` \| `focus` \| `manual` | `hover` | How the tooltip is triggered. |
| `delay` | `number` | — | Delay before showing, in ms. |
| `closeDelay` | `number` | — | Delay before hiding, in ms. |
| `arrow` | `boolean` | `true` | Whether to render the pointing arrow (Figma `tip`). |
| `maxWidth` | `string` | — | Maximum width of the tooltip bubble (CSS length or number). |
| `hoverable` | `boolean` | `true` | Allow hovering over the tooltip body without closing. |
| `disabled` | `boolean` | `false` | Prevent the tooltip from opening. |
| `portal` | `boolean` | `true` | Reserved for API compatibility. Popup always uses Base UI default portal (document.body). |

**Slots:**
- `children`: The trigger element the tooltip attaches to.
- `content`: Text or content displayed inside the tooltip bubble. (accepts: Text, Icon)

*Surface-aware: adapts automatically on colored backgrounds.*

## 5. Component Props Schemas (JSON Schema)

When a schema is available for a component, the LLM MUST emit props that validate against it. Unknown props are rejected by `.strict()` validation. Deprecated enum values are excluded — use the canonical options only.

### Avatar

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "enum": [
        "image",
        "icon",
        "text"
      ]
    },
    "size": {
      "type": "string",
      "enum": [
        "2xs",
        "xs",
        "s",
        "m",
        "l",
        "xl",
        "2xl",
        "custom"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "src": {
      "type": "string"
    },
    "alt": {
      "type": "string"
    },
    "fallback": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "customSize": {
      "type": "number"
    },
    "disabled": {
      "type": "boolean"
    },
    "onPress": {},
    "onClick": {},
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Badge

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "size": {
      "type": "string",
      "enum": [
        "xs",
        "s",
        "m",
        "l"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### BottomNavigation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "labelType": {
      "type": "string",
      "enum": [
        "none",
        "1line",
        "2line"
      ]
    },
    "value": {
      "type": "string"
    },
    "defaultValue": {
      "type": "string"
    },
    "onValueChange": {},
    "showDivider": {
      "type": "boolean"
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "children",
    "aria-label"
  ],
  "additionalProperties": false
}
```

### Button

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "aria-label": {
      "type": "string"
    },
    "aria-pressed": {},
    "aria-expanded": {},
    "aria-controls": {
      "type": "string"
    },
    "aria-describedby": {
      "type": "string"
    },
    "aria-haspopup": {},
    "children": {
      "type": "string"
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        },
        {
          "type": "number",
          "const": 6
        },
        {
          "type": "number",
          "const": 8
        },
        {
          "type": "number",
          "const": 10
        },
        {
          "type": "number",
          "const": 12
        }
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "contained": {
      "type": "boolean"
    },
    "condensed": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    },
    "onPress": {},
    "onClick": {},
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "decoration": {},
    "type": {
      "type": "string",
      "enum": [
        "button",
        "submit",
        "reset"
      ]
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "children"
  ],
  "additionalProperties": false
}
```

### Checkbox

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "labelAssociation": {
      "type": "string",
      "enum": [
        "native",
        "field"
      ]
    },
    "label": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "supplementaryDescribedById": {
      "type": "string"
    },
    "errorHighlight": {
      "type": "boolean"
    },
    "checked": {
      "type": "boolean"
    },
    "defaultChecked": {
      "type": "boolean"
    },
    "indeterminate": {
      "type": "boolean"
    },
    "onCheckedChange": {},
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    },
    "value": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "labelWrapper": {
      "type": "string",
      "enum": [
        "label",
        "div"
      ]
    },
    "aria-describedby": {
      "type": "string"
    },
    "aria-invalid": {},
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Chip

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "selected": {
      "type": "boolean"
    },
    "defaultSelected": {
      "type": "boolean"
    },
    "onSelectedChange": {},
    "value": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    },
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### ChipGroup

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {},
    "defaultValue": {},
    "onValueChange": {},
    "multiple": {
      "type": "boolean"
    },
    "orientation": {
      "type": "string",
      "enum": [
        "horizontal",
        "vertical"
      ]
    },
    "wrap": {
      "type": "boolean"
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "maxSelections": {
      "type": "number"
    },
    "required": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loopFocus": {
      "type": "boolean"
    },
    "aria-label": {
      "type": "string"
    },
    "aria-labelledby": {
      "type": "string"
    },
    "children": {
      "type": "string"
    }
  },
  "required": [
    "children"
  ],
  "additionalProperties": false
}
```

### CounterBadge

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {
      "type": "number"
    },
    "max": {
      "type": "number"
    },
    "showZero": {
      "type": "boolean"
    },
    "size": {
      "type": "string",
      "enum": [
        "xs",
        "s",
        "m",
        "l"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

### Divider

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "orientation": {
      "type": "string",
      "enum": [
        "horizontal",
        "vertical"
      ]
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "children": {
      "type": "string"
    },
    "contentAlign": {
      "type": "string",
      "enum": [
        "center",
        "start",
        "end"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "roundCaps": {
      "type": "boolean"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### FAB

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "icon": {
      "type": "string"
    },
    "label": {
      "type": "string"
    },
    "variant": {
      "type": "string",
      "enum": [
        "primary",
        "secondary",
        "surface"
      ]
    },
    "size": {
      "type": "string",
      "enum": [
        "medium",
        "small",
        "large"
      ]
    },
    "position": {
      "type": "string",
      "enum": [
        "bottom-right",
        "bottom-left",
        "bottom-center"
      ]
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    },
    "onPress": {},
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "icon"
  ],
  "additionalProperties": false
}
```

### Icon

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "icon": {
      "type": "string"
    },
    "size": {
      "type": "string",
      "enum": [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "12",
        "14",
        "16",
        "18",
        "20",
        "24",
        "32",
        "40",
        "2.5",
        "3.5",
        "4.5"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "emphasis": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low",
        "tinted",
        "tintedA11y"
      ]
    },
    "aria-label": {
      "type": "string"
    },
    "aria-hidden": {
      "type": "boolean"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "icon"
  ],
  "additionalProperties": false
}
```

### IconButton

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "icon": {
      "type": "string"
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        },
        {
          "type": "number",
          "const": 6
        },
        {
          "type": "number",
          "const": 8
        },
        {
          "type": "number",
          "const": 10
        },
        {
          "type": "number",
          "const": 12
        }
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "condensed": {
      "type": "boolean"
    },
    "layout": {
      "type": "string",
      "enum": [
        "1:1",
        "3:2"
      ]
    },
    "contained": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    },
    "onPress": {},
    "onClick": {},
    "aria-label": {
      "type": "string"
    },
    "aria-expanded": {
      "type": "boolean"
    },
    "data-testid": {
      "type": "string"
    },
    "form": {
      "type": "string"
    },
    "slot": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "formAction": {},
    "formEncType": {
      "type": "string"
    },
    "formMethod": {
      "type": "string"
    },
    "formNoValidate": {
      "type": "boolean"
    },
    "formTarget": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "button",
        "submit",
        "reset"
      ]
    },
    "value": {},
    "defaultChecked": {
      "type": "boolean"
    },
    "defaultValue": {},
    "suppressContentEditableWarning": {
      "type": "boolean"
    },
    "suppressHydrationWarning": {
      "type": "boolean"
    },
    "accessKey": {
      "type": "string"
    },
    "autoCapitalize": {},
    "autoFocus": {
      "type": "boolean"
    },
    "contentEditable": {},
    "contextMenu": {
      "type": "string"
    },
    "dir": {
      "type": "string"
    },
    "draggable": {},
    "enterKeyHint": {
      "type": "string",
      "enum": [
        "search",
        "next",
        "enter",
        "done",
        "go",
        "previous",
        "send"
      ]
    },
    "hidden": {
      "type": "boolean"
    },
    "id": {
      "type": "string"
    },
    "lang": {
      "type": "string"
    },
    "nonce": {
      "type": "string"
    },
    "spellCheck": {},
    "tabIndex": {
      "type": "number"
    },
    "translate": {
      "type": "string",
      "enum": [
        "yes",
        "no"
      ]
    },
    "radioGroup": {
      "type": "string"
    },
    "role": {},
    "about": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "datatype": {
      "type": "string"
    },
    "inlist": {},
    "prefix": {
      "type": "string"
    },
    "property": {
      "type": "string"
    },
    "rel": {
      "type": "string"
    },
    "resource": {
      "type": "string"
    },
    "rev": {
      "type": "string"
    },
    "typeof": {
      "type": "string"
    },
    "vocab": {
      "type": "string"
    },
    "autoCorrect": {
      "type": "string"
    },
    "autoSave": {
      "type": "string"
    },
    "color": {
      "type": "string"
    },
    "itemProp": {
      "type": "string"
    },
    "itemScope": {
      "type": "boolean"
    },
    "itemType": {
      "type": "string"
    },
    "itemID": {
      "type": "string"
    },
    "itemRef": {
      "type": "string"
    },
    "results": {
      "type": "number"
    },
    "security": {
      "type": "string"
    },
    "unselectable": {
      "type": "string",
      "enum": [
        "off",
        "on"
      ]
    },
    "popover": {
      "type": "string",
      "enum": [
        "",
        "auto",
        "manual",
        "hint"
      ]
    },
    "popoverTargetAction": {
      "type": "string",
      "enum": [
        "toggle",
        "show",
        "hide"
      ]
    },
    "popoverTarget": {
      "type": "string"
    },
    "inert": {
      "type": "boolean"
    },
    "inputMode": {
      "type": "string",
      "enum": [
        "text",
        "none",
        "search",
        "tel",
        "url",
        "email",
        "numeric",
        "decimal"
      ]
    },
    "is": {
      "type": "string"
    },
    "exportparts": {
      "type": "string"
    },
    "part": {
      "type": "string"
    },
    "tw": {
      "type": "string"
    },
    "aria-activedescendant": {
      "type": "string"
    },
    "aria-atomic": {},
    "aria-autocomplete": {
      "type": "string",
      "enum": [
        "none",
        "list",
        "inline",
        "both"
      ]
    },
    "aria-braillelabel": {
      "type": "string"
    },
    "aria-brailleroledescription": {
      "type": "string"
    },
    "aria-busy": {},
    "aria-checked": {},
    "aria-colcount": {
      "type": "number"
    },
    "aria-colindex": {
      "type": "number"
    },
    "aria-colindextext": {
      "type": "string"
    },
    "aria-colspan": {
      "type": "number"
    },
    "aria-controls": {
      "type": "string"
    },
    "aria-current": {},
    "aria-describedby": {
      "type": "string"
    },
    "aria-description": {
      "type": "string"
    },
    "aria-details": {
      "type": "string"
    },
    "aria-disabled": {},
    "aria-errormessage": {
      "type": "string"
    },
    "aria-flowto": {
      "type": "string"
    },
    "aria-haspopup": {},
    "aria-hidden": {},
    "aria-invalid": {},
    "aria-keyshortcuts": {
      "type": "string"
    },
    "aria-labelledby": {
      "type": "string"
    },
    "aria-level": {
      "type": "number"
    },
    "aria-live": {
      "type": "string",
      "enum": [
        "off",
        "assertive",
        "polite"
      ]
    },
    "aria-modal": {},
    "aria-multiline": {},
    "aria-multiselectable": {},
    "aria-orientation": {
      "type": "string",
      "enum": [
        "horizontal",
        "vertical"
      ]
    },
    "aria-owns": {
      "type": "string"
    },
    "aria-placeholder": {
      "type": "string"
    },
    "aria-posinset": {
      "type": "number"
    },
    "aria-pressed": {},
    "aria-readonly": {},
    "aria-relevant": {
      "type": "string",
      "enum": [
        "text",
        "additions",
        "additions removals",
        "additions text",
        "all",
        "removals",
        "removals additions",
        "removals text",
        "text additions",
        "text removals"
      ]
    },
    "aria-required": {},
    "aria-roledescription": {
      "type": "string"
    },
    "aria-rowcount": {
      "type": "number"
    },
    "aria-rowindex": {
      "type": "number"
    },
    "aria-rowindextext": {
      "type": "string"
    },
    "aria-rowspan": {
      "type": "number"
    },
    "aria-selected": {},
    "aria-setsize": {
      "type": "number"
    },
    "aria-sort": {
      "type": "string",
      "enum": [
        "none",
        "ascending",
        "descending",
        "other"
      ]
    },
    "aria-valuemax": {
      "type": "number"
    },
    "aria-valuemin": {
      "type": "number"
    },
    "aria-valuenow": {
      "type": "number"
    },
    "aria-valuetext": {
      "type": "string"
    },
    "dangerouslySetInnerHTML": {},
    "onCopy": {},
    "onCopyCapture": {},
    "onCut": {},
    "onCutCapture": {},
    "onPaste": {},
    "onPasteCapture": {},
    "onCompositionEnd": {},
    "onCompositionEndCapture": {},
    "onCompositionStart": {},
    "onCompositionStartCapture": {},
    "onCompositionUpdate": {},
    "onCompositionUpdateCapture": {},
    "onFocus": {},
    "onFocusCapture": {},
    "onBlur": {},
    "onBlurCapture": {},
    "onChange": {},
    "onChangeCapture": {},
    "onBeforeInput": {},
    "onBeforeInputCapture": {},
    "onInput": {},
    "onInputCapture": {},
    "onReset": {},
    "onResetCapture": {},
    "onSubmit": {},
    "onSubmitCapture": {},
    "onInvalid": {},
    "onInvalidCapture": {},
    "onLoad": {},
    "onLoadCapture": {},
    "onError": {},
    "onErrorCapture": {},
    "onKeyDown": {},
    "onKeyDownCapture": {},
    "onKeyUp": {},
    "onKeyUpCapture": {},
    "onAbort": {},
    "onAbortCapture": {},
    "onCanPlay": {},
    "onCanPlayCapture": {},
    "onCanPlayThrough": {},
    "onCanPlayThroughCapture": {},
    "onDurationChange": {},
    "onDurationChangeCapture": {},
    "onEmptied": {},
    "onEmptiedCapture": {},
    "onEncrypted": {},
    "onEncryptedCapture": {},
    "onEnded": {},
    "onEndedCapture": {},
    "onLoadedData": {},
    "onLoadedDataCapture": {},
    "onLoadedMetadata": {},
    "onLoadedMetadataCapture": {},
    "onLoadStart": {},
    "onLoadStartCapture": {},
    "onPause": {},
    "onPauseCapture": {},
    "onPlay": {},
    "onPlayCapture": {},
    "onPlaying": {},
    "onPlayingCapture": {},
    "onProgress": {},
    "onProgressCapture": {},
    "onRateChange": {},
    "onRateChangeCapture": {},
    "onSeeked": {},
    "onSeekedCapture": {},
    "onSeeking": {},
    "onSeekingCapture": {},
    "onStalled": {},
    "onStalledCapture": {},
    "onSuspend": {},
    "onSuspendCapture": {},
    "onTimeUpdate": {},
    "onTimeUpdateCapture": {},
    "onVolumeChange": {},
    "onVolumeChangeCapture": {},
    "onWaiting": {},
    "onWaitingCapture": {},
    "onAuxClick": {},
    "onAuxClickCapture": {},
    "onClickCapture": {},
    "onContextMenu": {},
    "onContextMenuCapture": {},
    "onDoubleClick": {},
    "onDoubleClickCapture": {},
    "onDrag": {},
    "onDragCapture": {},
    "onDragEnd": {},
    "onDragEndCapture": {},
    "onDragEnter": {},
    "onDragEnterCapture": {},
    "onDragExit": {},
    "onDragExitCapture": {},
    "onDragLeave": {},
    "onDragLeaveCapture": {},
    "onDragOver": {},
    "onDragOverCapture": {},
    "onDragStart": {},
    "onDragStartCapture": {},
    "onDrop": {},
    "onDropCapture": {},
    "onMouseDown": {},
    "onMouseDownCapture": {},
    "onMouseEnter": {},
    "onMouseLeave": {},
    "onMouseMove": {},
    "onMouseMoveCapture": {},
    "onMouseOut": {},
    "onMouseOutCapture": {},
    "onMouseOver": {},
    "onMouseOverCapture": {},
    "onMouseUp": {},
    "onMouseUpCapture": {},
    "onSelect": {},
    "onSelectCapture": {},
    "onTouchCancel": {},
    "onTouchCancelCapture": {},
    "onTouchEnd": {},
    "onTouchEndCapture": {},
    "onTouchMove": {},
    "onTouchMoveCapture": {},
    "onTouchStart": {},
    "onTouchStartCapture": {},
    "onPointerDown": {},
    "onPointerDownCapture": {},
    "onPointerMove": {},
    "onPointerMoveCapture": {},
    "onPointerUp": {},
    "onPointerUpCapture": {},
    "onPointerCancel": {},
    "onPointerCancelCapture": {},
    "onPointerEnter": {},
    "onPointerLeave": {},
    "onPointerOver": {},
    "onPointerOverCapture": {},
    "onPointerOut": {},
    "onPointerOutCapture": {},
    "onGotPointerCapture": {},
    "onGotPointerCaptureCapture": {},
    "onLostPointerCapture": {},
    "onLostPointerCaptureCapture": {},
    "onScroll": {},
    "onScrollCapture": {},
    "onScrollEnd": {},
    "onScrollEndCapture": {},
    "onWheel": {},
    "onWheelCapture": {},
    "onAnimationStart": {},
    "onAnimationStartCapture": {},
    "onAnimationEnd": {},
    "onAnimationEndCapture": {},
    "onAnimationIteration": {},
    "onAnimationIterationCapture": {},
    "onToggle": {},
    "onBeforeToggle": {},
    "onTransitionCancel": {},
    "onTransitionCancelCapture": {},
    "onTransitionEnd": {},
    "onTransitionEndCapture": {},
    "onTransitionRun": {},
    "onTransitionRunCapture": {},
    "onTransitionStart": {},
    "onTransitionStartCapture": {}
  },
  "required": [
    "icon",
    "aria-label"
  ],
  "additionalProperties": false
}
```

### Image

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "src": {
      "type": "string"
    },
    "alt": {
      "type": "string"
    },
    "aspectRatio": {
      "type": "string",
      "enum": [
        "auto",
        "1:1",
        "3:2",
        "1:2",
        "2:1",
        "2:3",
        "3:4",
        "4:3",
        "9:16",
        "16:9",
        "9:21",
        "21:9"
      ]
    },
    "interactive": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "fit": {
      "type": "string",
      "enum": [
        "none",
        "inherit",
        "cover",
        "contain",
        "fill",
        "scale-down",
        "initial",
        "revert",
        "revert-layer",
        "unset"
      ]
    },
    "objectFit": {
      "type": "string",
      "enum": [
        "none",
        "inherit",
        "cover",
        "contain",
        "fill",
        "scale-down",
        "initial",
        "revert",
        "revert-layer",
        "unset"
      ]
    },
    "objectPosition": {
      "type": "string"
    },
    "loading": {
      "type": "string",
      "enum": [
        "auto",
        "lazy",
        "eager"
      ]
    },
    "srcSet": {
      "type": "string"
    },
    "sizes": {
      "type": "string"
    },
    "crossOrigin": {
      "type": "string",
      "enum": [
        "anonymous",
        "use-credentials"
      ]
    },
    "decoding": {
      "type": "string",
      "enum": [
        "auto",
        "sync",
        "async"
      ]
    },
    "draggable": {
      "type": "boolean"
    },
    "lottieAttributes": {},
    "width": {},
    "height": {},
    "onPress": {},
    "onClick": {},
    "onLoad": {},
    "onError": {},
    "fallback": {
      "type": "string"
    },
    "fallbackSrc": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "testID": {
      "type": "string"
    }
  },
  "required": [
    "src",
    "alt"
  ],
  "additionalProperties": false
}
```

### IndicatorBadge

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "size": {
      "type": "string",
      "enum": [
        "xs",
        "s",
        "m",
        "l"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "aria-label"
  ],
  "additionalProperties": false
}
```

### InputField

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "invalid": {
      "type": "boolean"
    },
    "labelSlot": {
      "type": "string"
    },
    "label": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "infoIcon": {
      "type": "boolean"
    },
    "infoIconSlot": {
      "type": "string"
    },
    "infoTooltipContent": {
      "type": "string"
    },
    "infoIconAriaLabel": {
      "type": "string"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    },
    "feedback": {
      "type": "string"
    },
    "dynamicTextSlot": {
      "type": "string"
    },
    "dynamicText": {
      "type": "string"
    },
    "helperButton": {
      "type": "string"
    },
    "validationMode": {
      "type": "string",
      "enum": [
        "onBlur",
        "onChange"
      ]
    },
    "validate": {},
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "value": {
      "type": "string"
    },
    "defaultValue": {
      "type": "string"
    },
    "autoFocus": {
      "type": "boolean"
    },
    "id": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "onFocus": {},
    "onBlur": {},
    "onChange": {},
    "onKeyDown": {},
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        },
        {
          "type": "number",
          "const": 6
        },
        {
          "type": "number",
          "const": 8
        },
        {
          "type": "number",
          "const": 10
        },
        {
          "type": "number",
          "const": 12
        }
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "shape": {
      "type": "string",
      "enum": [
        "default",
        "pill"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium"
      ]
    },
    "start2": {
      "type": "string"
    },
    "end2": {
      "type": "string"
    },
    "placeholder": {
      "type": "string"
    },
    "readOnly": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "data-testid": {
      "type": "string"
    },
    "autoComplete": {
      "type": "string"
    },
    "maxLength": {
      "type": "number"
    }
  },
  "additionalProperties": false
}
```

### ListItem

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "supportText": {
      "type": "string"
    },
    "supportStart": {
      "type": "string"
    },
    "start": {
      "type": "string"
    },
    "startSize": {
      "type": "string",
      "enum": [
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    "end": {
      "type": "string"
    },
    "endSize": {
      "type": "string",
      "enum": [
        "S",
        "M"
      ]
    },
    "slotAlignment": {
      "type": "string",
      "enum": [
        "centre",
        "top"
      ]
    },
    "container": {
      "type": "string",
      "enum": [
        "fullWidth",
        "inset"
      ]
    },
    "selected": {},
    "divider": {
      "type": "string",
      "enum": [
        "none",
        "inset",
        "full"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "disabled": {
      "type": "boolean"
    },
    "href": {
      "type": "string"
    },
    "onClick": {},
    "aria-label": {
      "type": "string"
    }
  },
  "required": [
    "title"
  ],
  "additionalProperties": false
}
```

### ListItemGroup

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "sectionDivider": {
      "type": "boolean"
    },
    "container": {
      "type": "string",
      "enum": [
        "fullWidth",
        "inset"
      ]
    },
    "divider": {
      "type": "string",
      "enum": [
        "none",
        "inset",
        "full"
      ]
    },
    "role": {
      "type": "string",
      "enum": [
        "menu",
        "list",
        "group"
      ]
    },
    "aria-label": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Logo

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "variant": {
      "type": "string",
      "enum": [
        "mark",
        "full"
      ]
    },
    "size": {
      "type": "string",
      "enum": [
        "xs",
        "s",
        "m",
        "l"
      ]
    },
    "customSize": {
      "type": "number"
    },
    "children": {
      "type": "string"
    },
    "src": {
      "type": "string"
    },
    "svgContent": {
      "type": "string"
    },
    "material": {
      "type": "string",
      "enum": [
        "custom",
        "bronze",
        "silver",
        "gold"
      ]
    },
    "materialTarget": {
      "type": "string",
      "enum": [
        "fill",
        "stroke",
        "fill-stroke"
      ]
    },
    "materialGradientType": {
      "type": "string",
      "enum": [
        "linear",
        "radial",
        "conic"
      ]
    },
    "materialGradientAngle": {
      "type": "number"
    },
    "alt": {
      "type": "string"
    },
    "onLoad": {},
    "onError": {},
    "fallback": {
      "type": "string"
    }
  },
  "required": [
    "alt"
  ],
  "additionalProperties": false
}
```

### PaginationDots

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pageCount": {
      "type": "number"
    },
    "activeIndex": {
      "type": "number"
    },
    "defaultActiveIndex": {
      "type": "number"
    },
    "onActiveIndexChange": {},
    "loop": {
      "type": "boolean"
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "readOnly": {
      "type": "boolean"
    },
    "aria-label": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "pageCount"
  ],
  "additionalProperties": false
}
```

### Radio

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "labelAssociation": {
      "type": "string",
      "enum": [
        "native",
        "field"
      ]
    },
    "label": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "supplementaryDescribedById": {
      "type": "string"
    },
    "errorHighlight": {
      "type": "boolean"
    },
    "value": {
      "type": "string"
    },
    "checked": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "id": {
      "type": "string"
    },
    "labelWrapper": {
      "type": "string",
      "enum": [
        "label",
        "div"
      ]
    },
    "aria-labelledby": {
      "type": "string"
    },
    "aria-describedby": {
      "type": "string"
    },
    "aria-invalid": {},
    "data-testid": {
      "type": "string"
    }
  },
  "required": [
    "value"
  ],
  "additionalProperties": false
}
```

### Slider

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {},
    "defaultValue": {},
    "onValueChange": {},
    "onValueCommitted": {},
    "min": {
      "type": "number"
    },
    "max": {
      "type": "number"
    },
    "step": {
      "type": "number"
    },
    "largeStep": {
      "type": "number"
    },
    "minStepsBetweenValues": {
      "type": "number"
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "orientation": {
      "type": "string",
      "enum": [
        "horizontal",
        "vertical"
      ]
    },
    "knobStyle": {
      "type": "string",
      "enum": [
        "inside",
        "outside"
      ]
    },
    "showTooltip": {},
    "formatValue": {},
    "showSteps": {
      "type": "boolean"
    },
    "stepLabels": {
      "type": "string"
    },
    "snapToSteps": {
      "type": "boolean"
    },
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    },
    "form": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "aria-labelledby": {
      "type": "string"
    },
    "ariaLabels": {}
  },
  "additionalProperties": false
}
```

### Spinner

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "size": {
      "type": "string",
      "enum": [
        "S",
        "M",
        "L",
        "XL",
        "2XS",
        "XS",
        "2XL",
        "3XL",
        "4XL",
        "5XL"
      ]
    },
    "label": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Stepper

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {
      "type": "number"
    },
    "defaultValue": {
      "type": "number"
    },
    "onChange": {},
    "min": {
      "type": "number"
    },
    "max": {
      "type": "number"
    },
    "step": {
      "type": "number"
    },
    "shiftMultiplier": {
      "type": "number"
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "error": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "attention": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "accent": {
      "type": "string",
      "enum": [
        "primary",
        "secondary",
        "sparkle"
      ]
    },
    "condensed": {
      "type": "boolean"
    },
    "direction": {
      "type": "string",
      "enum": [
        "ltr",
        "rtl"
      ]
    },
    "start": {
      "type": "string"
    },
    "end": {
      "type": "string"
    },
    "partProps": {},
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Switch

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "checked": {
      "type": "boolean"
    },
    "defaultChecked": {
      "type": "boolean"
    },
    "onCheckedChange": {},
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    },
    "accent": {
      "type": "string",
      "enum": [
        "primary",
        "secondary",
        "sparkle"
      ]
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "aria-label": {
      "type": "string"
    },
    "aria-labelledby": {
      "type": "string"
    },
    "data-testid": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Tabs

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "value": {},
    "defaultValue": {},
    "onValueChange": {},
    "orientation": {
      "type": "string",
      "enum": [
        "horizontal",
        "vertical"
      ]
    },
    "size": {
      "type": "string",
      "enum": [
        "s",
        "m",
        "l"
      ]
    },
    "appearance": {
      "type": "string",
      "enum": [
        "auto",
        "primary",
        "secondary",
        "neutral",
        "sparkle",
        "brand-bg",
        "positive",
        "negative",
        "warning",
        "informative"
      ]
    }
  },
  "required": [
    "children"
  ],
  "additionalProperties": false
}
```

### Tooltip

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "position": {
      "type": "string",
      "enum": [
        "top",
        "topStart",
        "topEnd",
        "bottom",
        "bottomStart",
        "bottomEnd",
        "left",
        "leftStart",
        "leftEnd",
        "right",
        "rightStart",
        "rightEnd"
      ]
    },
    "side": {
      "type": "string",
      "enum": [
        "top",
        "bottom",
        "left",
        "right"
      ]
    },
    "align": {
      "type": "string",
      "enum": [
        "center",
        "start",
        "end"
      ]
    },
    "sideOffset": {
      "type": "number"
    },
    "open": {
      "type": "boolean"
    },
    "defaultOpen": {
      "type": "boolean"
    },
    "onOpenChange": {},
    "trigger": {
      "type": "string",
      "enum": [
        "manual",
        "hover",
        "click",
        "focus"
      ]
    },
    "delay": {
      "type": "number"
    },
    "closeDelay": {
      "type": "number"
    },
    "arrow": {
      "type": "boolean"
    },
    "maxWidth": {},
    "hoverable": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "zIndex": {
      "type": "number"
    },
    "subtle": {
      "type": "boolean"
    }
  },
  "required": [
    "children",
    "content"
  ],
  "additionalProperties": false
}
```

### WebHeader

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "variant": {
      "type": "string",
      "enum": [
        "hidden",
        "default",
        "transparent",
        "glass",
        "stickyHidden"
      ]
    },
    "breakpoint": {
      "type": "string",
      "enum": [
        "S",
        "M",
        "L"
      ]
    },
    "aria-label": {
      "type": "string"
    },
    "aria-labelledby": {
      "type": "string"
    },
    "children": {
      "type": "string"
    }
  },
  "required": [
    "children"
  ],
  "additionalProperties": false
}
```

### AgentPulse

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "state": {
      "anyOf": [
        {
          "type": "string",
          "const": "idle"
        },
        {
          "type": "string",
          "const": "listening"
        },
        {
          "type": "string",
          "const": "thinking"
        },
        {
          "type": "string",
          "const": "speaking"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "sm"
        },
        {
          "type": "string",
          "const": "md"
        },
        {
          "type": "string",
          "const": "lg"
        },
        {
          "type": "string",
          "const": "xl"
        }
      ]
    },
    "autoTransition": {
      "type": "boolean"
    },
    "paused": {
      "type": "boolean"
    },
    "speed": {
      "type": "number"
    },
    "reducedMotionFallback": {
      "anyOf": [
        {
          "type": "string",
          "const": "static"
        },
        {
          "type": "string",
          "const": "pulse"
        },
        {
          "type": "string",
          "const": "none"
        }
      ]
    },
    "label": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Carousel

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "aria-label": {
      "type": "string"
    },
    "autoPlay": {
      "type": "number"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "aspectRatio": {
      "anyOf": [
        {
          "type": "string",
          "const": "3:4"
        },
        {
          "type": "string",
          "const": "9:16"
        },
        {
          "type": "string",
          "const": "1:1"
        },
        {
          "type": "string",
          "const": "4:3"
        },
        {
          "type": "string",
          "const": "16:9"
        },
        {
          "type": "string",
          "const": "flexible"
        }
      ]
    },
    "alignment": {
      "anyOf": [
        {
          "type": "string",
          "const": "startBottom"
        },
        {
          "type": "string",
          "const": "startMiddle"
        },
        {
          "type": "string",
          "const": "middleBottom"
        }
      ]
    },
    "controls": {
      "anyOf": [
        {
          "type": "string",
          "const": "below"
        },
        {
          "type": "string",
          "const": "onMedia"
        }
      ]
    }
  },
  "additionalProperties": false
}
```

### ChatComposer

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {
      "type": "string"
    },
    "onChange": {},
    "onSubmit": {},
    "placeholder": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    },
    "autoFocus": {
      "type": "boolean"
    },
    "modelLabel": {
      "type": "string"
    },
    "suggestions": {}
  },
  "required": [
    "value",
    "onChange",
    "onSubmit"
  ],
  "additionalProperties": false
}
```

### CheckboxField

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "label": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "checked": {
      "type": "boolean"
    },
    "defaultChecked": {
      "type": "boolean"
    },
    "indeterminate": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "invalid": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "value": {
      "type": "string"
    },
    "groupValue": {},
    "groupDefaultValue": {},
    "onGroupValueChange": {}
  },
  "additionalProperties": false
}
```

### CircularProgressIndicator

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "variant": {
      "anyOf": [
        {
          "type": "string",
          "const": "determinate"
        },
        {
          "type": "string",
          "const": "indeterminate"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "2XS"
        },
        {
          "type": "string",
          "const": "XS"
        },
        {
          "type": "string",
          "const": "S"
        },
        {
          "type": "string",
          "const": "M"
        },
        {
          "type": "string",
          "const": "L"
        },
        {
          "type": "string",
          "const": "XL"
        },
        {
          "type": "string",
          "const": "2XL"
        },
        {
          "type": "string",
          "const": "3XL"
        },
        {
          "type": "string",
          "const": "4XL"
        },
        {
          "type": "string",
          "const": "5XL"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "content": {
      "anyOf": [
        {
          "type": "string",
          "const": "none"
        },
        {
          "type": "string",
          "const": "icon"
        },
        {
          "type": "string",
          "const": "text"
        }
      ]
    },
    "value": {
      "type": "number"
    },
    "min": {
      "type": "number"
    },
    "max": {
      "type": "number"
    },
    "children": {},
    "aria-label": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Container

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "children": {},
    "variant": {
      "anyOf": [
        {
          "type": "string",
          "const": "fluid"
        },
        {
          "type": "string",
          "const": "fixed"
        },
        {
          "type": "string",
          "const": "full-bleed"
        }
      ]
    },
    "maxWidth": {
      "type": "string"
    },
    "as": {
      "type": "string"
    },
    "surface": {
      "anyOf": [
        {
          "type": "string",
          "const": "default"
        },
        {
          "type": "string",
          "const": "ghost"
        },
        {
          "type": "string",
          "const": "minimal"
        },
        {
          "type": "string",
          "const": "subtle"
        },
        {
          "type": "string",
          "const": "moderate"
        },
        {
          "type": "string",
          "const": "bold"
        },
        {
          "type": "string",
          "const": "elevated"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "layout": {
      "anyOf": [
        {
          "type": "string",
          "const": "flex"
        },
        {
          "type": "string",
          "const": "grid"
        }
      ]
    },
    "direction": {
      "anyOf": [
        {
          "type": "string",
          "const": "row"
        },
        {
          "type": "string",
          "const": "column"
        }
      ]
    },
    "wrap": {
      "type": "boolean"
    },
    "justify": {
      "anyOf": [
        {
          "type": "string",
          "const": "start"
        },
        {
          "type": "string",
          "const": "center"
        },
        {
          "type": "string",
          "const": "end"
        },
        {
          "type": "string",
          "const": "space-between"
        },
        {
          "type": "string",
          "const": "space-around"
        },
        {
          "type": "string",
          "const": "space-evenly"
        },
        {
          "type": "string",
          "const": "stretch"
        }
      ]
    },
    "align": {
      "anyOf": [
        {
          "type": "string",
          "const": "start"
        },
        {
          "type": "string",
          "const": "center"
        },
        {
          "type": "string",
          "const": "end"
        },
        {
          "type": "string",
          "const": "stretch"
        },
        {
          "type": "string",
          "const": "baseline"
        }
      ]
    },
    "alignSelf": {
      "anyOf": [
        {
          "type": "string",
          "const": "start"
        },
        {
          "type": "string",
          "const": "center"
        },
        {
          "type": "string",
          "const": "end"
        },
        {
          "type": "string",
          "const": "stretch"
        },
        {
          "type": "string",
          "const": "baseline"
        }
      ]
    },
    "columns": {
      "type": "number"
    },
    "rows": {
      "type": "number"
    },
    "padding": {
      "type": "string"
    },
    "paddingX": {
      "type": "string"
    },
    "paddingY": {
      "type": "string"
    },
    "paddingTop": {
      "type": "string"
    },
    "paddingRight": {
      "type": "string"
    },
    "paddingBottom": {
      "type": "string"
    },
    "paddingLeft": {
      "type": "string"
    },
    "gap": {
      "type": "string"
    },
    "rowGap": {
      "type": "string"
    },
    "columnGap": {
      "type": "string"
    },
    "width": {
      "type": "string"
    },
    "height": {
      "type": "string"
    },
    "minWidth": {
      "type": "string"
    },
    "minHeight": {
      "type": "string"
    },
    "maxHeight": {
      "type": "string"
    },
    "flex": {
      "type": "string"
    },
    "grow": {
      "type": "number"
    },
    "shrink": {
      "type": "number"
    },
    "basis": {
      "type": "string"
    },
    "position": {
      "anyOf": [
        {
          "type": "string",
          "const": "static"
        },
        {
          "type": "string",
          "const": "relative"
        },
        {
          "type": "string",
          "const": "absolute"
        },
        {
          "type": "string",
          "const": "fixed"
        },
        {
          "type": "string",
          "const": "sticky"
        }
      ]
    },
    "top": {
      "type": "string"
    },
    "right": {
      "type": "string"
    },
    "bottom": {
      "type": "string"
    },
    "left": {
      "type": "string"
    },
    "zIndex": {
      "type": "number"
    },
    "overflow": {
      "anyOf": [
        {
          "type": "string",
          "const": "visible"
        },
        {
          "type": "string",
          "const": "hidden"
        },
        {
          "type": "string",
          "const": "clip"
        },
        {
          "type": "string",
          "const": "scroll"
        },
        {
          "type": "string",
          "const": "auto"
        }
      ]
    },
    "className": {
      "type": "string"
    },
    "style": {}
  },
  "additionalProperties": false
}
```

### Grid

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "columns": {},
    "gap": {
      "type": "string"
    },
    "as": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### IconContained

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        },
        {
          "type": "string",
          "const": "xl"
        }
      ]
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "icon": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### Modal

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

### Pagination

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "totalPages": {
      "type": "number"
    },
    "page": {
      "type": "number"
    },
    "defaultPage": {
      "type": "number"
    },
    "siblingCount": {
      "type": "number"
    },
    "boundaryCount": {
      "type": "number"
    },
    "showPrevNext": {
      "type": "boolean"
    },
    "showFirstLast": {
      "type": "boolean"
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "S"
        },
        {
          "type": "string",
          "const": "M"
        },
        {
          "type": "string",
          "const": "L"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "disabled": {
      "type": "boolean"
    },
    "aria-label": {
      "type": "string"
    },
    "onPageChange": {}
  },
  "required": [
    "totalPages"
  ],
  "additionalProperties": false
}
```

### RadioField

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "label": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "value": {
      "type": "string"
    },
    "defaultValue": {
      "type": "string"
    },
    "checked": {
      "type": "boolean"
    },
    "defaultChecked": {
      "type": "boolean"
    },
    "singleOptionValue": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "orientation": {
      "anyOf": [
        {
          "type": "string",
          "const": "vertical"
        },
        {
          "type": "string",
          "const": "horizontal"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "invalid": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    },
    "required": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "validationMode": {
      "anyOf": [
        {
          "type": "string",
          "const": "onBlur"
        },
        {
          "type": "string",
          "const": "onChange"
        }
      ]
    },
    "validate": {}
  },
  "additionalProperties": false
}
```

### SelectableButton

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "selected": {
      "type": "boolean"
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "contained": {
      "type": "boolean"
    },
    "condensed": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### SelectableIconButton

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "selected": {
      "type": "boolean"
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "number",
          "const": 4
        },
        {
          "type": "number",
          "const": 6
        },
        {
          "type": "number",
          "const": 8
        },
        {
          "type": "number",
          "const": 10
        },
        {
          "type": "number",
          "const": 12
        },
        {
          "type": "number",
          "const": 14
        },
        {
          "type": "string",
          "const": "2xs"
        },
        {
          "type": "string",
          "const": "xs"
        },
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        },
        {
          "type": "string",
          "const": "xl"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "shape": {
      "anyOf": [
        {
          "type": "string",
          "const": "1:1"
        },
        {
          "type": "string",
          "const": "2:3"
        }
      ]
    },
    "contained": {
      "type": "boolean"
    },
    "condensed": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "icon": {
      "type": "string"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### SelectableSingleTextButton

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "selected": {
      "type": "boolean"
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "condensed": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### SegmentedControl

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "value": {
      "type": "string"
    },
    "defaultValue": {
      "type": "string"
    },
    "onValueChange": {},
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "shape": {
      "anyOf": [
        {
          "type": "string",
          "const": "pill"
        },
        {
          "type": "string",
          "const": "rectangular"
        }
      ]
    },
    "equalWidth": {
      "type": "boolean"
    },
    "trackEmphasis": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "type": {
      "anyOf": [
        {
          "type": "string",
          "const": "text"
        },
        {
          "type": "string",
          "const": "icon"
        }
      ]
    },
    "disabled": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### SingleTextButton

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "s"
        },
        {
          "type": "string",
          "const": "m"
        },
        {
          "type": "string",
          "const": "l"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "tertiary"
        },
        {
          "type": "string",
          "const": "quaternary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "condensed": {
      "type": "boolean"
    },
    "fullWidth": {
      "type": "boolean"
    },
    "disabled": {
      "type": "boolean"
    },
    "loading": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

### Surface

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "mode": {
      "anyOf": [
        {
          "type": "string",
          "const": "default"
        },
        {
          "type": "string",
          "const": "ghost"
        },
        {
          "type": "string",
          "const": "minimal"
        },
        {
          "type": "string",
          "const": "subtle"
        },
        {
          "type": "string",
          "const": "moderate"
        },
        {
          "type": "string",
          "const": "bold"
        },
        {
          "type": "string",
          "const": "elevated"
        },
        {
          "type": "string",
          "const": "blend"
        }
      ]
    },
    "material": {
      "anyOf": [
        {
          "type": "string",
          "const": "solid"
        },
        {
          "type": "string",
          "const": "transparent"
        }
      ]
    },
    "mediaContext": {
      "anyOf": [
        {
          "type": "string",
          "const": "dynamic"
        },
        {
          "type": "string",
          "const": "dark"
        },
        {
          "type": "string",
          "const": "light"
        }
      ]
    },
    "as": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### Text

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "variant": {
      "anyOf": [
        {
          "type": "string",
          "const": "display"
        },
        {
          "type": "string",
          "const": "headline"
        },
        {
          "type": "string",
          "const": "title"
        },
        {
          "type": "string",
          "const": "body"
        },
        {
          "type": "string",
          "const": "label"
        },
        {
          "type": "string",
          "const": "code"
        }
      ]
    },
    "size": {
      "anyOf": [
        {
          "type": "string",
          "const": "L"
        },
        {
          "type": "string",
          "const": "M"
        },
        {
          "type": "string",
          "const": "S"
        },
        {
          "type": "string",
          "const": "XS"
        },
        {
          "type": "string",
          "const": "2XS"
        },
        {
          "type": "string",
          "const": "3XS"
        }
      ]
    },
    "weight": {
      "anyOf": [
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        }
      ]
    },
    "attention": {
      "anyOf": [
        {
          "type": "string",
          "const": "none"
        },
        {
          "type": "string",
          "const": "high"
        },
        {
          "type": "string",
          "const": "medium"
        },
        {
          "type": "string",
          "const": "low"
        },
        {
          "type": "string",
          "const": "tintedA11y"
        }
      ]
    },
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "italic": {
      "type": "boolean"
    },
    "underline": {
      "type": "boolean"
    },
    "strikethrough": {
      "type": "boolean"
    },
    "language": {
      "anyOf": [
        {
          "type": "string",
          "const": "latin"
        },
        {
          "type": "string",
          "const": "others"
        }
      ]
    },
    "lang": {
      "type": "string"
    },
    "script": {
      "anyOf": [
        {
          "type": "string",
          "const": "devanagari"
        },
        {
          "type": "string",
          "const": "bengali"
        },
        {
          "type": "string",
          "const": "gujarati"
        },
        {
          "type": "string",
          "const": "gurmukhi"
        },
        {
          "type": "string",
          "const": "kannada"
        },
        {
          "type": "string",
          "const": "malayalam"
        },
        {
          "type": "string",
          "const": "oriya"
        },
        {
          "type": "string",
          "const": "tamil"
        },
        {
          "type": "string",
          "const": "telugu"
        },
        {
          "type": "string",
          "const": "arabic"
        }
      ]
    },
    "scriptMode": {
      "anyOf": [
        {
          "type": "string",
          "const": "ui"
        },
        {
          "type": "string",
          "const": "reading"
        }
      ]
    },
    "textAlign": {
      "anyOf": [
        {
          "type": "string",
          "const": "left"
        },
        {
          "type": "string",
          "const": "center"
        },
        {
          "type": "string",
          "const": "right"
        }
      ]
    },
    "maxLines": {
      "type": "number"
    },
    "as": {
      "type": "string"
    },
    "href": {
      "type": "string"
    },
    "text": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### TouchSlider

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appearance": {
      "anyOf": [
        {
          "type": "string",
          "const": "auto"
        },
        {
          "type": "string",
          "const": "primary"
        },
        {
          "type": "string",
          "const": "secondary"
        },
        {
          "type": "string",
          "const": "neutral"
        },
        {
          "type": "string",
          "const": "sparkle"
        },
        {
          "type": "string",
          "const": "brand-bg"
        },
        {
          "type": "string",
          "const": "positive"
        },
        {
          "type": "string",
          "const": "negative"
        },
        {
          "type": "string",
          "const": "warning"
        },
        {
          "type": "string",
          "const": "informative"
        }
      ]
    },
    "orientation": {
      "anyOf": [
        {
          "type": "string",
          "const": "horizontal"
        },
        {
          "type": "string",
          "const": "vertical"
        }
      ]
    },
    "progressStyle": {
      "anyOf": [
        {
          "type": "string",
          "const": "rounded"
        },
        {
          "type": "string",
          "const": "sharp"
        }
      ]
    },
    "min": {
      "type": "number"
    },
    "max": {
      "type": "number"
    },
    "step": {
      "type": "number"
    },
    "disabled": {
      "type": "boolean"
    },
    "readOnly": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

## 6. Global Prohibitions

- Never emit hard-coded colors, pixels, or font sizes — every visual value must be a design token (`var(--Token-Name)`).
- Never stack two high-attention buttons in the same view.
- Never set `background-color` on a container that holds interactive components — use `<Surface mode="...">` so child components adapt via `[data-surface]`.
- Never emit a prop that is not declared in the Component Reference above.
- Never use deprecated enum values (see `deprecatedOptions` in each component).
