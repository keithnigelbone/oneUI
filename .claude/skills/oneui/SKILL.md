---
name: oneui
version: 0.1.0
visibility: public
description: >
  Build correct OneUI / JDS UI with @jds4/oneui-react (web) and @oneui/ui-native
  (React Native). The entry-point skill for any project that consumes the published
  OneUI component library: it loads project context, enforces the cross-cutting
  correctness rules (appearance vs attention, surface discipline, icons, images,
  Base-UI composition, token-only styling), and drives component APIs live from the
  OneUI MCP so generated code matches the installed version. Use this skill whenever
  building a screen, page, form, or component with OneUI/JDS, whenever a project has
  @jds4/oneui-react / @oneui/ui-native in package.json or an oneui.brands.json file,
  and whenever someone says "OneUI", "JDS", "Jio design system", "build a OneUI
  screen", or imports from @jds4/oneui-react. SCOPE: this skill owns component-API
  correctness + the build workflow. For page composition/layout/typography/navigation
  defer to `oneui-design-composition`; for WHICH surface level a region earns defer to
  `surface`; for the [data-surface] remapping mechanism defer to `surface-context`.
---

# OneUI / JDS — Building UI with the Component Library

The entry point for generating UI with the published OneUI library. OneUI is **token-only** (every visual comes from `var(--Token-*)` on web / `tokens.*` on native) and built on **Base UI** primitives. You never hand-roll controls or hard-code colors, sizes, or fonts — you compose released components and let the engine resolve everything.

> **Source of truth for component APIs is the OneUI MCP, not memory.** Props, enums, and defaults are versioned and platform-specific. Always confirm a component's API with `get_component_info` before using it, and validate output with `validate_oneui_code`. This skill holds the rules that *don't* change; the MCP holds the APIs that *do*.

## 1. Project Context (load first)

Before generating code, establish what the project is:

1. **Preferred** — call the MCP `get_project_context` tool (returns brand + active theme from `oneui.brands.json`, installed `@jds4/oneui-react` / `@oneui/ui-native` version, **platform**, and installed components). *(If your MCP build predates this tool, use the fallback.)*
2. **Fallback** — read `package.json` for `@jds4/oneui-react` (web) and/or `@oneui/ui-native` (native) and their versions; read `oneui.brands.json` for the active brand/theme; run `check_oneui_versions`.

The single most important field is **platform** — it is OneUI's equivalent of "which primitive library." It changes imports, tokens, and the rules that apply:

| | Web | Native |
| --- | --- | --- |
| Components | `@jds4/oneui-react` | `@oneui/ui-native` |
| Icons | `@jds4/oneui-icons-jio` | `@oneui/icons-jio-native` |
| Tokens | `var(--Token-*)` in CSS | `tokens.*` style objects |
| `get_component_info` / `list_components` / `validate_oneui_code` | `platform: "react"` | `platform: "reactnative"` |

This skill is **web-first**; native generation is still maturing — pass `platform: "reactnative"` to MCP tools and follow `rules/imports-and-setup.md` for native specifics.

## Principles

1. **Compose released components — never hand-roll.** Check `list_components` / `search_components` before writing a styled `div`. Importing a primitive directly from `@base-ui/react` is wrong (the validator flags it) — use the OneUI component that wraps it.
2. **Token-only. Zero literals.** No hex, px, rem, or raw font values. Web → `var(--Role-*)`, `--Body-M-FontSize`, …; native → `tokens.*`. `validate_oneui_code` fails on literals.
3. **Appearance ≠ attention.** `appearance` is the *color role*; `attention` is the *emphasis level*. They are different props that compose. (→ `rules/appearance-vs-attention.md`)
4. **Default-first surfaces.** Most of the screen is `default`. Any non-default background must be a `<Surface mode="…">`, never a `<div style={{ background }}>`. (→ `rules/surface-discipline.md`)
5. **Confirm the API, then validate.** `get_component_info` before composing; `validate_oneui_code` (+ `get_audit_checklist`) before you're done.

## Critical Rules

Each links to a file with Incorrect/Correct pairs. These are always enforced.

### Appearance vs Attention → [rules/appearance-vs-attention.md](./rules/appearance-vs-attention.md)
- **`appearance` = color role** (`primary` `secondary` `neutral` `sparkle` `brand-bg` `positive` `negative` `warning` `informative`, default `auto`→primary).
- **`attention` = emphasis** (`high`→bold, `medium`→subtle, `low`→ghost). A "secondary-looking" button is `attention="medium"`, **not** `appearance="secondary"`.
- **`secondary` appearance is for non-forward/accent elements** (chips, sliders, selected states, links) — never to demote a button.
- **Input `attention` is `medium | high` only** — there is no `low`.

### Surface Discipline → [rules/surface-discipline.md](./rules/surface-discipline.md)
- **7 surface modes**: `default ghost minimal subtle moderate bold elevated`. Start at `default`; escalate only for a named purpose.
- **Wrap non-default backgrounds in `<Surface>`** so `[data-surface]` token-remapping reaches children. Raw `div` backgrounds break adaptation.
- **No decorative stroke on a tinted Surface** — the fill already bounds it. One `bold` focal point per viewport.
- *Which* level a region earns → defer to the `surface` skill.

