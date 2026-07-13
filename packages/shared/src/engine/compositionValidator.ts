/**
 * Composition Validator — Deterministic AST Validation
 *
 * Pure function that validates a generated Component AST against
 * composition rules without any LLM involvement. Analogous to
 * voiceToneGuard.ts but for visual composition structure.
 *
 * Checks:
 *   P0 (error): token compliance, attention hierarchy, component existence,
 *               required children, unique IDs, surface mode validity
 *   P1 (warning): spacing consistency, slot validation, context constraints,
 *                 decorative border on Surface, manual background without Surface,
 *                 single hero per region, decorative icon density,
 *                 headings using non-Display typography, emoji-as-icon
 */

import type { ASTRoot, ASTNode, ComponentASTNode, ElementASTNode } from '../types/componentAST';
import type {
  CompositionCheck,
  CompositionValidationResult,
  CompositionContext,
  ValidationSeverity,
} from './compositionTypes';
import { VALID_SEMANTIC_ICON_NAMES } from './compositionASTNormalizer';

// ============================================
// Check IDs — exported so tests + UI can refer to them by symbol
// ============================================

export const VALIDATOR_CHECK_IDS = {
  // P0 — error level (structural correctness)
  uniqueIds: 'unique-ids',
  componentExistence: 'component-existence',
  requiredChildren: 'required-children',
  tokenCompliance: 'token-compliance',
  surfaceModeValidity: 'surface-mode-validity',
  iconNameValidity: 'icon-name-validity',
  imagePropCompleteness: 'image-prop-completeness',
  // P1 — warning level (taste / hierarchy / surface awareness)
  attentionHierarchy: 'attention-hierarchy',
  spacingConsistency: 'spacing-consistency',
  missingChildren: 'missing-children',
  decorativeBorderOnSurface: 'decorative-border-on-surface',
  surfaceWithoutDataSurface: 'surface-without-data-surface',
  singleHeroPerRegion: 'single-hero-per-region',
  decorativeIconsDensity: 'decorative-icons-density',
  headingTypographyRole: 'heading-typography-role',
  emojiAsIcon: 'emoji-as-icon',
} as const;

export type ValidatorCheckId =
  (typeof VALIDATOR_CHECK_IDS)[keyof typeof VALIDATOR_CHECK_IDS];

// ============================================
// Known component registry (minimal set for validation)
// ============================================

/**
 * Components that require at least one TextASTNode child.
 * Derived from the canvas system prompt and component metadata.
 */
const REQUIRES_TEXT_CHILD = new Set([
  'Button',
  'Checkbox',
]);

/**
 * Known valid component types. This is a fallback when no external
 * component registry is provided. Keep in sync with componentRegistry.ts
 * AND ASTRenderer.tsx COMPONENT_ALIASES — aliases are valid names here too.
 */
const KNOWN_COMPONENTS = new Set([
  // Canonical names
  'Button', 'IconButton',
  'Checkbox', 'Radio', 'Switch', 'Stepper',
  'Avatar', 'Icon', 'IconContained', 'Image',
  'CounterBadge', 'IndicatorBadge', 'Badge',
  'Divider', 'JioRibbon', 'ContentBlock',
  'Spinner', 'Chip', 'SelectableButton',
  'SelectableIconButton', 'SelectableSingleTextButton',
  'WebHeader', 'Input', 'InputField',
  'FAB', 'Link', 'Logo', 'Carousel', 'PaginationDots',
  'BottomNavigation', 'BottomNavItem', 'Container',
  'ChipGroup', 'ListItem', 'ListItemGroup', 'Surface',
  'Tooltip', 'Grid', 'HeaderItem', 'PrimaryNav', 'SecondaryNav',
  'MobileDrawer', 'Select', 'SegmentedControl', 'Dialog', 'Toast',
  'Progress', 'Accordion', 'Separator', 'Menu', 'CircularProgressIndicator',
  'Collapsible', 'NumberField', 'NavigationMenu', 'Popover', 'Column', 'Meter',
  // ASTRenderer aliases — LLMs commonly generate these names
  'TextInput', 'TextField', 'TextArea', 'Textarea',
  'Text', 'Heading', 'Paragraph', 'Label',
  'Fab', 'fab',
]);

/**
 * Valid surface mode values for [data-surface] attribute — the unified
 * tokens emitted by the engine.
 */
const VALID_SURFACE_MODES = new Set([
  'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
]);

/**
 * Surface modes that are NOT the page default — descendants of these get
 * their tokens remapped via the `[data-surface]` cascade. The decorative-
 * border-on-surface check uses this to know when a tinted boundary already
 * exists and an extra stroke is duplicative.
 */
const NON_DEFAULT_SURFACE_MODES = new Set([
  'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
]);

/**
 * Components whose Icon child is functional, not decorative — clicking the
 * surrounding component is the action. Standalone Icons outside these are
 * counted toward the decorative-icon density warning.
 */
