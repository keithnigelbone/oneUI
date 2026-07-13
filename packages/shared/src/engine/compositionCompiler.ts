/**
 * Composition Compiler — Framework-Agnostic
 *
 * Pure function that compiles modular composition rules + brand config +
 * component metadata into a ready-to-use system prompt for LLM consumption.
 * The compiler is context-aware: the same rules produce different compiled
 * outputs depending on the composition context (mobile-app, web-app,
 * marketing-page, social-post).
 *
 * Follows the same pattern as voiceCompiler.ts:
 *   rules + config → compile → output string
 */

import {
  DEFAULT_COMPOSITION_CONTEXTS,
  type CompositionConfig,
  type CompositionContext,
  type CompositionRule,
  type CompositionSkill,
  type CompiledCompositionPrompt,
  type ScoredReference,
} from './compositionTypes';
import { renderReferencePrecedent } from './referenceResolver';
import { computeCompositionHash } from './compositionCacheKey';

// ============================================
// Context presets
// ============================================

interface ContextPreset {
  /** Top-of-prompt task framing. Establishes WHAT the model is producing. */
  taskFraming: (brandName: string) => string;
  /** Layout constraints for this context */
  layoutConstraints: string;
  /** Component constraints specific to this context */
  componentConstraints: string;
  /** Spacing defaults for this context */
  spacingGuidance: string;
  /** Typography guidance for this context */
  typographyGuidance: string;
}

