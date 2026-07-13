/**
 * Pure markdown renderers that compose the agent's system prompt. Every
 * section returns a self-contained H2 block so callers can reorder freely.
 */

import { generateAIContext } from '../meta/generateAIContext';
import type { ComponentMeta } from '../types/componentMeta';
import type { AgentMode, BrandFoundationSummary } from './types';
import {
  renderCoreInvariantsStructured,
  type InvariantSdk,
} from '../types/coreInvariants';

// Web-flavoured legacy string. Kept verbatim for backwards-compatibility
// with every existing import. New callers should prefer
// `renderCoreInvariants(sdk)` which derives from the structured invariants
// source-of-truth at `packages/shared/src/types/coreInvariants.ts`.
export const CORE_INVARIANTS = `
## Core Design System Rules (always apply)

These rules cover ~80% of day-to-day guidance. For deeper topics — color scales,
typography system, the parent-step-relative surface algorithm, architecture,
responsive behaviour, motion, elevation — CALL the \`search_design_system\` tool.

### Zero literals
- All styling uses CSS custom properties: \`var(--Token-Name)\`.
- Never hardcode colors, pixel sizes, font sizes, or spacing values.
- Never emit inline styles with raw values in generated ASTs.

### Surface modes (unified vocabulary — no BG/FG split)
There are **8 surface modes**, one vocabulary for both containers and component fills:
\`default\`, \`ghost\`, \`minimal\`, \`subtle\`, \`moderate\`, \`bold\`, \`elevated\`, \`blend\`.

- \`default\` — page surface (2500 light / 200 dark), ignores parent.
- \`ghost\` — same step as parent, still triggers context remapping.
- \`minimal\` / \`subtle\` / \`moderate\` — parent + 1 / 2 / 3 steps toward contrasting direction.
- \`bold\` — role \`baseStep\` (or darker baseStep if parent is already dark).
- \`elevated\` — parent + 1 step toward lighter (capped at 2500).
- \`blend\` — same step as parent, used when a fill should visually merge with media/material context.

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

/**
 * Render the core invariants block.
 *
 * - With no argument (or `sdk='web'`): returns the legacy web-flavoured
 *   markdown string verbatim. All existing callers (HomeChat, create/, the
 *   docs route) keep their current output.
 * - With `sdk='rn' | 'ios' | 'android' | 'flutter'`: returns the SDK-
 *   idiomatic variant derived from the structured invariants. Non-web
 *   binders pass their target and receive prose talking about
 *   `tokens.color.*` / `JDSColor.*` / `JDSTheme.colors` / `JDSTheme.of(context)`
 *   instead of CSS custom properties.
 */
export function renderCoreInvariants(sdk?: InvariantSdk): string {
  if (sdk === undefined || sdk === 'web') return CORE_INVARIANTS;
  return renderCoreInvariantsStructured(sdk);
}

// Cached per (metas array ref, brand name) — `generateAIContext` walks every
// prop + slot of every component so we only want to pay it once per process.
const componentContextCache = new WeakMap<ComponentMeta[], Map<string, string>>();

export function renderComponentContext(
  metas: ComponentMeta[],
  brandName?: string,
): string {
  if (metas.length === 0) {
    return '## OneUI Component Reference\n\n_No components registered._';
  }
  const cacheKey = brandName ?? '__no_brand__';
  let brandCache = componentContextCache.get(metas);
  if (!brandCache) {
    brandCache = new Map();
    componentContextCache.set(metas, brandCache);
  }
  const cached = brandCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const rendered = generateAIContext(metas, { brandName, includeSlots: true });
  brandCache.set(cacheKey, rendered);
  return rendered;
}

export function renderBrandSummary(brand: BrandFoundationSummary): string {
  const lines: string[] = ['## Current Brand'];
  lines.push(`- Brand: **${brand.brandName}**`);
  lines.push(`- Theme: ${brand.theme}`);
  if (brand.primaryFont) lines.push(`- Primary font: ${brand.primaryFont}`);
  if (brand.secondaryFont) lines.push(`- Secondary font: ${brand.secondaryFont}`);
  if (brand.codeFont) lines.push(`- Code font: ${brand.codeFont}`);
  if (brand.activeRoles && brand.activeRoles.length > 0) {
    lines.push(`- Active accent roles: ${brand.activeRoles.join(', ')}`);
  }
  if (brand.density) lines.push(`- Density: ${brand.density}`);
  if (brand.platform) lines.push(`- Platform breakpoint: ${brand.platform}`);
  lines.push(
    '- Foundation tokens are resolved at runtime via brand CSS injection; reference them by name, not by value.',
  );
  return lines.join('\n');
}

export function renderVoiceSection(voicePrompt: string): string {
  const trimmed = voicePrompt.trim();
  if (trimmed.length === 0) return '';
  return ['## Brand Tone of Voice', trimmed].join('\n\n');
}

export function renderCompositionSection(compositionPrompt: string): string {
  const trimmed = compositionPrompt.trim();
  if (trimmed.length === 0) return '';
  return ['## Brand Composition Rules', trimmed].join('\n\n');
}

// Home chat gets the extended guidance block because users arrive with
// open-ended questions; create/ keeps the narrower list for prompt parity.
export function renderModeGuidance(mode: AgentMode): string {
  const commonTail = [
    '- Specific pattern or recipe not covered above (hero layouts, ribbon variants, card compositions).',
    '- Deep token semantics (what exactly does `--Primary-Bold-TintedA11y` mean?).',
    '- Typography role selection (when to pick Display vs Headline vs Title).',
    '- Spacing rhythm guidance for a specific platform or density.',
    '- Motion/elevation choices for interactive components.',
    '- Architectural questions about brand cascade, theme scope, or the unified surface system.',
  ];
  if (mode === 'home') {
    return [
      '## When to reach for search_design_system',
      '- User asks to build an app, screen, or page — search for composition recipes before proposing structure.',
      '- User asks about a specific component by name — search for its patterns and usage recipes.',
      '- User asks "how do we do X" — check the docs corpus first; it is canonical.',
      ...commonTail,
      '',
      '## Navigating the platform',
      'When the user wants to jump to a specific editor or surface, call `navigate_to`',
      'with the destination slug. Known slugs:',
      '- `/brand/overview`, `/brand/sub-brands` — brand + sub-brand configuration',
      '- `/foundations` — 13 foundation editors (color, surfaces, typography, motion, …)',
      '- `/components/<name>` — individual component showcase + editor',
      '- `/canvas` — tldraw composition canvas (Experience Builder)',
      '- `/create/start-here` — AI campaign builder',
      '- `/agents` — agents hub',
      '- `/agents/tone-of-voice`, `/agents/tone-of-voice/playground` — tone of voice sub-agent',
    ].join('\n');
  }
  return ['## When to reach for search_design_system', ...commonTail].join('\n');
}