### Icons & Text → [rules/icons-and-text.md](./rules/icons-and-text.md)
- **Icon prop is `icon`** (not `name`); import only from `@jds4/oneui-icons-jio` (web) / `@oneui/icons-jio-native`. No `lucide`, `@phosphor`, `react-native-vector-icons`, etc.
- **`appearance="sparkle"` is rare** (celebration/promotion, ~1–2 per viewport); `neutral` for general/chrome. Size via `emphasis`/`size`, never manual `w-/h-` classes.
- **Body text stays neutral** (`--Text-High/Medium/Low`); only links use a tinted/secondary appearance.

### Images → [rules/images.md](./rules/images.md)
- **`Image` has no `shape` prop** — round via the wrapper/CSS recipe; images are **always rounded, never square**, radius scales with image size; avatars are circular.
- Set `aspectRatio` + `fit` (default `cover`); use `interactive` only for clickable media.

### Base-UI Composition → [rules/base-ui-composition.md](./rules/base-ui-composition.md)
- Import components from **`@jds4/oneui-react`**, never `@base-ui/react` directly (validator: `forbidden-base-ui`).
- Custom triggers/elements use the Base-UI **`render`** prop (not Radix `asChild`); `nativeButton={false}` to render a non-button.

### Imports, Setup & Tokens → [rules/imports-and-setup.md](./rules/imports-and-setup.md)
- Import from `@jds4/oneui-react` — never the internal `@oneui/ui`. Set up the provider; never hard-code tokens.
- Role-explicit unified tokens (`--Primary-Bold`, `--Body-M-FontSize`) — not legacy aliases (`--Surface-Bold`, `--Typography-Size-M`).

## Key Patterns

```tsx
// Button hierarchy: ONE high (bold) focal point; demote with attention, not appearance.
<Button attention="high">Buy now</Button>        {/* bold  */}
<Button attention="medium">Add to wishlist</Button> {/* subtle */}
<Button attention="low">Skip</Button>              {/* ghost  */}

// secondary is a color ROLE for accent/non-forward controls — not a button level.
<Chip appearance="secondary">Selected filter</Chip>

// Non-default background MUST be a Surface so children remap. Never <div style={{background}}>.
<Surface mode="bold">
  <Button attention="high">Readable on bold automatically</Button>
</Surface>

// Inputs: attention is medium|high only; pill shape is for search.
<Input attention="medium" placeholder="Email" />
<Input attention="high" shape="pill" type="search" start={<Icon icon="search" />} />

// Icons: `icon` prop, from @jds4/oneui-icons-jio, sparkle is rare, no size classes.
<Icon icon="sparkle" appearance="sparkle" />
<Icon icon="info" appearance="neutral" emphasis="medium" />
```

## Component Selection

Confirm exact names/props with `list_components` + `get_component_info`. Common needs:

| Need | Use |
| --- | --- |
| Action / button | `Button` (hierarchy via `attention`); icon-only → `IconButton`; link-style → `Button contained={false}` |
| Text input | `Input` (`shape="pill"` for search); multiline → `TextArea` |
| Selection | `Checkbox`, `Radio`, `Switch`, `Stepper`, `Tabs` |
| Status / tag | `Badge`, `Chip` |
| Media | `Image` (rounded), `Avatar` (circular), `Logo` |
| Containers | `Card`, `Surface`, `Divider`, `ListItem` |
| Navigation | `HeaderNavigation`, `BottomNavigation`, `Tabs` |
| Feedback | `Toast` |
| Text / type | `Display`, `Headline`, `Title`, `Text`, `Label` |

## Workflow

1. **Context** — `get_project_context` (or fallback). Note brand, version, **platform**.
2. **Find** — `search_components` / `list_components` (pass `platform`). Compose, don't invent.
3. **Confirm APIs** — `get_component_info <name>` for the real props, enums, defaults, slots. Don't guess.
4. **Compose** — apply the Critical Rules. For *layout/typography* lean on `oneui-design-composition`; for *which surface level* lean on `surface`.
5. **Validate** — `validate_oneui_code` (pass `platform`); fix every issue (`forbidden-base-ui`, `undefined-component`, `unknown-prop`, literals, …).
6. **Audit** — run `get_audit_checklist` and confirm: zero literals, `<Surface>` wrapping, one bold focal point, icons from the OneUI icon package, body text neutral.

## References

- **Judgment skills** (this skill defers to them): `oneui-design-composition` (layout/typography/nav/component-selection), `surface` (which surface level + restraint), `surface-context` (the `[data-surface]` remapping mechanism).
- **MCP tools**: `get_project_context`, `list_components`/`search_components`, `get_component_info`, `get_core_invariants`, `get_surface_guide`, `list_brands`/`get_brand_tokens`, `validate_oneui_code`, `get_audit_checklist`, `setup_oneui_project`/`check_oneui_versions`/`update_oneui_packages`.
- **Authoritative rules**: the repo `CLAUDE.md` (surface context, shape system, role-explicit tokens) and `get_core_invariants`.