const CONTEXT_PRESETS: Record<CompositionContext, ContextPreset> = {
  'mobile-app': {
    taskFraming: (brand) =>
      `You are a senior UI designer creating mobile-first component compositions for ${brand} using the OneUI design system. You output JSON representing a Component AST. Your designs should feel polished and production-ready, not just stacked components.`,
    layoutConstraints:
      'Design for mobile (390px width). Single-column layouts dominate. Use vertical stacks as the primary layout pattern. Bottom-anchored CTAs for primary actions. Thumb-zone awareness: primary interactions should be reachable in the lower 2/3 of the screen.',
    componentConstraints:
      'All OneUI components are available. Touch targets must be minimum 44px. Prefer fullWidth buttons for primary CTAs. Use compact component sizes (s, m) for secondary elements. NAVIGATION: use BottomNavigation with BottomNavItem children for primary tab navigation — NEVER WebHeader (that is a web/desktop primitive and will look wrong on mobile). Top chrome should be minimal: a title text element plus optional IconButton (back / menu). Use FAB for a single floating primary action when the bottom area is occupied by BottomNavigation.',
    spacingGuidance:
      'Use the full spacing token hierarchy: var(--Spacing-5) or var(--Spacing-6) between major sections, var(--Spacing-4) between related items, var(--Spacing-3-5) or var(--Spacing-3) for tightly coupled elements. Page margins use var(--Spacing-Margin).',
    typographyGuidance:
      'Headline-L for page titles, Title-M/S for section headings, Body-M for content, Label-S for UI controls. Use var(--Typography-Font-Primary) on all text elements.',
  },
  'web-app': {
    taskFraming: (brand) =>
      `You are a senior UI designer creating responsive web application layouts for ${brand} using the OneUI design system. You output JSON representing a Component AST. Your designs should be responsive, keyboard-navigable, and production-ready.`,
    layoutConstraints:
      'Design for desktop-first responsive layouts. Use CSS Grid or multi-column flex layouts. Support 12-column grid systems. Sidebar + main content patterns for navigation-heavy apps. Consider hover states and keyboard navigation. Max content width should respect readable line lengths (~65ch for text content).',
    componentConstraints:
      'All OneUI components are available. Include hover state awareness. Use larger component sizes (m, l) for primary interactions. Consider IconButton for toolbar patterns. NAVIGATION: use WebHeader as the top navigation, with HeaderItem children (wrap in PrimaryNav for the main bar; add SecondaryNav for a tabs row when the page has sibling routes). Use MobileDrawer inside WebHeader for responsive collapse. NEVER BottomNavigation (that is a mobile-only primitive). For sub-page tabs that are not site navigation, use the Tabs component instead.',
    spacingGuidance:
      'Use generous spacing: var(--Spacing-6) to var(--Spacing-8) between major sections. var(--Spacing-4-5) between components. var(--Spacing-Gutter) for grid gutters. var(--Spacing-Margin) for page margins (auto-adapts to breakpoint).',
    typographyGuidance:
      'Display-L/M for hero headlines, Headline-L/M for page titles, Title-L/M for section headings, Body-M for content. Line lengths should not exceed 65ch for readability.',
  },
  'marketing-page': {
    taskFraming: (brand) =>
      `You are a senior UI designer creating marketing landing pages for ${brand} using the OneUI design system. You output JSON representing a Component AST. Your designs should be hero-driven, conversion-focused, and visually striking while maintaining brand consistency.`,
    layoutConstraints:
      'Hero-driven, scroll-based layout. Full-width sections alternating between default and bold surfaces. ContentBlock components for text overlays on imagery. Strong visual hierarchy with clear scroll rhythm. Use Surface mode="bold" for hero sections and brand moments.',
    componentConstraints:
      'Focus on: Button (bold, primary for CTAs), Image (full-width heroes), ContentBlock (text overlays), JioRibbon (secondary strips), Avatar (testimonials). Limit interactive form components. Maximum 2-3 CTAs per viewport. NAVIGATION: WebHeader variant="transparent" or "glass" when the hero should bleed behind the header; otherwise the default WebHeader is fine. Omit navigation entirely for single-screen hero-only layouts. Never BottomNavigation.',
    spacingGuidance:
      'Generous section spacing: var(--Spacing-9) to var(--Spacing-14) between major sections. Let content breathe. White space IS the design. var(--Spacing-6) to var(--Spacing-7) within sections.',
    typographyGuidance:
      'Display-L for hero headlines (f7 = 40px). Headline-L for section titles. Body-M/L for descriptions. Label-M for CTAs. Use negative letter-spacing (--Typography-LetterSpacing-Tight) for display text.',
  },
  'social-post': {
    taskFraming: (brand) =>
      `You are a senior UI designer creating social media post layouts for ${brand} using the OneUI design system. You output JSON representing a Component AST. Your designs must be high-contrast, immediately readable, and optimized for specific social platform dimensions.`,
    layoutConstraints:
      'Fixed dimensions — specify via root element style. Common sizes: Instagram 1080x1080 (1:1), Facebook 1200x630 (1.9:1), Twitter 1200x675 (16:9), LinkedIn 1200x627 (1.9:1), Story 1080x1920 (9:16). Use bold surfaces for brand impact. Center-aligned layouts dominate. Maximum 3-4 elements per post.',
    componentConstraints:
      'Focus on: ContentBlock (text overlays), Image (backgrounds), Button (CTA, if any). Minimal interactive components — social posts are primarily visual. Text must be large enough to read on mobile feeds.',
    spacingGuidance:
      'Generous padding: var(--Spacing-7) to var(--Spacing-9) as internal padding. Elements should feel spacious, not cramped. Use centered layouts with var(--Spacing-6) between stacked elements.',
    typographyGuidance:
      'Display-L or Headline-L for primary text (must be readable at 50% scale). Body-L for secondary text. Avoid Body-S or Label-XS — too small for social feeds. High contrast text on all surfaces.',
  },
  'print': {
    taskFraming: (brand) =>
      `You are a senior designer creating print-ready layouts for ${brand} using the OneUI design system. You output JSON representing a Component AST with metadata for physical dimensions. Your designs must be production-ready for offset or digital printing.`,
    layoutConstraints:
      'Fixed physical dimensions. Include "data-print" metadata on the root element with width/height in mm and DPI. Common sizes: A4 (210×297mm), A3 (297×420mm), Letter (216×279mm), DL (99×210mm). All colours must translate to CMYK — avoid transparency and gradients that don\'t reproduce well in print. Include bleed margins (3mm standard) as "data-bleed" attribute.',
    componentConstraints:
      'Non-interactive only: Image, text elements, ContentBlock. No buttons, switches, checkboxes, or interactive components — print is static. Use element nodes with explicit width/height styles. Include high-resolution image placeholders (300 DPI minimum).',
    spacingGuidance:
      'Physical margins: var(--Spacing-7) minimum for outer margins (maps to ~15mm at 300 DPI). Use generous gutters for multi-column layouts. Print-safe spacing — no values smaller than var(--Spacing-3-5) (illegible at standard print sizes).',
    typographyGuidance:
      'Display-L for headlines, Headline-M for subheads, Body-M for body text (minimum 9pt equivalent). Body-S is the absolute minimum for print — never use Label-XS or Label-2XS. Line lengths: 45-75 characters for readability. Always specify font-family for print font embedding.',
  },
  'outdoor': {
    taskFraming: (brand) =>
      `You are a senior designer creating outdoor advertising layouts for ${brand} using the OneUI design system. You output JSON representing a Component AST optimized for distance readability. Your designs must be bold, minimal, and immediately comprehensible at a glance.`,
    layoutConstraints:
      'Billboard/hoarding dimensions. Include "data-outdoor" metadata with physical size. Common sizes: 48-sheet (6096×3048mm), 96-sheet (12192×3048mm), 6-sheet (1200×1800mm), Bus shelter (1200×1800mm). Maximum 3 elements per composition. The entire message must be readable in 3-5 seconds at distance. Center or left-aligned layouts only.',
    componentConstraints:
      'Absolute minimum elements: Image (hero/product), text elements (headline + optional tagline), optional Logo. No interactive components, no fine detail, no body text. ContentBlock for text overlays on images. Maximum 7 words in the headline.',
    spacingGuidance:
      'Massive spacing — var(--Spacing-9) to var(--Spacing-18) between elements. Elements should feel isolated, not grouped. The background is as important as the content. Generous clear zones around text for readability against varying backgrounds.',
    typographyGuidance:
      'Display-L exclusively for headlines (f7+ = 40px+ equivalent, will be scaled to physical size). Never use anything smaller than Headline-M. Sans-serif only (var(--Typography-Font-Primary)). Maximum 2 type sizes per composition. Ultra-high contrast between text and background.',
  },
};

