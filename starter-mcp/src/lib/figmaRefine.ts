/**
 * figma_to_code — step 2: refine the raw extraction hierarchy into a TSX-ready tree.
 *
 * Input  = the nested hierarchy produced by figmaModesSnippet.ts (each node:
 *          { name, type, component?, appearance?, surface?, props?, chars?, layout?,
 *            w/h, sizeH/sizeV, modeOverrides?, children? }).
 * Output = a slimmer tree where:
 *   - a node that maps to a REGISTERED OneUI component becomes
 *       { kind:'component', component, appearance?, surface?, props?, text?, box?, layout?, children? };
 *   - a FRAME that only carries a `surface` override → { kind:'surface', mode, layout?, box?, children? };
 *   - everything else keeps its name + layout/box → { kind:'node', name, layout?, box?, children? }.
 *
 * Spacing on `layout` is a token KEY (Figma bound dimension-scale variable → key),
 * so generated/authored code stays literal-free. `layout` also carries
 * `cornerRadius` + `absoluteBox` (the latter drives row inference for non-auto
 * layout tab bars and the rare absolutely-positioned case).
 *
 * The registered set comes from the snapshot component index for the target
 * platform (default reactnative — `getComponentIndex('native')`).
 */
import { getComponentIndex } from './snapshot.js';
import { PLATFORMS, type PlatformId } from './platforms.js';