const FUNCTIONAL_ICON_HOSTS = new Set([
  'Button', 'IconButton', 'FAB', 'Fab', 'fab',
  'Chip', 'SelectableButton', 'SelectableIconButton', 'SelectableSingleTextButton',
  'Tab', 'WebHeader',
]);

/**
 * Components / element tags treated as a "region boundary" for the
 * single-hero-per-region check. A high-attention element nested deeper
 * is grouped against its nearest ancestor in this set.
 */
const REGION_HOSTS = new Set([
  'Surface', 'Card', 'ContentBlock', 'JioRibbon', 'Dialog',
]);
const REGION_TAGS = new Set([
  'section', 'main', 'header', 'footer', 'aside', 'nav', 'article',
]);

/**
 * Components / element tags that semantically are a "heading" — these must
 * use Display, Headline, or Title typography tokens, never Body or Label.
 */
const HEADING_HOSTS = new Set([
  'Heading', 'Title', 'Display', 'PageHeader',
]);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4']);

/** Typography size tokens that ARE valid for headings. */
const HEADING_TYPOGRAPHY_PATTERN = /var\(--(?:Display|Headline|Title)-/;

/** Typography size tokens that are NOT valid for headings (body / label). */
const BODY_LABEL_TYPOGRAPHY_PATTERN = /var\(--(?:Body|Label|Code)-/;

/**
 * Emoji detection — `Extended_Pictographic` covers the commonly understood
 * emoji set. We pair it with a "no letters or digits" check so phrases like
 * "Save 🎉" don't trip the emoji-as-icon warning; only icon-position usage
 * (where the entire content is pictographs) matters.
 */
const EMOJI_PICTOGRAPHIC_PATTERN = /\p{Extended_Pictographic}/u;
const HAS_WORD_CHAR_PATTERN = /[\p{L}\p{N}]/u;

function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return EMOJI_PICTOGRAPHIC_PATTERN.test(trimmed) && !HAS_WORD_CHAR_PATTERN.test(trimmed);
}

/** Border-related style properties that constitute a decorative stroke. */
const BORDER_STYLE_PROPS = [
  'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
  'borderColor', 'borderWidth', 'borderStyle', 'outline',
] as const;

/** CSS values that don't actually draw a border, despite appearing on a border prop. */
const NULL_BORDER_VALUES = new Set(['none', '0', '0px', 'transparent', 'initial', 'unset', 'inherit']);

// ============================================
// Token compliance regex
// ============================================

/**
 * Regex to detect hard-coded CSS values that should be tokens.
 * Matches: hex colors, rgb/rgba, px values, rem/em values, named colors.
 * Does NOT match: var(--...) references, pure numbers (for flex/opacity),
 * 'auto', 'none', 'inherit', 'initial', layout values (flex, column, etc.).
 */
const HARDCODED_VALUE_PATTERN = /^(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|\d+(?:\.\d+)?(?:px|rem|em|pt|cm|mm|in)\b)/;

/** Values that are legitimate CSS keywords, not hard-coded design values */
const ALLOWED_CSS_KEYWORDS = new Set([
  'flex', 'grid', 'block', 'inline', 'inline-flex', 'inline-block', 'none',
  'auto', 'inherit', 'initial', 'unset', 'revert',
  'column', 'row', 'column-reverse', 'row-reverse', 'wrap', 'nowrap',
  'center', 'flex-start', 'flex-end', 'space-between', 'space-around', 'space-evenly',
  'stretch', 'baseline', 'start', 'end',
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'hidden', 'visible', 'scroll', 'clip',
  'solid', 'dashed', 'dotted',
  'normal', 'bold', 'italic',
  'pointer', 'default', 'text',
  'cover', 'contain', 'fill',
  'transparent',
  'top', 'bottom', 'left', 'right',
  '100%', '0',
  // Micro-pixel values: legitimate for dividers, separators, and thin borders
  '1px', '2px',
]);

// ============================================
// AST traversal helpers
// ============================================

interface NodeVisitor {
  path: string;
  node: ASTNode;
}

function* walkAST(node: ASTNode, path: string = 'root'): Generator<NodeVisitor> {
  yield { path, node };
  if (node.kind === 'component' || node.kind === 'element') {
    // Defensive: the schema requires `children: ASTNode[]`, but LLMs
    // occasionally omit the array for empty elements. Treat missing as [].
    const children = Array.isArray(node.children) ? node.children : [];
    for (let i = 0; i < children.length; i++) {
      yield* walkAST(children[i], `${path} > children[${i}]`);
    }
  }
}

function hasTextDescendant(node: ASTNode): boolean {
  if (node.kind === 'text') return node.text.trim().length > 0;
  if (node.kind === 'component' || node.kind === 'element') {
    const children = Array.isArray(node.children) ? node.children : [];
    return children.some(hasTextDescendant);
  }
  return false;
}

/**
 * Context-aware visitor — like `NodeVisitor` but also exposes the parent
 * node, the surface mode the visited node *sits on*, and the path to the
 * nearest "region" ancestor. Used by the taste-based checks that need
 * structural context (border on Surface, hero per region, etc.).
 *
 * `surfaceContext` is the surface the visited node lives ON, not the
 * surface it ESTABLISHES. When a `<Surface mode="bold">` is visited, the
 * Surface itself sits on its parent's surface; only its descendants see
 * `surfaceContext === 'bold'`.
 */
interface ContextVisitor {
  path: string;
  node: ASTNode;
  parent: ASTNode | null;
  surfaceContext: string;
  /** Path to the nearest region-host ancestor, or 'root' if none. */
  regionPath: string;
}

function getEstablishedSurface(node: ASTNode): string | null {
  if (node.kind === 'component' && node.type === 'Surface') {
    const mode = node.props.mode;
    return typeof mode === 'string' ? mode : null;
  }
  if (node.kind === 'element') {
    const ds = node.props['data-surface'];
    return typeof ds === 'string' ? ds : null;
  }
  return null;
}

function isRegionHost(node: ASTNode): boolean {
  if (node.kind === 'component') return REGION_HOSTS.has(node.type);
  if (node.kind === 'element') {
    if (REGION_TAGS.has(node.tag)) return true;
    if (node.props['data-section'] != null || node.props['data-region'] != null) return true;
    return false;
  }
  return false;
}

function* walkASTWithContext(
  node: ASTNode,
  path: string = 'root',
  parent: ASTNode | null = null,
  surfaceContext: string = 'default',
  regionPath: string = 'root',
): Generator<ContextVisitor> {
  yield { path, node, parent, surfaceContext, regionPath };

  if (node.kind === 'component' || node.kind === 'element') {
    const established = getEstablishedSurface(node);
    const childSurface = established ?? surfaceContext;
    const childRegion = isRegionHost(node) ? path : regionPath;
    const children = Array.isArray(node.children) ? node.children : [];
    for (let i = 0; i < children.length; i++) {
      yield* walkASTWithContext(
        children[i],
        `${path} > children[${i}]`,
        node,
        childSurface,
        childRegion,
      );
    }
  }
}

function getStyleObject(node: ASTNode): Record<string, unknown> | null {
  if (node.kind !== 'component' && node.kind !== 'element') return null;
  const style = node.props.style;
  if (!style || typeof style !== 'object' || Array.isArray(style)) return null;
  return style as Record<string, unknown>;
}

/** Warning-severity check — counts nodes where `children` is missing. The
 *  validator doesn't crash on these (walkAST coerces to []), but we surface
 *  them so the score reflects schema drift. */
function checkMissingChildren(root: ASTRoot): CompositionCheck {
  const offending: string[] = [];
  for (const { node, path } of walkAST(root.root)) {
    if (
      (node.kind === 'component' || node.kind === 'element') &&
      !Array.isArray((node as { children?: unknown }).children)
    ) {
      offending.push(path);
    }
  }
  return {
    id: VALIDATOR_CHECK_IDS.missingChildren,
    name: 'All container nodes declare children arrays',
    passed: offending.length === 0,
    severity: 'warning',
    details:
      offending.length > 0
        ? `Missing children[] on ${offending.length} node(s): ${offending.slice(0, 3).join(', ')}${offending.length > 3 ? '…' : ''}`
        : undefined,
  };
}

// ============================================
// Individual checks
// ============================================

function checkUniqueIds(root: ASTRoot): CompositionCheck {
  const ids = new Set<string>();
  const duplicates: string[] = [];

  for (const { node } of walkAST(root.root)) {
    if (ids.has(node.id)) {
      duplicates.push(node.id);
    }
    ids.add(node.id);
  }

  return {
    id: VALIDATOR_CHECK_IDS.uniqueIds,
    name: 'Unique node IDs',
    passed: duplicates.length === 0,
    severity: 'error',
    details: duplicates.length > 0
      ? `Duplicate IDs found: ${duplicates.join(', ')}`
      : undefined,
  };
}

function checkComponentExistence(
  root: ASTRoot,
  knownComponents?: Set<string>,
): CompositionCheck {
  const registry = knownComponents ?? KNOWN_COMPONENTS;
  const unknown: Array<{ type: string; path: string }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind === 'component' && !registry.has(node.type)) {
      unknown.push({ type: node.type, path });
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.componentExistence,
    name: 'Component registry compliance',
    passed: unknown.length === 0,
    severity: 'error',
    details: unknown.length > 0
      ? `Unknown components: ${unknown.map((u) => `${u.type} at ${u.path}`).join('; ')}`
      : undefined,
  };
}

