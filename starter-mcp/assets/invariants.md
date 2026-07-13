
## Core Design System Rules (always apply)

These rules cover ~80% of day-to-day guidance. For deeper topics — color scales,
typography system, the parent-step-relative surface algorithm, architecture,
responsive behaviour, motion, elevation — CALL the `search_design_system` tool.

### Zero literals
- All styling uses CSS custom properties: `var(--Token-Name)`.
- Never hardcode colors, pixel sizes, font sizes, or spacing values.
- Never emit inline styles with raw values in generated ASTs.

### Surface modes (unified vocabulary — no BG/FG split)
There are **7 surface modes**, one vocabulary for both containers and component fills:
`default`, `ghost`, `minimal`, `subtle`, `moderate`, `bold`, `elevated`.

- `default` — page surface (2500 light / 100 dark), ignores parent.
- `ghost` — same step as parent, still triggers context remapping.
- `minimal` / `subtle` / `moderate` — parent + 1 / 2 / 3 steps toward contrasting direction.
- `bold` — role `baseStep` (or darker baseStep if parent is already dark).
- `elevated` — parent + 1 step toward lighter (capped at 2500).

The same `bold` token is used whether the surface is a hero background or a primary button fill.
Context-awareness happens automatically because every surface is resolved against its parent step.

### Surface usage (MANDATORY)
- When placing components on a non-default background, ALWAYS wrap them in `<Surface mode="...">`.
  NEVER set `background` or `backgroundColor` directly on a plain `<div>` (or any container)
  that holds interactive components — whether the value is a literal or a token. A raw
  background bypasses the `[data-surface]` cascade, so children do not remap and text/contrast break.
  Use `<Surface mode="...">` (or `data-surface="..."`) instead.
- Inside a Surface, reference generic role tokens (e.g. `--Primary-Bold`, `--Primary-TintedA11y`,
  `--Text-High`). The brand CSS engine remaps them per `[data-surface]` block automatically.
- Do not add decorative strokes/borders on top of a tinted Surface — the fill IS the boundary.

### Figma attention levels → Button variants
- **High** → `bold` variant: fill `--{Role}-Bold`, text `--{Role}-Bold-High`.
- **Medium** → `subtle` variant: fill `--{Role}-Subtle`, text `--{Role}-TintedA11y`.
- **Low** → `ghost` variant: fill `transparent`, text `--{Role}-TintedA11y`.

Nested inside `<Surface mode="bold">`, these tokens remap automatically — no per-component inversion
logic, no separate on-bold token family at the API boundary.

### Shape defaults
- Buttons default to `Shape-Pill` (9999px, standalone constant — NOT part of the numeric scale).
- Other interactive controls (inputs, chips, selects) default to `Shape-2`.
- Containers/cards use `Shape-3` through `Shape-10` (derived from the f-step dimension scale).
- Circular elements (avatars, dots) use `Shape-Pill`.

### Typography font family (MANDATORY)
- Every text element — inside a component OR in custom composition — MUST set its
  font through a **font token**, never a literal font name. Use `--Typography-Font-Text`
  (body/label/UI) or `--Typography-Font-Heading` (display/headline/title), or the
  role-level `--{Role}-FontFamily` tokens (`--Body-FontFamily`, `--Label-FontFamily`,
  `--Headline-FontFamily`, …) which resolve to those slots.
- NEVER write a literal typeface: `font-family: 'JioType Var'`, `fontFamily: 'Inter'`,
  `font-family: Arial`, etc. A hardcoded font pins the typeface and breaks brand
  switching — under the Jio brand the token already resolves to **JioType Var**, and
  under any other brand it resolves to that brand's font automatically (Jio is the
  default + fallback). The literal is always wrong.
- Whenever you set a `font-size` / `--*-FontSize` on a text element, also set the
  font-family token (and the matching `--*-LineHeight`). Size, line-height, and family
  travel together.
- `--Typography-Font-Primary` is a still-emitted backward-compat alias of
  `--Typography-Font-Text`; existing code that uses it keeps working, but prefer the
  canonical `--Typography-Font-Text` / `--Typography-Font-Heading` in new output.