/** Absolute bounding box (x/y/w/h) — captured for every node by figmaModesSnippet. */
export interface AbsBox {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

/** Font properties captured from a Figma TEXT node (figmaModesSnippet.typographyInfo). */
export interface RawTypography {
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  fontFamily?: string;
  /** Effective text fill opacity (fill.opacity × node.opacity) — drives attention="low". */
  fillOpacity?: number;
  /** Resolved name of the colour variable bound to the text fill (e.g. "…/secondary"). */
  fillVar?: string;
  /** Figma textTruncation==='ENDING' → ellipsis clamp; drives a maxLines default. */
  truncate?: boolean;
  /** Explicit Figma maxLines (line clamp) → emitted as Text maxLines. */
  maxLines?: number;
  /** Text box is exactly one line tall → codegen emits maxLines={1}. */
  singleLine?: boolean;
  /** Bound Figma text-style (or fontSize variable) name, e.g. "title/M" — the
   *  authoritative source for Text variant+size (px inference is a fallback). */
  styleName?: string;
}

export interface RawNode {
  id?: string;
  name?: string;
  type?: string;
  component?: string;
  appearance?: string;
  surface?: string;
  props?: Record<string, unknown>;
  modeOverrides?: Record<string, string>;
  image?: boolean;
  /** Visible text content (TEXT nodes only) — captured by figmaModesSnippet. */
  chars?: string;
  /** Font properties (TEXT nodes only) — captured by figmaModesSnippet. */
  typography?: RawTypography;
  /** Auto-layout geometry + bound dimension-scale variables — captured by figmaModesSnippet. */
  layout?: RawLayout;
  /** Node box + per-axis sizing mode (Figma "Fixed/Hug/Fill"). */
  w?: number;
  h?: number;
  sizeH?: string; // 'FIXED' | 'HUG' | 'FILL'
  sizeV?: string;
  children?: RawNode[];
}

/** Node geometry + sizing mode the codegen uses for width/aspectRatio/flex. */
export interface NodeBox {
  w?: number;
  h?: number;
  sizeH?: 'fixed' | 'hug' | 'fill';
  sizeV?: 'fixed' | 'hug' | 'fill';
}

/** A spacing value as captured from Figma: resolved px + the bound variable name (if any). */
export interface RawSpace {
  px?: number;
  token?: string;
}

interface RawLayout {
  mode?: string; // 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  primaryAxisAlignItems?: string; // MIN | CENTER | MAX | SPACE_BETWEEN
  counterAxisAlignItems?: string; // MIN | CENTER | MAX | BASELINE
  wrap?: boolean;
  itemSpacing?: RawSpace;
  paddingTop?: RawSpace;
  paddingRight?: RawSpace;
  paddingBottom?: RawSpace;
  paddingLeft?: RawSpace;
  cornerRadius?: number;
  absoluteBox?: AbsBox;
  /** Figma layoutPositioning==='ABSOLUTE' — child ignores its parent's auto-layout. */
  absolute?: boolean;
  /** Figma pin constraints (MIN|MAX|CENTER|STRETCH|SCALE) — used to place absolute children. */
  constraints?: { horizontal?: string; vertical?: string };
}

/** Token-based layout the codegen renders onto <Container>/<Surface>. Spacing values are token KEYS. */
export interface LayoutSpec {
  direction?: 'row' | 'column';
  gap?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  /** Figma corner radius in px (informational; agent/codegen may use it). */
  cornerRadius?: number;
  /** Absolute bounding box for non-auto-layout / pinned cases + row inference. */
  absoluteBox?: AbsBox;
  /** Figma layoutPositioning==='ABSOLUTE' — child is a pinned overlay, not in flex flow. */
  absolute?: boolean;
  /** Figma pin constraints (MIN|MAX|CENTER|STRETCH|SCALE) — codegen derives offsets from these. */
  constraints?: { horizontal?: string; vertical?: string };
}

export type RefinedNode =
  | {
      kind: 'component';
      component: string;
      /** Figma layer name — carried through for warnings that must identify WHICH
       * node was affected (e.g. a dropped/fallback icon among several siblings). */
      name?: string;
      appearance?: string;
      surface?: string;
      props?: Record<string, unknown>;
      /** Visible text content → emitted as JSX children (Text, and any label-less text component). */
      text?: string;
      /** Figma typography (TEXT nodes) → codegen maps to Text variant/size/weight. */
      typography?: RawTypography;
      /** Node geometry + sizing mode (for Image aspectRatio/width). */
      box?: NodeBox;
      /** Placement (cornerRadius/absoluteBox; mostly for the agent flow). */
      layout?: LayoutSpec;
      /** Figma node id to render+download for image content (Image/Avatar). Backfilled to props.src later. */
      assetId?: string;
      children?: RefinedNode[];
      /**
       * Slot PROPS whose value is rendered content, not a plain string/number
       * (e.g. PrimaryNav's `startSlot`/`avatarSlot`/`endSlot` — it has no
       * `children` prop at all). Keyed by the real prop name; codegen renders
       * each list as JSX and emits `propName={<>…</>}`.
       */
      slots?: Record<string, RefinedNode[]>;
    }
  | { kind: 'surface'; mode: string; layout?: LayoutSpec; box?: NodeBox; children?: RefinedNode[] }
  | { kind: 'node'; name: string; layout?: LayoutSpec; box?: NodeBox; children?: RefinedNode[] };

/** An image asset to download. Icons are NEVER here — they come from the icon library. */
export interface ImageAsset {
  id: string;
  component: string;
  alt?: string;
}

/** Figma component-name → OneUI canonical-name aliases (slug form). */
const ALIASES: Record<string, string> = {
  bottomnav: 'bottomnavigation',
  bottomnavitem: 'bottomnavigationitem',
  inputtext: '', // internal of Input — not a standalone component
  linearprogressindicator: 'progress', // Figma uses long form; code uses Progress
  progressindicator: 'progress',
  // Figma library instance names are dotted ("HeaderNative.PrimaryNav") — slugify
  // strips the dots, so these collapse to the same key as a plain "PrimaryNav"/
  // "SecondaryNav" instance would. Mapping them explicitly keeps that collision
  // intentional rather than accidental.
  headernativeprimarynav: 'primarynav',
  headernativesecondarynav: 'secondarynav',
};

/**
 * Registered components that genuinely compose OTHER components as user content,
 * so their children are kept. Every other registered component is a LEAF — it
 * renders from props (icon, label, src…), so its Figma children are internal
 * implementation and are dropped (we still harvest the icon glyph name).
 */
const CONTAINERS = new Set(
  [
    'BottomNavigation', 'ChipGroup', 'Tabs', 'CheckboxField', 'RadioField', 'Card', 'Banner',
    'Container', 'InputField', 'Modal', 'Select', 'Scrim', 'Carousel', 'HeaderNative',
    'SegmentedControl', 'SecondaryNav',
    // Figma's own library ships a real ".CarouselControls/<placement>/…" instance
    // wrapping the pagination dots — same reliable-signal pattern as PrimaryNav/
    // SecondaryNav. Without this its real children (the dots) get dropped as
    // "leaf internals" before restructureCarousel ever sees them.
    'CarouselControls',
  ].map((n) => n.toLowerCase()),
);

// Real glyph layers are named like "ic_shopping" / "ic-grocery" (mandatory
// separator) — this must NOT match the literal "Icon" component name.
const GLYPH_RE = /^ic[_-][a-z0-9]/i;

/** Depth-first search for the first icon-glyph node name (e.g. "ic_shopping"). */
function harvestIcon(node: RawNode): string | undefined {
  for (const child of node.children ?? []) {
    const n = (child.name ?? '').trim();
    const comp = (child.component ?? '').trim();
    if (GLYPH_RE.test(n)) return n;
    // "Icon Asset" nodes carry the glyph name in their component field
    if (GLYPH_RE.test(comp)) return comp;
    const deep = harvestIcon(child);
    if (deep) return deep;
  }
  return undefined;
}

/** Depth-first search for the first non-empty text content (a Text component's inner TEXT). */
function harvestText(node: RawNode): string | undefined {
  for (const child of node.children ?? []) {
    if (typeof child.chars === 'string' && child.chars.trim()) return child.chars.trim();
    const deep = harvestText(child);
    if (deep) return deep;
  }
  return undefined;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// --- Layout → spacing-token mapping -----------------------------------------

/** Valid native spacing token keys (mirror of NativeSpacingKey). */
const SPACING_KEYS = new Set([
  '0', '0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '4-5', '5', '5-5',
  '6', '7', '8', '9', '10', '12', '14', '16', '18', '20', '24', '28', '32', '40',
  'Margin', 'Gutter',
]);

/** Numeric key → default px (the Jio scale is a 4px grid: px = 4 × key). */
const KEY_PX: Array<[string, number]> = [...SPACING_KEYS]
  .filter((k) => /^\d/.test(k))
  .map((k) => [k, parseFloat(k.replace('-', '.')) * 4] as [string, number]);

/**
 * Resolve a captured spacing value to a spacing token. Prefers the bound Figma
 * variable, emitting its FULL path (e.g. `dimensions/spacings/6`,
 * `dimensions/grid/margin`) so the generated code is traceable to the design
 * variable — the Container/Surface `resolveSpacingPx` normalises it at runtime.
 * Falls back to the nearest canonical key for px-only values.
 */
export function spaceToKey(s: RawSpace | undefined): string | undefined {
  if (!s) return undefined;
  if (s.token) {
    const last = s.token.split('/').pop()!.trim();
    const lower = s.token.toLowerCase();
    if (SPACING_KEYS.has(last) || lower.includes('margin') || lower.includes('gutter')) {
      return s.token; // full dimension-scale path; component resolves it
    }
  }
  if (typeof s.px === 'number') {
    if (s.px <= 0) return undefined; // 0 padding/gap — nothing to emit
    // Nearest key on the default 4px grid (runtime resolves the brand value).
    let best = KEY_PX[0][0];
    let bestD = Infinity;
    for (const [k, px] of KEY_PX) {
      const d = Math.abs(px - s.px);
      if (d < bestD) { bestD = d; best = k; }
    }
    return best;
  }
  return undefined;
}

const PRIMARY_JUSTIFY: Record<string, LayoutSpec['justify']> = {
  MIN: 'start', CENTER: 'center', MAX: 'end', SPACE_BETWEEN: 'between',
};
const COUNTER_ALIGN: Record<string, LayoutSpec['align']> = {
  MIN: 'start', CENTER: 'center', MAX: 'end', BASELINE: 'baseline',
};

const SIZING: Record<string, 'fixed' | 'hug' | 'fill'> = { FIXED: 'fixed', HUG: 'hug', FILL: 'fill' };

/** Capture node geometry + sizing mode, or undefined when nothing useful. */
function mapBox(node: RawNode): NodeBox | undefined {
  const out: NodeBox = {};
  if (typeof node.w === 'number') out.w = node.w;
  if (typeof node.h === 'number') out.h = node.h;
  if (node.sizeH && SIZING[node.sizeH]) out.sizeH = SIZING[node.sizeH];
  if (node.sizeV && SIZING[node.sizeV]) out.sizeV = SIZING[node.sizeV];
  return Object.keys(out).length ? out : undefined;
}

/**
 * Convert raw Figma layout into a token-based LayoutSpec. Produces a value even
 * for non-auto-layout nodes when cornerRadius / absoluteBox are present (so those
 * survive for the agent flow + row inference). Returns undefined when empty.
 */
function mapLayout(raw: RawLayout | undefined): LayoutSpec | undefined {
  if (!raw) return undefined;
  const out: LayoutSpec = {};
  if (raw.mode === 'HORIZONTAL' || raw.mode === 'VERTICAL') {
    out.direction = raw.mode === 'HORIZONTAL' ? 'row' : 'column';
    const gap = spaceToKey(raw.itemSpacing);
    if (gap) out.gap = gap;
    const pt = spaceToKey(raw.paddingTop);
    const pr = spaceToKey(raw.paddingRight);
    const pb = spaceToKey(raw.paddingBottom);
    const pl = spaceToKey(raw.paddingLeft);
    if (pt) out.paddingTop = pt;
    if (pr) out.paddingRight = pr;
    if (pb) out.paddingBottom = pb;
    if (pl) out.paddingLeft = pl;
    const justify = raw.primaryAxisAlignItems ? PRIMARY_JUSTIFY[raw.primaryAxisAlignItems] : undefined;
    if (justify && justify !== 'start') out.justify = justify;
    // Skip 'start' (Figma MIN): leaving alignItems at RN's default 'stretch' lets
    // children fill the cross axis (sections/headers span full width). Explicit
    // fill children still stretch; hug children stay visually start-aligned.
    const align = raw.counterAxisAlignItems ? COUNTER_ALIGN[raw.counterAxisAlignItems] : undefined;
    if (align && align !== 'start') out.align = align;
    if (raw.wrap) out.wrap = true;
  }
  if (typeof raw.cornerRadius === 'number') out.cornerRadius = raw.cornerRadius;
  if (raw.absoluteBox) out.absoluteBox = raw.absoluteBox;
  if (raw.absolute) out.absolute = true;
  if (raw.constraints) out.constraints = raw.constraints;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Heuristic: a non-auto-layout frame whose children are all short Text items and
 * whose box is much wider than tall is almost certainly a horizontal tab/nav bar.
 * Figma sometimes lays these out absolutely (no `layoutMode`) → without this they
 * render as a vertical column. Returns true when row direction should be forced.
 */
function looksLikeHorizontalNav(layout: LayoutSpec | undefined, children: RefinedNode[]): boolean {
  if (layout?.direction) return false; // already has an explicit direction
  if (children.length < 3) return false;
  const ab = layout?.absoluteBox;
  if (!ab || !ab.w || !ab.h) return false;
  if (ab.w / ab.h < 2.5) return false; // not wide-and-short
  return children.every((c) => c.kind === 'component' && c.component === 'Text');
}

/** Read the absolute bounding box off any refined node (all kinds carry it on `layout`). */
function refinedAbsBox(n: RefinedNode): AbsBox | undefined {
  return n.layout?.absoluteBox;
}

/**
 * Group a run of horizontally-adjacent siblings into an inferred ROW container.
 *
 * Figma frequently lays a tab/segment bar (e.g. "For you · Music · Podcasts ·
 * Radio") inside a VERTICAL parent with each tab as a sibling positioned by hand
 * (no row auto-layout). Refined faithfully, those siblings stack vertically. When
 * ≥3 consecutive siblings share a horizontal band (vertical overlap) and march
 * left→right without overlapping, they are a row — wrap them so codegen emits a
 * single <Container direction="row">. Only applied when the parent is NOT already
 * a row (a row parent already arranges its children horizontally).
 */
function groupHorizontalRuns(children: RefinedNode[]): RefinedNode[] {
  if (children.length < 3) return children;
  const adjacent = (a: AbsBox, b: AbsBox): boolean => {
    if (a.x == null || a.y == null || a.w == null || a.h == null) return false;
    if (b.x == null || b.y == null || b.h == null) return false;
    const vOverlap = b.y < a.y + a.h && b.y + (b.h ?? 0) > a.y; // share a horizontal band
    const toRight = b.x >= a.x + a.w - 1; // next begins at/after current's right edge
    return vOverlap && toRight;
  };
  const out: RefinedNode[] = [];
  let i = 0;
  while (i < children.length) {
    let j = i;
    while (j + 1 < children.length) {
      const a = refinedAbsBox(children[j]);
      const b = refinedAbsBox(children[j + 1]);
      if (a && b && adjacent(a, b)) j++;
      else break;
    }
    const runLen = j - i + 1;
    if (runLen >= 3) {
      out.push({
        kind: 'node',
        name: 'inferred-row',
        layout: { direction: 'row', align: 'center', justify: 'start' },
        children: children.slice(i, j + 1),
      });
    } else {
      out.push(...children.slice(i, j + 1));
    }
    i = j + 1;
  }
  return out;
}

/** Build slug → canonical display name for the platform's registered components. */
export function registeredComponentMap(platform: PlatformId = 'reactnative'): Map<string, string> {
  const subdir = PLATFORMS[platform].assetSubdir;
  const map = new Map<string, string>();
  for (const c of getComponentIndex(subdir)) map.set(slugify(c.name), c.name);
  return map;
}

/** Resolve a node to a registered OneUI component name, or null. */
function matchRegistered(node: RawNode, reg: Map<string, string>): string | null {
  const sources = [node.component, node.name].filter(Boolean) as string[];
  for (const src of sources) {
    // try the whole name and each '/'-segment (handles "Slot/size8/Logo")
    const candidates = [src, ...src.split('/')];
    for (const cand of candidates) {
      let s = slugify(cand);
      if (s in ALIASES) s = ALIASES[s];
      if (!s) continue;
      if (reg.has(s)) return reg.get(s)!;
    }
  }
  return null;
}

const NODE_ID_RE = /^[A-Za-z]?\d+:\d+$/;

/** Real Figma componentProperty names are plain identifiers; anything else
 *  (Figma's "⛔️ ⛔️ ⛔️" idle-state warning marker, stray punctuation keys) is
 *  noise, not a prop — drop it so it doesn't surface as a bogus codegen warning. */
const PROP_KEY_RE = /^[A-Za-z][A-Za-z0-9 _-]*$/;

/** Drop slot/instance-swap props (node-id values, SLOT placeholders); keep real prop values. */
function cleanProps(props?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!props) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === 'SLOT') continue;
    if (typeof v === 'string' && NODE_ID_RE.test(v)) continue;
    if (!PROP_KEY_RE.test(k)) continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Depth-first search for a nested "." variant-wrapper instance carrying the
 * real componentProperties (Figma sometimes nests the actual props one level
 * inside a leading-dot instance sharing the outer component's name family —
 * e.g. outer "Header.Item" wraps an inner ".Header.Item" that holds
 * label/active/attention). Only used as a fallback when the matched node's
 * own `props` come back empty.
 */
function harvestNestedProps(node: RawNode): Record<string, unknown> | undefined {
  for (const child of node.children ?? []) {
    const n = (child.name ?? '').trim();
    if (n.startsWith('.') && child.props && Object.keys(child.props).length) {
      return child.props;
    }
    const deep = harvestNestedProps(child);
    if (deep) return deep;
  }
  return undefined;
}

/** Depth-first search for a descendant FRAME whose (trimmed, lowercased) name matches. */
function findNamedChild(node: RawNode, name: string): RawNode | undefined {
  for (const child of node.children ?? []) {
    if ((child.name ?? '').trim().toLowerCase() === name) return child;
    const deep = findNamedChild(child, name);
    if (deep) return deep;
  }
  return undefined;
}

function isRefinedComponent(n: RefinedNode, name: string): boolean {
  return n.kind === 'component' && n.component === name;
}

/** Depth-first search (self included) for the first RefinedNode matching `pred`. */
function findFirstRefined(node: RefinedNode, pred: (n: RefinedNode) => boolean): RefinedNode | undefined {
  if (pred(node)) return node;
  for (const child of node.children ?? []) {
    const found = findFirstRefined(child, pred);
    if (found) return found;
  }
  return undefined;
}

/** Depth-first collection of every RefinedNode matching `pred`. */
function collectRefined(node: RefinedNode, pred: (n: RefinedNode) => boolean, out: RefinedNode[] = []): RefinedNode[] {
  if (pred(node)) out.push(node);
  for (const child of node.children ?? []) collectRefined(child, pred, out);
  return out;
}

/**
 * Restructure Carousel's already-refined generic children (Container/Surface/
 * Image/Badge/Text/Button/PaginationDots — see the call site) into the real
 * compound API: a CarouselRail of CarouselItem (each with CarouselSlideImage,
 * an optional CarouselItemBadgeRow, and an optional CarouselSlideContent), and
 * a CarouselControls > CarouselIndicatorList row.
 *
 * Content matching is by SHAPE (an Image ⇒ a slide; a PaginationDots ⇒ the
 * controls row), not by literal Figma layer name — those names are Figma's
 * component-authoring convention (ItemPrev/ItemCurrent/…, paginationDotsWrapper)
 * and aren't a stable per-design signal. A slide's inner Text/Button/Icon
 * content is flattened into CarouselSlideContent's children rather than
 * precisely re-nested (e.g. a ButtonGroup wrapper) — an accepted fidelity gap
 * over losing the content outright.
 */
/**
 * PaginationDots is a standalone component (needs an explicit `count` prop,
 * not wired to CarouselContext) — inside a Carousel it must be
 * CarouselIndicatorList instead, which reads slide count/active index from
 * context. Recursively swaps any nested PaginationDots node in place.
 */
function replacePaginationDotsWithIndicator(node: RefinedNode): RefinedNode {
  if (isRefinedComponent(node, 'PaginationDots')) {
    const indicatorProps: Record<string, unknown> = {};
    if (node.kind === 'component' && typeof node.props?.appearance === 'string') {
      indicatorProps.appearance = node.props.appearance;
    }
    return {
      kind: 'component',
      component: 'CarouselIndicatorList',
      props: Object.keys(indicatorProps).length ? indicatorProps : undefined,
    };
  }
  if (node.children?.length) {
    return { ...node, children: node.children.map(replacePaginationDotsWithIndicator) };
  }
  return node;
}

function restructureCarousel(rows: RefinedNode[]): RefinedNode[] {
  const out: RefinedNode[] = [];
  const slides: RefinedNode[] = [];

  for (const row of rows) {
    // Figma sometimes provides a real ".CarouselControls/…" instance (now in
    // CONTAINERS, so its children survived the normal container-refine) —
    // trust its structure but still swap any nested PaginationDots for the
    // context-aware CarouselIndicatorList (see replacePaginationDotsWithIndicator).
    if (isRefinedComponent(row, 'CarouselControls')) {
      out.push(replacePaginationDotsWithIndicator(row));
      continue;
    }
    const dots = findFirstRefined(row, (n) => isRefinedComponent(n, 'PaginationDots'));
    if (dots) {
      const indicatorProps: Record<string, unknown> = {};
      if (dots.kind === 'component' && typeof dots.props?.appearance === 'string') {
        indicatorProps.appearance = dots.props.appearance;
      }
      out.push({
        kind: 'component',
        component: 'CarouselControls',
        props: { placement: 'below', layout: 'center' },
        children: [
          {
            kind: 'component',
            component: 'CarouselIndicatorList',
            props: Object.keys(indicatorProps).length ? indicatorProps : undefined,
          },
        ],
      });
      continue;
    }
    let sawSlide = false;
    for (const slideCandidate of row.children ?? []) {
      const image = findFirstRefined(slideCandidate, (n) => isRefinedComponent(n, 'Image'));
      if (!image) continue;
      const scrim = findFirstRefined(slideCandidate, (n) => isRefinedComponent(n, 'Scrim'));
      const badges = collectRefined(slideCandidate, (n) => isRefinedComponent(n, 'Badge'));

      const slideImage: RefinedNode = {
        kind: 'component',
        component: 'CarouselSlideImage',
        props: {
          ...(image.kind === 'component' ? image.props : undefined),
          ...(scrim ? { scrim: true } : {}),
        },
        box: image.kind === 'component' ? image.box : undefined,
        // Carried through so the later applyImageSources pass (which walks
        // the FINAL tree, after this restructure) can still backfill `src` —
        // this is a new node object, not the original `image` reference.
        assetId: image.kind === 'component' ? image.assetId : undefined,
      };

      const itemChildren: RefinedNode[] = [slideImage];
      if (badges.length) {
        itemChildren.push({
          kind: 'component',
          component: 'CarouselItemBadgeRow',
          props: { placement: 'start' },
          children: badges,
        });
      }

      const excluded = new Set<RefinedNode>([image, ...(scrim ? [scrim] : []), ...badges]);
      const contentChildren = collectRefined(
        slideCandidate,
        (n) => !excluded.has(n) && (isRefinedComponent(n, 'Text') || isRefinedComponent(n, 'Button')
          || isRefinedComponent(n, 'IconButton') || isRefinedComponent(n, 'Icon') || isRefinedComponent(n, 'Image')),
      );
      if (contentChildren.length) {
        itemChildren.push({
          kind: 'component',
          component: 'CarouselSlideContent',
          props: { alignment: 'startBottom', width: 'm' },
          children: contentChildren,
        });
      }

      slides.push({
        kind: 'component',
        component: 'CarouselItem',
        props: slideCandidate.kind === 'surface' ? { surface: slideCandidate.mode } : undefined,
        children: itemChildren,
      });
      sawSlide = true;
    }
    // Row didn't match the pagination-controls shape and yielded no slides
    // either — preserve it as-is rather than silently discarding its content
    // (e.g. an unanticipated Carousel chrome element some future design adds).
    if (!sawSlide && (row.children?.length ?? 0) > 0) out.push(row);
  }

  if (slides.length) out.unshift({ kind: 'component', component: 'CarouselRail', children: slides });
  return out;
}

/** A Figma-internal wrapper whose children should bubble up (no node of its own). */
function isTransparent(node: RawNode): boolean {
  const n = (node.name ?? '').trim();
  if (node.type === 'SLOT') return true;
  if (n.startsWith('.')) return true;
  if (/^slot\//i.test(n)) return true;
  return false;
}

function displayName(node: RawNode): string {
  const n = (node.component || node.name || node.type || 'node').replace(/^\.+/, '');
  return n.split('/').pop() || n;
}

/** Components that render icons (icon comes from the icon LIBRARY, never downloaded). */
const ICON_COMPONENTS = new Set(['icon', 'iconbutton', 'iconcontained']);

interface Ctx {
  reg: Map<string, string>;
  images: ImageAsset[];
}

function strProp(props: Record<string, unknown>, key: string): string | undefined {
  const v = props[key];
  return typeof v === 'string' ? v : undefined;
}

function refineChildren(kids: RawNode[] | undefined, ctx: Ctx, parentComponent: string | null): RefinedNode[] {
  const out: RefinedNode[] = [];
  for (const child of kids ?? []) {
    const r = refineNode(child, ctx, parentComponent);
    if (Array.isArray(r)) out.push(...r);
    else if (r) out.push(r);
  }
  return out;
}

/** Returns a RefinedNode, an array (when the node is transparent), or null. */
function refineNode(node: RawNode, ctx: Ctx, parentComponent: string | null): RefinedNode | RefinedNode[] | null {
  // Drop device-chrome frames (and their subtree) — the simulated status bar
  // ("9:41" + signal/wifi/battery "Levels") duplicates the real OS status bar.
  // Match on name regardless of node type — the status bar is often a reused
  // INSTANCE/COMPONENT, not a plain FRAME, so a FRAME-only guard misses it.
  const rawName = (node.name ?? '').trim();
  if (/^status\s*bar$/i.test(rawName) || /^levels$/i.test(rawName)) {
    return null;
  }

  const mapped = matchRegistered(node, ctx.reg);

  if (mapped) {
    // Collapse "Component > same Component" (e.g. a slot wrapper named like the component).
    if (mapped === parentComponent) {
      return refineChildren(node.children, ctx, parentComponent);
    }
    const out: RefinedNode = { kind: 'component', component: mapped, name: rawName || undefined };
    if (node.appearance) out.appearance = node.appearance;
    if (node.surface) out.surface = node.surface;
    // BottomNavigation's active tab is a brand-colour affordance by convention —
    // the resolved Figma appearance mode is just whatever the ambient page mode
    // was (usually "neutral"), with no signal distinguishing "explicitly set"
    // from "inherited default". Override to the sane default so the tab bar
    // doesn't render all-neutral.
    if (mapped === 'BottomNavigation') out.appearance = 'primary';
    let props = cleanProps(node.props) ?? {};
    // Some Figma library components (e.g. Header.Item) carry their real
    // componentProperties on a nested "." variant-wrapper instance rather
    // than on the matched node itself — the matched node's own props come
    // back empty in that case.
    if (Object.keys(props).length === 0) {
      const nested = cleanProps(harvestNestedProps(node));
      if (nested) props = nested;
    }
    const isContainer = CONTAINERS.has(mapped.toLowerCase());
    const isInputLike = mapped === 'Input' || mapped === 'InputField';
    if (isInputLike) {
      // Input is a LEAF (its internal layers are implementation), InputField is
      // a CONTAINER (it composes a visible label/feedback stack) — but both
      // share the same leading-icon-glyph + placeholder-text harvesting need,
      // since those Figma-internal layers are equally invisible-as-children
      // either way. Harvested via the same `icon` prop key the plain-leaf path
      // + codegen's icon resolver use — codegen maps Input/InputField's `icon`
      // prop to the `start` slot (a ReactNode), not a direct icon-component ref.
      const icon = harvestIcon(node);
      if (icon && !('icon' in props)) props.icon = icon;
      const placeholder = harvestText(node);
      if (placeholder && !('placeholder' in props)) props.placeholder = placeholder;
    } else if (!isContainer) {
      // Leaf component: drop internal implementation children, but harvest the
      // icon glyph name so codegen can wire the icon to the icon LIBRARY.
      const icon = harvestIcon(node);
      if (icon && !('icon' in props)) props.icon = icon;
    }
    if (mapped === 'PrimaryNav') {
      // PrimaryNav has NO `children` prop — real content is passed via
      // startSlot/avatarSlot/endSlot. The Figma library component structures
      // this as a "Row 1" wrapper with named "start"/"end" child frames (an
      // avatar living among the "end" content routes to avatarSlot instead).
      const slots: Record<string, RefinedNode[]> = {};
      const rowStart = findNamedChild(node, 'start');
      if (rowStart?.children?.length) {
        const startSlot = refineChildren(rowStart.children, ctx, mapped);
        if (startSlot.length) {
          slots.startSlot = startSlot;
          // Figma's own `start` boolean componentProperty is an unreliable
          // signal here (seen `false` on instances that visibly show a logo) —
          // real slot content found is the authoritative signal to show it.
          props.start = true;
        }
      }
      const rowEnd = findNamedChild(node, 'end');
      if (rowEnd?.children?.length) {
        const endRefined = refineChildren(rowEnd.children, ctx, mapped);
        const isAvatar = (c: RefinedNode) => c.kind === 'component' && c.component === 'Avatar';
        const avatarChildren = endRefined.filter(isAvatar);
        const otherChildren = endRefined.filter((c) => !isAvatar(c));
        if (avatarChildren.length) {
          slots.avatarSlot = avatarChildren;
          props.avatar = true;
        }
        if (otherChildren.length) {
          slots.endSlot = otherChildren;
          props.end = true;
        }
      }
      if (Object.keys(slots).length) out.slots = slots;
    }
    if (isContainer) {
      let children = refineChildren(node.children, ctx, mapped);
      // BottomNavigation is a tablist: it must contain ONLY BottomNavigationItem.
      // Figma's nav frame also holds a top border line (a Divider/Separator) —
      // drop any non-item children so they don't break the bar's layout.
      if (mapped === 'BottomNavigation') {
        children = children.filter(
          (c) => c.kind === 'component' && c.component === 'BottomNavigationItem',
        );
      }
      // Carousel's Figma slide anatomy (ItemPrev/ItemCurrent/ItemNext, badge
      // row, content overlay…) is plain frames, not registered sub-component
      // instances — the generic container-refine above already produced a
      // Container/Surface/Image/Badge/Text tree. Restructure THAT into the
      // real compound API (CarouselRail > CarouselItem […] + CarouselControls
      // > CarouselIndicatorList) by content shape, not by literal layer name.
      if (mapped === 'Carousel') {
        children = restructureCarousel(children);
      }
      if (children.length) out.children = children;
    }
    if (Object.keys(props).length) out.props = props;

    // Text content: a OneUI Text component carries its copy in an inner TEXT layer.
    // Harvest it so codegen emits <Text>…</Text> instead of an empty self-closing tag.
    // Button is harvested too: its real label (e.g. "View all") lives in an inner
    // TEXT layer, while the `label` componentProperty is often the Figma default
    // placeholder "Button" — codegen prefers the harvested text in that case.
    if (mapped === 'Text' || mapped === 'Button' || mapped === 'HeaderItem') {
      // HeaderItem's label lives on the harvested componentProperty (`label`),
      // not an inner TEXT layer — prefer it before falling back to chars/harvestText.
      const labelProp = mapped === 'HeaderItem' ? strProp(props, 'label') : undefined;
      const t = labelProp
        ?? ((typeof node.chars === 'string' && node.chars.trim()) ? node.chars.trim() : harvestText(node));
      if (t) out.text = t;
      // A Text rendered as a registered INSTANCE (not a bare TEXT node) still
      // carries real font info on the raw node — without this, typographyToTextProps
      // never fires and the Text renders flat (variant/size/weight all default).
      if (mapped === 'Text' && node.typography) out.typography = node.typography;
      if (mapped === 'HeaderItem') {
        // `label` becomes `children` (out.text above), not a JSX prop.
        delete props.label;
        // `value` is required but Figma has no equivalent — derive a stable
        // id from the label so codegen doesn't emit an invalid/empty value.
        if (!strProp(props, 'value') && t) props.value = slugify(t);
      }
    }

    // Image content (photographic/raster) → mark for download. NEVER icons.
    // Logo wordmarks are also raster/vector brand marks (not icon-library glyphs),
    // so they need the same download treatment as Image/Avatar — otherwise codegen
    // emits a Logo with no src/svgContent and it silently renders blank.
    const isIcon = ICON_COMPONENTS.has(mapped.toLowerCase());
    const wantsImage =
      !isIcon &&
      (mapped === 'Image' ||
        mapped === 'Logo' ||
        (mapped === 'Avatar' && strProp(props, 'content') === 'image') ||
        node.image === true);
    if (wantsImage && node.id) {
      out.assetId = node.id;
      ctx.images.push({ id: node.id, component: mapped, alt: strProp(props, 'altText') ?? strProp(props, 'alt') });
    }
    // Geometry/sizing for every component (Logo/Input/Image…) so codegen can
    // size + fill them. Image uses w/h+aspectRatio; others use fill → flex.
    const box = mapBox(node);
    if (box) out.box = box;
    // Placement (cornerRadius/absoluteBox) — mostly informational for the agent flow.
    const layout = mapLayout(node.layout);
    if (layout) out.layout = layout;
    return out;
  }

  // Raw TEXT node (not a registered component) → render its copy as <Text>…</Text>
  // so headings, product names, prices, etc. survive into the generated screen.
  if (node.type === 'TEXT' && typeof node.chars === 'string' && node.chars.trim()) {
    const out: RefinedNode = { kind: 'component', component: 'Text', text: node.chars.trim() };
    if (node.appearance) out.appearance = node.appearance;
    if (node.typography) out.typography = node.typography;
    return out;
  }

  // Surface-frame rule: a frame whose own (explicit) override sets a surface,
  // and which is NOT a registered component → render as <Surface mode=…>.
  const surfaceOverride = node.type === 'FRAME' ? node.modeOverrides?.surface : undefined;
  if (surfaceOverride) {
    const children = refineChildren(node.children, ctx, parentComponent);
    // An unmapped component (e.g. a segmented control) with no keepable inner
    // content refines to zero children. Rendering it anyway produces a
    // childless <Surface> that codegen may pin to a fixed, overflow-clipped
    // width (see sizeStyleStr) — a decorative box with no content that visually
    // hides adjacent siblings instead of just doing nothing. Drop it: an absent
    // node is a smaller regression than one that clips its neighbours.
    if (children.length === 0) return [];
    const out: RefinedNode = { kind: 'surface', mode: surfaceOverride };
    const layout = mapLayout(node.layout);
    if (layout) out.layout = layout;
    const box = mapBox(node);
    if (box) out.box = box;
    out.children = children;
    return out;
  }

  // Figma-internal wrappers: bubble children up.
  if (isTransparent(node)) {
    return refineChildren(node.children, ctx, parentComponent);
  }

  // Other components/containers: keep name + layout, preserve hierarchy.
  const children = refineChildren(node.children, ctx, parentComponent);
  const out: RefinedNode = { kind: 'node', name: displayName(node) };
  let layout = mapLayout(node.layout);
  // Infer a horizontal tab/nav row when a non-auto-layout frame is wide+short
  // with all-Text children (Figma sometimes positions tabs absolutely).
  if (looksLikeHorizontalNav(layout, children)) {
    layout = { ...(layout ?? {}), direction: 'row', justify: 'between', align: 'center' };
  }
  if (layout) out.layout = layout;
  const box = mapBox(node);
  if (box) out.box = box;
  // Group hand-positioned horizontal sibling runs (e.g. a tab bar) into an
  // inferred row, unless this node already arranges its children in a row.
  const kids = layout?.direction === 'row' ? children : groupHorizontalRuns(children);
  if (kids.length) out.children = kids;
  return out;
}

export interface RefineResult {
  base?: Record<string, string>;
  tree: RefinedNode | null;
  /** Image assets to render+download. Empty when the frame has no images. */
  images: ImageAsset[];
}

/**
 * Refine a raw extraction payload ({ base?, tree }) into the TSX-ready tree,
 * collecting any image assets (icons excluded — they come from the icon library).
 */
export function refineExtraction(
  raw: { base?: Record<string, string>; tree?: RawNode | null } | null | undefined,
  platform: PlatformId = 'reactnative',
): RefineResult {
  const ctx: Ctx = { reg: registeredComponentMap(platform), images: [] };
  if (!raw?.tree) return { base: raw?.base, tree: null, images: [] };
  const r = refineNode(raw.tree, ctx, null);
  let tree: RefinedNode | null;
  if (Array.isArray(r)) tree = r.length === 1 ? r[0] : { kind: 'node', name: 'root', children: r };
  else tree = r;
  return { base: raw.base, tree, images: ctx.images };
}

/** Walk the refined tree, setting props.src on nodes whose assetId is in the map. */
export function applyImageSources(tree: RefinedNode | null, byId: Map<string, string>): void {
  if (!tree) return;
  if (tree.kind === 'component' && tree.assetId && byId.has(tree.assetId)) {
    tree.props = { ...(tree.props ?? {}), src: byId.get(tree.assetId) };
    delete tree.assetId;
  }
  for (const child of tree.children ?? []) applyImageSources(child, byId);
  if (tree.kind === 'component' && tree.slots) {
    for (const slotChildren of Object.values(tree.slots)) {
      for (const child of slotChildren) applyImageSources(child, byId);
    }
  }
}
