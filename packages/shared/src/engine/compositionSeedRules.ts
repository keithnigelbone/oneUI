/**
 * Composition Seed Rules — Default rule content for the 12 composition sections.
 *
 * These are the baseline rules extracted from the original canvas system prompt
 * and the design-composition skill. They serve as:
 * - Fallback when no brand-specific rules are configured
 * - Seed data for the compositionRules Convex table
 * - Reference for the rule format
 *
 * This file lives in @oneui/shared (not @oneui/convex) so it can be imported
 * from both API routes and Convex functions.
 */

import type { CompositionRule } from './compositionTypes';

interface SeedRuleSection {
  sectionId: string;
  title: string;
  priority: number;
  content: string;
}

export const COMPOSITION_SEED_SECTIONS: readonly SeedRuleSection[] = [
  {
    sectionId: 'layout-structure',
    title: 'Layout Structure',
    priority: 1,
    content: `Every screen should have clear sections. Use element nodes as section containers:

1. **Header section** — Avatar + title, or Image hero, or just a heading area
2. **Content section** — The main interactive area (forms, lists, cards)
3. **Action section** — Primary CTA at bottom, secondary actions above

Layout patterns for element nodes:
- **Vertical stack**: { "display": "flex", "flexDirection": "column", "gap": "var(--Spacing-4)" }
- **Horizontal row**: { "display": "flex", "flexDirection": "row", "gap": "var(--Spacing-4)", "alignItems": "center" }
- **Space between row**: { "display": "flex", "justifyContent": "space-between", "alignItems": "center" }
- **Centered content**: { "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "var(--Spacing-4-5)" }`,
  },
  {
    sectionId: 'spacing-rhythm',
    title: 'Spacing Rhythm',
    priority: 2,
    content: `Use the spacing token hierarchy consistently:
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

Whitespace philosophy: When in doubt, add more whitespace. The spacious, Apple-like aesthetic comes from generous breathing room between elements.`,
  },
  {
    sectionId: 'typography-hierarchy',
    title: 'Typography Hierarchy',
    priority: 3,
    content: `All typography sizes alias to dimension f-steps. Always include font-family: var(--Typography-Font-Primary) on every text element.

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
\`var(--Primary-Default-Medium-Text)\` or \`var(--Text-Medium)\`. NEVER use
\`--Text-Low\` or \`--Primary-Default-Low-Text\` for copy the user is expected
to read (subtitles, field labels, helper text, SSO row labels).

Low-emphasis tokens are reserved for:
- Placeholder text already supplied by the component (don't restate).
- Disabled states only.
- Timestamps or metadata beside a primary label (never the primary line itself).

When in doubt: prefer Medium over Low. Washed-out copy reads as broken.

## Case rules (Jio brand)
- NEVER use UPPERCASE for section labels, badges, chips, table headers, or tab labels.
- NEVER apply CSS \`text-transform: uppercase\` or wide \`letter-spacing\` for "caps" effects.
- NEVER write headings in all caps ("ORDERS & DELIVERY" is wrong — use "Orders & delivery").
- Use Sentence case for section headings and card titles ("Orders and delivery", not "Orders And Delivery").
- Only proper nouns retain capitalisation (JioMart, JioCinema, Diwali).
- Button labels use Sentence case: "Enable notifications", not "ENABLE NOTIFICATIONS".
- Badge text uses lowercase or Sentence case: "new", "Featured", never "NEW".`,
  },
  {
    sectionId: 'attention-flow',
    title: 'Attention Flow',
    priority: 4,
    content: `Distribute visual emphasis like a pyramid:
- **High (5%)** — Primary CTA, hero branded moment. ONE per screen.
- **Medium (10%)** — Secondary CTAs, active states, emphasis cards
- **Low (25%)** — Cards with subtle fills, secondary actions
- **None (60%)** — Body text, lists, tables, navigation, headers

One focal point per viewport section. Never let two bold elements compete.

Appearances: primary for main actions, neutral for settings, positive for success, negative for destructive.

**Density inversion exception** — when the screen's purpose is data, intelligence, monitoring, inferred state, or copilot-style assistance (dashboards, IoT status, finance trackers, health monitors, alert centres), the pyramid does NOT apply. Use multiple medium-attention pivots instead of a single hero, and require ≥3 differentiation data points per region (number + label + inferred reason). See the \`high-density-data-screen\` skill for full guidance — invoke it whenever the brief implies a data-first surface rather than an action-first one.`,
  },
  {
    sectionId: 'surface-application',
    title: 'Surface Application',
    priority: 5,
    content: `80-90% of any screen should be default surface. Content shines against a neutral backdrop.

Surface mode decision tree (one vocabulary, no BG/FG split):
- Page background → default
- Card or panel → default (content is hero)
- Alternating rows / sidebar → minimal
- Grouped section with boundary → subtle
- Stronger emphasis without going bold → moderate
- Hero or branded moment → bold
- Floating element (menu, popover, sheet) → elevated

To fill a Surface with a specific role colour, override --Surface-Fill-{Mode} inline:
\`<Surface mode="subtle" style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}>\`
Children with appearance="secondary" then resolve correctly via the [data-surface] cascade.

Bold surface is an event, not a default. ALWAYS use <Surface mode="..."> for non-default backgrounds. Never set background-color manually on containers with interactive children — tokens inside a raw div do not remap.`,
  },
  {
    sectionId: 'component-selection',
    title: 'Component Selection',
    priority: 6,
    content: `Common micro-patterns:

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
- Destructive: variant="bold" or "subtle" appearance="negative"`,
  },
  {
    sectionId: 'color-role-usage',
    title: 'Color Role Usage',
    priority: 7,
    content: `4 brand color roles:
- **Primary**: Action color. Buttons, nav indicators, links. One primary action per viewport.
- **Secondary**: Accent. Checkboxes, toggles, chips. Complements primary.
- **Sparkle**: Celebration. Rare — max 1-2 per viewport.
- **Neutral**: Chrome. Gray buttons, dividers, tertiary actions.

Semantic roles (never for brand expression):
- positive: success (green)
- negative: error/destructive (red)
- warning: caution (amber)
- informative: info (blue)`,
  },
  {
    sectionId: 'navigation-patterns',
    title: 'Navigation Patterns',
    priority: 8,
    content: `Headers always use default background.

Mobile: Bottom tab bar (4-5 items), stack navigation, sheet/modal for contextual actions.
Web: WebHeader component, sidebar for deep hierarchies, breadcrumbs, tab groups.

Navigation should never compete with content for attention.`,
  },
  {
    sectionId: 'responsive-adaptation',
    title: 'Responsive Adaptation',
    priority: 9,
    content: `Grid: Mobile 4col, Tablet 8col, Desktop 12col.
Use var(--Spacing-Margin) and var(--Spacing-Gutter) — they auto-adapt.

Column transitions: 1 (mobile/focused), 2 (tablet/comparison), 3+ (desktop/grids).`,
  },
  {
    sectionId: 'motion-elevation',
    title: 'Motion & Elevation',
    priority: 10,
    content: `Motion: Discreet (quick, functional) for UI, Expressive (noticeable, branded) for emphasis.
Elevation: 0 (flat default), 1-2 (cards/dropdowns), 3 (dialogs), 4-5 (rare dramatic overlays).
Use elevation sparingly. Most elements level 0.`,
  },
  {
    sectionId: 'vertical-specifics',
    title: 'Vertical-Specific Rules',
    priority: 11,
    content: `Apply by brand vertical:
- **E-commerce**: Product grids, image-first cards, one CTA per card, sticky cart bar
- **Entertainment**: Immersive imagery, dark mode, horizontal scroll thumbnails
- **Finance**: Data-dense, tables, trust signals, conservative spacing, form-heavy
- **Governance**: Formal, high readability, conservative color, accessibility-first
- **Farm**: Simple, large touch targets, icon-heavy, offline-friendly
- **IoT**: Dashboard widgets, real-time data, compact density, color-coded states
- **Telecom**: Plan comparison, usage meters, promo heroes`,
  },
  {
    sectionId: 'accessibility-layout',
    title: 'Accessibility & Layout',
    priority: 12,
    content: `- Focus order follows visual reading order
- Touch targets: 44×44px mobile, 24×24px desktop minimum
- Color never the only way to convey information
- WCAG AA contrast (4.5:1 normal text, 3:1 large text)
- Sequential heading hierarchy (h1 → h2 → h3)
- Images need meaningful alt text
- IconButton needs aria-label
- Use semantic HTML (section, header, main, nav)`,
  },
];

/**
 * Build CompositionRule[] from seed sections for use as fallback
 * when no brand-specific rules exist.
 */
export function buildSeedRules(): CompositionRule[] {
  return COMPOSITION_SEED_SECTIONS.map((section) => ({
    sectionId: section.sectionId,
    title: section.title,
    content: section.content,
    priority: section.priority,
    scope: 'base' as const,
    isActive: true,
    version: 1,
  }));
}
