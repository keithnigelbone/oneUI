# One UI Studio — Brand Configuration PRD

> **Version**: 1.0.0  
> **Last Updated**: January 2026  
> **Status**: Draft  
> **Parent**: [Platform Overview PRD](./PRD-01-PLATFORM-OVERVIEW.md)

---

## Overview

The Brand Configuration section provides a comprehensive view of all design tokens for a selected brand, including token exploration, Figma synchronization, and brand-specific overrides. This is the command center for understanding and managing the complete token ecosystem.

### User Stories

- As a **Design System Lead**, I want to see all tokens at a glance so I can ensure brand consistency
- As a **Designer**, I want to explore token relationships so I can understand the system
- As a **Developer**, I want to search tokens quickly so I can find the right values
- As an **Admin**, I want to sync from Figma so tokens stay current

---

## Navigation Structure

```
Brand Configuration
├── Overview          ← Dashboard with key metrics
├── Token Explorer    ← Searchable token browser
├── Figma Sync        ← Import/sync management
└── Export            ← Export configurations
```

---

## F1: Brand Overview Dashboard

### F1.1 Brand Header

```
┌─────────────────────────────────────────────────────────────────┐
│  [Brand Icon]                                                   │
│  JioCinema                                              [Edit]  │
│  Entertainment streaming platform                               │
│                                                                 │
│  Status: Active    Created: Jan 2024    Last Sync: 2 hours ago │
└─────────────────────────────────────────────────────────────────┘
```

**Data Model**:
```typescript
interface BrandHeader {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'draft' | 'deprecated';
  createdAt: Date;
  lastSyncAt: Date;
  createdBy: User;
}
```

### F1.2 Token Statistics Cards

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Colors    │ │  Typography  │ │   Spacing    │ │    Total     │
│     247      │ │      96      │ │      39      │ │     512      │
│   +12 new    │ │   unchanged  │ │   +3 new     │ │   tokens     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### F1.3 Brand Color Preview

Visual preview of primary brand colors across modes:

```
┌─────────────────────────────────────────────────────────────────┐
│  Brand Colors                                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Light Mode                                              │   │
│  │  [Primary 500] [Secondary 500] [Background] [Text]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Dark Mode                                               │   │
│  │  [Primary 600] [Secondary 600] [Background] [Text]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F1.4 Recent Changes Timeline

```typescript
interface TokenChange {
  id: string;
  tokenName: string;
  category: string;
  action: 'created' | 'updated' | 'deleted';
  previousValue?: string;
  newValue?: string;
  changedBy: User;
  changedAt: Date;
}
```

**Display**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Recent Changes                                       [View All]│
│                                                                 │
│  ● 2 hours ago — Surface-Bold updated                           │
│    oklch(50% 0.15 340) → oklch(52% 0.16 340)                   │
│    by Nuno Alves                                                │
│                                                                 │
│  ● Yesterday — 12 new color tokens added via Figma sync         │
│    by System                                                    │
│                                                                 │
│  ● 3 days ago — Typography scale updated                        │
│    Display.L increased from 66px to 68px                        │
│    by Design Team                                               │
└─────────────────────────────────────────────────────────────────┘
```

### F1.5 Quick Actions

```
┌─────────────────────────────────────────────────────────────────┐
│  Quick Actions                                                  │
│                                                                 │
│  [🔄 Sync from Figma]  [📦 Export All]  [📋 Copy Token List]   │
│  [🎨 Edit Brand Colors]  [📊 View Analytics]  [⚙️ Settings]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## F2: Token Explorer

### F2.1 Search & Filter Bar

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search tokens...                          [Filters ▼]       │
│                                                                 │
│  Categories: [All] [Color] [Typography] [Spacing] [Shape] ...  │
│                                                                 │
│  Mode: [All] [Light] [Dark] [Dim]                              │
└─────────────────────────────────────────────────────────────────┘
```

**Search Behavior**:
- Fuzzy search across token names
- Search in values (e.g., search "oklch" finds color tokens)
- Search in descriptions
- Keyboard shortcut: `Cmd/Ctrl + K`

**Filter Options**:
```typescript
interface TokenFilters {
  category: string[];      // color, typography, spacing, etc.
  mode: string[];          // light, dark, dim
  status: string[];        // active, deprecated, new
  hasOverride: boolean;    // Brand-specific overrides
  search: string;
}
```

### F2.2 Token List View

```
┌─────────────────────────────────────────────────────────────────┐
│  Token Name              │ Value         │ Mode    │ Actions    │
├─────────────────────────────────────────────────────────────────┤
│  ▼ Color                                                        │
│    ▼ Surface                                                    │
│      Surface-Bold        │ [■] oklch(52% 0.16 340) │ Light │ ⋮ │
│      Surface-Bold        │ [■] oklch(45% 0.14 340) │ Dark  │ ⋮ │
│      Surface-Subtle      │ [■] oklch(95% 0.02 340) │ Light │ ⋮ │
│      Surface-Ghost       │ [■] transparent        │ All   │ ⋮ │
│    ▼ Text                                                       │
│      Text-High           │ [■] oklch(20% 0 0)     │ Light │ ⋮ │
│      Text-High           │ [■] oklch(95% 0 0)     │ Dark  │ ⋮ │
│  ▼ Typography                                                   │
│    ▼ Display                                                    │
│      Display-L           │ 66px / 900 / 100%      │ Mobile│ ⋮ │
└─────────────────────────────────────────────────────────────────┘
```

