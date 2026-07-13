# OneUI Canvas — Component Composition Builder

> tldraw-powered infinite canvas for composing, previewing, and exporting OneUI components with AI-assisted generation.

**Route:** `/canvas`
**No secondary navigation** — the canvas takes 100% of the content area.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ CanvasContent.tsx (apps/platform)                       │
│ ├── Theme scope: 'global' (brand tokens applied)       │
│ ├── Keyboard shortcuts (Cmd+S, Cmd+E, Cmd+Shift+C)    │
│ ├── Save/Load via Convex                               │
│ └── Code export (4 formats)                            │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ExperienceCanvas.tsx (packages/ui)                  │ │
│ │ ├── tldraw <Tldraw> with custom shape utils         │ │
│ │ ├── ComponentShapeUtil (renders real components)     │ │
│ │ ├── ContainerShapeUtil (Surface containers)         │ │
│ │ ├── FrameShapeUtil (artboard frames)                │ │
│ │ ├── LeftSidebar (components, templates, surfaces)   │ │
│ │ ├── SelectionPanel (prop editing, frame actions)    │ │
│ │ ├── LayersPanel (shape hierarchy)                   │ │
│ │ ├── AIPrompt (natural language generation)          │ │
│ │ ├── PreviewToggle (edit/preview mode)               │ │
│ │ └── Auto-layout engine                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/platform/src/app/(platform)/canvas/page.tsx` | Canvas route (dynamic import, ssr: false) |
| `apps/platform/src/app/(platform)/canvas/CanvasContent.tsx` | Page component (Convex, theme, shortcuts, code panel) |
| `apps/platform/src/app/(platform)/canvas/canvas.module.css` | Page layout styles |
| `apps/platform/src/app/api/canvas/generate/route.ts` | AI generation API (Claude via Vercel AI SDK) |
| `packages/ui/src/components/ExperienceCanvas/ExperienceCanvas.tsx` | Main canvas component |
| `packages/ui/src/components/ExperienceCanvas/ComponentShape.tsx` | Custom tldraw shape for OneUI components |
| `packages/ui/src/components/ExperienceCanvas/ContainerShape.tsx` | Custom tldraw shape for Surface containers |
| `packages/ui/src/components/ExperienceCanvas/PropPanel.tsx` | Meta-driven property editor |
| `packages/ui/src/components/ExperienceCanvas/LayersPanel.tsx` | Shape hierarchy tree |
| `packages/ui/src/components/ExperienceCanvas/AIPrompt.tsx` | AI generation prompt bar |
| `packages/ui/src/components/ExperienceCanvas/PreviewToggle.tsx` | Edit/Preview mode toggle |
| `packages/ui/src/components/ExperienceCanvas/autoLayout.ts` | Persistent auto-layout engine |
| `packages/ui/src/components/ExperienceCanvas/useCanvasEditor.ts` | Editor state, AST export, validation |

---

## Component Shapes

### ComponentShapeUtil

Renders real OneUI components inside tldraw shapes. Each shape stores:

```typescript
type ComponentShapeProps = {
  w: number;                              // Shape width
  h: number;                              // Shape height
  componentType: string;                  // PascalCase name (e.g., 'Button')
  componentProps: Record<string, unknown>; // Props passed to the component
  childText: string;                      // Text content (button label, checkbox label)
  _surfaceContext: string;                // Auto-detected surface mode
};
```

**How it renders:**
1. Looks up `componentType` in `COMPONENT_REGISTRY`
2. Gets `entry.component` (the actual React component, NOT the preview grid)
3. Renders `<Component {...props}>{childText}</Component>` inside tldraw's `HTMLContainer`
4. Adds `data-surface` attribute if inside a Surface container (for CSS token remapping)

**Surface context detection:**
- Runs directly in the render method (reactive to all shapes)
- Checks if the component's center point overlaps any Container shape
- Sets `data-surface` attribute on the HTMLContainer for CSS cascade

**Fixed-size components** (Avatar, Checkbox, Radio, Switch, Icon, etc.) have `canResize: false` — their selection frame matches the intrinsic component size.

**Square components** (Avatar, IconButton, IconContained, Icon, badges) lock aspect ratio on resize.

### ContainerShapeUtil

Renders Surface containers with configurable appearance role and surface mode.

```typescript
type ContainerShapeProps = {
  w: number;
  h: number;
  surfaceMode: string;    // 'default' | 'ghost' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated'
  appearance: string;     // 'primary' | 'secondary' | 'neutral' | 'sparkle' | etc.
  label: string;
};
```

Each appearance role maps to its own token set for the background color:
- Primary: `var(--Primary-Bold)`, `var(--Primary-Subtle)`, etc.
- Neutral: `var(--Neutral-Bold)`, `var(--Neutral-Subtle)`, etc.
- And so on for all 8 appearance roles.

The container renders a `<div data-surface="{mode}">` which triggers CSS token remapping from the brand CSS `@layer brand` for child components.

---

## Left Sidebar

### Structure

```
Search input (filters all sections)
├── Artboard dropdown (5 device presets)
├── Surfaces section
│   ├── Appearance selector (primary/secondary/neutral/...)
│   └── Mode list with color swatches (default/ghost/minimal/subtle/moderate/bold/elevated)
├── Tab bar: Components | Templates
├── Components tab (grouped by category)
│   ├── Actions (Button, Icon Button, Link Button)
│   ├── Display (Avatar, Icon, Icon Contained, Image, Counter Badge, Indicator Badge)
│   └── Inputs (Checkbox, Radio, Switch, Stepper)
└── Templates tab (24+ predefined compositions)
    ├── Per-component templates (e.g., Button: basic, with icon, group, variants)
    └── Compositions (Settings Form, Login Actions)