// ============================================
// Layout personality description
// ============================================

/**
 * Render the layout personality as a human-readable descriptor.
 *
 * Two dials, two phrases:
 *   density        → how information-packed the layout is
 *   expressiveness → how visually bold and immersive it is
 */
function describeLayoutPersonality(config: CompositionConfig): string {
  const { layoutPersonality } = config;
  const parts: string[] = [];

  if (layoutPersonality.density >= 70) parts.push('compact and data-dense');
  else if (layoutPersonality.density >= 40) parts.push('balanced density');
  else parts.push('spacious and editorial');

  if (layoutPersonality.expressiveness >= 70) parts.push('bold and immersive');
  else if (layoutPersonality.expressiveness >= 40) parts.push('balanced expression');
  else parts.push('minimal and functional');

  return parts.join(', ');
}

// ============================================
// Context filter (rule → boolean)
// ============================================

/**
 * Does this rule apply to the given context? Uses the rule's explicit
 * `contexts` field if present and non-empty; otherwise falls back to
 * DEFAULT_COMPOSITION_CONTEXTS keyed by sectionId.
 */
function ruleAppliesToContext(rule: CompositionRule, context: CompositionContext): boolean {
  const ctxs =
    rule.contexts && rule.contexts.length > 0
      ? rule.contexts
      : DEFAULT_COMPOSITION_CONTEXTS[rule.sectionId] ?? ['all'];
  return ctxs.includes('all') || ctxs.includes(context);
}

/**
 * Does this rule apply to the given vertical? If the rule has no vertical
 * tag, it applies to all verticals.
 */
function ruleAppliesToVertical(rule: CompositionRule, vertical: string): boolean {
  return !rule.vertical || rule.vertical === vertical;
}

// ============================================
// AST format reference (constant)
// ============================================

