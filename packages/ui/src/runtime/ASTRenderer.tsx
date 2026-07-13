/**
 * ASTRenderer.tsx
 *
 * Recursive renderer: maps ASTNode trees to real React components via the registry.
 * Each rendered node gets data-ast-node-id for editor selection.
 */

'use client';

import React, { createElement, memo, useMemo } from 'react';
import type { ASTNode, ASTRoot, ASTSerializableValue } from '@oneui/shared';
import { COMPONENT_REGISTRY } from '../registry/componentRegistry';
import { ComponentHarness } from '../components/ComponentHarness';
import './ASTRenderer.styles.css';

/**
 * Per-component prop allow-lists for leaves. The renderer drops any AST prop
 * not listed here before spreading onto the component, so an LLM emitting
 * `<Badge style={{ width: '100%' }} />` (or `className="w-full"`) cannot
 * stretch a component beyond its intrinsic size. Layout primitives (Card,
 * Container, Surface, Grid, Stack) are intentionally absent — they need
 * width / display / className for composition. Unknown components also pass
 * through unchanged so unregistered types don't silently break.
 *
 * Always-allowed meta keys (`data-ast-*`, `aria-*`, `id`, `role`, `key`) are
 * appended at filter time so each entry below only lists the public prop API.
 */
const LEAF_COMPONENT_ALLOWED_PROPS: Record<string, ReadonlyArray<string>> = {
  Badge: ['variant', 'size', 'appearance', 'start', 'end', 'children'],
  Button: [
    'variant',
    'size',
    'appearance',
    'attention',
    'contained',
    'start',
    'end',
    'startIcon',
    'endIcon',
    'leading',
    'trailing',
    'disabled',
    'loading',
    'onPress',
    'onClick',
    'type',
    'children',
  ],
  IconButton: [
    'icon',
    'size',
    'appearance',
    'attention',
    'variant',
    'disabled',
    'loading',
    'onPress',
    'onClick',
    'aria-label',
  ],
  Icon: ['name', 'size', 'color', 'appearance'],
  Avatar: ['size', 'src', 'alt', 'name', 'initials', 'shape', 'appearance'],
  Logo: ['size', 'variant', 'appearance', 'src', 'alt'],
  Spinner: ['size', 'label', 'appearance'],
  Chip: [
    'size',
    'variant',
    'appearance',
    'selected',
    'disabled',
    'start',
    'end',
    'onPress',
    'onClick',
    'children',
  ],
  IndicatorBadge: ['size', 'appearance', 'children'],
  CounterBadge: ['size', 'appearance', 'count', 'max', 'children'],
  Switch: ['size', 'appearance', 'checked', 'onCheckedChange', 'disabled'],
  Checkbox: ['size', 'appearance', 'checked', 'onCheckedChange', 'disabled', 'children'],
  Radio: ['size', 'appearance', 'value', 'disabled', 'children'],
  PaginationDots: ['pageCount', 'activeIndex', 'size', 'appearance'],
};

const ALWAYS_ALLOWED_PREFIXES = ['data-ast-', 'aria-', 'data-oneui-'] as const;
const ALWAYS_ALLOWED_KEYS = new Set([
  'id',
  'role',
  'key',
  'ref',
  'tabIndex',
  'children',
]);

/**
 * Style sub-keys that an LLM should never set on a leaf component — they
 * override the component's intrinsic sizing/layout and are the most common
 * source of "Badge full width" / "Button full width" drift. Stripped from
 * any `style` prop before spread; non-listed keys (e.g. `marginTop` for
 * spacing) are preserved.
 */
const FORBIDDEN_LEAF_STYLE_KEYS = new Set([
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'justifySelf',
  'display',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
]);

/**
 * Common component name aliases — LLMs sometimes generate names that differ
 * from the registry's PascalCase names. This maps them to the correct type.
 */