### F2.3 Token Detail Panel

Clicking a token opens a detail panel:

```
┌─────────────────────────────────────────────────────────────────┐
│  Surface-Bold                                          [Close]  │
├─────────────────────────────────────────────────────────────────┤
│  Category: Color > Surface                                      │
│  Description: Primary brand surface for bold elements           │
│                                                                 │
│  ┌─ Values by Mode ─────────────────────────────────────────┐  │
│  │  Light: oklch(52% 0.16 340)  [■■■■■■■■■■]               │  │
│  │  Dark:  oklch(45% 0.14 340)  [■■■■■■■■■■]               │  │
│  │  Dim:   oklch(40% 0.12 340)  [■■■■■■■■■■]               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Inheritance ────────────────────────────────────────────┐  │
│  │  Base: jio-default.Surface-Bold                          │  │
│  │  Override: Yes (jiocinema)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Usage ──────────────────────────────────────────────────┐  │
│  │  Components: Button (bold), Card (bold), Chip (bold)     │  │
│  │  Patterns: Hero banner, CTA sections                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Code ───────────────────────────────────────────────────┐  │
│  │  CSS:    var(--Surface-Bold)                             │  │
│  │  JS:     tokens.surface.bold                             │  │
│  │  Figma:  Surface/Bold                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Edit Override]  [View History]  [Copy Token]                  │
└─────────────────────────────────────────────────────────────────┘
```

### F2.4 Token Visualization

**Color Tokens**: Show swatch with accessibility info
```
┌────────────────────────────────────┐
│  [████████]  oklch(52% 0.16 340)   │
│  Contrast with Text-High: 7.2:1 ✓ │
│  WCAG AA: Pass                     │
└────────────────────────────────────┘
```

**Typography Tokens**: Show sample text
```
┌────────────────────────────────────┐
│  Display Large                      │
│  The quick brown fox               │
│  66px / Weight 900 / LH 100%       │
└────────────────────────────────────┘
```

**Spacing Tokens**: Show visual scale
```
┌────────────────────────────────────┐
│  Spacing-4: 16px                   │
│  [████████████████]                │
│  Scale position: 7/13              │
└────────────────────────────────────┘
```

---

## F3: Figma Sync

### F3.1 Sync Status

```
┌─────────────────────────────────────────────────────────────────┐
│  Figma Sync                                                     │
├─────────────────────────────────────────────────────────────────┤
│  Status: ✓ Connected                                            │
│  File: OneUI Design Kit [BETA]                                  │
│  Last Sync: January 14, 2026 at 10:30 AM                       │
│                                                                 │
│  [🔄 Sync Now]  [⚙️ Configure]  [📋 View Logs]                 │
└─────────────────────────────────────────────────────────────────┘
```

### F3.2 Sync Preview

Before applying, show diff:

```
┌─────────────────────────────────────────────────────────────────┐
│  Sync Preview                                        [Apply All]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✚ Added (12)                                                   │
│  ├─ Color/Brand/Tertiary-500                                    │
│  ├─ Color/Brand/Tertiary-600                                    │
│  └─ ... 10 more                                                 │
│                                                                 │
│  ✎ Modified (3)                                                 │
│  ├─ Surface-Bold                                                │
│  │   oklch(50% 0.15 340) → oklch(52% 0.16 340)                 │
│  ├─ Typography/Display-L                                        │
│  │   66px → 68px                                                │
│  └─ Spacing-5                                                   │
│      24px → 26px                                                │
│                                                                 │
│  ✖ Removed (0)                                                  │
│                                                                 │
│  [Cancel]  [Apply Selected]  [Apply All]                        │
└─────────────────────────────────────────────────────────────────┘
```

### F3.3 Sync Configuration

```typescript
interface SyncConfig {
  figmaFileKey: string;
  figmaAccessToken: string;  // Encrypted
  autoSync: boolean;
  syncInterval: number;      // Minutes
  collections: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
  conflictResolution: 'figma-wins' | 'studio-wins' | 'manual';
}
```

### F3.4 Conflict Resolution

When conflicts detected:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Conflict Detected: Surface-Bold                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Figma Value:          Studio Value:                            │
│  oklch(52% 0.16 340)   oklch(50% 0.18 340)                     │
│  [■■■■■■■■■■]          [■■■■■■■■■■]                             │
│                                                                 │
│  Modified in Figma: Jan 14, 10:30 AM                           │
│  Modified in Studio: Jan 14, 11:45 AM                          │
│                                                                 │
│  [Use Figma]  [Keep Studio]  [Merge Manually]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## F4: Brand Management

