# One UI Studio

> Multi-brand design system platform — 7+ brands, 2 platforms, 1.4B users, 22 languages

---

## Quick Start

Use Node `22` from `.nvmrc` before installing dependencies.

```bash
nvm use               # Match the repo Node runtime
pnpm install          # Install dependencies
pnpm dev              # Web platform only (localhost:3000)
pnpm dev:convex       # Convex backend
pnpm dev:all          # Full workspace dev servers
pnpm storybook        # Component docs (localhost:6006)
```

---

## Architecture

A monorepo with 5 packages and 2 apps:

```
packages/
├── shared/       # Framework-agnostic engine (color math, CSS gen, V4 surfaces)
├── tokens/       # CSS custom properties (layers.css, primitives, semantic, themes, density)
├── ui/           # React components (Base UI + CSS Modules)
├── ui-native/    # React Native components
└── convex/       # Convex backend schema + queries

apps/
├── platform/     # Next.js management app (brand config, foundation editors)
└── storybook/    # Storybook 10.2 component documentation
```

### CSS Cascade Layers

```
@layer base, semantic, theme, density, brand
```

Brand CSS is injected at runtime by `useBrandCSS()` into `@layer brand` — highest precedence, overrides everything.

### Key Systems

| System | Summary |
|--------|---------|
| **Color** | 25-step OkLCH scales, base chroma lock, preset or custom per brand |
| **Surfaces V4** | 7 modes (4 BG + 3 FG) × 9 appearance roles × 9 on-colour tokens |
| **Typography V2** | 27 sizes across 6 roles (Display/Headline/Title/Body/Label/Code), relational f-step aliases |
| **F-Scale** | 25-step modular scale (f-8 to f16) drives all spacing + typography |
| **Density** | CSS-only: compact shifts tokens down 1 f-step, open shifts up |
| **Responsive** | Discrete per-platform values via `data-Breakpoint` (3 breakpoints) |
| **Surface Context** | `[data-surface]` CSS blocks remap tokens — zero JS runtime component adaptation |

---

## Surface Context

Components automatically adapt colors when placed on colored surfaces via CSS `[data-surface]` attribute selectors. No JavaScript, no extra props.

**Surface modes:**

| Mode | Purpose |
|------|---------|
| `default` | Page background — ignores parent, always anchors to page |
| `ghost` | Same step as parent — triggers remapping without shifting tone |
| `minimal` | Parent +1 step toward contrast |
| `subtle` | Parent +2 steps — tinted card/panel |
| `moderate` | Parent +3 steps |
| `bold` | Role baseStep — full brand accent fill |
| `elevated` | Parent +1 step toward lighter — floating element |

```tsx
// Components adapt automatically — no manual overrides needed
<Surface mode="bold">
  <Button variant="bold">Fill → tinted accent on bold surface</Button>
  <Button variant="ghost">Text/border → white on bold surface</Button>
</Surface>
```

### Standard vs Brand Route

Surfaces can be computed in two routes:

| Route | Default surface | Offsets from |
|-------|----------------|-------------|
| **Standard** | Page background | Background (default) |
| **Brand** | Brand bold color | Brand bold fill |

The Brand route lets designers preview components as they'd appear in brand-dominant UI (e.g. a fully branded app shell where bold is the ambient surface). Toggle via the **Route** control in the Advanced Editor → Surfaces tab or the Inspector panel.

See [`docs/surface-context-awareness.md`](docs/surface-context-awareness.md) for full documentation.

---

## Commands

```bash
# Development
pnpm dev              # Web platform only
pnpm dev:convex       # Convex backend
pnpm dev:all          # Full workspace dev servers
pnpm dev:native       # React Native (Expo)
pnpm storybook        # Component docs

# Quality gates
pnpm check:literals   # Zero hard-coded values
pnpm validate:tokens  # Token resolution
pnpm typecheck        # TypeScript strict
pnpm test             # Unit tests (Vitest)
pnpm check:layers     # CSS layer order

# Build
pnpm build            # Production build
```

---

## Token Naming

```
--{Role}-{Mode}                 → surface fill
--{Role}-{Mode}-{OnColour}      → on-colour token

Examples:
--Primary-FG-Bold               → brand bold fill color
--Primary-FG-Bold-High          → text color on bold surface
--Neutral-BG-Subtle-Accent-A11y → accessible accent on subtle neutral bg
```