const AST_FORMAT_REFERENCE = `## AST Output Format

Single screen:
{ "version": 1, "name": "Screen Name", "root": { "id": "root", "kind": "element", "tag": "div", "props": { "style": { "display": "flex", "flexDirection": "column", "gap": "var(--Spacing-4-5)" } }, "children": [...sections...] } }

Multi-screen flow (when user asks for "flow", "steps", "screens"):
{ "version": 1, "name": "Flow Name", "root": { "id": "root", "kind": "element", "tag": "div", "props": {}, "children": [
  { "id": "screen-1", "kind": "element", "tag": "div", "props": { "data-screen": "Screen Name" }, "children": [...] },
  { "id": "screen-2", "kind": "element", "tag": "div", "props": { "data-screen": "Screen Name" }, "children": [...] }
] } }

### Node types:
- ComponentASTNode: { id, kind: "component", type: "Button"|"Avatar"|..., props: {...}, children: [...] }
- ElementASTNode: { id, kind: "element", tag: "div"|"section"|..., props: { style: {...} }, children: [...] }
- TextASTNode: { id, kind: "text", text: "..." }

## Component Name Reference (use EXACTLY these names — no aliases)
- Text inputs → "Input" (NOT TextInput, TextField, TextArea)
- Links → "Button" with contained={false} for action links, or "Link" for text/navigation links (NOT LinkButton, Anchor)
- Floating action → "FAB" (NOT Fab, fab)
- Labels/paragraphs → use element nodes with tag "p", "span", "label" (NOT Text, Heading, Paragraph)
- Icons → "Icon" with a \`name\` prop from the semantic list below (NEVER invent names)
- Icon with a coloured container → "IconContained" (do NOT substitute an empty coloured div)
- Compound component names are forbidden. NEVER output "Carousel.Item", "Carousel.Rail",
  "Tabs.Item", "Menu.Item", "Dialog.Content", or any other dotted component name.
  Use only the flat registry names listed in the component reference. When unsure,
  use element nodes ("div", "section", "span") around real OneUI components.
- Carousel is not a general layout primitive. For e-commerce hero strips,
  prefer a "section" with Image, text, Badge, Button, and PaginationDots.
  Do not emit Carousel subcomponents unless they are explicitly present in the
  flat component reference.

## Brand marks / logos — MANDATORY Logo component

When a brand mark, app logo, company logo, or Jio logo is needed, use the real
\`Logo\` component. NEVER invent \`BrandLogo\`, \`JioLogo\`, \`AppLogo\`, or draw
a raw circle/div as a logo.

Allowed patterns:
1. Logo with text fallback/mark content:
     { "kind": "component", "type": "Logo", "props": { "variant": "mark", "size": "m", "alt": "Jio logo" }, "children": [{ "kind": "text", "text": "Jio" }] }
2. Logo with a real asset when the source is available:
     { "kind": "component", "type": "Logo", "props": { "variant": "mark", "size": "m", "src": "/JioLogo.svg", "alt": "Jio logo" }, "children": [] }
3. Text-only brand word is acceptable for headlines, but do not use it as a
   substitute when the prompt explicitly asks for a logo or brand mark.

Every Logo MUST include \`alt\`. Do not split the brand name across components
("Surface" + "Jio"). Do not wrap it in a Surface just to force a shape.

## Icons — MANDATORY usage

Whenever a row, card, tile, list item, badge, chip, or avatar needs a leading
visual, use the real \`Icon\` (or \`IconContained\`) component. NEVER render a
plain coloured circle (\`<div style={{ background: '...', borderRadius: '50%' }} />\`)
as a stand-in for an icon — it looks broken and carries no semantic meaning.

Valid shape:
  { "kind": "component", "type": "Icon", "props": { "name": "notification", "size": "md" } }
  { "kind": "component", "type": "IconContained", "props": { "name": "check", "appearance": "positive", "size": "m" } }

Allowed \`name\` values (semantic, resolved per brand's icon set):
add, remove, close, edit, delete, copy, save, refresh, download, upload, share,
link, unlink, menu, search, home, settings, arrowLeft, arrowRight, arrowUp,
arrowDown, chevronLeft, chevronRight, chevronUp, chevronDown, externalLink, firstPage, lastPage, back, next,
check, checkCircle, warning, error, info, help, loading, play, pause, stop,
volumeOn, volumeOff, microphone, image, video, user, users, userAdd, userRemove,
eye, eyeOff, lock, unlock, star, starFilled, heart, heartFilled, bookmark,
bookmarkFilled, filter, sort, grid, list, mail, phone, chat, notification,
file, folder, document, calendar, clock, location, sun, moon, palette, layers,
components, canvas, create, sparkles, globe, smartphone, tablet, monitor, tv,
printer, billboard, bus.

If none of the above fits, pick the closest semantic name — do NOT invent a new
one. The runtime will silently omit unknown icon names and the row will look
empty, which is exactly the failure mode to avoid.

## Images — MANDATORY usage

When visual content is needed, use the real \`Image\` component. Every Image
MUST include \`src\`, \`alt\`, and a design-token-based style/aspect wrapper.
When no reference image asset is available, use
\`"src": "/oneui-generated-image-placeholder.svg"\` so the preview loads a real
local asset instead of a broken icon fallback. Never draw empty pastel
rectangles as image stand-ins. Product imagery should respect its natural
aspect ratio and never be squeezed by hard-coded pixel dimensions.

## Inline display components — do not stretch

Badge, Chip, Logo, Icon, and IconContained are inline-sized display components.
Never set \`width: "100%"\`, \`display: "block"\`, \`flex: 1\`, or \`fullWidth\`
on these components. If a layout needs a full-width row, put the full-width
style on an outer element and keep the Badge/Chip/Logo itself intrinsic.

## Token Examples — ZERO hard-coded px/color/font values
Style values MUST use var() references:
- Sizes:   var(--Spacing-3-5), var(--Spacing-4), var(--Spacing-4-5), var(--Spacing-5)
- Radii:   var(--Shape-4), var(--Shape-4-5), var(--Shape-Pill)
- Colors:  var(--Surface-Main), var(--Primary-High), var(--Primary-Bold), var(--Primary-Bold-High)
- Borders: var(--Stroke-S), var(--Stroke-M), var(--Border-Subtle)
- Width/height on avatar/icon containers: var(--Spacing-8) not "80px"
- Dividers: use the Divider component, NOT a div with height: 1px

## Strict Rules
- Output ONLY valid JSON, no markdown, no explanation
- Every node needs a unique "id" (e.g., "header-1", "btn-submit", "switch-dark-mode")
- Use descriptive IDs that reflect purpose
- Use realistic content — real labels like "Sign In", "Enable push notifications"
- Components that need text (Button, Checkbox) MUST have a text child node
- ALL style values must use design tokens: var(--Spacing-4), var(--Typography-Font-Primary), etc.
- ZERO hard-coded colors, pixels, or font sizes — the validator will flag every px value
- Include visual hierarchy: larger elements at top, actions at bottom
- Use appropriate appearances: primary for main actions, neutral for settings, positive for success, negative for destructive`;