```

### Adding Components

When a component is clicked in the sidebar:
1. Checks if a frame is selected (or uses the first frame on the page)
2. If inside a frame: places with proper padding (20px) and gap (12px), appends below last child
3. Buttons/inputs get `fullWidth: true` to stretch across the frame
4. If no frame: places at viewport center

### Auto-parent on Drop

When a free-floating component is dragged onto a frame:
- Side-effect detects the overlap
- Automatically reparents the shape into the frame
- Snaps to the bottom of existing children

---

## Right Panel

### PropPanel (on component selection)

Shows when a single component shape is selected:

```
Component Name         </>  100×40
[High] [Medium] [Low]         ← variant presets
Component: [Button ▼]         ← type switcher
Text: [Button text]           ← child text
attention: [high ▼]           ← enum prop
size: [10 ▼]                  ← enum prop
appearance: [auto ▼]          ← enum prop
condensed: [toggle]           ← boolean prop (Switch)
fullWidth: [toggle]           ← boolean prop
disabled: [toggle]            ← boolean prop
```

- **`</>`** button: copies the component's JSX to clipboard
- **Dimensions**: shows w×h, click to reset to default size
- **Variant presets**: one-click attention level switching
- Props auto-generated from `ComponentMeta.props`
- Uses project's own components (Select, Input, Switch)
- All styling uses Neutral appearance tokens

### FrameActions (on frame/artboard selection)

Shows when a frame is selected OR when a component inside a frame is selected:

```
Frame Name [count] [Fit] [PNG]
RESIZE: [360] [768] [1024] [1440]
AUTO LAYOUT: [Column ↓] [Row →] [Off]
             [Start] [Center] [End] [Fill]
