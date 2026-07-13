---
name: oneui-design-system
description: Orchestrate creation, validation, documentation, and backend for token-only design system components with React/React Native parity. Use when creating components, validating compliance, generating documentation, managing backend, or running quality checks.
---

# One UI Design System Skill

## When to Use

Activate this skill when:
- Creating new design system components
- Validating design system compliance
- Generating platform-specific code (React/React Native)
- Creating Storybook documentation
- Managing Convex backend data
- Running quality audits

## Core Principles

1. **Base UI as behavior source** — Never fork, patch, or alter primitives
2. **Token-only visuals** — No hex colors, px values, or literals
3. **Interactive = Brand-defined** — Jio default: Pill (999px), overridable per brand via `--ComponentName-borderRadius`
4. **Platform parity** — React and React Native share API/behavior/visuals
5. **Figma → Convex → Code** — One-way design flow via real-time backend

## Available Subagents

Use these specialized agents for specific tasks:

| Agent | Purpose | Invoke With |
|-------|---------|-------------|
| `foundations` | Token resolution, DIN 1450 typography, OkLCH color | "Use foundations agent to calculate typography" |
| `quality` | Literal detection, token validation | "Use quality agent to scan for hard-coded values" |
| `accessibility` | WCAG AA compliance, keyboard nav | "Use accessibility agent to audit Button" |
| `platform` | React ↔ React Native parity | "Use platform agent to generate React Native" |
| `testing` | Test generation, coverage | "Use testing agent to generate tests" |
| `storybook` | Stories, MDX docs, Chromatic | "Use storybook agent to create Button stories" |
| `convex` | Backend, token sync, registry | "Use convex agent to sync tokens from Figma" |

## Workflows

### Create Component

```
1. Read component spec from specs/{component}.json
2. Generate shared types (Button.shared.ts)
3. Generate web implementation (Button.tsx)
4. Generate React Native implementation (Button.native.tsx)
5. Validate with quality agent (no literals)
6. Audit with accessibility agent (WCAG AA)
7. Generate tests with testing agent (90% coverage)
8. Create Storybook stories with storybook agent
9. Register in Convex with convex agent
```

### Sync Tokens from Figma

```
1. Export tokens from Figma Variables
2. Use convex agent to sync to database
3. Use foundations agent to generate CSS/JS exports
4. Validate with quality agent
5. Update Storybook token documentation
```

### Audit Component

```
1. Scan for literals with quality agent
2. Run accessibility audit
3. Check platform parity
4. Verify test coverage
5. Check Storybook stories exist
6. Verify Convex registry entry
7. Report findings
```

## Shape System Reference

**CRITICAL**: This determines visual interactivity language.

```css
/* Interactive elements - Brand-defined (Jio default: Pill) */
.button { border-radius: var(--Button-borderRadius, var(--Shape-Pill)); }
.input { border-radius: var(--Input-borderRadius, var(--Shape-4)); }

/* Non-interactive elements - Use tokens */
.card { border-radius: var(--Shape-4); }     /* f0 = 16px on S/Default */
.container { border-radius: var(--Shape-4-5); } /* 24px */
```

## Token Resolution

### Typography (DIN 1450)

```
baseSize = tan(0.00582°) × distance × PPI / (2.54 × 0.53 × density)

Presets:
- Mobile: 30cm, 458ppi, 3x → 16px
- Desktop: 50cm, 100ppi, 1x → 16px
```

### Color (OkLCH)

```
25-step scale: 0, 50, 100... 1200
Base chroma lock: No step exceeds base chroma
Dark mode: +1 step shift on primaries
```

## Quality Gates

| Gate | Command | Threshold |
|------|---------|-----------|
| No Literals | `pnpm check:literals` | 0 violations |
| Tokens Resolve | `pnpm validate:tokens` | 100% |
| TypeScript | `pnpm typecheck` | 0 errors |
| Coverage | `pnpm test --coverage` | ≥90% |
| Accessibility | `pnpm test:a11y` | 0 critical |
| Bundle Size | `pnpm bundlesize` | <2.5kb |
| Platform Parity | `pnpm check:parity` | 100% |
| Visual Regression | `pnpm chromatic` | 0 changes |

## Component File Structure

```
{component}/
├── {component}.shared.ts     # Shared types & hooks
├── {component}.tsx           # React (web) implementation
├── {component}.native.tsx    # React Native implementation
├── {component}.module.css    # Web styles (CSS Modules)
├── {component}.test.tsx      # Unit tests
├── {component}.stories.tsx   # Storybook stories
└── index.ts                  # Barrel export
```

## Storybook Story Types

Each component needs 8 stories:
1. `Default` — Base usage with controls
2. `Variants` — Grid of all variants
3. `Sizes` — Row of all sizes
4. `States` — Default, disabled, loading
5. `WithIcons` — Leading/trailing icons
6. `Interactive` — Play functions
7. `Responsive` — Viewport testing
8. `Themes` — Light/dark grid

## Convex Data Model

```
tokens         → Design tokens (synced from Figma)
components     → Component registry (versions, files)
brands         → Brand configurations (overrides)
brandCSSCache  → Server-side CSS cache (auto-invalidated on foundation changes)
componentUsage → Analytics tracking
auditLogs      → Change history
```

## Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `LITERAL_DETECTED` | Hard-coded value found | Replace with token |
| `TOKEN_UNRESOLVED` | Token not in variables | Sync from Figma |
| `ARIA_NONCONFORMANT` | Missing accessibility | Add ARIA attributes |
| `SHAPE_VIOLATION` | Wrong shape for element | Use brand-defined shape token |
| `PARITY_MISMATCH` | Platform API differs | Align props/events |
| `STORY_MISSING` | No Storybook story | Generate with storybook agent |
| `REGISTRY_OUTDATED` | Component not in Convex | Publish with convex agent |

## Scripts

```bash
# Token operations
@skill tokens.resolve --tokens "Surface-Bold" --platform web --mode dark
@skill tokens.sync --from figma --to convex
@skill tokens.export --format css --output dist/

# Component operations
@skill components.generate --spec specs/button.json
@skill components.audit --path src/components/button/
@skill components.fix --literals --dry-run

# Documentation
@skill docs.stories --component Button
@skill docs.chromatic --component Button

# Backend
@skill convex.sync --tokens
@skill convex.publish --component Button --version 1.0.0
```

## Best Practices

1. **Always start with specs** — `specs/{component}.json`
2. **Generate shared types first** — `{component}.shared.ts`
3. **Implement web, then native** — Maintain parity
4. **Validate after every change** — Run quality gates
5. **Create stories early** — Document as you build
6. **Sync to Convex** — Keep registry updated
7. **Reference project knowledge** — `/mnt/project/*.md`
8. **Test across themes** — Light and dark modes