// ============================================
// Core compilation
// ============================================

/**
 * Compile resolved composition rules + config + component metadata into a
 * system prompt.
 *
 * @param resolvedRules  - Merged rules (brand overrides applied). Already sorted by priority.
 * @param config         - Brand composition config (vertical, personality).
 * @param componentRef   - Component reference markdown (from generateAIContext() or condensed).
 * @param brandSummary   - Optional brand context summary (foundation data).
 * @param skills         - Optional active skills to include.
 * @param context        - Composition context. Defaults to 'mobile-app'.
 * @returns CompiledCompositionPrompt with the assembled system prompt.
 */
/**
 * Per-context allowlist of components whose Storybook exemplars should be
 * injected into the prompt when `options.exemplars` is provided. Keeps the
 * exemplar section relevant to the target surface — a mobile-app prompt
 * doesn't need a WebHeader exemplar.
 */
const CONTEXT_EXEMPLAR_COMPONENTS: Record<CompositionContext, readonly string[]> = {
  'mobile-app': [
    'Button', 'IconButton', 'BottomNavigation', 'BottomNavItem',
    'FAB', 'ListItem', 'ListItemGroup', 'Avatar', 'Input', 'InputField',
    'Switch', 'Checkbox', 'Radio', 'Tabs', 'Container', 'Surface', 'Dialog',
    'Menu', 'Chip', 'Badge', 'Slider', 'TouchSlider', 'Stepper',
    'SegmentedControl', 'PaginationDots', 'Progress', 'Spinner', 'Logo',
  ],
  'web-app': [
    'WebHeader', 'HeaderItem', 'PrimaryNav', 'SecondaryNav', 'MobileDrawer',
    'Tabs', 'Button', 'IconButton', 'Link', 'Input', 'InputField',
    'Select', 'NavigationMenu', 'Dialog', 'Menu', 'Popover', 'SegmentedControl',
    'ListItem', 'Toast', 'Accordion', 'Chip', 'Badge', 'Switch', 'Checkbox',
    'Radio', 'Stepper', 'Surface', 'Progress', 'Separator', 'Logo',
  ],
  'marketing-page': [
    'WebHeader', 'Button', 'Image', 'Avatar', 'Container', 'Surface',
    'Badge', 'Logo', 'IconButton', 'Chip',
  ],
  'social-post': ['Image', 'Button', 'Avatar', 'Badge', 'Logo', 'Icon'],
  'print': ['Image', 'Logo', 'Icon'],
  'outdoor': ['Image', 'Logo', 'Icon'],
};