function checkRequiredChildren(root: ASTRoot): CompositionCheck {
  const violations: Array<{ type: string; path: string }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind === 'component' && REQUIRES_TEXT_CHILD.has(node.type)) {
      const children = Array.isArray(node.children) ? node.children : [];
      const hasTextChild = children.some((c) => c.kind === 'text');
      if (!hasTextChild) {
        violations.push({ type: node.type, path });
      }
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.requiredChildren,
    name: 'Required text children',
    passed: violations.length === 0,
    severity: 'error',
    details: violations.length > 0
      ? `Components missing required text children: ${violations.map((v) => `${v.type} at ${v.path}`).join('; ')}`
      : undefined,
  };
}

function checkIconNameValidity(root: ASTRoot): CompositionCheck {
  const invalid: Array<{ type: string; name: string; path: string }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind !== 'component') continue;
    if (node.type === 'Icon' || node.type === 'IconContained') {
      const name = node.props.name;
      if (typeof name !== 'string' || !VALID_SEMANTIC_ICON_NAMES.has(name)) {
        invalid.push({ type: node.type, name: typeof name === 'string' ? name : 'missing', path });
      }
    }
    if (node.type === 'IconButton') {
      const icon = node.props.icon;
      if (typeof icon === 'string' && !VALID_SEMANTIC_ICON_NAMES.has(icon)) {
        invalid.push({ type: node.type, name: icon, path });
      }
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.iconNameValidity,
    name: 'Icon names use semantic OneUI names',
    passed: invalid.length === 0,
    severity: 'error',
    details:
      invalid.length > 0
        ? `Invalid icon names: ${invalid.map((item) => `${item.name} on ${item.type} at ${item.path}`).join('; ')}`
        : undefined,
  };
}