**Roles**: Primary, Secondary, Neutral, Sparkle, Brand-Bg, Positive, Negative, Warning, Informative

**On-Colours**: High, Medium-Text, Low-Text, Medium-Stroke, Low-Stroke, Accent, Accent-A11y, Hover, Pressed

Legacy aliases (`--Surface-Bold`, `--Text-High`, etc.) are supported for backward compatibility.

---

## Component Pattern

```
packages/ui/src/components/ComponentName/
├── ComponentName.shared.ts    # Shared types + hooks
├── ComponentName.tsx          # React web
├── ComponentName.native.tsx   # React Native
├── ComponentName.module.css   # Token-only styles
├── ComponentName.stories.tsx  # Storybook
└── ComponentName.test.tsx     # Tests
```

All styling via `var(--Token-Name)` only — zero hard-coded values.

---

## Critical Rules

- **No literals** — no hex colors, hard-coded pixels, or raw values
- **Token-only styling** — `var(--Token-Name)` on web, `tokens.*` on native
- **Base UI only** — never fork primitive behaviors
- **Surface context** — always use `<Surface>` when placing components on non-default backgrounds
- **WCAG AA** — mandatory accessibility compliance

---

## Recent updates (this branch)

**Stack:**
- React 19.2 (web) / 19.1 (mobile) — `forwardRef` removed across 40 components, refs now plain props
- Expo SDK 54 + React Native 0.81.5 — metro 0.83 overrides, monorepo react dedupe via `metro.config.js resolveRequest`
- Mobile playground (`apps/mobile`) is now wired to the **real Convex pipeline**
  - `useQuery(api.brands.list)` + `getBrandOverviewData` drive a brand picker in the playground header
  - Live token panel surfaces resolved hex values + 4 typography samples for visual confirmation
  - Last-selected brand persists via `AsyncStorage`
  - `EXPO_PUBLIC_CONVEX_URL` env var (see `.env.example`)

**Typography V2 — full native parity:**
- New `buildNativeTypography` engine: 27 sizes × 6 roles → numeric `{ fontSize, lineHeight, fontWeight, fontFamily, letterSpacing }` resolved from brand foundation + DIN 1450 dimension scale
- `useTypographyTokens(role, size, { emphasis? })` hook for native components
- `Button.native` consumes `Label-{XS|S|M|L}` tokens (was previously hardcoded sizes)
- Custom uploaded fonts loaded via `expo-font` (`useBrandFonts` hook) before mount, no fallback flash

**Other:**
- `pnpm.overrides` for the metro suite bumped from 0.81.5 → 0.83.3 (required by `@expo/metro@54`)
- React resolution forced to mobile-local copies via `resolveRequest` so the platform app's `react@19.2.x` (tldraw) and the mobile app's `react@19.1.x` (Expo SDK 54) coexist without "Invalid hook call"
- `Badge` shield logic restored — `CounterBadge` / `IndicatorBadge` displayName re-added (was silently dropped during the forwardRef migration)

---

## AI coding (MCP plugin)

`starter-mcp/` is the **One UI MCP server** (`@jds4/oneui-mcp`), shipped as the `oneui` Claude Code plugin. It gives an AI coding agent the design system's rules, component catalog, brand tokens, a `validate_oneui_code` gate, and Figma→code (`figma_to_code`) — all offline from a baked snapshot. Install and setup: [`starter-mcp/INSTALL.md`](starter-mcp/INSTALL.md) (`/plugin install oneui`). It is a standalone npm package outside the pnpm workspace with its own CI (`.github/workflows/starter-mcp.yml`).

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`CLAUDE.md`](CLAUDE.md) | Full architecture, rules, and system reference |
| [`docs/surface-context-awareness.md`](docs/surface-context-awareness.md) | Surface context system |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and data flows |
| [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) | Developer guide |
| [`starter-mcp/INSTALL.md`](starter-mcp/INSTALL.md) | One UI MCP / `oneui` coding plugin — install & setup |
| [`docs/mcp-audit-2026-07.md`](docs/mcp-audit-2026-07.md) | MCP audit, findings, and remediation backlog |