/** Minimal shape the compiler needs from a harvested Storybook exemplar. */
export interface CompilerStoryExemplar {
  component: string;
  storyName: string;
  description?: string;
  args?: Record<string, unknown>;
  renderSource?: string;
}

export interface CompileCompositionOptions {
  /** Optional resolved references to inject as the "Visual Precedent" section. */
  references?: ScoredReference[];
  /**
   * Output target for the compiled prompt. AST mode keeps the JSON AST
   * schema reference; TSX mode omits it because Sandpack code generation
   * appends its own output contract.
   */
  outputFormat?: 'ast' | 'tsx';
  /**
   * Optional Storybook usage exemplars. When provided, the compiler filters
   * to the context's allowlist and appends a "Component Usage Exemplars"
   * section. Caller is responsible for passing the full corpus; filtering
   * lives here so the context matters.
   */
  exemplars?: CompilerStoryExemplar[];
  /** Per-prompt cap on the exemplar section's character budget. Default 8KB. */
  exemplarBudget?: number;
}

export function compileCompositionRules(
  resolvedRules: CompositionRule[],
  config: CompositionConfig,
  componentRef: string = '',
  brandSummary: string = '',
  skills?: CompositionSkill[],
  context: CompositionContext = 'mobile-app',
  options: CompileCompositionOptions = {},
): CompiledCompositionPrompt {
  const preset = CONTEXT_PRESETS[context];
  const sections: string[] = [];
  const includedSections: string[] = [];
  const brandName = brandSummary ? 'the brand' : 'OneUI';

  // -- Task framing --
  sections.push(preset.taskFraming(brandName));
  sections.push('');

  // -- Layout personality --
  sections.push(`Layout personality: ${describeLayoutPersonality(config)}.`);
  if (config.vertical !== 'general') {
    sections.push(`Vertical: ${config.vertical}. Apply ${config.vertical}-specific composition patterns.`);
  }
  sections.push('');

  // -- Context-specific constraints --
  sections.push('## Layout Constraints');
  sections.push(preset.layoutConstraints);
  sections.push('');

  sections.push('## Component Constraints');
  sections.push(preset.componentConstraints);
  sections.push('');

  sections.push('## Spacing Guidance');
  sections.push(preset.spacingGuidance);
  sections.push('');

  sections.push('## Typography Guidance');
  sections.push(preset.typographyGuidance);
  sections.push('');

  // -- Brand personality modifiers --
  if (config.preferBoldHeros) {
    sections.push('**Brand preference**: Use bold surface hero patterns (Surface mode="bold") for primary sections.');
    sections.push('');
  }
  if (config.preferMinimalContainers) {
    sections.push('**Brand preference**: Use minimal/ghost containers. Cards use default background — content is the hero, not the container.');
    sections.push('');
  }
  if (config.maxComponentsPerScreen) {
    sections.push(`**Constraint**: Maximum ${config.maxComponentsPerScreen} interactive components per screen. Simplicity is the goal.`);
    sections.push('');
  }

  // -- Composition rules (filtered by context + vertical) --
  const applicableRules = resolvedRules.filter(
    (r) =>
      r.isActive &&
      r.content &&
      ruleAppliesToContext(r, context) &&
      ruleAppliesToVertical(r, config.vertical),
  );

  if (applicableRules.length > 0) {
    sections.push('## Composition Rules');
    sections.push('');
    for (const rule of applicableRules) {
      sections.push(`### ${rule.title}`);
      sections.push(rule.content);
      sections.push('');
      includedSections.push(rule.sectionId);
    }
  }

  // -- Component reference (budget-aware) --
  if (componentRef) {
    // Truncate if the total prompt is getting too large
    const currentSize = sections.join('\n').length;
    const maxComponentRefSize = Math.max(8000, 24000 - currentSize);
    const truncatedRef =
      componentRef.length > maxComponentRefSize
        ? componentRef.slice(0, maxComponentRefSize) + '\n\n... (component reference truncated for prompt budget)'
        : componentRef;
    sections.push(truncatedRef);
    sections.push('');
  }

  // -- Brand summary (if provided) --
  if (brandSummary) {
    sections.push('## Brand Context');
    sections.push(brandSummary);
    sections.push('');
  }

  // -- Visual precedent (reference screens grounding the generation) --
  const references = options.references ?? [];
  if (references.length > 0) {
    sections.push(renderReferencePrecedent(references));
    sections.push('');
  }

  // -- Skills (if active and applicable to this context) --
  if (skills && skills.length > 0) {
    const applicableSkills = skills.filter(
      (s) => s.isActive && s.applicableContexts.includes(context),
    );
    if (applicableSkills.length > 0) {
      sections.push('## Composition Skills (Reusable Patterns)');
      sections.push('');
      for (const skill of applicableSkills) {
        sections.push(`### ${skill.name}`);
        sections.push(skill.description);
        if (skill.examples.length > 0) {
          const example = skill.examples[0];
          sections.push(`Example prompt: "${example.prompt}"`);
        }
        sections.push('');
      }
    }
  }

  // -- Storybook usage exemplars (filtered by context allowlist, budgeted) --
  if (options.exemplars && options.exemplars.length > 0) {
    const allow = new Set(CONTEXT_EXEMPLAR_COMPONENTS[context] ?? []);
    const relevant = options.exemplars.filter((e) => allow.has(e.component));
    if (relevant.length > 0) {
      const budget = options.exemplarBudget ?? 8000;
      const exemplarLines: string[] = [];
      let used = 0;
      exemplarLines.push('## Component Usage Exemplars');
      exemplarLines.push('');
      exemplarLines.push(
        'Real Storybook usage patterns. Study the variant + slot combinations — these are how designers actually assemble each component. Prefer the patterns shown here when composing.',
      );
      exemplarLines.push('');
      for (const ex of relevant) {
        const parts: string[] = [];
        parts.push(`### ${ex.component} — ${ex.storyName}`);
        if (ex.description) parts.push(ex.description);
        if (ex.args) parts.push(`args: ${JSON.stringify(ex.args)}`);
        if (ex.renderSource) {
          const src = ex.renderSource.length > 800
            ? ex.renderSource.slice(0, 800) + '\n/* ...truncated */'
            : ex.renderSource;
          parts.push(`render:\n\`\`\`tsx\n${src}\n\`\`\``);
        }
        const block = parts.join('\n') + '\n';
        if (used + block.length > budget) break;
        exemplarLines.push(block);
        used += block.length;
      }
      sections.push(exemplarLines.join('\n'));
      sections.push('');
    }
  }

  // -- AST format reference (AST renderer only) --
  if ((options.outputFormat ?? 'ast') === 'ast') {
    sections.push(AST_FORMAT_REFERENCE);
    sections.push('');
  }

  const prompt = sections.join('\n');
  const hash = computeCompositionHash(resolvedRules, config, context);

  return {
    prompt,
    size: prompt.length,
    includedSections,
    context,
    hash,
    referenceScreenIds: references.map((r) => r.screen.id),
  };
}

// ============================================
// Default composition config
// ============================================

/**
 * Returns a sensible default CompositionConfig for brands that haven't
 * configured their composition settings yet.
 */
export function getDefaultCompositionConfig(): CompositionConfig {
  return {
    vertical: 'general',
    layoutPersonality: {
      density: 30,        // spacious by default
      expressiveness: 50, // balanced
    },
    defaultContext: 'mobile-app',
    preferBoldHeros: false,
    preferMinimalContainers: true,
    isActive: true,
    version: 1,
  };
}
