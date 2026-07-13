/**
 * Structured core invariants — replaces the hard-coded markdown string at
 * `packages/shared/src/agent/knowledgeSources.ts:10` (round-2 audit blocker B4).
 *
 * The string form was web-flavoured by accident: it talked about
 * `var(--Token-Name)`, `<Surface mode="...">`, and CSS-class behaviour
 * directly. A non-web SDK consumer (RN, iOS, Android, Flutter) reading
 * the same prompt would be instructed to emit CSS — wrong.
 *
 * This file exposes the invariants as data. A renderer at the agent layer
 * converts the data into platform-idiomatic prose per SDK. The web
 * renderer reproduces the existing CORE_INVARIANTS string verbatim, so
 * downstream consumers (HomeChat, create/, the docs route) see no
 * behavioural change.
 */

// ---------------------------------------------------------------------------
// SDK identifiers — duplicated here as a string union so this file is
// independent of B3 (componentMetaExtensions.SDK_IDS). When @jds/kb-core
// lands on dev, both collapse into one canonical export.
// ---------------------------------------------------------------------------

export type InvariantSdk = 'web' | 'rn' | 'ios' | 'android' | 'flutter';

// ---------------------------------------------------------------------------
// Structured invariant data
// ---------------------------------------------------------------------------

export interface ZeroLiteralsRule {
  readonly forbiddenLiteralKinds: readonly ('hex' | 'rgb' | 'hsl' | 'oklch' | 'named-color' | 'px' | 'em' | 'rem')[];
  readonly use: 'token';
}

export const SURFACE_MODES_INVARIANT = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;
export type SurfaceModeInvariant = (typeof SURFACE_MODES_INVARIANT)[number];

export const ATTENTION_LEVELS_INVARIANT = ['high', 'medium', 'low'] as const;
export type AttentionLevelInvariant = (typeof ATTENTION_LEVELS_INVARIANT)[number];

export interface SurfaceRules {
  readonly modes: typeof SURFACE_MODES_INVARIANT;
  readonly mandatoryWrapperOnNonDefault: true;
  readonly attentionToSurface: Readonly<Record<AttentionLevelInvariant, SurfaceModeInvariant>>;
  readonly forbidDecorativeStrokeOnTintedSurface: true;
}

export interface ShapeDefaults {
  readonly button: 'pill';
  readonly interactiveControl: string;
  readonly nonInteractiveContainer: 'token-driven';
  readonly circular: 'pill';
}

export interface FocusHaloRules {
  readonly innerGapTokenName: '--Surface-Halo-Gap';
  readonly outerHaloTokenName: '--Focus-Outline';
  readonly forbiddenFallback: '--Surface-Main';
}

export interface TokenNamingConvention {
  readonly surfaceFill: '--{Role}-{Mode}';
  readonly contentToken: '--{Role}-{ContentSlot}';
  readonly onBoldContent: '--{Role}-Bold-{ContentSlot}';
  readonly stateToken: '--{Role}-{Mode}-{State}';
  readonly typography: '--{Role}-{Size}-FontSize';
}

export interface CoreInvariantsStruct {
  readonly schemaVersion: `${number}.${number}.${number}`;
  readonly zeroLiterals: ZeroLiteralsRule;
  readonly surfaces: SurfaceRules;
  readonly shapeDefaults: ShapeDefaults;
  readonly focusHalo: FocusHaloRules;
  readonly tokenNaming: TokenNamingConvention;
  readonly roles: readonly string[];
}

export const CORE_INVARIANTS_STRUCT: CoreInvariantsStruct = {
  schemaVersion: '5.0.0',
  zeroLiterals: {
    forbiddenLiteralKinds: ['hex', 'rgb', 'hsl', 'oklch', 'named-color', 'px', 'em', 'rem'],
    use: 'token',
  },
  surfaces: {
    modes: SURFACE_MODES_INVARIANT,
    mandatoryWrapperOnNonDefault: true,
    attentionToSurface: { high: 'bold', medium: 'subtle', low: 'ghost' },
    forbidDecorativeStrokeOnTintedSurface: true,
  },
  shapeDefaults: {
    button: 'pill',
    interactiveControl: '3XS',
    nonInteractiveContainer: 'token-driven',
    circular: 'pill',
  },
  focusHalo: {
    innerGapTokenName: '--Surface-Halo-Gap',
    outerHaloTokenName: '--Focus-Outline',
    forbiddenFallback: '--Surface-Main',
  },
  tokenNaming: {
    surfaceFill: '--{Role}-{Mode}',
    contentToken: '--{Role}-{ContentSlot}',
    onBoldContent: '--{Role}-Bold-{ContentSlot}',
    stateToken: '--{Role}-{Mode}-{State}',
    typography: '--{Role}-{Size}-FontSize',
  },
  roles: [
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'brand-bg',
    'positive',
    'negative',
    'warning',
    'informative',
  ],
} as const;

// ---------------------------------------------------------------------------
// Per-SDK renderers
// ---------------------------------------------------------------------------