const COMPONENT_ALIASES: Record<string, string> = {
  TextInput: 'Input',
  TextField: 'Input',
  InputField: 'Input',
  TextArea: 'Input',
  Textarea: 'Input',
  Anchor: 'Link',
  LinkButton: 'Button',
  Fab: 'FAB',
  fab: 'FAB',
  // Navigation — LLM produces a range of names; resolve to the concrete
  // WebHeader primitive for web contexts. Mobile contexts are steered to
  // BottomNavigation via the executor prompt + dedicated aliases below.
  Header: 'WebHeader',
  TopBar: 'WebHeader',
  AppBar: 'WebHeader',
  Navbar: 'WebHeader',
  NavBar: 'WebHeader',
  Navigation: 'WebHeader',
  NavigationHeader: 'WebHeader',
  SiteHeader: 'WebHeader',
  NavigationBar: 'BottomNavigation',
  TabBar: 'BottomNavigation',
  BottomBar: 'BottomNavigation',
  BottomTabs: 'BottomNavigation',
  Text: '__text__',        // Fallback: render as text node
  Heading: '__text__',
  Paragraph: '__text__',
  Label: '__text__',
};

// ---------------------------------------------------------------------------
// Node renderers
// ---------------------------------------------------------------------------

/**
 * Render mode:
 * - 'preview' (default): Uses previewComponent for editor showcase grids
 * - 'render': Uses the actual component with exact props from the AST —
 *   this is what you want for composition playgrounds and live previews
 */
export type ASTRenderMode = 'preview' | 'render';

interface ASTNodeRendererProps {
  node: ASTNode;
  renderMode: ASTRenderMode;
}

const ASTNodeRenderer = memo(function ASTNodeRenderer({ node, renderMode }: ASTNodeRendererProps) {
  switch (node.kind) {
    case 'text':
      return <>{node.text}</>;

    case 'element': {
      const { id, tag, props } = node;
      // LLMs occasionally omit `children` for empty elements. Treat as [].
      const children = Array.isArray(node.children) ? node.children : [];
      const elementProps = {
        ...convertProps(props, renderMode),
        'data-ast-node-id': id,
      };
      return createElement(
        tag,
        elementProps,
        ...children.map((child) => (
          <ASTNodeRenderer key={child.id} node={child} renderMode={renderMode} />
        )),
      );
    }

    case 'component': {
      const { id, type, props } = node;
      const children = Array.isArray(node.children) ? node.children : [];

      // Resolve aliases (LLMs often generate TextInput, TextField, etc.)
      const resolvedType = COMPONENT_ALIASES[type] ?? type;

      // Special case: alias maps to a text node (Heading, Paragraph, Label)
      if (resolvedType === '__text__') {
        const textContent = children.map((c) =>
          c.kind === 'text' ? c.text : ''
        ).join('');
        return (
          <div data-ast-node-id={id} style={convertProps(props, renderMode).style as any}>
            {textContent || (props.children as string) || type}
          </div>
        );
      }

      const entry = COMPONENT_REGISTRY[resolvedType];

      // In 'render' mode, prefer the actual component; in 'preview' mode, prefer previewComponent
      const Component = renderMode === 'render'
        ? (entry?.component ?? entry?.previewComponent)
        : (entry?.previewComponent ?? entry?.component);

      if (!Component) {
        // Loud fallback: the LLM emitted a component type that isn't in the
        // registry. Render an inline-block warning chip so the failure is
        // visible to designers immediately. `data-ast-unknown` keeps the CSS
        // hook for the playground canvas styling.
        return (
          <span
            data-ast-node-id={id}
            data-ast-unknown={type}
            data-oneui-canvas-fallback-badge
            title={`Unknown component: ${type} — add it to COMPONENT_REGISTRY or alias it.`}
          >
            ⚠ {type}
            {children.length > 0 && children.map((child) => (
              <ASTNodeRenderer key={child.id} node={child} renderMode={renderMode} />
            ))}
          </span>
        );
      }
      const sanitizedProps = sanitizePropsForComponent(
        resolvedType,
        convertProps(props, renderMode),
      );
      const componentProps = {
        ...sanitizedProps,
        'data-ast-node-id': id,
        // Resolved component name, surfaced so the canvas click-to-select
        // flow can read the type back from the DOM without re-walking the
        // AST tree. `type` is the raw LLM name; `resolvedType` is the
        // post-alias registry key — the former is what the agent emitted
        // and most useful for revision prompts.
        'data-ast-component': resolvedType !== type ? `${type}->${resolvedType}` : resolvedType,
      };
      if (children.length > 0) {
        return (
          <Component {...componentProps}>
            {children.map((child) => (
              <ASTNodeRenderer key={child.id} node={child} renderMode={renderMode} />
            ))}
          </Component>
        );
      }
      return <Component {...componentProps} />;
    }
  }
});

