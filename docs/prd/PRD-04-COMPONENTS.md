# One UI Studio — Components Section PRD

> **Version**: 2.0.0
> **Last Updated**: January 2026
> **Status**: Draft
> **Parent**: [Platform Overview PRD](./PRD-01-PLATFORM-OVERVIEW.md)
> **Related**: [Component Architecture PRD](./PRD-04a-COMPONENT-ARCHITECTURE.md)

---

## Executive Summary

The Components section of One UI Studio is where users browse, configure, and customize design system components by connecting them to Foundation tokens. This PRD defines the platform experience — how users interact with components, manipulate token bindings, connect to all foundation categories (Color, Typography, Spacing, Shape, Elevation, Motion), and maintain real-time Storybook synchronization.

### Purpose

Enable design system teams to:
- Browse and explore all available components
- Visually configure component properties
- **Connect components to Foundation tokens** (the key differentiator)
- Preview changes across brands, themes, densities, and platforms
- Maintain 1:1 sync with Storybook documentation
- Export production-ready code

### User Stories

| Role | Story |
|------|-------|
| Design System Lead | I want to connect component tokens to our foundations so changes cascade automatically |
| Designer | I want to preview components with different brand tokens to validate designs |
| Developer | I want to see which foundation tokens each component uses |
| QA Engineer | I want to verify components match Storybook documentation exactly |
| Product Manager | I want to track component adoption and token usage |

---

## Navigation Structure

```
Components
├── All (default)          ← Grid view of all components with status
├── Actions                ← Button, IconButton, Link, FAB
├── Inputs                 ← TextField, Checkbox, Radio, Switch, Select
├── Layout                 ← Card, Container, Divider, Stack
├── Feedback               ← Toast, Alert, Progress, Skeleton
├── Navigation             ← Tabs, Menu, Breadcrumb, Pagination
├── Overlays               ← Modal, Dialog, Popover, Tooltip
└── Data Display           ← Badge, Avatar, List, Table
```

---

## F1: Component Library View

### F1.1 Component Grid

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Components                                              [+ Import New]  │
│                                                                         │
│  🔍 Search components...     [Category ▼] [Platform ▼] [Status ▼]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Context Bar:                                                           │
│  Brand: [JioCinema ▼]  Theme: [Light ▼]  Density: [Default ▼]          │
│  Platform: [Web ●] [Native]                                             │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   ┌──────────┐   │  │   ┌────────┐     │  │   ┌──────────┐   │      │
│  │   │  Button  │   │  │   │   ★    │     │  │   │ Label    │   │      │
│  │   └──────────┘   │  │   └────────┘     │  │   │          │   │      │
│  │                  │  │                  │  │   └──────────┘   │      │
│  │  Button          │  │  Icon Button     │  │  Text Field      │      │
│  │  ● Stable v2.1   │  │  ● Stable v1.3   │  │  ● Stable v1.5   │      │
│  │  Tokens: 24      │  │  Tokens: 18      │  │  Tokens: 32      │      │
│  │  [Storybook ↗]   │  │  [Storybook ↗]   │  │  [Storybook ↗]   │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F1.2 Component Card

**Data Model**:
```typescript
interface ComponentCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
  version: string;
  platforms: { web: boolean; native: boolean };

  // Foundation connections
  tokenConnections: {
    color: number;      // Count of color tokens used
    typography: number;
    spacing: number;
    shape: number;
    elevation: number;
    motion: number;
    total: number;
  };

  // Links
  storybookUrl: string;
  figmaUrl?: string;

  lastUpdated: Date;
}
```

**Acceptance Criteria**:
- [ ] AC1.1: Grid displays all components with live preview thumbnails
- [ ] AC1.2: Thumbnails update in real-time when context (brand/theme/density) changes
- [ ] AC1.3: Each card shows token connection count by foundation category
- [ ] AC1.4: Click card navigates to Component Detail View
- [ ] AC1.5: Storybook link opens component in Storybook in new tab
- [ ] AC1.6: Search filters components by name, description, or token name
- [ ] AC1.7: Filter by category, platform, or status works correctly

