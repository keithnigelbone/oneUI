/**
 * figma_to_code — step 4: generate @oneui/ui-native screen code from the refined tree.
 *
 * Input  = a RefineResult (from figmaRefine.ts, after applyImageSources).
 * Output = a single .native.tsx file written to outDir, containing a default-export
 *          RN screen component that uses ONLY @oneui/ui-native components.
 *
 * Rules (hard constraints, enforced by validate_oneui_code downstream):
 *   - Every color via useSurfaceTokens(appearance); no literal hex.
 *   - Spacing via token-based <Container>/<Surface> props (gap/padding = token KEYS,
 *     resolved at runtime via theme.spacing); no literal px.
 *   - Tinted/coloured frames → <Surface mode="…">, never a raw View background.
 *   - Images → require(props.src) from the already-downloaded assets.
 *   - Icons → <Icon icon="ic_…"> from @oneui/icons-jio-native, never require'd.
 *   - Component names validated against the native registry (getComponentIndex('native')).
 */
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { getComponentIndex, getComponent } from './snapshot.js';
import type {
  RefineResult,
  RefinedNode,
  LayoutSpec,
  NodeBox,
  RawTypography,
  AbsBox,
} from './figmaRefine.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CodegenOpts {
  screenName: string;
  outDir: string;
  projectRoot: string;
  /** Platform asset subdir (always 'native' for RN). */
  platformSubdir?: string;
}

export interface CodegenResult {
  file: string;
  relPath: string;
  code: string;
  components: string[];
  warnings: string[];
  /** PascalCase screen component name (also the default export). */
  componentName: string;
}

export interface RouteResult {
  /** Written route file(s), relative to projectRoot. */
  routePath: string;
  indexPath?: string;
  /** The expo-router path the route is reachable at, e.g. "/jiogames". */
  href: string;
}

// ---------------------------------------------------------------------------
// Registry — loads per-component JSON so codegen can validate/map props
// ---------------------------------------------------------------------------

interface PropEntry {
  name: string;
  required?: boolean;
  description?: string;
  type?: string;
}

/** Figma abbreviates sizes as S/M/L/XL/2XL while some KB entries use full words. */
const SIZE_ABBR: Record<string, string> = {
  s: 'small',
  m: 'medium',
  l: 'large',
  xl: 'extra large',
  '2xl': 'extra extra large',
};

/**
 * Icon's `size` prop has NO enum (it's an open DesignIconSize spacing-index
 * token OR a raw pixel number — see Icon/interface.ts), so the generic
 * enum-canonicalization path above never runs for it. Figma still authors
 * icon instances with t-shirt letter sizes; map them to the nearest
 * DesignIconSize token so codegen emits a value the real prop type accepts.
 */
const ICON_SIZE_ABBR: Record<string, string> = {
  '2xs': '3', xs: '4', s: '5', m: '6', l: '8', xl: '10', '2xl': '12', xxl: '12', '3xl': '14',
};