// ---------------------------------------------------------------------------
// Prop conversion (ASTSerializableValue → React-compatible)
// ---------------------------------------------------------------------------

/**
 * The LLM sometimes nests AST nodes inside component *props* (e.g. an
 * IconButton's `icon` slot arrives as `{ kind: 'component', type: 'Icon',
 * props: {...} }`). Detect and render those through the same pipeline so the
 * real component receives a valid React element instead of a raw object
 * (React throws "Objects are not valid as a React child" otherwise).
 */
function isASTNodeShape(value: unknown): value is ASTNode {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const kind = (value as { kind?: unknown }).kind;
  return kind === 'component' || kind === 'element' || kind === 'text';
}

function convertValue(value: ASTSerializableValue, renderMode: ASTRenderMode): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => convertValue(item as ASTSerializableValue, renderMode));
  }
  if (isASTNodeShape(value)) {
    return (
      <ASTNodeRenderer
        key={(value as { id?: string }).id ?? undefined}
        node={value as ASTNode}
        renderMode={renderMode}
      />
    );
  }
  return value;
}

function convertProps(
  props: Record<string, ASTSerializableValue>,
  renderMode: ASTRenderMode = 'render',
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    result[key] = convertValue(value, renderMode);
  }
  return result;
}

/**
 * Detect an obviously-broken image src — empty string, the literal LLM
 * placeholder tokens, or a relative path that won't resolve against the
 * playground origin. Returns a deterministic SVG data URL fallback so
 * the image renders as a neutral grey box instead of a broken-image icon.
 */
const PLACEHOLDER_SRC_PATTERNS = [
  /^placeholder$/i,
  /^<image>$/i,
  /^image$/i,
  /^todo$/i,
  /^example\.(com|org)/i,
];

const NEUTRAL_IMAGE_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3" preserveAspectRatio="none">' +
      '<rect width="4" height="3" fill="%23e6e6e6"/>' +
      '</svg>',
  );

function isSuspectImageSrc(src: unknown): boolean {
  if (typeof src !== 'string') return true;
  const trimmed = src.trim();
  if (!trimmed) return true;
  if (PLACEHOLDER_SRC_PATTERNS.some((re) => re.test(trimmed))) return true;
  // Allow data: URLs, absolute http(s), and root-relative app paths.
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('/')
  ) {
    return false;
  }
  // Relative paths and bare strings ("hero.png", "image_01") won't load
  // from the playground origin — substitute a neutral placeholder.
  return true;
}

/**
 * Filter a converted prop bag against the leaf component's allow-list, drop
 * forbidden style keys, and substitute suspect image sources. Layout
 * primitives and unregistered components fall through unchanged.
 */