---

## F2: Component Detail View

### F2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Components                                                    │
│                                                                         │
│  Button                                               v2.1.0 • Stable   │
│  Primary interactive element for triggering actions                     │
│                                                                         │
│  Quick Links: [Figma ↗] [Storybook ↗] [GitHub ↗] [Copy Import]         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Tabs: [Blueprint] [Properties] [Foundation Tokens] [States] [Code]    │
│                                                                         │
├────────────────────────────────┬────────────────────────────────────────┤
│                                │                                        │
│    Configuration Panel         │         Live Preview Panel             │
│    (Tab-specific content)      │                                        │
│                                │  ┌────────────────────────────────┐   │
│                                │  │                                │   │
│                                │  │      [  Button  ]              │   │
│                                │  │                                │   │
│                                │  └────────────────────────────────┘   │
│                                │                                        │
│                                │  Context Controls:                     │
│                                │  Brand: [JioCinema ▼]                 │
│                                │  Theme: [Light] [Dark] [Dim]          │
│                                │  Density: [Compact] [Default] [Open]  │
│                                │  State: [Idle] [Hover] [Pressed]...   │
│                                │                                        │
│                                │  ┌────────────────────────────────┐   │
│                                │  │  Storybook Sync: ✓ In Sync     │   │
│                                │  │  Last sync: 2 minutes ago       │   │
│                                │  │  [Open in Storybook ↗]         │   │
│                                │  └────────────────────────────────┘   │
│                                │                                        │
└────────────────────────────────┴────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] AC2.1: Live preview updates instantly (<50ms) when any configuration changes
- [ ] AC2.2: Context controls (brand/theme/density/state) persist across tab navigation
- [ ] AC2.3: Storybook sync indicator shows real-time status
- [ ] AC2.4: "Open in Storybook" opens exact same configuration in Storybook

---

## F3: Foundation Tokens Tab (Core Feature)

This is the **key differentiator** — connecting components to foundation tokens.