function checkImagePropCompleteness(root: ASTRoot): CompositionCheck {
  const invalid: Array<{ path: string; missing: string[] }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind !== 'component' || (node.type !== 'Image' && node.type !== 'Logo')) continue;
    const missing: string[] = [];
    if (node.type === 'Image' && (typeof node.props.src !== 'string' || node.props.src.trim().length === 0)) {
      missing.push('src');
    }
    if (typeof node.props.alt !== 'string' || node.props.alt.trim().length === 0) {
      missing.push('alt');
    }
    if (
      node.type === 'Logo' &&
      typeof node.props.src !== 'string' &&
      typeof node.props.svgContent !== 'string' &&
      !hasTextDescendant(node)
    ) {
      missing.push('content');
    }
    if (missing.length > 0) invalid.push({ path, missing });
  }

  return {
    id: VALIDATOR_CHECK_IDS.imagePropCompleteness,
    name: 'Media components include required content',
    passed: invalid.length === 0,
    severity: 'error',
    details:
      invalid.length > 0
        ? `Incomplete Image nodes: ${invalid.map((item) => `${item.path} missing ${item.missing.join(', ')}`).join('; ')}`
        : undefined,
  };
}

function checkAttentionHierarchy(root: ASTRoot): CompositionCheck {
  // Count high-attention components per screen
  // If multi-screen (data-screen), check per screen; otherwise check globally
  const screens = new Map<string, number>();

  function countInSubtree(node: ASTNode, screenId: string) {
    if (node.kind === 'component') {
      const attention = node.props.attention ?? node.props.variant;
      if (attention === 'high' || attention === 'bold') {
        screens.set(screenId, (screens.get(screenId) ?? 0) + 1);
      }
    }
    if (node.kind === 'component' || node.kind === 'element') {
      const children = Array.isArray(node.children) ? node.children : [];
      for (const child of children) {
        // Check if this child defines a new screen boundary
        const childScreen =
          child.kind === 'element' && child.props['data-screen']
            ? String(child.props['data-screen'])
            : screenId;
        countInSubtree(child, childScreen);
      }
    }
  }

  countInSubtree(root.root, '__global__');

  const violations = Array.from(screens.entries())
    .filter(([, count]) => count > 1)
    .map(([screen, count]) => `${screen === '__global__' ? 'global' : screen}: ${count} high-attention components`);

  return {
    id: VALIDATOR_CHECK_IDS.attentionHierarchy,
    name: 'Attention hierarchy (max 1 high per screen)',
    passed: violations.length === 0,
    severity: 'warning', // Warning, not error — multiple bold buttons can be intentional
    details: violations.length > 0
      ? `Multiple high-attention components: ${violations.join('; ')}`
      : undefined,
  };
}

function checkTokenCompliance(root: ASTRoot): CompositionCheck {
  const violations: Array<{ value: string; property: string; path: string }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind === 'element') {
      const style = node.props.style;
      if (style && typeof style === 'object' && !Array.isArray(style)) {
        for (const [prop, value] of Object.entries(style as Record<string, unknown>)) {
          if (typeof value !== 'string') continue;

          // Skip if it's a var() reference — that's correct
          if (value.startsWith('var(')) continue;

          // Skip allowed CSS keywords
          if (ALLOWED_CSS_KEYWORDS.has(value)) continue;

          // Skip pure numbers (flex values, opacity, z-index)
          if (/^\d+(\.\d+)?$/.test(value)) continue;

          // Skip percentages
          if (/^\d+(\.\d+)?%$/.test(value)) continue;

          // Check for hard-coded values
          if (HARDCODED_VALUE_PATTERN.test(value)) {
            violations.push({ value, property: prop, path: `${path} > props.style.${prop}` });
          }
        }
      }
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.tokenCompliance,
    name: 'Token compliance (no hard-coded values)',
    passed: violations.length === 0,
    severity: 'error',
    details: violations.length > 0
      ? `Hard-coded values found: ${violations.slice(0, 5).map((v) => `${v.property}: ${v.value} at ${v.path}`).join('; ')}${violations.length > 5 ? ` (+${violations.length - 5} more)` : ''}`
      : undefined,
  };
}