/** Web renderer — reproduces the existing CORE_INVARIANTS string verbatim. */
function renderWeb(_: CoreInvariantsStruct): string {
  return `
## Core Design System Rules (always apply)

These rules cover ~80% of day-to-day guidance. For deeper topics — color scales,
typography system, the parent-step-relative surface algorithm, architecture,
responsive behaviour, motion, elevation — CALL the \`search_design_system\` tool.

### Zero literals
- All styling uses CSS custom properties: \`var(--Token-Name)\`.
- Never hardcode colors, pixel sizes, font sizes, or spacing values.
- Never emit inline styles with raw values in generated ASTs.

### Surface modes (unified vocabulary — no BG/FG split)
There are **7 surface modes**, one vocabulary for both containers and component fills:
\`default\`, \`ghost\`, \`minimal\`, \`subtle\`, \`moderate\`, \`bold\`, \`elevated\`.

- \`default\` — page surface (2500 light / 100 dark), ignores parent.
- \`ghost\` — same step as parent, still triggers context remapping.
- \`minimal\` / \`subtle\` / \`moderate\` — parent + 1 / 2 / 3 steps toward contrasting direction.
- \`bold\` — role \`baseStep\` (or darker baseStep if parent is already dark).
- \`elevated\` — parent + 1 step toward lighter (capped at 2500).

The same \`bold\` token is used whether the surface is a hero background or a primary button fill.
Context-awareness happens automatically because every surface is resolved against its parent step.

### Surface usage (MANDATORY)
- When placing components on a non-default background, ALWAYS wrap them in \`<Surface mode="...">\`.
  Never set \`background\` directly on a plain div containing interactive components — children will not adapt.
- Inside a Surface, reference generic role tokens (e.g. \`--Primary-Bold\`, \`--Primary-TintedA11y\`,
  \`--Text-High\`). The brand CSS engine remaps them per \`[data-surface]\` block automatically.
- Do not add decorative strokes/borders on top of a tinted Surface — the fill IS the boundary.

### Figma attention levels → Button variants
- **High** → \`bold\` variant: fill \`--{Role}-Bold\`, text \`--{Role}-Bold-High\`.
- **Medium** → \`subtle\` variant: fill \`--{Role}-Subtle\`, text \`--{Role}-TintedA11y\`.
- **Low** → \`ghost\` variant: fill \`transparent\`, text \`--{Role}-TintedA11y\`.

Nested inside \`<Surface mode="bold">\`, these tokens remap automatically — no per-component inversion
logic, no separate on-bold token family at the API boundary.

### Shape defaults
- Buttons default to \`Shape-Pill\` (9999px, standalone constant — NOT part of the numeric scale).
- Other interactive controls (inputs, chips, selects) default to \`Shape-2\`.
- Containers/cards use sized tokens (\`Shape-3\` … \`Shape-10\`).
- Circular elements (avatars, dots) use \`Shape-Pill\`.

### Focus halo
- Interactive components use \`--Surface-Halo-Gap\` for the inner gap ring, NOT \`--Surface-Main\`.
- \`--Surface-Halo-Gap\` auto-adapts inside \`[data-surface]\` contexts.

### Token naming (role-explicit unified — prefer these)
- Surface fills: \`--{Role}-{Mode}\` (e.g. \`--Primary-Bold\`, \`--Primary-Subtle\`, \`--Primary-Elevated\`).
- Content tokens: \`--{Role}-High\`, \`--{Role}-Medium-Text\`, \`--{Role}-Low\`,
  \`--{Role}-Tinted\`, \`--{Role}-TintedA11y\`, \`--{Role}-Stroke-Medium\`, \`--{Role}-Stroke-Low\`.
- On-bold content: \`--{Role}-Bold-High\`, \`--{Role}-Bold-Medium\`, \`--{Role}-Bold-TintedA11y\`.
- State tokens: \`--{Role}-Hover\`, \`--{Role}-Pressed\`, \`--{Role}-Bold-Hover\`, \`--{Role}-Bold-Pressed\`,
  \`--{Role}-Subtle-Hover\`, \`--{Role}-Subtle-Pressed\`.
- Typography sizes: \`--{Role}-{Size}-FontSize\` (e.g. \`--Body-M-FontSize\`, \`--Display-L-FontSize\`).
- Typography line-heights: \`--{Role}-{Size}-LineHeight\` (always pair with the FontSize token).
- Typography weights: \`--{Role}-FontWeight-{Level}\` (e.g. \`--Body-FontWeight-High\`).
- Shape: \`--Shape-{Size}\` or \`--Shape-Pill\`.
- Spacing: \`--Spacing-{Size}\` (e.g. \`--Spacing-4\`, \`--Spacing-6\`).

The legacy role alias families (\`--{Role}-FG-*\`, \`--{Role}-BG-*\`, \`--Surface-Bold\`, \`--Text-High\`,
etc.) are still emitted by the engine for backward compatibility but must NOT be authored into new
code or AI-generated output.

### Roles (multi-accent)
Up to 9 appearance roles: \`primary\`, \`secondary\`, \`neutral\`,
\`sparkle\`, \`brand-bg\`, \`positive\`, \`negative\`, \`warning\`, \`informative\`.
`.trim();
}

