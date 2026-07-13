# One UI Studio Documentation

Complete documentation for the One UI multi-brand design system platform.

## Quick Navigation

### 📋 Getting Started
- [Setup Progress](../SETUP_PROGRESS.md) - What was created
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Complete guide
- [Project Instructions](../CLAUDE.md) - Rules and architecture

### 🏗️ Architecture
- [Architecture Overview](./architecture/overview.md) - System design
- [Foundations](./architecture/foundations.md) - Design token system
- [Platform](./architecture/platform.md) - Web platform architecture
- [Convex Backend](./architecture/convex.md) - Database and real-time sync

### 🎨 Design System
- [Shape System](./design/shapes.md) - Interactive vs non-interactive
- [Color System](./design/colors.md) - OkLCH color scales
- [Typography](./design/typography.md) - DIN 1450 calculations
- [Spacing](./design/spacing.md) - Responsive interpolation
- [Motion](./design/motion.md) - Timing and easing

### 🤖 Quality & Automation
- [Quality Gates](./quality/gates.md) - Validation scripts
- [Accessibility](./quality/accessibility.md) - WCAG AA standards
- [Testing](./quality/testing.md) - Unit and a11y tests

### 🛠️ Component Development
- [Component Pattern](./components/pattern.md) - How to build components
- [Button Reference](./components/button.md) - Example component
- [Scaffolding Tool](./components/scaffolding.md) - Generate new components

### 📦 Package Guide
- [packages/shared](./packages/shared.md) - Core types
- [packages/tokens](./packages/tokens.md) - Token system
- [packages/ui](./packages/ui.md) - Web components
- [packages/ui-native](./packages/ui-native.md) - React Native
- [packages/convex](./packages/convex.md) - Backend

### 🎯 PRDs
- [Platform Overview](../prd/PRD-01-PLATFORM-OVERVIEW.md)
- [Brand Configuration](../prd/PRD-02-BRAND-CONFIGURATION.md)
- [Foundations](../prd/PRD-03-FOUNDATIONS.md)
- [Components](../prd/PRD-04-COMPONENTS.md)
- [Experience Builder](../prd/PRD-05-EXPERIENCE-BUILDER.md)

## Key Files

- **CLAUDE.md** - Project instructions (at root)
- **SETUP_PROGRESS.md** - Setup status tracker
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation guide
- **pnpm-workspace.yaml** - Monorepo definition
- **package.json** - Root workspace config
- **turbo.json** - Build pipeline

## Commands

```bash
# Development
pnpm dev              # Start all dev servers
pnpm storybook        # Component documentation
pnpm typecheck        # TypeScript validation

# Quality Gates
pnpm check:literals   # Zero-tolerance enforcement
pnpm validate:tokens  # Token resolution validation
pnpm check:parity     # Platform parity validation

# Building
pnpm build            # Production build
pnpm clean            # Clean all build artifacts
```

## Architecture Overview

```
Web Platform (Next.js)
    ↓
UI Library (React + Base UI)
    ↓
Token System (CSS + JS)
    ↑
Convex Backend (Real-time sync)
    ↑
React Native (Platform parity)
```

## Zero-Tolerance Rules

1. **No Literals** - All values must be tokens
2. **Token-Only Styling** - `var(--Token)` or `tokens.*`
3. **Shape System** - Interactive = `999px` pill
4. **Base UI Purity** - Never fork primitives
5. **Type Safety** - Strict TypeScript everywhere
6. **Accessibility** - WCAG AA mandatory

## Next Steps

1. Run `pnpm install` to set up dependencies
2. Verify with `pnpm typecheck` and `pnpm check:literals`
3. Start development: `pnpm dev`
4. Create new components with `npx tsx scripts/generate-component.ts ComponentName`
5. Test in Storybook: `pnpm storybook`

---

For detailed information, see the relevant documentation file above.