### Focus halo
- Interactive components use `--Surface-Halo-Gap` for the inner gap ring, NOT `--Surface-Main`.
- `--Surface-Halo-Gap` auto-adapts inside `[data-surface]` contexts.

### Token naming (role-explicit unified — prefer these)
- Surface fills: `--{Role}-{Mode}` (e.g. `--Primary-Bold`, `--Primary-Subtle`, `--Primary-Elevated`).
- Content tokens: `--{Role}-High`, `--{Role}-Medium-Text`, `--{Role}-Low`,
  `--{Role}-Tinted`, `--{Role}-TintedA11y`, `--{Role}-Stroke-Medium`, `--{Role}-Stroke-Low`.
- On-bold content: `--{Role}-Bold-High`, `--{Role}-Bold-Medium`, `--{Role}-Bold-TintedA11y`.
- State tokens: `--{Role}-Hover`, `--{Role}-Pressed`, `--{Role}-Bold-Hover`, `--{Role}-Bold-Pressed`,
  `--{Role}-Subtle-Hover`, `--{Role}-Subtle-Pressed`.
- Typography sizes: `--{Role}-{Size}-FontSize` (e.g. `--Body-M-FontSize`, `--Display-L-FontSize`).
- Typography line-heights: `--{Role}-{Size}-LineHeight` (always pair with the FontSize token).
- Typography weights: `--{Role}-FontWeight-{Level}` (e.g. `--Body-FontWeight-High`).
- Shape: `--Shape-0` … `--Shape-10` (f-step derived) or `--Shape-Pill` (9999px standalone).
- Spacing: `--Spacing-{Size}` (e.g. `--Spacing-4`, `--Spacing-6`).

The legacy role alias families (`--{Role}-FG-*`, `--{Role}-BG-*`, `--Surface-Bold`, `--Text-High`,
etc.) are still emitted by the engine for backward compatibility but must NOT be authored into new
code or AI-generated output.

### Roles (multi-accent)
Up to 9 appearance roles: `primary`, `secondary`, `neutral`,
`sparkle`, `brand-bg`, `positive`, `negative`, `warning`, `informative`.

### Icons (MANDATORY)
- Icons come ONLY from `@jds4/oneui-icons-jio`, rendered via the OneUI `<Icon name="..." />`
  component (import `'@jds4/oneui-icons-jio'` once as a side-effect; import `Icon` from
  `@jds4/oneui-react`). Example: `<Icon name="home" emphasis="high" />`.
- NEVER install or import other icon libraries — no `hugeicons-react`, `@phosphor-icons/react`,
  `@tabler/icons-react`, `@remixicon/react`, `lucide-react`, etc. They bloat the app, break brand
  consistency, and are not part of OneUI.

### Dependencies / install (MANDATORY)
- Install exactly three packages: `@jds4/oneui-react`, `@jds4/oneui-icons-jio`, and the matching
  bundler plugin (`@jds4/oneui-{vite,webpack,next,esbuild}-plugin`). Nothing else from OneUI.
- **Install the HIGHEST published version (including prereleases), resolved at install time.** The
  `latest` dist-tag can lag behind the newest alpha (it pointed at `0.1.0-alpha.0` while `alpha.5` was
  newest), so a bare `npm install @jds4/oneui-react` or `@latest` can pull an OLD build. Instead:
  1. `npm view @jds4/oneui-react versions --json` → take the highest semver (e.g. `0.1.0-alpha.5`).
  2. `npm install @jds4/oneui-react@<that> @jds4/oneui-icons-jio@<that>` (resolve each package independently).
  Or just call the MCP's `setup_oneui_project` / `update_oneui_packages`, which do exactly this.
- This pins a concrete version (good). NEVER hand-write `"latest"` as the version in `package.json` —
  it is not a valid pin for a prerelease line and resolves to whatever the `latest` tag points at (often
  old). `"latest"` belongs only in `oneui.brands.json` as the brand CDN version, never an npm specifier.