function renderRn(s: CoreInvariantsStruct): string {
  const roles = s.roles.map((r) => `\`${r}\``).join(', ');
  return `
## Core Design System Rules (always apply) — React Native

### Zero literals
- All styling reads from \`@oneui/tokens\` constants (\`tokens.color\`, \`tokens.spacing\`, \`tokens.shape\`).
- Never hardcode hex / rgb / oklch colours or numeric \`fontSize\` / spacing values.

### Surface modes
- 7 modes: ${s.surfaces.modes.map((m) => `\`${m}\``).join(', ')}.
- Wrap coloured / tinted regions in \`<Surface mode="…" appearance="…">\` from
  \`@oneui/ui-native\`. Descendants pick up the remapped role tokens via
  \`useSurfaceTokens(appearance)\`. Setting \`style={{ backgroundColor }}\`
  directly bypasses the context cascade — never do that.

### Attention → variant
- high → bold (fills bold; text on-bold-high)
- medium → subtle (fills subtle; text tinted-a11y)
- low → ghost (transparent; text tinted-a11y)

### Shape defaults
- Buttons → \`tokens.shape.Pill\`. Inputs / chips → \`tokens.shape['2']\`.
  Cards / containers → sized \`tokens.shape['3']\` … \`tokens.shape['10']\`.

### Focus halo
- Use \`role.states.boldPressed\` / \`role.states.subtlePressed\` for press feedback.

### Roles
${roles}.
`.trim();
}

function renderIos(s: CoreInvariantsStruct): string {
  return `
## Core Design System Rules (always apply) — iOS / SwiftUI

### Zero literals
- All styling reads from \`JDSColor.*\`, \`JDSSpacing.*\`, \`JDSShape.*\`.
- Never hardcode hex / UIColor RGB or numeric size literals.

### Surface modes
- 7 modes: ${s.surfaces.modes.map((m) => `\`.${m}\``).join(', ')}.
- Wrap coloured regions in \`JDSSurface(mode: .bold, appearance: .primary) { … }\`.
  Children read \`@Environment(\\.jdsSurface)\` to resolve content tokens.

### Attention → variant
- high → .bold, medium → .subtle, low → .ghost.

### Shape defaults
- Buttons → \`JDSShape.pill\`. Inputs / chips → \`JDSShape.scale3XS\`.
  Containers → \`JDSShape.scale{XS..6XL}\`.

### Roles
${s.roles.map((r) => `\`.${r}\``).join(', ')}.
`.trim();
}

function renderAndroid(s: CoreInvariantsStruct): string {
  return `
## Core Design System Rules (always apply) — Android / Compose

### Zero literals
- All styling reads from \`JDSTheme.colors\`, \`JDSTheme.spacing\`, \`JDSTheme.shape\`.
- Never use \`Color(0xFF…)\` literals or \`X.dp\` / \`X.sp\` outside the token table.

### Surface modes
- 7 modes: ${s.surfaces.modes.map((m) => `\`${m}\``).join(', ')}.
- Wrap coloured regions in \`JdsSurface(mode = Bold, appearance = Primary) { … }\`.
  Children read \`LocalJdsSurface\` to resolve content tokens.

### Attention → variant
- high → Bold, medium → Subtle, low → Ghost.

### Shape defaults
- Buttons → \`Shape-Pill\`. Inputs / chips → \`Shape-2\` (numeric scale; there are no T-shirt names).

### Roles
${s.roles.map((r) => `\`${r}\``).join(', ')}.
`.trim();
}

function renderFlutter(s: CoreInvariantsStruct): string {
  return `
## Core Design System Rules (always apply) — Flutter

### Zero literals
- All styling reads from \`JDSTheme.of(context).colors\`, \`.spacing\`, \`.shape\`.
- Never use \`Color(0xFF…)\` literals.

### Surface modes
- 7 modes: ${s.surfaces.modes.map((m) => `\`${m}\``).join(', ')}.
- Wrap coloured regions in \`JDSSurface(mode: SurfaceMode.bold, appearance: Role.primary, child: …)\`.

### Attention → variant
- high → SurfaceMode.bold, medium → .subtle, low → .ghost.

### Roles
${s.roles.map((r) => `\`${r}\``).join(', ')}.
`.trim();
}

const RENDERERS: Readonly<Record<InvariantSdk, (s: CoreInvariantsStruct) => string>> = {
  web: renderWeb,
  rn: renderRn,
  ios: renderIos,
  android: renderAndroid,
  flutter: renderFlutter,
};

/**
 * Render the structured invariants as SDK-idiomatic markdown prose.
 *
 * Calling without an argument returns the legacy web-flavoured string
 * (existing callers — HomeChat, create/, the docs route — see no change).
 * Passing `sdk: 'rn' | 'ios' | 'android' | 'flutter'` returns the
 * SDK-appropriate variant; non-web binders use this in place of the
 * web-flavoured default.
 */
export function renderCoreInvariantsStructured(sdk: InvariantSdk = 'web'): string {
  return RENDERERS[sdk](CORE_INVARIANTS_STRUCT);
}