### F4.1 Create New Brand

```
┌─────────────────────────────────────────────────────────────────┐
│  Create New Brand                                      [Close]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Brand Name *                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ JioHotstar                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Description                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Sports and entertainment streaming platform              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Base Brand *                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ jio-default                                         ▼    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  All tokens inherit from base unless overridden                 │
│                                                                 │
│  Primary Color                                                  │
│  ┌──────────────────┐                                          │
│  │ Hue: [====●====] │  340°                                    │
│  │ Chroma: [==●===] │  0.18                                    │
│  └──────────────────┘                                          │
│  Preview: [■■■■■■■■■■] oklch(50% 0.18 340)                     │
│                                                                 │
│  Secondary Color                                                │
│  ┌──────────────────┐                                          │
│  │ Hue: [======●==] │  45°                                     │
│  │ Chroma: [===●==] │  0.15                                    │
│  └──────────────────┘                                          │
│  Preview: [■■■■■■■■■■] oklch(50% 0.15 45)                      │
│                                                                 │
│  [Cancel]                                            [Create]   │
└─────────────────────────────────────────────────────────────────┘
```

### F4.2 Brand Settings

```typescript
interface BrandSettings {
  id: string;
  name: string;
  slug: string;           // URL-safe identifier
  description: string;
  baseBrand: string;      // Inheritance parent
  icon: string;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
  status: 'active' | 'draft' | 'deprecated';
  figmaFileKey?: string;
  team: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### F4.3 Token Override Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Token Overrides for JioCinema                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  12 tokens overridden from jio-default                          │
│                                                                 │
│  Token                  │ Base Value      │ Override Value      │
│  ───────────────────────┼─────────────────┼─────────────────────│
│  Surface-Bold           │ oklch(50% 0.15) │ oklch(52% 0.16 340)│
│  Surface-Subtle         │ oklch(95% 0.02) │ oklch(96% 0.03 340)│
│  Primary-500            │ oklch(50% 0.15) │ oklch(50% 0.18 340)│
│  ...                                                            │
│                                                                 │
│  [Add Override]  [Remove All Overrides]  [Export Overrides]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## F5: Export Configuration

### F5.1 Export Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  Export Tokens                                         [Close]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Brand: JioCinema                                               │
│                                                                 │
│  Format                                                         │
│  ○ CSS Variables                                                │
│  ○ JSON (Design Tokens)                                         │
│  ● TypeScript                                                   │
│  ○ SCSS Variables                                               │
│                                                                 │
│  Include                                                        │
│  ☑ All modes (light, dark, dim)                                │
│  ☑ All platforms (mobile, desktop)                             │
│  ☐ Include deprecated tokens                                   │
│  ☑ Include descriptions                                        │
│                                                                 │
│  Output                                                         │
│  ○ Download ZIP                                                 │
│  ● Copy to clipboard                                            │
│  ○ Push to GitHub                                               │
│                                                                 │
│  Preview:                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ export const tokens = {                                  │   │
│  │   surface: {                                             │   │
│  │     bold: 'oklch(52% 0.16 340)',                        │   │
│  │     subtle: 'oklch(96% 0.03 340)',                      │   │
│  │   },                                                     │   │
│  │ };                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Cancel]                                            [Export]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Convex Schema

```typescript
// Brand definitions
brands: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  icon: v.optional(v.string()),
  baseBrand: v.optional(v.id('brands')),
  primaryHue: v.number(),
  primaryChroma: v.number(),
  secondaryHue: v.number(),
  secondaryChroma: v.number(),
  status: v.union(v.literal('active'), v.literal('draft'), v.literal('deprecated')),
  figmaFileKey: v.optional(v.string()),
  team: v.array(v.id('users')),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id('users'),
})
  .index('by_slug', ['slug'])
  .index('by_status', ['status']),

// Token overrides (brand-specific)
tokenOverrides: defineTable({
  brandId: v.id('brands'),
  tokenName: v.string(),
  mode: v.string(),
  value: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id('users'),
})
  .index('by_brand', ['brandId'])
  .index('by_token', ['tokenName']),

// Sync history
syncHistory: defineTable({
  brandId: v.id('brands'),
  source: v.string(),        // 'figma', 'manual', 'api'
  tokensAdded: v.number(),
  tokensUpdated: v.number(),
  tokensRemoved: v.number(),
  syncedAt: v.number(),
  syncedBy: v.id('users'),
  status: v.union(v.literal('success'), v.literal('failed'), v.literal('partial')),
  errorMessage: v.optional(v.string()),
}),
```

---

## Success Criteria

1. **Token discovery**: Find any token in < 5 seconds
2. **Sync reliability**: 99.9% successful syncs
3. **Override clarity**: Clear visualization of inheritance
4. **Export speed**: Full export in < 3 seconds
5. **Audit trail**: Complete history for compliance

---

## Open Questions

1. How do we handle token deprecation and migration paths?
2. Should we support branching/versioning of token sets?
3. What's the merge strategy for multi-designer collaboration?