function checkSurfaceModeValidity(root: ASTRoot): CompositionCheck {
  const violations: Array<{ mode: string; path: string }> = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind === 'element') {
      const dataSurface = node.props['data-surface'];
      if (dataSurface && typeof dataSurface === 'string' && !VALID_SURFACE_MODES.has(dataSurface)) {
        violations.push({ mode: dataSurface, path });
      }
    }
    if (node.kind === 'component' && node.type === 'Surface') {
      const mode = node.props.mode;
      if (mode && typeof mode === 'string' && !VALID_SURFACE_MODES.has(mode)) {
        violations.push({ mode, path });
      }
    }
  }

  // Also check root-level surfaceMode
  if (root.surfaceMode && !VALID_SURFACE_MODES.has(root.surfaceMode)) {
    violations.push({ mode: root.surfaceMode, path: 'root.surfaceMode' });
  }

  return {
    id: VALIDATOR_CHECK_IDS.surfaceModeValidity,
    name: 'Surface mode validity',
    passed: violations.length === 0,
    severity: 'error',
    details: violations.length > 0
      ? `Invalid surface modes: ${violations.map((v) => `"${v.mode}" at ${v.path}`).join('; ')}`
      : undefined,
  };
}

function checkSpacingConsistency(root: ASTRoot): CompositionCheck {
  // Advisory check: warn if siblings use mixed spacing approaches
  const mixedGapContainers: string[] = [];

  for (const { node, path } of walkAST(root.root)) {
    if (node.kind === 'element' && Array.isArray(node.children) && node.children.length > 1) {
      const style = node.props.style;
      if (style && typeof style === 'object' && !Array.isArray(style)) {
        const gap = (style as Record<string, unknown>).gap;
        // Warn if gap is missing on a flex/grid container with multiple children
        const display = (style as Record<string, unknown>).display;
        if ((display === 'flex' || display === 'grid') && !gap) {
          mixedGapContainers.push(path);
        }
      }
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.spacingConsistency,
    name: 'Spacing consistency',
    passed: mixedGapContainers.length === 0,
    severity: 'warning',
    details: mixedGapContainers.length > 0
      ? `Flex/grid containers without gap token: ${mixedGapContainers.slice(0, 3).join('; ')}${mixedGapContainers.length > 3 ? ` (+${mixedGapContainers.length - 3} more)` : ''}`
      : undefined,
  };
}

// ============================================
// Taste-based checks (warning severity)
// ============================================
//
// These six checks encode design-system "do/don't" guidance that goes beyond
// structural correctness. They emit warnings, never errors — a brand may
// legitimately need any one of these on a case-by-case basis. The signal
// reduces score; it never blocks output.

/**
 * Decorative border applied to a node sitting inside a non-default Surface.
 * Encodes the CLAUDE.md rule: "tinted fill already provides the boundary;
 * adding a stroke duplicates the cue and muddies hierarchy."
 */
function checkDecorativeBorderOnSurface(root: ASTRoot): CompositionCheck {
  const violations: Array<{ path: string; surface: string; props: string[] }> = [];

  for (const { node, path, surfaceContext } of walkASTWithContext(root.root)) {
    if (!NON_DEFAULT_SURFACE_MODES.has(surfaceContext)) continue;
    const style = getStyleObject(node);
    if (!style) continue;

    const found: string[] = [];
    for (const prop of BORDER_STYLE_PROPS) {
      const value = style[prop];
      if (typeof value !== 'string') continue;
      const trimmed = value.trim();
      if (!trimmed || NULL_BORDER_VALUES.has(trimmed)) continue;
      found.push(prop);
    }
    if (found.length > 0) {
      violations.push({ path, surface: surfaceContext, props: found });
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.decorativeBorderOnSurface,
    name: 'No decorative borders inside tinted Surface',
    passed: violations.length === 0,
    severity: 'warning',
    details:
      violations.length > 0
        ? `Stroke applied inside non-default Surface (the tinted fill already provides the boundary): ${violations
            .slice(0, 3)
            .map((v) => `${v.props.join('+')} at ${v.path} (surface=${v.surface})`)
            .join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}`
        : undefined,
  };
}

/**
 * Element with a manual `background` / `backgroundColor` style instead of
 * using `<Surface mode="...">`. The component's children won't get the
 * surface-context token remap, so descendants render with mis-resolved
 * colors against the page palette.
 */
function checkSurfaceWithoutDataSurface(root: ASTRoot): CompositionCheck {
  const violations: Array<{ path: string; bgValue: string }> = [];

  for (const { node, path } of walkASTWithContext(root.root)) {
    // Surface itself is the correct API — skip it. data-surface elements are
    // also opted into the cascade.
    if (getEstablishedSurface(node) != null) continue;

    const style = getStyleObject(node);
    if (!style) continue;

    const bg = style.background ?? style.backgroundColor;
    if (typeof bg !== 'string') continue;
    const trimmed = bg.trim();
    if (!trimmed) continue;
    if (trimmed === 'transparent' || trimmed === 'none' || trimmed === 'inherit') continue;
    // The page background token is already the default surface; using it is a no-op.
    if (/^var\(--Surface-Main\b/.test(trimmed)) continue;

    // Only flag containers — a 1px decorative box may legitimately use a bg.
    if (node.kind === 'element' || node.kind === 'component') {
      const children = Array.isArray(node.children) ? node.children : [];
      if (children.length === 0) continue;
    }

    violations.push({ path, bgValue: trimmed });
  }

  return {
    id: VALIDATOR_CHECK_IDS.surfaceWithoutDataSurface,
    name: 'Backgrounds use Surface, not raw style',
    passed: violations.length === 0,
    severity: 'warning',
    details:
      violations.length > 0
        ? `Manual background on a container without <Surface> wrapping (children won't get token remap): ${violations
            .slice(0, 3)
            .map((v) => `${v.bgValue} at ${v.path}`)
            .join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}`
        : undefined,
  };
}

function isHighAttentionNode(node: ASTNode): boolean {
  if (node.kind !== 'component') return false;
  const attention = node.props.attention;
  const variant = node.props.variant;
  return attention === 'high' || variant === 'bold';
}

/**
 * Per-region count of high-attention components. Within any single region
 * (Card, Surface, section, etc.) only one element should claim the visual
 * peak — Huashu's "one detail at 120%, the rest at 80%". The existing
 * `attention-hierarchy` check is per-screen; this is per-region (tighter).
 */
function checkSingleHeroPerRegion(root: ASTRoot): CompositionCheck {
  const counts = new Map<string, number>();

  for (const { node, regionPath } of walkASTWithContext(root.root)) {
    if (isHighAttentionNode(node)) {
      counts.set(regionPath, (counts.get(regionPath) ?? 0) + 1);
    }
  }

  const violations = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([region, count]) => `${region}: ${count} high-attention items`);

  return {
    id: VALIDATOR_CHECK_IDS.singleHeroPerRegion,
    name: 'One hero per region',
    passed: violations.length === 0,
    severity: 'warning',
    details:
      violations.length > 0
        ? `Multiple high-attention items inside the same region (one detail to 120%, rest to 80%): ${violations
            .slice(0, 3)
            .join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}`
        : undefined,
  };
}

/**
 * Decorative-icon density. Counts Icon components NOT inside a functional
 * host (Button, Chip, Tab, …). Above the threshold, iconography is
 * dilutive rather than informative.
 */
function checkDecorativeIconsDensity(root: ASTRoot): CompositionCheck {
  const ICON_TYPES = new Set(['Icon', 'IconContained']);
  const STANDALONE_ICON_THRESHOLD = 4;

  let standaloneCount = 0;
  const samplePaths: string[] = [];

  for (const { node, path, parent } of walkASTWithContext(root.root)) {
    if (node.kind !== 'component') continue;
    if (!ICON_TYPES.has(node.type)) continue;

    // Functional if directly inside a button-like host.
    const inFunctionalHost =
      parent !== null && parent.kind === 'component' && FUNCTIONAL_ICON_HOSTS.has(parent.type);
    if (inFunctionalHost) continue;

    standaloneCount++;
    if (samplePaths.length < 3) samplePaths.push(path);
  }

  return {
    id: VALIDATOR_CHECK_IDS.decorativeIconsDensity,
    name: 'Decorative icon density',
    passed: standaloneCount <= STANDALONE_ICON_THRESHOLD,
    severity: 'warning',
    details:
      standaloneCount > STANDALONE_ICON_THRESHOLD
        ? `${standaloneCount} standalone Icon components (>${STANDALONE_ICON_THRESHOLD}). Decorative icons dilute signal density — keep iconography functional. Examples: ${samplePaths.join(', ')}`
        : undefined,
  };
}

function isHeadingNode(node: ASTNode): boolean {
  if (node.kind === 'element') {
    if (HEADING_TAGS.has(node.tag)) return true;
    if (node.props.role === 'heading') return true;
    return false;
  }
  if (node.kind === 'component') {
    if (HEADING_HOSTS.has(node.type)) return true;
    if (node.props.role === 'heading') return true;
    return false;
  }
  return false;
}

/**
 * Headings should reach for Display / Headline / Title typography tokens.
 * If a heading's inline `fontSize` is wired to a Body or Label token, the
 * brand's custom Display slot is being bypassed.
 */
function checkHeadingTypography(root: ASTRoot): CompositionCheck {
  const violations: Array<{ path: string; token: string }> = [];

  for (const { node, path } of walkASTWithContext(root.root)) {
    if (!isHeadingNode(node)) continue;
    const style = getStyleObject(node);
    if (!style) continue;
    const fontSize = style.fontSize;
    if (typeof fontSize !== 'string') continue;
    const trimmed = fontSize.trim();
    // Heading uses correct typography role — pass.
    if (HEADING_TYPOGRAPHY_PATTERN.test(trimmed)) continue;
    // Heading uses Body/Label/Code role — flag.
    if (BODY_LABEL_TYPOGRAPHY_PATTERN.test(trimmed)) {
      violations.push({ path, token: trimmed });
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.headingTypographyRole,
    name: 'Headings use Display / Headline / Title tokens',
    passed: violations.length === 0,
    severity: 'warning',
    details:
      violations.length > 0
        ? `Heading nodes referencing Body/Label typography (bypasses brand Display slot): ${violations
            .slice(0, 3)
            .map((v) => `${v.token} at ${v.path}`)
            .join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}`
        : undefined,
  };
}

/**
 * Emoji used in icon position (inside an Icon component, or as a `start` /
 * `end` slot string on a button-like component). Emoji-as-icon reads as
 * unprofessional in a multi-brand commercial system; the brand's Icon
 * library should be used instead. Phrases that contain emoji alongside
 * regular text (e.g. "Save 🎉") are intentionally NOT flagged — only
 * icon-position usage matters.
 */
function checkEmojiAsIcon(root: ASTRoot): CompositionCheck {
  const ICON_TYPES = new Set(['Icon', 'IconContained']);
  const SLOT_AWARE_HOSTS = new Set([
    'Button', 'IconButton', 'Chip',
    'SelectableButton', 'SelectableSingleTextButton',
    'Input', 'InputField', 'TextInput', 'TextField',
    'ListItem',
  ]);

  const violations: Array<{ path: string; reason: string; emoji: string }> = [];

  for (const { node, path } of walkASTWithContext(root.root)) {
    if (node.kind !== 'component') continue;

    // Case 1: text-only emoji child of an Icon.
    if (ICON_TYPES.has(node.type)) {
      const children = Array.isArray(node.children) ? node.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.kind === 'text' && isEmojiOnly(child.text)) {
          violations.push({
            path: `${path} > children[${i}]`,
            reason: 'emoji as Icon content',
            emoji: child.text.trim(),
          });
        }
      }
    }

    // Case 2: `start` / `end` slot string is emoji-only on button-likes.
    if (SLOT_AWARE_HOSTS.has(node.type)) {
      for (const slot of ['start', 'end'] as const) {
        const value = node.props[slot];
        if (typeof value === 'string' && isEmojiOnly(value)) {
          violations.push({
            path: `${path}.props.${slot}`,
            reason: `emoji in ${slot} slot of ${node.type}`,
            emoji: value.trim(),
          });
        }
      }
    }
  }

  return {
    id: VALIDATOR_CHECK_IDS.emojiAsIcon,
    name: 'No emoji as icon',
    passed: violations.length === 0,
    severity: 'warning',
    details:
      violations.length > 0
        ? `Emoji used in icon position (use the brand Icon library instead): ${violations
            .slice(0, 3)
            .map((v) => `${v.emoji} (${v.reason}) at ${v.path}`)
            .join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}`
        : undefined,
  };
}

// ============================================
// Main validation function
// ============================================

/**
 * Validate a generated composition AST against deterministic rules.
 *
 * @param ast              - The AST to validate
 * @param knownComponents  - Set of known component names (from registry). Falls back to built-in set.
 * @param _context         - Composition context (for context-specific checks, future use)
 * @returns CompositionValidationResult with all check results
 */
export function validateComposition(
  ast: ASTRoot,
  knownComponents?: Set<string>,
  _context?: CompositionContext,
): CompositionValidationResult {
  const checks: CompositionCheck[] = [
    // P0 — error level (structural correctness)
    checkUniqueIds(ast),
    checkComponentExistence(ast, knownComponents),
    checkRequiredChildren(ast),
    checkTokenCompliance(ast),
    checkSurfaceModeValidity(ast),
    checkIconNameValidity(ast),
    checkImagePropCompleteness(ast),
    // P1 — warning level (taste / hierarchy / surface awareness)
    checkAttentionHierarchy(ast),
    checkSpacingConsistency(ast),
    checkMissingChildren(ast),
    checkDecorativeBorderOnSurface(ast),
    checkSurfaceWithoutDataSurface(ast),
    checkSingleHeroPerRegion(ast),
    checkDecorativeIconsDensity(ast),
    checkHeadingTypography(ast),
    checkEmojiAsIcon(ast),
  ];

  const errorCount = checks.filter((c) => !c.passed && c.severity === 'error').length;
  const warningCount = checks.filter((c) => !c.passed && c.severity === 'warning').length;
  const infoCount = checks.filter((c) => !c.passed && c.severity === 'info').length;

  // Score: start at 100, subtract 15 per error, 5 per warning, 1 per info
  const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5 - infoCount);

  return {
    valid: errorCount === 0,
    score,
    checks,
    errorCount,
    warningCount,
    infoCount,
  };
}

