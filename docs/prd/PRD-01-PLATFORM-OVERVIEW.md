# One UI Studio — Platform Overview PRD

> **Version**: 1.0.0  
> **Last Updated**: January 2026  
> **Status**: Draft

---

## Executive Summary

One UI Studio is a comprehensive design system management platform enabling teams to configure, customize, and distribute token-based design systems across multiple brands and platforms. Built on the philosophy of "this is how you build your component library," the platform provides visual tools for managing foundations, components, and AI-powered experience building.

### Target Users

- **Design System Leads** — Configure and maintain design tokens
- **Product Designers** — Customize components for specific brands
- **Developers** — Access component code and token exports
- **AI/UX Teams** — Build micro-patterns with AI assistance

### Key Metrics

| Metric | Target |
|--------|--------|
| Time to configure new brand | < 30 minutes |
| Token sync from Figma | < 10 seconds |
| Component customization | < 5 minutes |
| AI pattern generation | < 30 seconds |

---

## Platform Architecture

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  │  Global Brand ▼  │  Theme ▼  │  Platform ▼  │ [User] │  ← Top Bar
├──────────┼──────────────────────────────────────────────────────┤
│          │                                                       │
│  Brand   │  ┌─────────────────────────────────────────────────┐ │
│  Config  │  │                                                 │ │
│          │  │              MAIN CONTENT AREA                  │ │
│ ──────── │  │                                                 │ │
│          │  │                                                 │ │
│  Found-  │  │  (Changes based on left nav selection)         │ │
│  ations  │  │                                                 │ │
│          │  │                                                 │ │
│ ──────── │  │                                                 │ │
│          │  │                                                 │ │
│  Compo-  │  │                                                 │ │
│  nents   │  │                                                 │ │
│          │  │                                                 │ │
│ ──────── │  │                                                 │ │
│          │  │                                                 │ │
│  Experi- │  └─────────────────────────────────────────────────┘ │
│  ence    │                                                       │
│  Builder │  ┌─────────────────────────────────────────────────┐ │
│          │  │  Secondary Navigation / Tabs (contextual)       │ │  ← Sub-nav
└──────────┴──┴─────────────────────────────────────────────────┴─┘
```

---

## F1: Top Bar (Global Controls)

### F1.1 Brand Selector

**Purpose**: Switch between configured brands to preview/edit their specific tokens.

```typescript
interface BrandSelector {
  currentBrand: Brand;
  availableBrands: Brand[];
  onBrandChange: (brandId: string) => void;
}

interface Brand {
  id: string;           // "jiocinema"
  name: string;         // "JioCinema"
  icon: string;         // Brand logo URL
  primaryHue: number;   // 340
  status: 'active' | 'draft' | 'deprecated';
}
```

**Behavior**:
- Dropdown with search
- Shows brand icon + name
- Indicates status badge (Active/Draft)
- "Add New Brand" action at bottom
- Changes propagate to all panels

### F1.2 Theme Selector

**Purpose**: Toggle between color modes to preview token values.

```typescript
interface ThemeSelector {
  currentTheme: 'light' | 'dark' | 'dim';
  onThemeChange: (theme: string) => void;
}
```

**Options**:
- **Light** — Default mode (Neutral 2500 background)
- **Dark** — Inverted mode (Neutral 200 background)
- **Dim** — Branded dark (Primary 200 background)

**Behavior**:
- Segmented control or dropdown
- Instantly updates all previews
- Persists in user preferences

### F1.3 Platform Selector

**Purpose**: Switch viewport context for responsive token preview.

```typescript
interface PlatformSelector {
  currentPlatform: 'mobile' | 'tablet' | 'desktop' | 'tv';
  density: 'compact' | 'default' | 'open';
  onPlatformChange: (platform: string) => void;
  onDensityChange: (density: string) => void;
}
```

**Options**:
| Platform | Viewport | Base Size |
|----------|----------|-----------|
| Mobile | 375px | 16px |
| Tablet | 768px | 17px |
| Desktop | 1440px | 16px |
| TV | 1920px | 48px |

**Density Sub-selector**:
- Compact — Tight spacing
- Default — Standard spacing
- Open — Generous spacing

### F1.4 User Menu

**Purpose**: Account management and platform settings.

**Items**:
- User profile
- Team settings
- API keys
- Export preferences
- Documentation
- Sign out

---

## F2: Left Navigation (Primary Nav)

### F2.1 Structure

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: IconName;
  path: string;
  badge?: number;      // For notifications
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    id: 'brand',
    label: 'Brand Configuration',
    icon: 'palette',
    path: '/brand',
    children: [
      { id: 'overview', label: 'Overview', path: '/brand/overview' },
      { id: 'tokens', label: 'Token Explorer', path: '/brand/tokens' },
      { id: 'sync', label: 'Figma Sync', path: '/brand/sync' },
    ]
  },
  {
    id: 'foundations',
    label: 'Foundations',
    icon: 'layers',
    path: '/foundations',
    children: [
      { id: 'color', label: 'Color', path: '/foundations/color' },
      { id: 'typography', label: 'Typography', path: '/foundations/typography' },
      { id: 'spacing', label: 'Spacing', path: '/foundations/spacing' },
      { id: 'shapes', label: 'Shapes', path: '/foundations/shapes' },
      { id: 'elevation', label: 'Elevation', path: '/foundations/elevation' },
      { id: 'motion', label: 'Motion', path: '/foundations/motion' },
    ]
  },
  {
    id: 'components',
    label: 'Components',
    icon: 'component',
    path: '/components',
  },
  {
    id: 'experience',
    label: 'Experience Builder',
    icon: 'sparkles',
    path: '/experience',
    badge: 'AI'
  },
];
```