function parseEnumType(typeStr: string): Set<string> | null {
  const matches = [...typeStr.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  return matches.length > 0 ? new Set(matches) : null;
}

interface ComponentSpec {
  name: string;
  slug: string;
  validProps: Set<string>;
  errorProps: Set<string>;
  hasVariant: boolean;
  hasAttention: boolean;
  hasMode: boolean;
  propLookup: Map<string, string>;
  propValues: Map<string, Set<string>>;
  requiredA11yStrings: Set<string>;
}

/** "Full Width" → "fullWidth", "Attention" → "attention". */
function normalizePropKey(key: string): string {
  return key
    .trim()
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/** Build a lowercase name → ComponentSpec map by reading each component's JSON. */
function buildRegistry(platformSubdir = 'native'): Map<string, ComponentSpec> {
  const map = new Map<string, ComponentSpec>();
  for (const entry of getComponentIndex(platformSubdir)) {
    const slug = entry.slug ?? entry.name.toLowerCase();
    const data = getComponent(slug, platformSubdir) as { props?: PropEntry[] } | null;
    const props: PropEntry[] = data?.props ?? [];

    const validProps = new Set<string>();
    const errorProps = new Set<string>();
    const propLookup = new Map<string, string>();
    const propValues = new Map<string, Set<string>>();

    for (const p of props) {
      validProps.add(p.name);
      const desc = p.description ?? '';
      if (desc.startsWith('[error]') || desc.includes('— [error]')) {
        errorProps.add(p.name);
      }
      propLookup.set(p.name.toLowerCase(), p.name);
      propLookup.set(normalizePropKey(p.name), p.name);
      const enumVals = parseEnumType(p.type ?? '');
      if (enumVals) propValues.set(p.name, enumVals);
    }

    const spec: ComponentSpec = {
      name: entry.name,
      slug,
      validProps,
      errorProps,
      hasVariant: validProps.has('variant'),
      hasAttention: validProps.has('attention'),
      hasMode: validProps.has('mode'),
      propLookup,
      propValues,
      requiredA11yStrings: (() => {
        const A11Y_PROPS = new Set(['alt', 'aria-label', 'aria-labelledby', 'aria-describedby']);
        const s = new Set<string>();
        for (const p of props) {
          if (p.required && A11Y_PROPS.has(p.name)) s.add(p.name);
        }
        return s;
      })(),
    };
    map.set(entry.name.toLowerCase(), spec);
  }
  return map;
}

function resolveComponent(
  name: string,
  registry: Map<string, ComponentSpec>
): ComponentSpec | null {
  return registry.get(name.toLowerCase()) ?? null;
}

// ---------------------------------------------------------------------------
// Code generation — walking the refined tree
// ---------------------------------------------------------------------------

interface GenCtx {
  registry: Map<string, ComponentSpec>;
  imports: Set<string>;
  needsSurfaceImport: boolean;
  needsIconImport: boolean;
  needsRNImageHelper: boolean;
  needsViewImport: boolean;
  needsScrollViewImport: boolean;
  needsSafeAreaInsets: boolean;
  warnings: string[];
  screenDir: string;
  projectRoot: string;
  /** Valid Ic* component names exported by the installed icon package (empty = unknown → skip validation). */
  iconComponents: Set<string>;
}

/**
 * Read the set of icon components actually exported by the installed
 * `@oneui/icons-jio-native` (each glyph is a generated `Ic*` module). Used to
 * verify a converted glyph name exists before emitting it — Figma layer names
 * don't always have a 1:1 component (e.g. `ic_favorite` has no `IcFavorite` in
 * the Jio set), and emitting a missing reference breaks the build at runtime.
 * Returns an empty set when the package can't be read (→ validation skipped).
 */
function loadIconComponentNames(projectRoot: string): Set<string> {
  const out = new Set<string>();
  const dir = resolve(projectRoot, 'node_modules/@oneui/icons-jio-native/dist/generated');
  try {
    for (const f of readdirSync(dir)) {
      // The package ships generated glyphs as type decls (Ic*.d.ts) + bundled JS;
      // match the .d.ts (skip the .d.ts.map) to enumerate available components.
      const m = /^(Ic[A-Za-z0-9]+)\.d\.ts$/.exec(f);
      if (m) out.add(m[1]);
    }
  } catch {
    /* package not found / different layout → skip validation */
  }
  return out;
}

/**
 * When a Figma glyph doesn't resolve to an installed icon component, prefer a
 * generic placeholder over silently dropping the icon (and, for Icon/IconButton,
 * the whole component) — a visibly-wrong-but-present icon is far easier to spot
 * and fix than a component that's just missing. Only ever used after confirming
 * it's actually exported by the installed package (`ctx.iconComponents`).
 */
const FALLBACK_ICON_GLYPH_CANDIDATES = [
  'IcInfo',
  'IcHelp',
  'IcMoreHorizontal',
  'IcInfoCircle',
  'IcHelpCircle',
  'IcQuestionCircle',
  'IcCircle',
];

function resolveFallbackGlyph(iconComponents: Set<string>): string | null {
  return FALLBACK_ICON_GLYPH_CANDIDATES.find((g) => iconComponents.has(g)) ?? null;
}

function indent(n: number): string {
  return '  '.repeat(n);
}

function escapeAttr(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'boolean') return `{${v}}`;
  if (typeof v === 'number') return `{${v}}`;
  return `{${JSON.stringify(v)}}`;
}

/**
 * Map a Figma icon-glyph layer name to its @oneui/icons-jio-native component.
 * Glyph layers are named "ic_search" / "ic-previous_title"; the package exports
 * PascalCase components keyed on the rest of the name as ONE-OR-MORE words:
 *   ic_search          → IcSearch
 *   ic_previous_title  → IcPreviousTitle
 *   ic_hellojio        → IcHellojio
 * (Each underscore/hyphen-separated segment is capitalised; the remainder of a
 * segment is lower-cased so multi-token glyphs like "hellojio" stay one word.)
 */
function glyphNameToComponent(glyph: string): string {
  const rest = glyph.trim().replace(/^ic[_-]/i, '');
  const pascal = rest
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  return `Ic${pascal}`;
}

/** Humanize a glyph component name for an a11y label fallback: IcCastMedia → "Cast Media". */
function glyphToLabel(glyphComp: string): string {
  return glyphComp
    .replace(/^Ic/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}

/**
 * Parse a Figma text-style / fontSize-variable name into Text variant + size.
 * Authoritative because a style's resolved px varies by theme/density mode.
 * Handles "title/M", "Title-M", "Mobile/Title/M", "typography/fontSize/title-M",
 * "label/XS/high", "body/2XS", etc. Segments split on / - _ space . — variant is
 * the first known role token; size is the first L/M/S/XS/2XS/3XS/XL token; weight
 * is the first high/medium/low token (Figma encodes it in the style name).
 */
function parseStyleName(name: string): { variant?: string; size?: string; weight?: string } {
  const VARIANTS = ['display', 'headline', 'title', 'body', 'label', 'code'];
  const SIZES = ['3xs', '2xs', 'xs', 'xl', 'l', 'm', 's']; // exact segment match
  const WEIGHTS = ['high', 'medium', 'low'];
  const segs = name
    .toLowerCase()
    .split(/[/\-_\s.]+/)
    .filter(Boolean);
  const out: { variant?: string; size?: string; weight?: string } = {};
  const v = VARIANTS.find((x) => segs.includes(x));
  if (v) out.variant = v;
  const sz = segs.find((s) => SIZES.includes(s));
  if (sz) out.size = sz.toUpperCase();
  const wt = WEIGHTS.find((x) => segs.includes(x));
  if (wt) out.weight = wt;
  return out;
}

/**
 * Map a Figma TEXT node's typography to OneUI Text `variant`/`size`/`weight`.
 * Variant + size come from the bound text-style NAME when present (authoritative;
 * px varies by theme/density mode). Without a style name, fall back to fontSize
 * buckets calibrated to the real Jio scale (display 26–32, headline 20–23,
 * title 17–19, body/label 14–18). `weight` is driven by the resolved fontWeight
 * first (handles variable fonts whose style string still reads "Regular").
 * Caller validates each value against the component's KB enum before emitting.
 */
function typographyToTextProps(t: RawTypography): {
  variant?: string;
  size?: string;
  weight?: string;
  attention?: string;
} {
  const out: { variant?: string; size?: string; weight?: string; attention?: string } = {};

  // Weight first so the px fallback can branch on it (a bold 16px header is a
  // title; 16px body copy stays body).
  const w = t.fontWeight;
  const style = (t.fontStyle ?? '').toLowerCase();
  if ((typeof w === 'number' && w >= 600) || /black|bold|extrabold|semibold|heavy/.test(style))
    out.weight = 'high';
  else if ((typeof w === 'number' && w <= 300) || /light|thin/.test(style)) out.weight = 'low';
  const isBold = out.weight === 'high';

  // Authoritative: the bound style name ("title/M", "label/XS/high") → variant +
  // size + weight directly. Weight from the name wins over fontWeight; "medium" is
  // the Text default so it is left implicit.
  if (t.styleName) {
    const parsed = parseStyleName(t.styleName);
    if (parsed.variant) out.variant = parsed.variant;
    if (parsed.size) out.size = parsed.size;
    if (parsed.weight) out.weight = parsed.weight === 'medium' ? undefined : parsed.weight;
  }

  // Fallback (no style name): fontSize buckets on the real Jio type scale.
  const fs = t.fontSize;
  if (typeof fs === 'number' && !out.variant) {
    if (fs >= 30) {
      out.variant = 'display';
      out.size = 'L';
    } else if (fs >= 27) {
      out.variant = 'display';
      out.size = 'M';
    } else if (fs >= 24) {
      out.variant = 'display';
      out.size = 'S';
    } else if (fs >= 22) {
      out.variant = 'headline';
      out.size = 'L';
    } else if (fs >= 20) {
      out.variant = 'headline';
      out.size = 'M';
    } else if (fs >= 17) {
      out.variant = 'title';
      out.size = fs >= 19 ? 'L' : fs >= 18 ? 'M' : 'S';
    } else if (fs >= 16) {
      out.variant = isBold ? 'title' : 'body';
      out.size = 'M';
    } // 16px bold header → title/M
    else if (fs >= 14) {
      out.variant = isBold ? 'label' : 'body';
      out.size = 'S';
    } else {
      out.variant = 'label';
      out.size = 'S';
    }
  }

  // Low-emphasis (secondary/caption) text: Figma renders it as the same colour
  // token at reduced opacity (~0.56) or a "secondary"/"low" colour variable.
  // Map either signal to attention="low" so subtitles/captions/inactive tabs dim.
  const op = t.fillOpacity;
  const fillVar = (t.fillVar ?? '').toLowerCase();
  if (
    (typeof op === 'number' && op < 0.8) ||
    /secondary|tertiary|low|medium|muted|subtle|caption|placeholder|disabled|hint|inactive/.test(
      fillVar
    )
  ) {
    out.attention = 'low';
  }
  return out;
}

function mapSurfaceToVariantProp(surfaceMode: string, spec: ComponentSpec): string | null {
  const FILL_VARIANTS = new Set(['bold', 'subtle', 'ghost']);
  if (!FILL_VARIANTS.has(surfaceMode)) return null;
  if (spec.hasVariant) return `variant="${surfaceMode}"`;
  if (spec.hasAttention) {
    const attentionMap: Record<string, string> = { bold: 'high', subtle: 'medium', ghost: 'low' };
    const level = attentionMap[surfaceMode];
    return level ? `attention="${level}"` : null;
  }
  return null;
}

function resolvePropKey(figmaKey: string, spec: ComponentSpec): string | null {
  return spec.propLookup.get(figmaKey) ?? spec.propLookup.get(normalizePropKey(figmaKey)) ?? null;
}

/** Render a `kind:"component"` node as JSX. */
function renderComponent(
  node: Extract<RefinedNode, { kind: 'component' }>,
  ctx: GenCtx,
  depth: number,
  parentDir?: 'row' | 'column',
  inHScroll = false
): string {
  const spec = resolveComponent(node.component, ctx.registry);
  if (!spec) {
    ctx.warnings.push(`Unknown OneUI native component: "${node.component}" — rendered as comment`);
    return `${indent(depth)}{/* TODO: unknown component "${node.component}" */}`;
  }
  ctx.imports.add(spec.name);

  const props: string[] = [];
  const emittedPropNames = new Set<string>();
  // Resolved icon glyph component (e.g. "IcSearch") — used to derive an a11y
  // label fallback when Figma left aria-label empty.
  let resolvedGlyph: string | null = null;

  if (node.appearance && spec.validProps.has('appearance')) {
    props.push(`appearance="${node.appearance}"`);
    emittedPropNames.add('appearance');
  }

  if (node.surface) {
    const explicitAttention = (node.props as Record<string, unknown> | undefined)?.attention;
    const explicitVariant = (node.props as Record<string, unknown> | undefined)?.variant;
    const surfaceTargetsProp = spec.hasVariant ? 'variant' : spec.hasAttention ? 'attention' : null;
    const alreadySetByProps =
      surfaceTargetsProp === 'attention'
        ? explicitAttention !== undefined
        : surfaceTargetsProp === 'variant'
          ? explicitVariant !== undefined
          : false;
    if (!alreadySetByProps) {
      const mapped = mapSurfaceToVariantProp(node.surface, spec);
      if (mapped) {
        props.push(mapped);
        if (surfaceTargetsProp) emittedPropNames.add(surfaceTargetsProp);
      } else {
        ctx.warnings.push(
          `Surface mode "${node.surface}" on ${spec.name} skipped — not a fill-level variant (bold/subtle/ghost)`
        );
      }
    }
  }

  // Text label from a Figma `label` prop (maps to JSX children on Button/Badge…).
  let labelText: string | null = null;

  for (const [figmaKey, v] of Object.entries(node.props ?? {})) {
    const tentativeName = resolvePropKey(figmaKey, spec) ?? figmaKey.toLowerCase();
    if (emittedPropNames.has(tentativeName)) continue;

    if (figmaKey === 'icon' && typeof v === 'string') {
      // Figma glyph layers are named "ic_search" / "ic-previous_title"; the icon
      // package exports PascalCase components (IcSearch, IcPreviousTitle) and the
      // semantic-name resolver does NOT understand the raw "ic_*" layer name. Map
      // the layer name to its component and pass the component reference (works
      // for both <Icon icon={…}/> and IconButton/IconContained `icon`), so glyphs
      // actually render instead of resolving to nothing.
      let glyphComp = glyphNameToComponent(v);
      const nodeLabel = node.name ? `"${node.name}"` : spec.name;
      // The Figma layer name doesn't always have a matching component in the
      // installed icon set (e.g. `ic_favorite` → no `IcFavorite`). Never silently
      // drop the icon (or, further down, the whole Icon/IconButton) — substitute
      // a confirmed-installed placeholder glyph so the gap is visible on-device,
      // and name the specific node in the warning (not just the component type).
      // (Empty set = couldn't read the package → emit the unverified glyph anyway.)
      if (ctx.iconComponents.size > 0 && !ctx.iconComponents.has(glyphComp)) {
        const fallback = resolveFallbackGlyph(ctx.iconComponents);
        if (fallback) {
          ctx.warnings.push(
            `${nodeLabel}: icon "${v}" → ${glyphComp} not in @oneui/icons-jio-native — using placeholder ${fallback}. Add/rename the glyph, or the icon set may need updating.`
          );
          glyphComp = fallback;
        } else {
          ctx.warnings.push(
            `${nodeLabel}: icon "${v}" → ${glyphComp} not in @oneui/icons-jio-native, and no fallback glyph is installed — omitted`
          );
          continue;
        }
      }
      if (spec.name === 'Input' || spec.name === 'InputField') {
        // Input/InputField's leading-icon slot is `start` (a ReactNode), not a
        // direct icon-component reference.
        if (spec.validProps.has('start') && !emittedPropNames.has('start')) {
          ctx.needsIconImport = true;
          props.push(`start={<Icon icon={JioIcons.${glyphComp}} aria-hidden />}`);
          emittedPropNames.add('start');
          resolvedGlyph = glyphComp;
        }
      } else if (spec.name === 'Icon' || spec.name === 'BottomNavigationItem') {
        // `icon` here is a direct IconComponent reference (not a slot ReactNode).
        // BottomNavigationItem.icon is REQUIRED but the snapshot omits it from
        // its prop list, so emit it explicitly whenever Figma carried a glyph —
        // otherwise the tab bar renders label-only and collapses.
        ctx.needsIconImport = true;
        props.push(`icon={JioIcons.${glyphComp}}`);
        emittedPropNames.add('icon');
        resolvedGlyph = glyphComp;
      } else if (spec.validProps.has('icon')) {
        // Icon-slot components (IconButton, IconContained…) accept a ReactNode.
        ctx.needsIconImport = true;
        props.push(`icon={<Icon icon={JioIcons.${glyphComp}} />}`);
        emittedPropNames.add('icon');
        resolvedGlyph = glyphComp;
      }
      continue;
    }
    if (figmaKey === 'src' && typeof v === 'string') {
      const srcProp = spec.validProps.has('src') ? 'src' : null;
      if (srcProp) {
        ctx.needsRNImageHelper = true;
        const absAsset = resolve(ctx.projectRoot, v);
        let reqPath = relative(ctx.screenDir, absAsset);
        if (!reqPath.startsWith('.')) reqPath = `./${reqPath}`;
        props.push(`${srcProp}={u(require('${reqPath}'))}`);
      }
      continue;
    }
    if (spec.name === 'Image' && figmaKey === 'aspectRatio') {
      continue; // Image sizing is derived from the node box below.
    }
    if (figmaKey === 'altText' || figmaKey === 'alt') {
      // Most components expose `accessibilityLabel`; some (e.g. CarouselSlideImage)
      // only have `alt` and have no `accessibilityLabel` prop at all — emitting it
      // there is an excess/unknown prop, not just a style nit.
      if (spec.validProps.has('accessibilityLabel') && !emittedPropNames.has('accessibilitylabel')) {
        props.push(`accessibilityLabel=${escapeAttr(v)}`);
        emittedPropNames.add('accessibilitylabel');
      } else if (spec.validProps.has('alt') && !emittedPropNames.has('alt')) {
        props.push(`alt=${escapeAttr(v)}`);
        emittedPropNames.add('alt');
      }
      continue;
    }
    if ((figmaKey === 'label' || figmaKey === 'Label') && !spec.validProps.has('label')) {
      if (typeof v === 'string' && spec.validProps.has('children')) {
        labelText = v;
      }
      continue;
    }

    const tsPropName = resolvePropKey(figmaKey, spec);
    if (!tsPropName) {
      ctx.warnings.push(`${spec.name}: unknown prop "${figmaKey}" from Figma — skipped`);
      continue;
    }
    if (spec.errorProps.has(tsPropName)) continue;
    if (emittedPropNames.has(tsPropName.toLowerCase())) continue;
    if (typeof v === 'boolean') {
      props.push(`${tsPropName}={${v}}`);
      emittedPropNames.add(tsPropName.toLowerCase());
    } else if (typeof v === 'number') {
      props.push(`${tsPropName}={${v}}`);
      emittedPropNames.add(tsPropName.toLowerCase());
    } else if (typeof v === 'string') {
      const kbType = spec.propValues.get(tsPropName);
      if (!kbType) {
        const isBoolString = v === 'true' || v === 'false' || v === 'On' || v === 'Off';
        if (isBoolString) {
          const boolVal = v === 'true' || v === 'On';
          props.push(`${tsPropName}={${boolVal}}`);
          emittedPropNames.add(tsPropName.toLowerCase());
          continue;
        }
        // Figma's "no content in this slot" convention for freeform ReactNode
        // props (start/end/avatarSlot/…) is the literal string "none" — not a
        // real value. Passing it through renders a stray "none" text node.
        if (v.trim().toLowerCase() === 'none') {
          emittedPropNames.add(tsPropName.toLowerCase());
          continue;
        }
        if (spec.name === 'Icon' && tsPropName === 'size') {
          const mapped = ICON_SIZE_ABBR[v.trim().toLowerCase()];
          if (mapped) {
            props.push(`${tsPropName}="${mapped}"`);
            emittedPropNames.add(tsPropName.toLowerCase());
            continue;
          }
        }
        props.push(`${tsPropName}=${escapeAttr(v)}`);
        emittedPropNames.add(tsPropName.toLowerCase());
        continue;
      }
      if (!kbType.has(v)) {
        const lower = v.toLowerCase();
        let canonical = [...kbType].find((ev) => ev.toLowerCase() === lower);
        if (!canonical && lower in SIZE_ABBR) {
          const expanded = SIZE_ABBR[lower];
          canonical = [...kbType].find((ev) => ev.toLowerCase() === expanded.toLowerCase());
        }
        if (canonical) {
          props.push(`${tsPropName}=${escapeAttr(canonical)}`);
          emittedPropNames.add(tsPropName.toLowerCase());
        } else {
          ctx.warnings.push(
            `${spec.name}: prop "${tsPropName}" value "${v}" is not in KB enum [${[...kbType].join(', ')}] — skipped`
          );
        }
      } else {
        props.push(`${tsPropName}=${escapeAttr(v)}`);
        emittedPropNames.add(tsPropName.toLowerCase());
      }
    }
  }

  // Slot PROPS whose value is rendered content, not a plain string/number —
  // e.g. PrimaryNav's startSlot/avatarSlot/endSlot (it has no `children` prop
  // at all). Render each list as JSX and emit `propName={<>…</>}`.
  if (node.slots) {
    for (const [slotName, slotChildren] of Object.entries(node.slots)) {
      if (!spec.validProps.has(slotName) || emittedPropNames.has(slotName.toLowerCase()) || slotChildren.length === 0) {
        continue;
      }
      const rendered = slotChildren.map((c) => renderNode(c, ctx, depth + 1, undefined, inHScroll)).join('\n');
      const value =
        slotChildren.length > 1
          ? `<>\n${rendered}\n${indent(depth)}</>`
          : rendered.trim();
      props.push(`${slotName}={${value}}`);
      emittedPropNames.add(slotName.toLowerCase());
    }
  }

  // Text typography → variant/size/weight from the Figma font (fontSize/weight).
  // Without this every Text renders at the default body size (flat hierarchy).
  // Each value is validated against the Text KB enum before emitting; explicit
  // Figma props already in emittedPropNames win.
  if (spec.name === 'Text' && node.typography) {
    const typo = typographyToTextProps(node.typography);
    for (const [name, value] of Object.entries(typo) as [string, string | undefined][]) {
      if (!value || emittedPropNames.has(name.toLowerCase()) || !spec.validProps.has(name))
        continue;
      const enumVals = spec.propValues.get(name);
      const canonical = !enumVals
        ? value
        : enumVals.has(value)
          ? value
          : [...enumVals].find((ev) => ev.toLowerCase() === value.toLowerCase());
      if (canonical) {
        props.push(`${name}=${escapeAttr(canonical)}`);
        emittedPropNames.add(name.toLowerCase());
      }
    }
    // maxLines is a numeric prop (not part of the variant/size/weight enum loop):
    // an explicit Figma maxLines wins; an ellipsis-clamped node defaults to 1.
    if (!emittedPropNames.has('maxlines')) {
      const ty = node.typography;
      const ml =
        typeof ty.maxLines === 'number' && ty.maxLines > 0
          ? ty.maxLines
          : ty.truncate || ty.singleLine
            ? 1
            : undefined;
      if (ml) {
        props.push(`maxLines={${ml}}`);
        emittedPropNames.add('maxlines');
      }
    }
  }

  // Image sizing from the Figma node box. Fixed/hug → explicit w×h. Fill →
  // responsive: flex:1 + aspectRatio in a ROW; width="100%" + aspectRatio in a
  // COLUMN (width="100%" inside a row creates a sizing cycle and balloons).
  if (spec.name === 'Image' && node.box && node.box.w && node.box.h) {
    const { w, h, sizeH } = node.box;
    if (sizeH === 'fixed' || sizeH === 'hug') {
      props.push(`width={${w}}`, `height={${h}}`);
    } else if (parentDir === 'row') {
      props.push(`style={{ flex: 1 }}`, `aspectRatio="${nearestAspect(w, h)}"`);
      emittedPropNames.add('style');
    } else {
      props.push(`width="100%"`, `aspectRatio="${nearestAspect(w, h)}"`);
    }
  }

  // Image corner radius from Figma cornerRadius → borderRadius (square otherwise).
  if (spec.name === 'Image' && node.layout?.cornerRadius) {
    const cr = node.layout.cornerRadius;
    const i = props.findIndex((p) => p.startsWith('style={{'));
    if (i >= 0) props[i] = injectStyle(' ' + props[i], `borderRadius: ${cr}`).trimStart();
    else {
      props.push(`style={{ borderRadius: ${cr} }}`);
      emittedPropNames.add('style');
    }
  }

  // A determinate Progress needs a `value` to render a filled bar; Figma exposes
  // no numeric percentage, so emit a sensible default rather than an indeterminate
  // spinner (which is what a value-less Progress renders).
  if (spec.name === 'Progress' && !emittedPropNames.has('value')) {
    props.push(`value={30}`);
    emittedPropNames.add('value');
    ctx.warnings.push(
      'Progress: no value in Figma — defaulted value={30} (determinate placeholder)'
    );
  }

  // Scrim is a decorative OVERLAY — pin it absolute over its parent card so its
  // internal flex doesn't grow unbounded inside the screen ScrollView.
  if (spec.name === 'Scrim' && !emittedPropNames.has('style')) {
    props.push(`style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}`);
    emittedPropNames.add('style');
  }

  // Custom-sized components (Logo, Avatar, …) need a numeric `customSize`
  // alongside `size="custom"`; without it they render at 0 or crash. Drive it
  // from the Figma node box. Generic: any component whose spec has `customSize`.
  if (spec.validProps.has('customSize') && node.box?.w && !emittedPropNames.has('customsize')) {
    const emittedSizeCustom = props.some((p) => p === 'size="custom"' || p === "size='custom'");
    if (emittedSizeCustom) {
      // size="custom" already emitted (from Figma props) → just supply customSize.
      props.push(`customSize={${node.box.w}}`);
      emittedPropNames.add('customsize');
    } else if (!emittedPropNames.has('size')) {
      // No size came through at all (e.g. Logo) → drive both from the box.
      props.push(`size="custom"`, `customSize={${node.box.w}}`);
      emittedPropNames.add('size');
      emittedPropNames.add('customsize');
    }
  }

  // Leaf component that "fills" its parent axis (e.g. the search Input) → grow/stretch.
  if (spec.name !== 'Image' && !emittedPropNames.has('style')) {
    // pinContentWidth=false: a leaf component sizes to its own content; never
    // pin a hug/fixed Figma width onto it (that clips labels like the Button).
    let sizeStr = sizeStyleStr(node.box, parentDir, inHScroll, false);
    // Some components are inherently full-width bars (e.g. BottomNavigation, a
    // tablist that distributes its fill items across the row). Figma often gives
    // them no captured box, so sizeStyleStr emits nothing and they collapse to
    // hug-content. Stretch them so the component can spread its items.
    if (!sizeStr && FULL_WIDTH_COMPONENTS.has(spec.name)) {
      sizeStr = " style={{ alignSelf: 'stretch' }}";
    }
    if (sizeStr) {
      props.push(sizeStr.trimStart());
      emittedPropNames.add('style');
    }
  }

  for (const a11yProp of spec.requiredA11yStrings) {
    if (!emittedPropNames.has(a11yProp.toLowerCase())) {
      // Derive a label from the icon glyph (IcCastMedia → "Cast Media") rather
      // than emitting an empty aria-label that Figma left blank.
      const label = a11yProp === 'aria-label' && resolvedGlyph ? glyphToLabel(resolvedGlyph) : '';
      props.push(`${a11yProp}=${escapeAttr(label)}`);
    }
  }

  // Icon / IconButton require an icon glyph — if none resolved from Figma
  // (no glyph layer found at all, so the prop loop above never ran), fall back
  // to a placeholder glyph rather than dropping the component: a visibly-wrong
  // icon on-device is easy to spot and fix, a missing component is not.
  if ((spec.name === 'Icon' || spec.name === 'IconButton') && !emittedPropNames.has('icon')) {
    const nodeLabel = node.name ? `"${node.name}"` : spec.name;
    const fallback = resolveFallbackGlyph(ctx.iconComponents);
    if (fallback) {
      ctx.warnings.push(
        `${nodeLabel}: no icon glyph found on this Figma node — using placeholder ${fallback}.`
      );
      ctx.needsIconImport = true;
      props.push(
        spec.name === 'Icon'
          ? `icon={JioIcons.${fallback}}`
          : `icon={<Icon icon={JioIcons.${fallback}} />}`
      );
      emittedPropNames.add('icon');
    } else {
      ctx.warnings.push(
        `${nodeLabel}: ${spec.name} omitted — no icon glyph resolved from Figma, and no fallback glyph is installed`
      );
      return `${indent(depth)}{/* ${nodeLabel}: ${spec.name} omitted — no icon glyph */}`;
    }
  }

  const children = node.children ?? [];
  const propsStr = props.length ? ' ' + props.join(' ') : '';

  // Text content: prefer a real `label`; the literal "Button" is Figma's default
  // placeholder, so fall back to harvested text (e.g. "View all") when present.
  let textContent: string | null = null;
  if (labelText && labelText !== 'Button') textContent = labelText;
  else textContent = node.text ?? labelText ?? null;
  const textChild = textContent !== null ? `{${JSON.stringify(textContent)}}` : null;

  if (children.length === 0 && textChild) {
    return `${indent(depth)}<${spec.name}${propsStr}>${textChild}</${spec.name}>`;
  }
  if (children.length === 0) {
    return `${indent(depth)}<${spec.name}${propsStr} />`;
  }

  const childLines = children
    .map((c) => renderNode(c, ctx, depth + 1, undefined, inHScroll))
    .join('\n');
  const innerContent = textChild ? `${indent(depth + 1)}${textChild}\n${childLines}` : childLines;
  return `${indent(depth)}<${spec.name}${propsStr}>\n${innerContent}\n${indent(depth)}</${spec.name}>`;
}

/** Aspect-ratio presets the Image component accepts, with numeric value. */
const AR_PRESETS: Array<[string, number]> = [
  ['1:1', 1],
  ['1:2', 0.5],
  ['2:1', 2],
  ['2:3', 2 / 3],
  ['3:2', 1.5],
  ['3:4', 0.75],
  ['4:3', 4 / 3],
  ['9:16', 9 / 16],
  ['16:9', 16 / 9],
  ['9:21', 9 / 21],
  ['21:9', 21 / 9],
];

function nearestAspect(w: number, h: number): string {
  const r = w / h;
  let best = '1:1';
  let bestD = Infinity;
  for (const [k, v] of AR_PRESETS) {
    const d = Math.abs(v - r);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return best;
}

/** Treat a FIXED cross-size at least this wide/tall as a full-span section. */
const FULL_SPAN_PX = 320;

/** Components that are inherently full-width bars (stretch even with no box). */
const FULL_WIDTH_COMPONENTS = new Set(['BottomNavigation']);

/**
 * Map Figma "Fill" sizing to RN flexbox, relative to the parent's direction:
 *   - fill on the MAIN axis  → flex:1 (grow to share space)
 *   - fill (or large FIXED) on the CROSS axis → alignSelf:'stretch' (span the
 *     parent fully, fixing collapsed headers/sections whose frames are FIXED-width).
 */
function sizeStyleStr(
  box: NodeBox | undefined,
  parentDir: 'row' | 'column' | undefined,
  inHScroll = false,
  pinContentWidth = true
): string {
  if (!box || !parentDir) return '';
  const parts: string[] = [];

  // --- Width axis --------------------------------------------------------
  // `pinContentWidth` is true only for structural layout boxes (Container /
  // Surface). Leaf COMPONENTS (Button, Avatar, Badge, Chip…) own their width:
  // pinning a hug/fixed Figma width onto them clips the content (e.g. a "Follow"
  // Button forced to 65px renders "F…"). Leaves still honour fill → flex/stretch.
  if (box.sizeH === 'fill') {
    // Grow along a row's main axis; span a column's cross axis.
    parts.push(parentDir === 'row' ? 'flex: 1' : "alignSelf: 'stretch'");
  } else if (
    pinContentWidth &&
    box.sizeH === 'fixed' &&
    typeof box.w === 'number' &&
    box.w < FULL_SPAN_PX
  ) {
    // A narrow FIXED box is a deliberate clip "window" (e.g. a 16px carousel
    // peek over a 328px slide) → pin the width and clip the overflow.
    parts.push(`width: ${box.w}`, "overflow: 'hidden'");
  } else if (
    pinContentWidth &&
    box.sizeH === 'hug' &&
    inHScroll &&
    typeof box.w === 'number' &&
    box.w < FULL_SPAN_PX
  ) {
    // A HUG box inside a horizontal ScrollView must be pinned: the scroll offers
    // unbounded width, so a OneUI <Text> child would stretch the box to ≈1500px
    // and shove every sibling off-screen. Pinning the Figma width wraps text
    // inside the item instead. OUTSIDE a scroll the parent width is bounded, so
    // a hug box sizes to its content naturally (don't pin — that would force a
    // tiny Figma width like a 62px tab to wrap its label onto several lines).
    parts.push(`width: ${box.w}`);
  } else if (box.sizeH === 'fixed' && parentDir === 'column') {
    // Large FIXED width in a vertical stack → a full-span section.
    parts.push("alignSelf: 'stretch'");
  }

  // --- Height axis -------------------------------------------------------
  if (box.sizeV === 'fill') {
    parts.push(parentDir === 'column' ? 'flex: 1' : "alignSelf: 'stretch'");
  }
  // Height is intentionally never pinned: leaving it content-driven lets text
  // wrap to multiple lines and rows size to their tallest child.

  return parts.length ? ` style={{ ${parts.join(', ')} }}` : '';
}

/** Carousel detection enabled — wrapped rows get a bounded-height outer View. */
const ENABLE_HSCROLL = true;

/**
 * A horizontal frame whose direct children are wider than the frame itself →
 * render it inside a horizontal ScrollView (carousels, category/product rows).
 */
function rowOverflows(node: Extract<RefinedNode, { kind: 'node' | 'surface' }>): boolean {
  if (!ENABLE_HSCROLL) return false;
  if (node.layout?.direction !== 'row') return false;
  const frameW = node.box?.w;
  if (!frameW || !node.box?.h) return false; // need a bounded height to wrap safely
  const kids = node.children ?? [];
  if (kids.length < 2) return false;
  let sum = 0;
  for (const c of kids) {
    const w = (c as { box?: NodeBox }).box?.w;
    if (!w) return false; // unknown child width — don't guess
    sum += w;
  }
  return sum > frameW * 1.02;
}

/**
 * Wrap an element in a horizontal ScrollView inside an outer View whose height is
 * seeded from the Figma frame. Use `minHeight` (not `height`): the Figma box height
 * gives the rail a floor so it doesn't collapse, but RN metrics differ from Figma
 * (e.g. a customSize avatar + a "Follow" button can exceed the Figma frame height),
 * so a hard `height` would clip the bottom row. minHeight lets the rail grow to fit.
 */
function wrapHorizontalScroll(
  inner: string,
  ctx: GenCtx,
  depth: number,
  height: number | undefined
): string {
  ctx.needsScrollViewImport = true;
  ctx.needsViewImport = true;
  const hStyle = height ? `{ minHeight: ${height} }` : '{}';
  return (
    `${indent(depth)}<View style={${hStyle}}>\n` +
    `${indent(depth + 1)}<ScrollView horizontal showsHorizontalScrollIndicator={false}>\n` +
    `${inner}\n` +
    `${indent(depth + 1)}</ScrollView>\n` +
    `${indent(depth)}</View>`
  );
}

/**
 * Build the token-based layout prop string for Container/Surface.
 * Spacing values are token KEYS; the component resolves them via theme.spacing.
 */
function layoutPropsString(layout: LayoutSpec): string {
  const p: string[] = [];
  if (layout.direction) p.push(`direction="${layout.direction}"`);
  if (layout.gap) p.push(`gap="${layout.gap}"`);

  const { paddingTop: t, paddingRight: r, paddingBottom: b, paddingLeft: l } = layout;
  if (t && r && b && l && t === r && r === b && b === l) {
    p.push(`padding="${t}"`);
  } else {
    const x = l && r && l === r ? l : undefined;
    const y = t && b && t === b ? t : undefined;
    if (x) p.push(`paddingX="${x}"`);
    else {
      if (l) p.push(`paddingLeft="${l}"`);
      if (r) p.push(`paddingRight="${r}"`);
    }
    if (y) p.push(`paddingY="${y}"`);
    else {
      if (t) p.push(`paddingTop="${t}"`);
      if (b) p.push(`paddingBottom="${b}"`);
    }
  }

  if (layout.align) p.push(`align="${layout.align}"`);
  if (layout.justify) p.push(`justify="${layout.justify}"`);
  if (layout.wrap) p.push(`wrap={true}`);
  return p.length ? ' ' + p.join(' ') : '';
}

/** Render a `kind:"surface"` node as JSX (with token-based auto-layout). */
function renderSurface(
  node: Extract<RefinedNode, { kind: 'surface' }>,
  ctx: GenCtx,
  depth: number,
  parentDir: 'row' | 'column' | undefined,
  inHScroll = false
): string {
  ctx.needsSurfaceImport = true;
  ctx.imports.add('Surface');
  const ownDir = node.layout?.direction;
  const overflow = rowOverflows(node);
  const d = overflow ? depth + 2 : depth;
  // Peel Figma-absolute overlays out of the flex flow and re-pin them by constraints.
  const parentBox = node.layout?.absoluteBox;
  const { flow: children, absolute: absChildren } = splitAbsolute(node.children ?? []);
  // Defensive guard (figmaRefine already avoids constructing a childless
  // surface-override node): never pin a fixed-width overflow-hidden clip
  // window onto an EMPTY Surface — a decorative box with no content just
  // hides whatever sibling sits next to it. Size normally instead.
  let layoutStr =
    (node.layout ? layoutPropsString(node.layout) : '') +
    sizeStyleStr(node.box, parentDir, inHScroll, children.length > 0);
  // Rounded surface (e.g. a tinted card) → borderRadius from Figma cornerRadius.
  // Previously only Container/View wrappers carried this through; a <Surface>
  // with the same rounded corners lost it.
  if (node.layout?.cornerRadius) {
    layoutStr = injectStyle(layoutStr, `borderRadius: ${node.layout.cornerRadius}`);
  }
  // Once inside a horizontal ScrollView, descendants stay "in scroll" so their
  // hug widths get pinned (the unbounded-width context propagates down).
  const childInHScroll = inHScroll || overflow;
  const absInner = absChildren
    .map((c) => renderAbsoluteChild(c, parentBox, ctx, d + 1, childInHScroll))
    .join('\n');
  const absTail = absInner ? `\n${absInner}` : '';
  let el: string;
  if (children.length === 0 && absChildren.length === 0) {
    el = `${indent(d)}<Surface mode="${node.mode}"${layoutStr} />`;
  } else if (children.length === 0) {
    el = `${indent(d)}<Surface mode="${node.mode}"${layoutStr}>\n${absInner}\n${indent(d)}</Surface>`;
  } else {
    const childLines = children
      .map((c) => renderNode(c, ctx, d + 1, ownDir, childInHScroll))
      .join('\n');
    el = `${indent(d)}<Surface mode="${node.mode}"${layoutStr}>\n${childLines}${absTail}\n${indent(d)}</Surface>`;
  }
  return overflow ? wrapHorizontalScroll(el, ctx, depth, node.box?.h) : el;
}

/** Render a `kind:"node"` structural wrapper → token <Container>, else <View>. */
/**
 * A container that directly holds a darkening Scrim (a bottom/top/center
 * gradient or flat overlay at medium/high attention) is a media-overlay card:
 * its sibling content (title, date, badges) sits ON the darkened image and
 * must read LIGHT. Rendering that container as a dark `Surface mode="bold"`
 * (with a transparent fill so it doesn't cover the image) re-resolves every
 * descendant's neutral tokens to light — matching the Figma white overlay text
 * — without any literal colours. Edge fades (position start/end, decorative
 * carousel peeks with no overlaid text) are excluded.
 */
function hasDarkeningScrim(children: RefinedNode[]): boolean {
  return children.some((c) => {
    if (c.kind !== 'component' || c.component !== 'Scrim') return false;
    const pos = String(c.props?.position ?? 'bottom').toLowerCase();
    const att = String(c.props?.attention ?? 'medium').toLowerCase();
    return (pos === 'bottom' || pos === 'top' || pos === 'center') && att !== 'low';
  });
}

/** Merge an extra CSS-in-JS entry into an existing ` style={{ … }}` substring, or append a new style prop. */
function injectStyle(propStr: string, entry: string): string {
  if (/ style=\{\{/.test(propStr)) {
    return propStr.replace(/ style=\{\{\s*/, ` style={{ ${entry}, `);
  }
  return `${propStr} style={{ ${entry} }}`;
}

/** True when a refined node is a Scrim overlay component. */
function isScrimNode(n: RefinedNode): boolean {
  return n.kind === 'component' && n.component === 'Scrim';
}

/** Axis-aligned box overlap (auto-layout siblings never overlap → overlap ⇒ overlay). */
function boxesOverlap(a: AbsBox, b: AbsBox): boolean {
  if (a.x == null || a.y == null || a.w == null || a.h == null) return false;
  if (b.x == null || b.y == null || b.w == null || b.h == null) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Split a frame's children into normal flex flow vs. absolutely-positioned overlays.
 *
 * Primary signal: Figma `layoutPositioning === 'ABSOLUTE'` (refined to `layout.absolute`)
 * — the child ignores its parent's auto-layout and must NOT count in the flex flow.
 * Fallback (only when NO child in the frame carries that flag, e.g. a tree extracted
 * before positioning was plumbed through): a non-Scrim child whose box overlaps an
 * earlier non-Scrim sibling is an overlay, since auto-layout siblings never overlap.
 */
function splitAbsolute(children: RefinedNode[]): { flow: RefinedNode[]; absolute: RefinedNode[] } {
  const hasExplicit = children.some((c) => c.layout?.absolute === true);
  const flow: RefinedNode[] = [];
  const absolute: RefinedNode[] = [];
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    let isAbs = c.layout?.absolute === true;
    if (!isAbs && !hasExplicit) {
      const cb = c.layout?.absoluteBox;
      if (cb && !isScrimNode(c)) {
        for (let j = 0; j < i; j++) {
          const s = children[j];
          if (isScrimNode(s)) continue;
          const sb = s.layout?.absoluteBox;
          if (sb && boxesOverlap(cb, sb)) {
            isAbs = true;
            break;
          }
        }
      }
    }
    (isAbs ? absolute : flow).push(c);
  }
  return { flow, absolute };
}

/**
 * CSS-in-JS body (without braces) for an absolutely-positioned overlay child.
 * Offsets derive from the child's box relative to the parent's box, honouring the
 * Figma pin constraints:
 *   MIN → top/left · MAX → bottom/right · CENTER → 50% + translate · STRETCH → both edges.
 * With no constraints, each axis defaults to the MIN (top/left) delta — pixel-accurate
 * to the design. With no boxes at all it falls back to top:0/left:0.
 */
function positionAbsoluteStyle(child: RefinedNode, parentBox: AbsBox | undefined): string {
  const cb = child.layout?.absoluteBox;
  const cons = child.layout?.constraints;
  const parts: string[] = ["position: 'absolute'"];
  const transforms: string[] = [];
  const ok =
    !!cb &&
    !!parentBox &&
    cb.x != null &&
    cb.y != null &&
    cb.w != null &&
    cb.h != null &&
    parentBox.x != null &&
    parentBox.y != null &&
    parentBox.w != null &&
    parentBox.h != null;
  if (ok) {
    const left = Math.round(cb!.x! - parentBox!.x!);
    const top = Math.round(cb!.y! - parentBox!.y!);
    const right = Math.round(parentBox!.x! + parentBox!.w! - (cb!.x! + cb!.w!));
    const bottom = Math.round(parentBox!.y! + parentBox!.h! - (cb!.y! + cb!.h!));
    switch (cons?.horizontal) {
      case 'MAX':
        parts.push(`right: ${right}`);
        break;
      case 'CENTER':
        parts.push(`left: '50%'`);
        transforms.push(`{ translateX: ${-Math.round(cb!.w! / 2)} }`);
        break;
      case 'STRETCH':
        parts.push(`left: ${left}`, `right: ${right}`);
        break;
      default:
        parts.push(`left: ${left}`);
    }
    switch (cons?.vertical) {
      case 'MAX':
        parts.push(`bottom: ${bottom}`);
        break;
      case 'CENTER':
        parts.push(`top: '50%'`);
        transforms.push(`{ translateY: ${-Math.round(cb!.h! / 2)} }`);
        break;
      case 'STRETCH':
        parts.push(`top: ${top}`, `bottom: ${bottom}`);
        break;
      default:
        parts.push(`top: ${top}`);
    }
  } else {
    parts.push('top: 0', 'left: 0');
  }
  if (transforms.length) parts.push(`transform: [${transforms.join(', ')}]`);
  return parts.join(', ');
}

/** Render an absolute overlay child wrapped in a pinned Container (kept out of flex flow). */
function renderAbsoluteChild(
  child: RefinedNode,
  parentBox: AbsBox | undefined,
  ctx: GenCtx,
  depth: number,
  inHScroll: boolean
): string {
  ctx.imports.add('Container');
  const style = positionAbsoluteStyle(child, parentBox);
  const inner = renderNode(child, ctx, depth + 1, 'column', inHScroll);
  return (
    `${indent(depth)}<Container variant="full-bleed" style={{ ${style} }}>\n` +
    `${inner}\n` +
    `${indent(depth)}</Container>`
  );
}

function renderStructuralNode(
  node: Extract<RefinedNode, { kind: 'node' }>,
  ctx: GenCtx,
  depth: number,
  parentDir: 'row' | 'column' | undefined,
  inHScroll = false
): string {
  const sizeStr = sizeStyleStr(node.box, parentDir, inHScroll);
  const hasLayout = !!(node.layout && (node.layout.direction || node.layout.gap));
  // A media-overlay card (direct Scrim child) becomes a dark Surface so its
  // overlaid text/badges resolve to light tokens (see hasDarkeningScrim).
  const overlayDark = hasDarkeningScrim(node.children ?? []);
  const tag = overlayDark ? 'Surface' : hasLayout || sizeStr ? 'Container' : 'View';
  if (tag === 'Surface') {
    ctx.needsSurfaceImport = true;
    ctx.imports.add('Surface');
  } else if (tag === 'Container') ctx.imports.add('Container');
  else ctx.needsViewImport = true;
  // Generated Containers are flex LAYOUT primitives, not page wrappers. The
  // default `fluid` variant injects `width: '100%'` + horizontal padding, which
  // makes every hug box fill its parent (tabs collapse to one item, scroll-row
  // items balloon to ~1500px and push siblings off-screen). `full-bleed` is the
  // neutral variant ({}) — width then comes purely from the Figma sizing
  // (sizeStyleStr: fill→stretch/flex, hug→natural, scroll items→pinned).
  const variantStr =
    tag === 'Surface' ? ' mode="bold"' : tag === 'Container' ? ' variant="full-bleed"' : '';
  const ownDir = node.layout?.direction;
  const overflow = rowOverflows(node);
  const d = overflow ? depth + 2 : depth;
  let layoutStr = (node.layout ? layoutPropsString(node.layout) : '') + sizeStr;
  // Surface paints a bold fill; keep it transparent so the hero image shows
  // through while descendants still inherit the dark (light-text) context.
  if (tag === 'Surface') layoutStr = injectStyle(layoutStr, "backgroundColor: 'transparent'");
  // Rounded frame (e.g. a media card) → borderRadius from Figma cornerRadius.
  // injectStyle appends a fresh `style={{...}}` when none exists yet, so this
  // applies to a plain View wrapper too, not just Container/Surface.
  if (node.layout?.cornerRadius) {
    layoutStr = injectStyle(layoutStr, `borderRadius: ${node.layout.cornerRadius}`);
  }
  // Peel absolutely-positioned overlays (Figma "Ignore auto layout") out of the
  // flex flow so they don't get swept into the parent's anchor. Each is re-pinned
  // by its own constraints (renderAbsoluteChild) and appended inside this frame.
  const parentBox = node.layout?.absoluteBox;
  const { flow: children, absolute: absChildren } = splitAbsolute(node.children ?? []);
  const childInHScroll = inHScroll || overflow;
  const commentLine =
    node.name && node.name !== 'root' ? `${indent(d + 1)}{/* ${node.name} */}\n` : '';
  const absInner = absChildren
    .map((c) => renderAbsoluteChild(c, parentBox, ctx, d + 1, childInHScroll))
    .join('\n');
  const absTail = absInner ? `\n${absInner}` : '';
  let el: string;
  if (children.length === 0 && absChildren.length === 0) {
    el = commentLine
      ? `${indent(d)}<${tag}${variantStr}${layoutStr}>\n${commentLine}${indent(d)}</${tag}>`
      : `${indent(d)}<${tag}${variantStr}${layoutStr} />`;
  } else if (children.length === 0) {
    // Frame holds only pinned overlays, no flow content.
    el = `${indent(d)}<${tag}${variantStr}${layoutStr}>\n${commentLine}${absInner}\n${indent(d)}</${tag}>`;
  } else if (overlayDark) {
    // Media-overlay card: the first non-Scrim child is the background image (stays
    // in flow to set the card height); the Scrim self-positions; the remaining
    // FLOW content (title/subtitle) is bottom-anchored so it sits ON the image
    // instead of stacking below it. Figma-absolute overlays (badges/tags) were
    // already peeled above and are re-pinned by their own constraints via absTail.
    ctx.imports.add('Container');
    let bgSeen = false;
    const flowParts: string[] = [];
    const overlayParts: string[] = [];
    for (const c of children) {
      const isScrim = c.kind === 'component' && c.component === 'Scrim';
      if (isScrim) {
        flowParts.push(renderNode(c, ctx, d + 1, ownDir, childInHScroll));
        continue;
      }
      if (!bgSeen) {
        bgSeen = true;
        flowParts.push(renderNode(c, ctx, d + 1, ownDir, childInHScroll));
        continue;
      }
      overlayParts.push(renderNode(c, ctx, d + 2, 'column', childInHScroll));
    }
    let inner = flowParts.join('\n');
    if (overlayParts.length) {
      inner +=
        `\n${indent(d + 1)}<Container variant="full-bleed" direction="column" justify="end" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>\n` +
        `${overlayParts.join('\n')}\n` +
        `${indent(d + 1)}</Container>`;
    }
    el = `${indent(d)}<${tag}${variantStr}${layoutStr}>\n${commentLine}${inner}${absTail}\n${indent(d)}</${tag}>`;
  } else {
    const childLines = children
      .map((c) => renderNode(c, ctx, d + 1, ownDir, childInHScroll))
      .join('\n');
    el = `${indent(d)}<${tag}${variantStr}${layoutStr}>\n${commentLine}${childLines}${absTail}\n${indent(d)}</${tag}>`;
  }
  return overflow ? wrapHorizontalScroll(el, ctx, depth, node.box?.h) : el;
}

function renderNode(
  node: RefinedNode,
  ctx: GenCtx,
  depth: number,
  parentDir?: 'row' | 'column',
  inHScroll = false
): string {
  if (node.kind === 'component') return renderComponent(node, ctx, depth, parentDir, inHScroll);
  if (node.kind === 'surface') return renderSurface(node, ctx, depth, parentDir, inHScroll);
  return renderStructuralNode(node, ctx, depth, parentDir, inHScroll);
}

// ---------------------------------------------------------------------------
// Top-level file emitter
// ---------------------------------------------------------------------------

function toPascalCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Pinned-footer detection for the screen root. A real app keeps the bottom
 * navigation (and a mini-player / CTA bar) FIXED while only the content scrolls.
 * Figma nests them in the page frame, so the naive single-ScrollView wrap makes
 * them scroll away. This peels the trailing `BottomNavigation` (a direct child of
 * the root) and a trailing bar `Surface` (mode ≠ default — typically the
 * mini-player, which sits as the last child of the main content column) so the
 * caller can render them OUTSIDE the ScrollView. Returns null when there's
 * nothing to pin (most screens) → caller keeps the plain single-ScrollView wrap.
 */
function isBottomNav(n: RefinedNode): boolean {
  return n.kind === 'component' && n.component === 'BottomNavigation';
}
function isPinnedBar(n: RefinedNode): boolean {
  return n.kind === 'surface' && !!n.mode && n.mode !== 'default';
}
function splitPinnedFooters(
  tree: RefinedNode
): { scrollableChildren: RefinedNode[]; pinned: RefinedNode[]; rootMode: string | null } | null {
  if ((tree.kind !== 'surface' && tree.kind !== 'node') || !tree.children?.length) return null;
  const t = structuredClone(tree) as Extract<RefinedNode, { kind: 'surface' | 'node' }>;
  const children = t.children ?? [];
  const pinned: RefinedNode[] = [];

  // 1) trailing bottom navigation (direct root child)
  if (children.length && isBottomNav(children[children.length - 1])) {
    pinned.unshift(children.pop()!);
  }
  // 2) a trailing bar Surface — either a direct root sibling, or the LAST child
  //    of the (now) last scrollable container (the mini-player nested in the
  //    main column).
  const last = children[children.length - 1];
  if (last && isPinnedBar(last)) {
    pinned.unshift(children.pop()!);
  } else if (last && (last.kind === 'node' || last.kind === 'surface') && last.children?.length) {
    const inner = last.children;
    if (isPinnedBar(inner[inner.length - 1])) {
      pinned.unshift(inner.pop()!);
    }
  }

  if (!pinned.length) return null;
  return { scrollableChildren: children, pinned, rootMode: t.kind === 'surface' ? t.mode : null };
}

export function generateNativeScreen(refined: RefineResult, opts: CodegenOpts): CodegenResult {
  const { screenName, outDir, projectRoot, platformSubdir = 'native' } = opts;
  const registry = buildRegistry(platformSubdir);
  const absOutDir = isAbsolute(outDir) ? outDir : resolve(projectRoot, outDir);
  const ctx: GenCtx = {
    registry,
    imports: new Set<string>(),
    needsSurfaceImport: false,
    needsIconImport: false,
    needsRNImageHelper: false,
    needsViewImport: false,
    needsScrollViewImport: false,
    needsSafeAreaInsets: false,
    warnings: [],
    screenDir: absOutDir,
    projectRoot: isAbsolute(projectRoot) ? projectRoot : resolve(projectRoot),
    iconComponents: loadIconComponentNames(
      isAbsolute(projectRoot) ? projectRoot : resolve(projectRoot)
    ),
  };

  // Wrap the screen body in a vertical ScrollView (the Figma frame is usually
  // taller than the viewport). If the screen has pinned footers (bottom nav /
  // mini-player), keep them OUTSIDE the ScrollView inside a flex:1 root so only
  // the content scrolls.
  let jsxBody: string;
  if (refined.tree) {
    ctx.needsScrollViewImport = true;
    const split = splitPinnedFooters(refined.tree);
    if (split) {
      const scrollInner = split.scrollableChildren.map((c) => renderNode(c, ctx, 4)).join('\n');
      const pinnedInner = split.pinned.map((c) => renderNode(c, ctx, 3)).join('\n');
      let rootOpen: string;
      let rootClose: string;
      ctx.needsSafeAreaInsets = true;
      if (split.rootMode) {
        ctx.needsSurfaceImport = true;
        ctx.imports.add('Surface');
        rootOpen = `${indent(2)}<Surface mode="${split.rootMode}" style={{ flex: 1, paddingTop: insets.top }}>`;
        rootClose = `${indent(2)}</Surface>`;
      } else {
        ctx.needsViewImport = true;
        rootOpen = `${indent(2)}<View style={{ flex: 1, paddingTop: insets.top }}>`;
        rootClose = `${indent(2)}</View>`;
      }
      jsxBody =
        `${rootOpen}\n` +
        `${indent(3)}<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>\n` +
        `${scrollInner}\n` +
        `${indent(3)}</ScrollView>\n` +
        `${pinnedInner}\n` +
        `${rootClose}`;
    } else {
      ctx.needsSafeAreaInsets = true;
      const inner = renderNode(refined.tree, ctx, 3);
      jsxBody =
        `${indent(2)}<ScrollView style={{ flex: 1, paddingTop: insets.top }} showsVerticalScrollIndicator={false}>\n` +
        `${inner}\n` +
        `${indent(2)}</ScrollView>`;
    }
  } else {
    jsxBody = `${indent(2)}{/* empty design — nothing to render */}`;
  }

  if (ctx.needsSurfaceImport) ctx.imports.add('Surface');

  const componentImports = [...ctx.imports].filter((n) => n !== 'Surface').sort();
  const surfaceImports = ctx.needsSurfaceImport ? ['Surface'] : [];
  const allUiImports = [...componentImports, ...surfaceImports].sort();

  const importLines: string[] = [];
  const allUiImportsWithIcon =
    ctx.needsIconImport && !allUiImports.includes('Icon')
      ? [...allUiImports, 'Icon'].sort()
      : allUiImports;

  if (allUiImportsWithIcon.length > 0) {
    importLines.push(`import { ${allUiImportsWithIcon.join(', ')} } from '@oneui/ui-native';`);
  }
  const rnImports: string[] = [];
  if (ctx.needsViewImport) rnImports.push('View');
  if (ctx.needsScrollViewImport) rnImports.push('ScrollView');
  if (rnImports.length > 0) {
    importLines.push(`import { ${rnImports.join(', ')} } from 'react-native';`);
  }
  if (ctx.needsIconImport) {
    importLines.push(`import * as JioIcons from '@oneui/icons-jio-native';`);
  }
  if (ctx.needsRNImageHelper) {
    // "Image" is a forbidden react-native primitive import (only View/ScrollView
    // are allowed) — resolve require() asset numbers via expo-asset instead.
    importLines.push(`import { Asset } from 'expo-asset';`);
  }
  if (ctx.needsSafeAreaInsets) {
    importLines.push(`import { useSafeAreaInsets } from 'react-native-safe-area-context';`);
  }

  const componentName = toPascalCase(screenName) || 'Screen';

  const baseModes = refined.base ?? {};
  const baseModeComment =
    Object.keys(baseModes).length > 0 ? `// Base design modes: ${JSON.stringify(baseModes)}\n` : '';

  const warningComments =
    ctx.warnings.length > 0
      ? `// Codegen warnings:\n${ctx.warnings.map((w) => `//   - ${w}`).join('\n')}\n`
      : '';

  const topLevelHelpers: string[] = [];
  if (ctx.needsIconImport) {
    topLevelHelpers.push(`JioIcons.initJioNativeIcons();`);
  }
  if (ctx.needsRNImageHelper) {
    topLevelHelpers.push(
      `// @oneui/ui-native Image/Avatar take src as a URL string — resolve RN asset numbers`,
      `function u(mod: number): string {`,
      `  return Asset.fromModule(mod).uri;`,
      `}`
    );
  }

  const code = [
    `/**`,
    ` * ${componentName} — generated from Figma by figma_to_code`,
    ` * Uses only @oneui/ui-native components. No literals.`,
    ` * Validate with: validate_oneui_code(code, platform="native")`,
    ` */`,
    importLines.join('\n'),
    ``,
    topLevelHelpers.length > 0 ? topLevelHelpers.join('\n') + '\n' : null,
    warningComments + baseModeComment + `export default function ${componentName}() {`,
    ctx.needsSafeAreaInsets ? `  const insets = useSafeAreaInsets();` : null,
    `  return (`,
    jsxBody,
    `  );`,
    `}`,
    ``,
  ]
    .filter((l) => l !== null)
    .join('\n');

  mkdirSync(absOutDir, { recursive: true });
  const fileName = `${componentName}.native.tsx`;
  const file = resolve(absOutDir, fileName);
  writeFileSync(file, code, 'utf8');
  const relPath = relative(projectRoot, file) || fileName;

  return {
    file,
    relPath,
    code,
    components: allUiImportsWithIcon,
    warnings: ctx.warnings,
    componentName,
  };
}

/**
 * Write an expo-router route that renders the generated screen, so the screen is
 * reachable without hand-editing the consuming app. Optionally point the app's
 * index at it. Routing thus comes "through the MCP", not manual edits.
 */
export function generateRouteFiles(
  componentName: string,
  projectRoot: string,
  opts?: { appDir?: string; screensImport?: string; setIndex?: boolean }
): RouteResult {
  const root = isAbsolute(projectRoot) ? projectRoot : resolve(projectRoot);
  const appDir = resolve(root, opts?.appDir ?? 'src/app');
  // Simple lowercase slug (matches the existing route convention, e.g. "jiomart").
  const slug = componentName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'screen';
  const screensImport = opts?.screensImport ?? '@/screens';
  const href = `/${slug}`;

  mkdirSync(appDir, { recursive: true });
  const routeFile = resolve(appDir, `${slug}.tsx`);
  const routeCode =
    `import React from 'react';\n` +
    `import ${componentName} from '${screensImport}/${componentName}.native';\n\n` +
    `export default function ${componentName}Route() {\n` +
    `  return <${componentName} />;\n` +
    `}\n`;
  writeFileSync(routeFile, routeCode, 'utf8');

  const out: RouteResult = { routePath: relative(root, routeFile) || `${slug}.tsx`, href };

  if (opts?.setIndex) {
    const indexFile = resolve(appDir, 'index.tsx');
    const indexCode =
      `import React from 'react';\n` +
      `import { Redirect } from 'expo-router';\n\n` +
      `export default function Index() {\n` +
      `  return <Redirect href="${href}" />;\n` +
      `}\n`;
    writeFileSync(indexFile, indexCode, 'utf8');
    out.indexPath = relative(root, indexFile) || 'index.tsx';
  }

  return out;
}