// ============================================================================
// Skill text validator (Phase F — Skill Writer)
// ============================================================================

/**
 * Issue surfaced by `validateSkill`. Distinct from `CompositionCheck` because
 * skill validation runs against a *text draft*, not an AST — no ID/component
 * paths, just a flat list of severities tied to the prompt template body.
 */
export interface SkillIssue {
  level: 'error' | 'warning';
  code: SkillIssueCode;
  message: string;
}

export type SkillIssueCode =
  | 'EMPTY_DRAFT'
  | 'MISSING_BRAND_PLACEHOLDER'
  | 'HARDCODED_HEX'
  | 'HARDCODED_PX'
  | 'MISSING_SURFACE_GUIDANCE'
  | 'EXCESSIVE_LENGTH';

export interface SkillValidationResult {
  /** True iff zero error-level issues. Warnings do not block save. */
  valid: boolean;
  issues: SkillIssue[];
}

const SKILL_MAX_LENGTH = 2000;
const SKILL_HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;
const SKILL_PX_PATTERN = /\d+(?:\.\d+)?px\b/;
// Strips balanced `var(...)` expressions (one nesting level) so the px check
// ignores fallback values like `var(--Spacing-4)`.
const SKILL_VAR_EXPR_PATTERN = /var\([^()]*(?:\([^()]*\)[^()]*)*\)/g;