ACTIONS: [Stack ↓] [Stack →] [Fit ↕]
ALIGN CHILDREN: [Left] [Center] [Right] [Fill ↔]
SPACING: Gap [12] Pad [20]
ADD TO FRAME: [Button] [Switch] [Checkbox] [Avatar] [Stepper] [Image]
```

### MultiSelectionActions (on 2+ selections)

```
N selected
AUTO LAYOUT: [Wrap Vertical] [Wrap Horizontal]
ALIGN: [Left] [Center] [Right]
DISTRIBUTE: [Vertical] [Horizontal]
```

**Wrap Vertical/Horizontal**: Creates a new frame, reparents selected shapes into it, arranges with gap/padding. Like Figma's Shift+A.

---

## Auto-Layout Engine

### Persistent Layout (`autoLayout.ts`)

Stores layout configuration per frame ID:

```typescript
interface LayoutConfig {
  direction: 'column' | 'row';
  gap: number;           // default 12
  paddingX: number;      // default 20
  paddingY: number;      // default 20
  align: 'start' | 'center' | 'end' | 'stretch';
  hugContent: boolean;   // auto-resize frame to fit
}
```

When enabled on a frame:
- Runs automatically on every frame child change (via side-effect)
- Positions children according to direction + gap + padding
- `stretch` alignment sets child width to frame content width
- `hugContent` resizes frame height to exactly fit content

### One-shot Actions

- **Stack ↓/→**: Re-arranges existing children without enabling persistent layout
- **Fit ↕**: Resizes frame height to fit content
- **Align Children**: Aligns all children left/center/right or stretches to fill

---

## AI Generation

### API Route (`/api/canvas/generate`)

- Uses Vercel AI SDK with `@ai-sdk/anthropic` (Claude Sonnet)
- `generateText` with structured JSON output (no Zod schemas — more reliable)
- Rich system prompt with:
  - All 13 component types and their props
  - Composition rules (screen structure, attention hierarchy, spacing)
  - Layout patterns (setting rows, form groups, button pairs, profile headers)
  - Screen archetypes (Login, Settings, Onboarding, Profile, Product)
  - Multi-screen flow format (separate element children with `data-screen` prop)

### AI Prompt Component

```
[✦] [Describe a UI to generate...        ] [Generate]
```

- **✦ button**: toggles suggestion chips
- **Suggestions**: "Login screen with sign in and forgot password", "Settings page with notification toggles", etc.
- **Context-aware**: when components are selected, sends their types as context for refinement
- **Placement**: single screen → inside existing artboard; multi-screen → side-by-side new frames

### Multi-Screen Generation

When user asks for "flow", "steps", "screens":
- AI generates separate element blocks per screen with `data-screen` prop
- Canvas creates side-by-side iPhone-sized frames (390×844, 430px apart)
- Each frame named from the `data-screen` value
- Placed to the RIGHT of all existing content

---

## Code Export

### Four Formats

| Mode | Output |
|------|--------|
| **JSX** | Import statement + JSX fragment |
| **Component** | Complete React function component with export |
| **Next.js** | Full Next.js page with 'use client' directive |
| **Native** | React Native screen with ScrollView + StyleSheet |

### Frame-Aware Export

The AST export preserves artboard hierarchy:
- Frames become `<div>` wrappers with width/height/padding
- Components inside frames become children
- Orphan components appended at root
- `data-artboard` attribute preserves frame name

### Copy & Download

- **Copy**: copies code to clipboard
- **.tsx**: downloads as a `.tsx` file
- **Cmd+Shift+C**: copies selected components as JSX (multi-selection)
- **`</>`** in PropPanel: copies single component JSX

---

## Persistence (Convex)

### Compositions Table

```typescript
compositions: defineTable({
  brandId: v.id('brands'),
  name: v.string(),
  description: v.optional(v.string()),
  ast: v.string(),                        // Serialized ASTRoot JSON
  tldrawSnapshot: v.optional(v.string()), // Full tldraw state for restoration
  generatedCode: v.optional(v.string()),  // Cached code output
  status: v.union(v.literal('draft'), v.literal('published')),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Save Flow

1. User types a name in the floating input
2. Clicks Save (or Cmd+S)
3. Captures: AST from canvas, tldraw snapshot, generated code
4. Stores in Convex linked to current brand

### Load Flow

1. Open saved compositions panel (floating button shows count)
2. Click **Load** on a composition with a tldraw snapshot
3. `editor.store.loadSnapshot()` restores full canvas state
4. All shapes, positions, frames restored exactly

### Share

Each saved composition has a shareable URL: `/canvas/view/[compositionId]`
- Read-only viewer showing composition name, date, and generated code
- Copy Code button + "Open in Canvas" link

---

## Canvas Configuration

### Canvas Background

Dropdown in floating actions: Neutral (default) / White / Subtle / Dark
- Maps to `--Neutral-Minimal`, `--Neutral-Default`, `--Neutral-Subtle`, `--Neutral-Bold`

### Theme Toggle

☀/☾ button switches between light and dark theme for the entire canvas.
Components re-render with the new theme's tokens.

### Brand Awareness

The canvas page auto-sets `themeScope: 'global'` which injects the **selected brand's** CSS tokens. Components on the canvas render with the active brand's colors (Jio orange, Tira purple, etc.). Restores to 'preview' (platform default) when leaving the canvas.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save composition |
| `Cmd+E` | Toggle code panel |
| `Cmd+Shift+C` | Copy selected components as JSX |
| `Double-click` | Inline text editing on component |
| `Delete/Backspace` | Delete selected shapes |
| `Cmd+D` | Duplicate selected (tldraw built-in) |
| `Cmd+Z` | Undo (tldraw built-in) |
| `Cmd+Shift+Z` | Redo (tldraw built-in) |
| `Space+drag` | Pan canvas (tldraw built-in) |
| `Cmd+scroll` | Zoom (tldraw built-in) |

---

## Surface Context on Canvas

Components automatically adapt when placed on Surface containers:

1. **ContainerShape** renders with `data-surface="{mode}"` and the appearance role's background token
2. **ComponentShape** detects overlap with containers in real-time (render-time detection)
3. Sets `data-surface` attribute on its own HTMLContainer and inner wrapper
4. The brand CSS `[data-surface="bold"]` blocks (and one block per surface mode) remap tokens so children stay readable:
   - `--Primary-Bold` → parent-step-relative fill that stays distinguishable on the bold surface
   - `--Primary-Bold-High` → contrasting text colour
   - `--Primary-Subtle` → tinted tint that still reads against the bold surface
   - `--Primary-High` → contrasting text colour for content tokens

### Surface Modes Available

The 7 unified surface modes are all available as Surface containers:
- `default` — page/section background
- `ghost` — same step as parent (still triggers context remapping)
- `minimal` — parent + 1 step toward contrasting direction
- `subtle` — parent + 2 steps (tinted card / section)
- `moderate` — parent + 3 steps
- `bold` — role `baseStep` (hero, banner, CTA, filled button)
- `elevated` — parent + 1 step toward lighter (raised / floating element)

Legacy V4 mode names (`fg-bold`, `bg-subtle`, `bg-bold`, `fg-minimal`, `fg-subtle`, `bg-minimal`) are still accepted by `<Surface>` and normalised to the canonical 7 tokens; prefer the unified names above in new code.

---

## Edit vs Preview Mode

Toggle in top-right corner:

| Mode | Behavior |
|------|----------|
| **Edit** (default) | tldraw handles selection, drag, resize. Components are non-interactive. |
| **Preview** | Components become interactive: buttons click, switches toggle, checkboxes check. Canvas still pans/zooms. |

Preview mode sets `pointerEvents: 'all'` on component shapes and calls `editor.markEventAsHandled` to prevent tldraw from intercepting clicks.

---

## Typography

The canvas root and all tldraw text shapes use `--Typography-Font-Primary` from the brand's foundation. Text written on the canvas renders in the selected brand's font.

---

## Styling Principles

All canvas UI uses **Neutral appearance tokens** to avoid interfering with the brand's primary color:
- Backgrounds: `--Neutral-Minimal`, `--Neutral-Subtle`
- Borders: `--Neutral-Stroke-Low`
- Focus rings: `--Neutral-TintedA11y`
- Hover states: `--Neutral-Subtle-Hover`
- Shadows: `var(--Elevation-1)` — subtle, not heavy
- Text: `--Text-High`, `--Text-Medium`, `--Text-Low`
- Font sizes: `--Body-S-FontSize` (13px) for items, `--Label-XS-FontSize` (11px) for labels

**Zero hardcoded values** — all colors, spacing, typography, shapes, and shadows use design tokens from the system.

---

## tldraw Customizations

### Hidden UI

- **StylePanel**: hidden (colors, fill, dash, size — irrelevant for component composition)
- **HelpMenu**: hidden

### Removed Tools

Drawing tools removed from toolbar (kept only Select, Hand, and shape tools):
- Draw, Eraser, Arrow, Text, Note, Media, Highlight, Laser

### Frame Styling (Figma-like)

- Frame borders: removed (transparent stroke on all SVG rects)
- Frame background: `--Neutral-Default` (clean white)
- Frame label: plain gray text, no badge styling
- Frame body: subtle drop-shadow for depth cue