function sanitizePropsForComponent(
  componentName: string,
  props: Record<string, unknown>,
): Record<string, unknown> {
  // Image — same allow-list pattern but also rewrite a suspect `src`.
  if (componentName === 'Image') {
    const next: Record<string, unknown> = { ...props };
    if (isSuspectImageSrc(next.src)) {
      next.src = NEUTRAL_IMAGE_FALLBACK;
    }
    return sanitizeStyleProp(next, /* leaf */ false);
  }

  const allowed = LEAF_COMPONENT_ALLOWED_PROPS[componentName];
  if (!allowed) {
    // Layout primitives, registry components without a leaf entry, etc. —
    // pass through but still scrub forbidden style keys defensively.
    return sanitizeStyleProp({ ...props }, /* leaf */ false);
  }

  const allowSet = new Set(allowed);
  const result: Record<string, unknown> = {};
  const dropped: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (allowSet.has(key)) {
      result[key] = value;
      continue;
    }
    if (ALWAYS_ALLOWED_KEYS.has(key)) {
      result[key] = value;
      continue;
    }
    if (ALWAYS_ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
      result[key] = value;
      continue;
    }
    dropped.push(key);
  }

  if (dropped.length > 0 && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `[ASTRenderer] dropped non-allowed props on <${componentName}>: ${dropped.join(', ')}`,
    );
  }

  return sanitizeStyleProp(result, /* leaf */ true);
}

function sanitizeStyleProp(
  props: Record<string, unknown>,
  leaf: boolean,
): Record<string, unknown> {
  if (!leaf) return props;
  const style = props.style;
  if (!style || typeof style !== 'object' || Array.isArray(style)) return props;
  const safe: Record<string, unknown> = {};
  let stripped = false;
  for (const [k, v] of Object.entries(style as Record<string, unknown>)) {
    if (FORBIDDEN_LEAF_STYLE_KEYS.has(k)) {
      stripped = true;
      continue;
    }
    safe[k] = v;
  }
  if (stripped && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[ASTRenderer] stripped layout-override style keys from leaf component');
  }
  return { ...props, style: Object.keys(safe).length > 0 ? safe : undefined };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ASTRendererProps {
  /** The AST tree to render */
  tree: ASTRoot;
  /**
   * Render mode:
   * - 'preview' (default): Uses previewComponent — variant grids for editor showcase
   * - 'render': Uses the actual component with exact AST props — for playgrounds & live preview
   */
  mode?: ASTRenderMode;
  /** Optional surface mode override (takes precedence over tree.surfaceMode) */
  surfaceMode?: string;
  /** Breakpoint id ('S' | 'M' | 'L'). When set the harness applies
   *  `data-Breakpoint` so the dimension cascade resolves to the device's
   *  breakpoint instead of the ambient viewport. */
  platform?: string;
  /** Density mode ('compact' | 'default' | 'open'). Forwarded as
   *  `data-density` / `data-6-Density`. */
  density?: string;
  /** Platform tokens for the harness */
  platformTokens?: Record<string, string>;
  /** Token overrides for the harness */
  tokenOverrides?: Record<string, string>;
}

/**
 * Render an AST tree as real React components.
 * Optionally wraps in ComponentHarness for surface/density/platform context.
 */
export function ASTRenderer({
  tree,
  mode = 'preview',
  surfaceMode,
  platform,
  density,
  platformTokens,
  tokenOverrides,
}: ASTRendererProps) {
  const effectiveSurfaceMode = surfaceMode ?? tree.surfaceMode;
  const needsHarness = !!(
    effectiveSurfaceMode || platform || density || platformTokens || tokenOverrides
  );

  const renderedTree = useMemo(
    () => <ASTNodeRenderer node={tree.root} renderMode={mode} />,
    [tree.root, mode],
  );

  if (needsHarness) {
    return (
      <ComponentHarness
        surfaceMode={effectiveSurfaceMode as any}
        platform={platform}
        density={density}
        platformTokens={platformTokens}
        tokenOverrides={tokenOverrides}
      >
        {renderedTree}
      </ComponentHarness>
    );
  }

  return renderedTree;
}