/**
 * Deterministic structural validation for a skill `systemPromptTemplate`.
 * Pure function — runs client-side on every keystroke and server-side as a
 * guard before persisting to Convex. Errors block save; warnings inform.
 *
 * Rules:
 * - `EMPTY_DRAFT` (error): draft is blank after trim.
 * - `MISSING_BRAND_PLACEHOLDER` (error): no `{brand}` placeholder.
 * - `HARDCODED_HEX` (error): any `#hex` literal — must use `var(--Token-*)`.
 * - `HARDCODED_PX` (warning): bare px value not inside a `var()` expression.
 * - `MISSING_SURFACE_GUIDANCE` (warning): no mention of `surface` / `Surface`.
 * - `EXCESSIVE_LENGTH` (warning): draft exceeds {@link SKILL_MAX_LENGTH} chars.
 */
export function validateSkill(draft: string): SkillValidationResult {
  const issues: SkillIssue[] = [];
  const trimmed = draft.trim();

  if (trimmed.length === 0) {
    issues.push({
      level: 'error',
      code: 'EMPTY_DRAFT',
      message: 'Draft is empty. Add at least a few sentences describing what the skill produces.',
    });
    // Empty drafts can't fail any other check; short-circuit.
    return { valid: false, issues };
  }

  if (!draft.includes('{brand}')) {
    issues.push({
      level: 'error',
      code: 'MISSING_BRAND_PLACEHOLDER',
      message: 'Missing `{brand}` placeholder — required so the compiler can interpolate brand context.',
    });
  }

  if (SKILL_HEX_PATTERN.test(draft)) {
    issues.push({
      level: 'error',
      code: 'HARDCODED_HEX',
      message: 'Hex literal found. Use `var(--Token-Name)` references instead — hex pins the colour and bypasses brand customisation.',
    });
  }

  // Mask `var(...)` so px values inside fallbacks (e.g. `var(--Spacing-4)`)
  // don't trip the bare-px check.
  const draftWithoutVars = draft.replace(SKILL_VAR_EXPR_PATTERN, '');
  if (SKILL_PX_PATTERN.test(draftWithoutVars)) {
    issues.push({
      level: 'warning',
      code: 'HARDCODED_PX',
      message: 'Bare px value detected. Prefer `var(--Spacing-*)` or `var(--Dimension-f*)` so density and platform cascade correctly.',
    });
  }

  if (!/surface/i.test(draft)) {
    issues.push({
      level: 'warning',
      code: 'MISSING_SURFACE_GUIDANCE',
      message: 'No surface guidance found. Skills usually mention which surface mode (`default`, `bold`, `subtle`, …) the composition should sit on.',
    });
  }

  if (draft.length > SKILL_MAX_LENGTH) {
    issues.push({
      level: 'warning',
      code: 'EXCESSIVE_LENGTH',
      message: `Draft is ${draft.length} characters; aim for ≤ ${SKILL_MAX_LENGTH}. Long skills bloat the system prompt and dilute the model's attention.`,
    });
  }

  const hasError = issues.some((i) => i.level === 'error');
  return { valid: !hasError, issues };
}