### F3.1 Foundation Token Connection Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Foundation Tokens                                   [Import from Figma] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Configuration Context:                                                 │
│  Variant: [High ▼]  Appearance: [Primary ▼]  State: [Idle ▼]           │
│                                                                         │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ┌─ 🎨 COLOR TOKENS ──────────────────────────────────────────────────┐│
│  │                                                     [Expand All]    ││
│  │                                                                     ││
│  │  backgroundColor                                                    ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Color > Surfaces > Surface-Bold              [▼] │ ││
│  │  │ ┌────┐                                                        │ ││
│  │  │ │████│ oklch(52% 0.16 340)  — JioCinema / Light             │ ││
│  │  │ └────┘                                                        │ ││
│  │  │ [View in Foundations ↗] [Change Token]                       │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  textColor                                                          ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Color > Text > Text-OnBold-High              [▼] │ ││
│  │  │ ┌────┐                                                        │ ││
│  │  │ │████│ oklch(98% 0 0)  — JioCinema / Light                  │ ││
│  │  │ └────┘                                                        │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  borderColor                                                        ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: (none — transparent)                         [▼] │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ 📝 TYPOGRAPHY TOKENS ─────────────────────────────────────────────┐│
│  │                                                     [Expand All]    ││
│  │                                                                     ││
│  │  textStyle                                                          ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Typography > Label > Label-M                 [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Font: JioType Variable                                        │ ││
│  │  │ Size: 16px (scales with density)                             │ ││
│  │  │ Weight: Medium (500)                                          │ ││
│  │  │ Line Height: 125%                                             │ ││
│  │  │                                                               │ ││
│  │  │ [View in Foundations ↗] [Change Token]                       │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ 📏 SPACING TOKENS ────────────────────────────────────────────────┐│
│  │                                                     [Expand All]    ││
│  │                                                                     ││
│  │  paddingHorizontal                                                  ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Spacing > Spacing-4-5                        [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Base: 20px                                                    │ ││
│  │  │ Compact: 16px  •  Default: 20px  •  Open: 24px              │ ││
│  │  │ ════════════════●══════════════════════════════════════════  │ ││
│  │  │                                                               │ ││
│  │  │ [View in Foundations ↗] [Change Token]                       │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  paddingVertical                                                    ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Spacing > Spacing-3-5                        [▼] │ ││
│  │  │ Base: 12px                                                    │ ││
│  │  │ Compact: 10px  •  Default: 12px  •  Open: 14px              │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  gap (icon to label)                                                ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Spacing > Spacing-2-5                        [▼] │ ││
│  │  │ Base: 6px (Restrained floor — doesn't scale below)           │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ ⬡ SHAPE TOKENS ───────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  borderRadius                                                       ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Shape > Shape-Pill                      🔒 [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Value: 999px                                                  │ ││
│  │  │ ████████████████████████████████████████████████████████████ │ ││
│  │  │                                                               │ ││
│  │  │ ⚠️ LOCKED: Interactive elements MUST use Pill shape          │ ││
│  │  │ This enforces the visual language of interactivity           │ ││
│  │  │                                                               │ ││
│  │  │ [View Shape System ↗]                                        │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ 🔲 ELEVATION TOKENS ──────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  boxShadow                                                          ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Elevation > Level-0                          [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Level 0: No shadow (flat)                                     │ ││
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ││
│  │  │                                                               │ ││
│  │  │ Buttons typically use Level 0 (no elevation)                  │ ││
│  │  │ [View Elevation System ↗]                                    │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ ✨ MOTION TOKENS ─────────────────────────────────────────────────┐│
│  │                                                     [Expand All]    ││
│  │                                                                     ││
│  │  backgroundTransition                                               ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Motion > Discreet > Short                    [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Duration: 100ms                                               │ ││
│  │  │ Category: Discreet (small, focused animations)               │ ││
│  │  │                                                               │ ││
│  │  │ Preview: [▶ Play Animation]                                  │ ││
│  │  │ ═══════════════●═══════════════════════════════════════════  │ ││
│  │  │               100ms                                           │ ││
│  │  │                                                               │ ││
│  │  │ [View in Foundations ↗] [Change Token]                       │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  pressTransition                                                    ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Motion > Discreet > Micro                    [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Duration: 50ms                                                │ ││
│  │  │ Used for: Press feedback (scale transform)                   │ ││
│  │  │                                                               │ ││
│  │  │ Preview: [▶ Play Animation]                                  │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  │  easing                                                             ││
│  │  ┌───────────────────────────────────────────────────────────────┐ ││
│  │  │ Foundation: Motion > Easing > Standard                   [▼] │ ││
│  │  │                                                               │ ││
│  │  │ Curve: cubic-bezier(0.4, 0, 0.2, 1)                          │ ││
│  │  │                                                               │ ││
│  │  │ ┌────────────────────────────────────────────────────────┐   │ ││
│  │  │ │  ╭─────────────╮                                        │   │ ││
│  │  │ │  │             ╲                                        │   │ ││
│  │  │ │  │              ╲                                       │   │ ││
│  │  │ │  ╱               ╰──────────────────                    │   │ ││
│  │  │ └────────────────────────────────────────────────────────┘   │ ││
│  │  │                                                               │ ││
│  │  │ [View Easing Curves ↗]                                       │ ││
│  │  └───────────────────────────────────────────────────────────────┘ ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F3.2 Token Selection Modal

When user clicks "Change Token":

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Select Foundation Token                                       [Close]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Property: backgroundColor                                              │
│  Current: Surface-Bold                                                  │
│                                                                         │
│  🔍 Search tokens...                                                    │
│                                                                         │
│  Foundation Category: [Color ●] [All]                                   │
│                                                                         │
│  ┌─ Surfaces ─────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ● Surface-Bold          [████]  Primary brand surface             ││
│  │    oklch(52% 0.16 340)          For high-attention elements        ││
│  │                                                                     ││
│  │  ○ Surface-Bold-Hover    [████]  Hover state                       ││
│  │    oklch(48% 0.15 340)                                             ││
│  │                                                                     ││
│  │  ○ Surface-Bold-Pressed  [████]  Pressed state                     ││
│  │    oklch(44% 0.14 340)                                             ││
│  │                                                                     ││
│  │  ○ Surface-Subtle        [████]  Medium attention                  ││
│  │    oklch(95% 0.02 340)                                             ││
│  │                                                                     ││
│  │  ○ Surface-Ghost         [░░░░]  Low attention (transparent)       ││
│  │    transparent                                                      ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ Primary Scale ────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ○ Primary-500           [████]  Base brand color                  ││
│  │  ○ Primary-600           [████]  Darker variant                    ││
│  │  ○ Primary-400           [████]  Lighter variant                   ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Preview with selection:                                                │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                    [  Button  ]                                    ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  [Cancel]                                                    [Apply]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F3.3 Acceptance Criteria for Foundation Tokens Tab

**Color Tokens**:
- [ ] AC3.1: All color properties show connected foundation token name
- [ ] AC3.2: Color swatch displays resolved value for current brand/theme
- [ ] AC3.3: "View in Foundations" navigates to Color foundation page
- [ ] AC3.4: Token selection modal shows all available color tokens with preview

**Typography Tokens**:
- [ ] AC3.5: Typography properties show font family, size, weight, line-height
- [ ] AC3.6: Size shows scaling across densities (compact/default/open)
- [ ] AC3.7: Font preview displays actual rendered text sample

**Spacing Tokens**:
- [ ] AC3.8: Spacing values show base value and density variants
- [ ] AC3.9: Visual scale indicator shows relative position
- [ ] AC3.10: "Restrained floor" tokens are clearly marked

**Shape Tokens**:
- [ ] AC3.11: Interactive elements show locked Pill shape with explanation
- [ ] AC3.12: Lock icon and warning message for shape constraints
- [ ] AC3.13: Non-interactive variants can select from shape scale

**Elevation Tokens**:
- [ ] AC3.14: Elevation level displays with visual preview
- [ ] AC3.15: Shadow formula shown (key light + soft light)
- [ ] AC3.16: Dark mode stroke enhancement noted where applicable

**Motion Tokens**:
- [ ] AC3.17: Duration tokens show millisecond value and category
- [ ] AC3.18: "Play Animation" button demonstrates the timing
- [ ] AC3.19: Easing curves display visual bezier preview
- [ ] AC3.20: Both Discreet and Expressive categories available

**General**:
- [ ] AC3.21: Changes to any token immediately update live preview
- [ ] AC3.22: Changes trigger Storybook sync indicator
- [ ] AC3.23: All tokens link back to their Foundation section
- [ ] AC3.24: Token changes are saved to database (Convex)

---

## F4: States Tab

### F4.1 State Matrix View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  States                                              [View as: Matrix ▼]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Configure tokens for each interaction state                            │
│                                                                         │
│  Variant: [High (Bold) ▼]   Appearance: [Primary ▼]                    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │         │ Idle      │ Hover     │ Pressed   │ Focus     │ Disabled │
│  │─────────┼───────────┼───────────┼───────────┼───────────┼──────────│
│  │ Preview │ [Button]  │ [Button]  │ [Button]  │ [Button]  │ [Button] │
│  │─────────┼───────────┼───────────┼───────────┼───────────┼──────────│
│  │ Surface │ Bold      │ Bold-Hover│ Bold-Press│ Bold-Hover│ Bold @30%│
│  │ Text    │ OnBold    │ OnBold    │ OnBold    │ OnBold    │ OnBold   │
│  │ Scale   │ 1.0       │ 1.0       │ 0.98      │ 1.0       │ 1.0      │
│  │ Motion  │ —         │ Short     │ Micro     │ Short     │ —        │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Click any state column to edit its token configuration                 │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────────│
│                                                                         │
│  State Transitions (Motion):                                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  Idle → Hover                                                       │
│  │  ├─ backgroundColor: Motion-Discreet-Short (100ms)                  │
│  │  └─ easing: Motion-Easing-Standard                                  │
│  │                                                                       │
│  │  Hover → Pressed                                                     │
│  │  ├─ transform: Motion-Discreet-Micro (50ms)                         │
│  │  └─ easing: Motion-Easing-Standard                                  │
│  │                                                                       │
│  │  Any → Focus                                                         │
│  │  ├─ outline: Motion-Discreet-Short (100ms)                          │
│  │  └─ easing: Motion-Easing-Enter                                     │
│  │                                                                       │
│  │  [Edit Transitions]                                                  │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F4.2 State Editor Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Edit State: Hover                                             [Close]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─ Appearance Changes ───────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  backgroundColor                                                    ││
│  │  From: Surface-Bold → To: [Surface-Bold-Hover ▼]                   ││
│  │                                                                     ││
│  │  textColor                                                          ││
│  │  From: Text-OnBold-High → To: [Text-OnBold-High ▼] (no change)     ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ Motion Configuration ─────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  Transition Duration                                                ││
│  │  [Motion-Discreet-Short ▼]  100ms                                  ││
│  │                                                                     ││
│  │  Easing Curve                                                       ││
│  │  [Motion-Easing-Standard ▼]  cubic-bezier(0.4, 0, 0.2, 1)         ││
│  │                                                                     ││
│  │  Properties to Animate                                              ││
│  │  ☑ background-color                                                ││
│  │  ☑ color                                                           ││
│  │  ☐ transform                                                       ││
│  │  ☐ box-shadow                                                      ││
│  │                                                                     ││
│  │  [Preview Transition ▶]                                            ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  [Cancel]                                                    [Save]    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F4.3 Acceptance Criteria for States Tab

- [ ] AC4.1: Matrix displays all states (Idle, Hover, Pressed, Focus, Disabled)
- [ ] AC4.2: Each state shows preview thumbnail with actual tokens applied
- [ ] AC4.3: Clicking state column opens editor with current configuration
- [ ] AC4.4: State transitions show motion token connections
- [ ] AC4.5: "Preview Transition" plays animation between states
- [ ] AC4.6: Disabled state shows opacity reduction (30%)
- [ ] AC4.7: Focus state shows focus ring configuration
- [ ] AC4.8: All state changes sync to Storybook

---

## F5: Storybook Synchronization

### F5.1 Sync Status Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Storybook Sync                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Status: ✓ In Sync                                                      │
│  Last synchronized: January 17, 2026 at 3:45 PM                        │
│                                                                         │
│  ┌─ Sync Details ─────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  Stories synced:                                                    ││
│  │  ✓ Default                    — Button with default props          ││
│  │  ✓ Variants                   — All attention levels               ││
│  │  ✓ Sizes                      — XS through XL                      ││
│  │  ✓ States                     — Disabled, Loading, etc.            ││
│  │  ✓ WithIcons                  — Icon combinations                  ││
│  │  ✓ Interactive                — Play function tests                ││
│  │  ✓ Responsive                 — Viewport testing                   ││
│  │  ✓ Themes                     — Light/Dark/Dim comparison          ││
│  │  ✓ Brands                     — Multi-brand showcase               ││
│  │  ✓ Density                    — Compact/Default/Open               ││
│  │                                                                     ││
│  │  Token coverage: 24/24 (100%)                                       ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  [Force Sync Now]  [View in Storybook ↗]  [View Sync History]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F5.2 Real-time Sync Behavior

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Sync in Progress...                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ⟳ Synchronizing changes to Storybook...                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  Changes detected:                                                   │
│  │                                                                       │
│  │  ✓ Token: backgroundColor changed                                    │
│  │    Surface-Bold → Surface-Bold-Hover (for hover state)              │
│  │                                                                       │
│  │  ⟳ Updating story: States                                           │
│  │  ⟳ Updating story: Themes                                           │
│  │  ⟳ Regenerating CSS Module                                          │
│  │                                                                       │
│  │  Progress: ████████████░░░░░░░░ 60%                                 │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F5.3 Acceptance Criteria for Storybook Sync

- [ ] AC5.1: Sync status visible at all times in detail view
- [ ] AC5.2: Changes trigger automatic sync within 5 seconds
- [ ] AC5.3: Sync progress indicator shows what's being updated
- [ ] AC5.4: "Open in Storybook" opens matching story with same tokens
- [ ] AC5.5: All 10 required story types are maintained
- [ ] AC5.6: Token changes reflect in Storybook controls
- [ ] AC5.7: Brand/Theme/Density toolbar syncs with platform selections
- [ ] AC5.8: Sync history shows last 50 synchronizations
- [ ] AC5.9: Failed syncs show error details and retry option
- [ ] AC5.10: Force sync option available for manual refresh

---

## F6: Live Preview Panel

### F6.1 Preview Configuration

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Live Preview                                      [Fullscreen] [Split] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │                                                                       │
│  │                                                                       │
│  │                                                                       │
│  │                      [  Button  ]                                    │
│  │                                                                       │
│  │                                                                       │
│  │                                                                       │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Context Controls:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  Brand:   [JioCinema ●] [JioMart] [JioHotstar] [Jio Default]       │
│  │  Theme:   [Light ●] [Dark] [Dim]                                    │
│  │  Density: [Compact] [Default ●] [Open]                              │
│  │  Platform: [Mobile 375] [Tablet 768] [Desktop 1440 ●] [TV 1920]    │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Interaction State:                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  [Idle ●] [Hover] [Pressed] [Focus] [Disabled] [Loading]           │
│  │                                                                       │
│  │  ☐ Auto-cycle through states                                        │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Inspect Values:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  Background: oklch(52% 0.16 340)  [Surface-Bold]                    │
│  │  Text: oklch(98% 0 0)  [Text-OnBold-High]                          │
│  │  Padding: 12px 20px  [Spacing-3-5 × Spacing-4-5]                   │
│  │  Border-radius: 999px  [Shape-Pill]                                 │
│  │  Transition: 100ms ease  [Motion-Discreet-Short]                   │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F6.2 Split View Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Compare View                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Compare: [Brands ▼]                                                    │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   JioCinema     │  │    JioMart      │  │   JioHotstar    │        │
│  │                 │  │                 │  │                 │        │
│  │   [Button]      │  │   [Button]      │  │   [Button]      │        │
│  │                 │  │                 │  │                 │        │
│  │ Hue: 340°       │  │ Hue: 145°       │  │ Hue: 45°        │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│  Compare: [Themes ▼]                                                    │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │     Light       │  │      Dark       │  │      Dim        │        │
│  │    ░░░░░░░░░    │  │    ████████     │  │    ▓▓▓▓▓▓▓▓     │        │
│  │   [Button]      │  │   [Button]      │  │   [Button]      │        │
│  │                 │  │                 │  │                 │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F6.3 Acceptance Criteria for Live Preview

- [ ] AC6.1: Preview updates within 50ms of any configuration change
- [ ] AC6.2: All context combinations work (brand × theme × density × platform)
- [ ] AC6.3: Interaction states can be manually simulated
- [ ] AC6.4: "Inspect Values" shows resolved token values
- [ ] AC6.5: Token names displayed alongside computed values
- [ ] AC6.6: Fullscreen mode expands preview to full viewport
- [ ] AC6.7: Split comparison view shows up to 3 variants side-by-side
- [ ] AC6.8: Auto-cycle option demonstrates all states with motion

---

## F7: Code Export

### F7.1 Code Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Code                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Platform: [React Web ●] [React Native]                                 │
│                                                                         │
│  Generated files with current token configuration:                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  📄 Button.tsx              Component                    [Copy]     │
│  │  📄 Button.module.css       Styles with token vars       [Copy]     │
│  │  📄 Button.shared.ts        Types and utilities          [Copy]     │
│  │  📄 Button.tokens.ts        Token mapping hooks          [Copy]     │
│  │  📄 Button.stories.tsx      Storybook stories            [Copy]     │
│  │  📄 Button.test.tsx         Unit tests                   [Copy]     │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  Code Preview: Button.module.css                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  .button {                                                           │
│  │    /* Connected to: Shape > Shape-Pill */                           │
│  │    border-radius: var(--Shape-Pill);                                │
│  │                                                                       │
│  │    /* Connected to: Spacing > Spacing-2-5 */                        │
│  │    gap: var(--Spacing-2-5);                                         │
│  │                                                                       │
│  │    /* Connected to: Motion > Discreet-Short */                      │
│  │    transition:                                                       │
│  │      background-color var(--Motion-Discreet-Short)                  │
│  │        var(--Motion-Easing-Standard);                               │
│  │  }                                                                   │
│  │                                                                       │
│  │  .attention-high {                                                   │
│  │    /* Connected to: Color > Surfaces > Surface-Bold */              │
│  │    background-color: var(--Surface-Bold);                           │
│  │    /* Connected to: Color > Text > Text-OnBold-High */              │
│  │    color: var(--Text-OnBold-High);                                  │
│  │  }                                                                   │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  [Download All]  [Copy All]  [Push to GitHub]                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F7.2 Acceptance Criteria for Code Export

- [ ] AC7.1: Generated code uses CSS variables for all token references
- [ ] AC7.2: Comments in code show foundation connection (e.g., "Color > Surfaces")
- [ ] AC7.3: Code preview syntax highlighted
- [ ] AC7.4: "Copy" copies file content to clipboard
- [ ] AC7.5: "Download All" creates ZIP with all files
- [ ] AC7.6: React Native code uses token imports (not CSS vars)
- [ ] AC7.7: Generated Storybook stories match 10 required types
- [ ] AC7.8: No hard-coded values in generated code (zero literals)

---

## F8: Foundation Navigation Links

Every token connection should link back to its Foundation section.

### F8.1 Quick Navigation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Foundation Quick Links                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  This component uses tokens from:                                       │
│                                                                         │
│  🎨 Color (6 tokens)           [→ Go to Color Foundation]              │
│     Surface-Bold, Surface-Subtle, Surface-Ghost,                        │
│     Text-OnBold-High, Text-High, Text-Medium                           │
│                                                                         │
│  📝 Typography (3 tokens)      [→ Go to Typography Foundation]         │
│     Label-S, Label-M, Label-L                                          │
│                                                                         │
│  📏 Spacing (4 tokens)         [→ Go to Spacing Foundation]            │
│     Spacing-2-5, Spacing-3-5, Spacing-4-5, Spacing-5                   │
│                                                                         │
│  ⬡ Shape (1 token)             [→ Go to Shape Foundation]              │
│     Shape-Pill (locked for interactive)                                 │
│                                                                         │
│  🔲 Elevation (1 token)        [→ Go to Elevation Foundation]          │
│     Level-0 (no shadow)                                                 │
│                                                                         │
│  ✨ Motion (4 tokens)          [→ Go to Motion Foundation]             │
│     Discreet-Micro, Discreet-Short, Easing-Standard, Easing-Enter      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### F8.2 Acceptance Criteria for Foundation Links

- [ ] AC8.1: Every token shows its foundation category path
- [ ] AC8.2: "View in Foundations" opens foundation page at that token
- [ ] AC8.3: Foundation summary shows token counts per category
- [ ] AC8.4: Clicking category navigates to Foundation section
- [ ] AC8.5: Breadcrumb trail: Components > Button > Foundation Tokens > Color

---

## Data Model

### Convex Schema

```typescript
// Component token connections
componentTokenConnections: defineTable({
  componentId: v.id('components'),
  propertyPath: v.string(),           // 'backgroundColor', 'paddingX', etc.

  // Foundation connection
  foundationCategory: v.string(),      // 'color', 'typography', 'spacing', etc.
  tokenName: v.string(),               // 'Surface-Bold', 'Spacing-4-5', etc.

  // Context (for state-specific tokens)
  variant: v.optional(v.string()),     // 'high', 'medium', 'low'
  appearance: v.optional(v.string()),  // 'primary', 'secondary', etc.
  state: v.optional(v.string()),       // 'idle', 'hover', 'pressed', etc.

  // Constraints
  isLocked: v.boolean(),               // Can't be changed (e.g., Shape-Pill)
  lockReason: v.optional(v.string()),  // Explanation for lock

  updatedAt: v.number(),
  updatedBy: v.id('users'),
})
  .index('by_component', ['componentId'])
  .index('by_foundation', ['foundationCategory', 'tokenName']),

// Storybook sync status
storybookSync: defineTable({
  componentId: v.id('components'),
  status: v.union(v.literal('synced'), v.literal('syncing'), v.literal('error')),
  lastSyncAt: v.number(),
  storiesCount: v.number(),
  tokensCovered: v.number(),
  tokensTotal: v.number(),
  errorMessage: v.optional(v.string()),
}),

// Motion token connections (separate for clarity)
componentMotionTokens: defineTable({
  componentId: v.id('components'),
  transitionName: v.string(),         // 'backgroundTransition', 'pressTransition'
  fromState: v.string(),              // 'idle'
  toState: v.string(),                // 'hover'
  durationToken: v.string(),          // 'Motion-Discreet-Short'
  easingToken: v.string(),            // 'Motion-Easing-Standard'
  properties: v.array(v.string()),    // ['background-color', 'color']
}),
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Token connection time | < 3 clicks to change any token |
| Preview update latency | < 50ms |
| Storybook sync time | < 5 seconds after change |
| Foundation navigation | 1 click to reach any connected foundation |
| Token coverage visibility | 100% of tokens show foundation source |
| Motion preview | All transitions playable in UI |
| Multi-brand comparison | Side-by-side view for up to 3 brands |
| Export accuracy | 100% token variables, 0 literals |

---

## Acceptance Criteria Summary

### Must Have (P0)
- [ ] Foundation Tokens tab with all 6 categories (Color, Typography, Spacing, Shape, Elevation, Motion)
- [ ] Token selection modal with search and preview
- [ ] Live preview with instant updates
- [ ] Storybook sync status indicator
- [ ] Context controls (brand/theme/density/platform)
- [ ] Code export with token variable references

### Should Have (P1)
- [ ] State matrix view with motion transitions
- [ ] Split comparison view (brands/themes)
- [ ] Foundation quick navigation links
- [ ] Interaction state simulation
- [ ] Auto-cycle through states

### Nice to Have (P2)
- [ ] Animation preview for motion tokens
- [ ] Figma import for token mappings
- [ ] Token usage analytics
- [ ] Deprecation warnings for tokens

---

## Open Questions

1. **Token Override**: Should users be able to override foundation tokens per-component?
2. **Custom Tokens**: Can components define tokens not in foundations?
3. **Sync Frequency**: Real-time vs. debounced Storybook sync?
4. **Version Control**: How do we handle token changes across component versions?
5. **Permissions**: Who can modify foundation connections?

---

## Related Documents

- [PRD-04a: Component Architecture](./PRD-04a-COMPONENT-ARCHITECTURE.md) — Technical implementation details
- [PRD-03: Foundations](./PRD-03-FOUNDATIONS.md) — Foundation token definitions
- [PRD-01: Platform Overview](./PRD-01-PLATFORM-OVERVIEW.md) — Overall platform architecture