### F2.2 Behavior

- Collapsible sections
- Active state indication
- Keyboard navigation (arrow keys)
- Tooltip on collapsed state
- Persists collapsed/expanded state

---

## F3: Secondary Navigation (Contextual Tabs)

### F3.1 Purpose

Provides sub-section navigation within each primary section.

### F3.2 Implementation

```typescript
interface SecondaryNav {
  section: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface Tab {
  id: string;
  label: string;
  count?: number;  // For components: component count
}
```

### F3.3 Context Examples

**Brand Configuration**:
- Overview | Token Explorer | Figma Sync | Export

**Foundations > Color**:
- Palette | Surfaces | Text | Status | Accessibility

**Components**:
- All | Inputs | Actions | Layout | Feedback | Navigation

**Experience Builder**:
- Patterns | Templates | History | Saved

---

## F4: Main Content Area

### F4.1 Layout System

```typescript
interface ContentLayout {
  type: 'single' | 'split' | 'grid';
  sidebar?: 'left' | 'right';
  sidebarWidth?: number;  // 300-400px
}
```

**Single Column**: Full-width content (Overview pages)
**Split View**: Content + Preview panel (Component editor)
**Grid View**: Card-based layouts (Component library)

### F4.2 Common Patterns

**Header**:
```
┌─────────────────────────────────────────────────┐
│  Page Title                    [Actions] [Save] │
│  Description text                               │
└─────────────────────────────────────────────────┘
```

**Split Panel**:
```
┌─────────────────────────┬───────────────────────┐
│                         │                       │
│     Configuration       │      Live Preview     │
│        Panel            │        Panel          │
│                         │                       │
└─────────────────────────┴───────────────────────┘
```

---

## F5: Real-time Updates

### F5.1 Convex Integration

All changes sync in real-time via Convex:

```typescript
// Subscribe to brand changes
const brand = useQuery(api.brands.get, { id: brandId });

// Subscribe to token updates
const tokens = useQuery(api.tokens.list, { 
  brand: brandId,
  mode: theme,
});

// Mutation for saving
const updateToken = useMutation(api.tokens.update);
```

### F5.2 Optimistic Updates

- Show changes immediately
- Sync confirmation indicator
- Rollback on error

---

## F6: Export System

### F6.1 Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| CSS Variables | `:root { --token: value }` | Web apps |
| JSON | Design token format | Figma plugins |
| TypeScript | Typed token objects | React Native |
| Storybook | Theme decorator | Documentation |

### F6.2 Export Dialog

```typescript
interface ExportDialog {
  brand: string;
  formats: ExportFormat[];
  platforms: Platform[];
  themes: Theme[];
  includeDeprecated: boolean;
  onExport: (config: ExportConfig) => void;
}
```

---

## F7: Permissions & Roles

### F7.1 Role Matrix

| Action | Viewer | Editor | Admin | Owner |
|--------|--------|--------|-------|-------|
| View tokens | ✅ | ✅ | ✅ | ✅ |
| Edit tokens | ❌ | ✅ | ✅ | ✅ |
| Create brands | ❌ | ❌ | ✅ | ✅ |
| Delete brands | ❌ | ❌ | ❌ | ✅ |
| Manage team | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ✅ | ✅ | ✅ |

---

## Technical Requirements

### Performance

- Initial load: < 2s (LCP)
- Navigation: < 100ms
- Token update: < 50ms (optimistic)
- Search: < 200ms

### Browser Support

- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader announcements
- Focus management on navigation

---

## Data Model

### Convex Schema (Platform Core)

```typescript
// Platform settings
settings: defineTable({
  userId: v.id('users'),
  defaultBrand: v.string(),
  defaultTheme: v.string(),
  defaultPlatform: v.string(),
  sidebarCollapsed: v.boolean(),
  recentBrands: v.array(v.string()),
}),

// Navigation state
navigationState: defineTable({
  userId: v.id('users'),
  expandedSections: v.array(v.string()),
  lastVisited: v.string(),
}),
```

---

## Success Criteria

1. **Navigation clarity**: Users find desired section in < 3 clicks
2. **Context persistence**: Global selections persist across sessions
3. **Real-time feedback**: All changes reflect immediately
4. **Export efficiency**: Full token export in < 5 seconds
5. **Accessibility score**: Lighthouse a11y > 95

---

## Open Questions

1. Should we support multiple brands open simultaneously (tabs)?
2. How do we handle brand inheritance visualization?
3. What's the migration path for existing Figma-only workflows?
