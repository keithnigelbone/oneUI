/**
 * svgCleanup.ts
 *
 * Shared post-processing for exported SVGs.
 *
 * Two consumers:
 *   1. ComponentShape.toSvg() — applied to each component's dom-to-svg output
 *      before it gets embedded into the tldraw export.
 *   2. ExperienceCanvas.handleExport() — applied to the final tldraw-emitted
 *      SVG string after editor.getSvgString() returns. Catches noise that
 *      ComponentShape can't reach (tldraw's per-shape clipPath wrappers,
 *      stale aria/data attributes, redundant background rects, etc.).
 *
 * Goal: produce clean, layered SVGs that import into Figma / Illustrator
 * without dozens of "div1", "Group", "Clip path group" phantom layers and
 * without phantom background rectangles for elements that have no fill.
 */

const TRANSPARENT_FILL_VALUES = new Set([
  '',
  'none',
  'transparent',
  'rgba(0, 0, 0, 0)',
  'rgba(0,0,0,0)',
]);

/**
 * Matches `next/font`'s synthesized family names. Two forms exist:
 *   - Real face:    `__Inter_e8ce0c`            → captured group: `Inter`
 *   - Fallback face:`__Inter_Fallback_e8ce0c`   → captured group: `Inter`
 *                                                 PLUS isFallback === true
 *
 * `next/font` always emits both: the real one binds the actual woff2 src,
 * and the fallback one declares only `local('Arial')` plus
 * ascent/descent/line-gap overrides used to keep layout stable while the
 * real font is downloading. Neither is editable in Figma — they show up as
 * `__Inter_e8ce0c` in the typography panel and don't match anything in
 * the user's font library, which is exactly the problem we're fixing.
 *
 * Other CSS-in-JS runtimes (styled-components, emotion, vanilla-extract)
 * use their own naming schemes — none collide with this `__Name_hash`
 * shape so it's safe to scope our regex narrowly.
 */
const NEXT_FONT_HASHED_RE = /^__([A-Za-z][A-Za-z0-9]*)_(?:Fallback_)?[A-Za-z0-9]+$/;
const NEXT_FONT_FALLBACK_TOKEN_RE = /^__([A-Za-z][A-Za-z0-9]*)_Fallback_[A-Za-z0-9]+$/;

/** Strip surrounding single/double quotes from a CSS family token. */
function unquoteFamily(value: string): string {
  return value.replace(/^["']|["']$/g, '');
}

/**
 * Map `next/font`'s hashed family name back to its source face name.
 * `__Inter_e8ce0c`            → `Inter`
 * `__Inter_Fallback_e8ce0c`   → `Inter`
 * Anything else                → null (caller leaves the value as-is).
 */
function unhashNextFontFamily(rawFamily: string): string | null {
  const m = rawFamily.match(NEXT_FONT_HASHED_RE);
  return m ? m[1] : null;
}

/**
 * Normalize a comma-separated CSS `font-family` value:
 *   - Drops every `__Name_Fallback_hash` entry (they only exist for
 *     pre-load metric stability and never resolve to a usable font).
 *   - Replaces every `__Name_hash` entry with `Name`.
 *   - Wraps multi-word names in double quotes; bare names stay bare.
 *
 * Preserves the order and the trailing generic fallbacks
 * (`sans-serif`, `system-ui`, `monospace`, etc.).
 */
function normalizeFontFamilyValue(value: string): string {
  const out: string[] = [];
  for (const raw of value.split(',')) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const unq = unquoteFamily(trimmed);
    if (NEXT_FONT_FALLBACK_TOKEN_RE.test(unq)) continue; // drop fallback faces
    const cleanName = unhashNextFontFamily(unq);
    const finalName = cleanName ?? unq;
    if (finalName !== unq || /\s/.test(finalName)) {
      out.push(`"${finalName}"`);
    } else if (trimmed !== unq) {
      // Preserve original quoting style on identifiers that were already
      // quoted but didn't get renamed.
      out.push(trimmed);
    } else {
      out.push(finalName);
    }
  }
  return out.join(', ');
}

/**
 * Walk every `<text>` / `<tspan>` (and any element carrying an explicit
 * `font-family` attribute) and rewrite the value via
 * `normalizeFontFamilyValue`. dom-to-svg copies the COMPUTED font-family
 * onto each text element verbatim, so without this pass every imported
 * SVG carries `__Inter_<hash>` references that are unmatched by both
 * Figma's font library and the user's local fonts.
 */
function normalizeFontFamilyAttributes(root: Element): void {
  root.querySelectorAll('[font-family]').forEach((el) => {
    const value = el.getAttribute('font-family');
    if (!value) return;
    const normalized = normalizeFontFamilyValue(value);
    if (normalized) el.setAttribute('font-family', normalized);
    else el.removeAttribute('font-family');
  });
}

/**
 * Walk every `<style>` element and:
 *   1. Drop entire `@font-face { ... }` blocks whose `font-family`
 *      descriptor is a `Fallback` synthetic — keeping them would shadow
 *      the real face after rename and Figma would pick up a face whose
 *      `src` is `local('Arial')` only.
 *   2. Rename surviving `__Name_hash` family descriptors to `Name`.
 *   3. Rename any inline `font-family` declaration in non-@font-face
 *      rules (rare, but happens when a stylesheet sets a class style).
 *
 * Implemented with regex on the style text rather than re-parsing — we
 * already serialize-deserialize the SVG once per export, and these
 * transforms are mechanical enough that a parser would add cost without
 * adding correctness.
 */
function normalizeFontFaceBlocks(root: Element): void {
  const FONT_FACE_RE = /@font-face\s*\{([^{}]*)\}/g;
  const FAMILY_DECL_RE = /font-family\s*:\s*(['"]?)([^;'"\}]+)\1\s*;?/g;

  root.querySelectorAll('style').forEach((style) => {
    const original = style.textContent ?? '';
    if (!original) return;

    // Drop synthetic fallback @font-face blocks first.
    const culled = original.replace(FONT_FACE_RE, (block, body: string) => {
      const familyMatch = /font-family\s*:\s*(['"]?)([^;'"\}]+)\1/.exec(body);
      if (!familyMatch) return block;
      const family = unquoteFamily(familyMatch[2].trim());
      if (NEXT_FONT_FALLBACK_TOKEN_RE.test(family)) return ''; // drop block
      return block;
    });

    // Rename every `font-family: __Name_hash` → `font-family: "Name"`.
    const renamed = culled.replace(FAMILY_DECL_RE, (_full, _q: string, name: string) => {
      const trimmed = name.trim();
      const cleanName = unhashNextFontFamily(unquoteFamily(trimmed));
      if (!cleanName) return _full;
      return `font-family: "${cleanName}";`;
    });

    if (renamed !== original) style.textContent = renamed;
  });
}

/**
 * Debug attributes added by dom-to-svg + by tldraw's React render pipeline.
 * None of these affect rendering — they're metadata/dev affordances.
 */
const NOISE_ATTRIBUTES = [
  'data-tag',
  'data-z-index',
  'data-pseudo-element',
  'data-pseudo-element-owner',
  'data-view-box',
  'data-width',
  'data-height',
  'data-src',
  'data-shape-id',
  'data-shape-type',
  'data-testid',
  'data-component-type',
  'data-component-type-label',
  'data-tldraw-export-skip',
  'data-cb-field',
  'data-surface',
  'data-oneui-subbrand',
  'data-color-mode',
  'aria-owns',
  'aria-label',
  'aria-busy',
  'aria-disabled',
  'aria-hidden',
  'role',
  'nonce',
];

/**
 * Stacking-layer class names dom-to-svg attaches to internal grouping `<g>`
 * elements. They have no rendering effect outside dom-to-svg's own pipeline.
 */
const STACKING_LAYER_CLASSES = new Set([
  'root-background-and-borders',
  'negative-z-index-stacking-contexts-and-containers',
  'in-flow-non-positioned-floating',
  'in-flow-non-inline-non-positioned-descendants',
  'in-flow-inline-level-non-positioned-descendants',
  'in-flow-non-positioned-block-level',
  'in-flow-non-positioned-inline-level',
  'positioned-descendants-non-positive-non-floating-descendants',
  'positive-z-index-stacking-contexts-and-containers',
  'tl-container',
  'tl-theme__force-sRGB',
  'tl-theme__light',
  'tl-theme__dark',
  'tl-shape',
  'tl-shape-background',
  'tl-shape-foreign-object',
  'tl-export-embed-styles',
]);

/**
 * IDs auto-generated by dom-to-svg follow the pattern `<tagOrClass><digits>`.
 * Strip these unless they're referenced by a `url(#…)` or `xlink:href="#…"`
 * elsewhere in the SVG (in which case removing them would break gradients,
 * masks, clip paths, or filters).
 */
function collectReferencedIds(svgRoot: Element): Set<string> {
  const referenced = new Set<string>();

  // Walk every attribute on every element looking for url(#id) and #id refs.
  const all = svgRoot.querySelectorAll('*');
  for (const el of Array.from(all)) {
    for (const attr of Array.from(el.attributes)) {
      const v = attr.value;
      if (!v) continue;
      // url(#id), url("#id"), url('#id')
      const urlMatches = v.matchAll(/url\(['"]?#([^)'"]+)['"]?\)/g);
      for (const m of urlMatches) referenced.add(m[1]);
      // href="#id" / xlink:href="#id"
      if (
        (attr.name === 'href' || attr.name === 'xlink:href') &&
        v.startsWith('#')
      ) {
        referenced.add(v.slice(1));
      }
    }
  }
  return referenced;
}

/**
 * Returns true if `id` looks like dom-to-svg's auto-generated id (something
 * like `div12`, `span3`, `JioRibbon-module__abc__svg1`, `g7`). Real
 * developer-set ids without trailing digits are preserved.
 */
function isAutoGeneratedId(id: string): boolean {
  if (!id) return false;
  // Strip trailing digits and check if anything meaningful remains; if the
  // base resembles a tag/class slug, treat as generated.
  return /[a-zA-Z_-][\w-]*\d+$/.test(id);
}

/**
 * Remove a `<g>` element while preserving its children — splice them into
 * the parent at the same position.
 */
function unwrap(el: Element): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

/**
 * Parse a `transform` value and extract the (x, y) translation if it is
 * purely a translate. Returns null for compound transforms (rotate, scale,
 * skew, matrix with non-identity rotation/scale) — those are NOT safe to
 * combine without proper matrix multiplication.
 */
function parseTranslate(value: string | null): { x: number; y: number } | null {
  if (!value) return { x: 0, y: 0 };
  const v = value.trim();
  if (!v) return { x: 0, y: 0 };

  // translate(x), translate(x, y), translate(x y)
  const t = v.match(/^translate\(\s*(-?[\d.]+)\s*[, ]?\s*(-?[\d.]+)?\s*\)$/);
  if (t) {
    const x = parseFloat(t[1]);
    const y = t[2] !== undefined ? parseFloat(t[2]) : 0;
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }

  // matrix(a, b, c, d, e, f) — only safe to treat as translate if a=d=1, b=c=0
  const m = v.match(
    /^matrix\(\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*\)$/,
  );
  if (m) {
    const [, a, b, c, d, e, f] = m.map(parseFloat);
    if (a === 1 && b === 0 && c === 0 && d === 1) {
      return { x: e, y: f };
    }
  }

  return null;
}

function formatTranslate(x: number, y: number): string | null {
  // Round to 4 decimals to avoid floating-point noise like 104.66552448366927.
  const rx = Math.round(x * 10000) / 10000;
  const ry = Math.round(y * 10000) / 10000;
  if (rx === 0 && ry === 0) return null; // identity → no transform attr needed
  if (ry === 0) return `translate(${rx})`;
  return `translate(${rx} ${ry})`;
}

/**
 * Strip identity translate transforms (`translate(0)`, `translate(0,0)`,
 * `matrix(1,0,0,1,0,0)`). After this pass many wrappers become eligible
 * for collapse via the single-child unwrap step.
 */
function stripIdentityTransforms(root: Element): void {
  root.querySelectorAll('[transform]').forEach((el) => {
    const t = parseTranslate(el.getAttribute('transform'));
    if (t && t.x === 0 && t.y === 0) el.removeAttribute('transform');
  });
}

/**
 * Collapse parent → single-child `<g>` chains where BOTH carry only a
 * translate transform. Merges the translates by addition and drops one
 * level. Runs until fixed point. Safe because translation composes by
 * vector addition.
 *
 * Also handles the case where the parent has a translate and the child
 * has no transform: the translate moves down to the child, then the
 * empty parent is unwrapped on the next pass.
 */
function mergeNestedTranslates(root: Element): void {
  const isStructuralG = (el: Element): boolean => {
    if (el.tagName.toLowerCase() !== 'g') return false;
    // Only safe to merge if NO presentation attrs other than transform live
    // on the parent. mask/clip-path/filter/opacity/style would change the
    // rendered result if hoisted.
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name;
      if (name === 'transform') continue;
      // Safe to ignore noise attrs we strip elsewhere; if any meaningful
      // attr exists, bail.
      if (
        name === 'mask' ||
        name === 'clip-path' ||
        name === 'filter' ||
        name === 'opacity' ||
        name === 'style' ||
        name === 'fill' ||
        name === 'stroke' ||
        name === 'stroke-width' ||
        name === 'fill-opacity' ||
        name === 'stroke-opacity'
      ) {
        return false;
      }
    }
    return true;
  };

  for (let pass = 0; pass < 16; pass++) {
    let changed = false;
    Array.from(root.querySelectorAll('g')).forEach((parent) => {
      if (parent.children.length !== 1 || parent.childNodes.length !== 1) return;
      if (!isStructuralG(parent)) return;
      const child = parent.children[0];
      if (child.tagName.toLowerCase() !== 'g') return;

      const parentT = parseTranslate(parent.getAttribute('transform'));
      const childT = parseTranslate(child.getAttribute('transform'));
      // Only merge when BOTH transforms are pure translates (or absent).
      if (!parentT || !childT) return;

      const sum = formatTranslate(parentT.x + childT.x, parentT.y + childT.y);
      if (sum) child.setAttribute('transform', sum);
      else child.removeAttribute('transform');
      // Move the child up to replace the parent.
      parent.parentNode?.insertBefore(child, parent);
      parent.parentNode?.removeChild(parent);
      changed = true;
    });
    if (!changed) break;
  }
}

/**
 * Hoist a parent `<g transform="translate(x,y)">`'s translate into its
 * single child when that child has no transform attribute (and is itself
 * a structural g eligible for further collapse). After hoisting the
 * empty parent gets unwrapped by the recursive collapse step below.
 *
 * This catches cases like `<g transform="translate(72,72)" class="…">
 * <g class="…"><rect/></g></g>` where the outer wrapper carries the
 * positioning info needed by the visible element down the tree.
 */
function hoistTranslateIntoChildG(root: Element): void {
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    Array.from(root.querySelectorAll('g[transform]')).forEach((parent) => {
      if (parent.children.length !== 1 || parent.childNodes.length !== 1) return;
      const child = parent.children[0];
      if (child.tagName.toLowerCase() !== 'g') return;
      if (child.hasAttribute('transform')) return;

      const t = parseTranslate(parent.getAttribute('transform'));
      if (!t || (t.x === 0 && t.y === 0)) return;
      // Don't hoist if parent has any attribute other than transform that
      // would be lost (we already gate isStructuralG-style elsewhere, but
      // this function is more permissive — only the transform is moved).
      // Move the transform.
      const formatted = formatTranslate(t.x, t.y);
      if (formatted) child.setAttribute('transform', formatted);
      parent.removeAttribute('transform');
      changed = true;
    });
    if (!changed) break;
  }
}

/**
 * Drop any `<rect>` that exactly covers the supplied viewBox (or the
 * SVG root's natural bounds) at position (0, 0). dom-to-svg emits a
 * full-cover background rect for the root captured element whenever
 * its computed `background-color` is non-transparent — even when the
 * clone has been forced transparent inline, descendant elements with
 * brand-resolved bg colors can leak through and recreate the issue.
 * Stripping the cover-all rect is the canonical way to guarantee the
 * embedded `<svg>` stays fill-less so Figma doesn't paint the
 * containing Frame.
 */
function stripFullCoverRects(
  root: Element,
  viewBox: { width: number; height: number } | null,
): void {
  if (!viewBox) return;
  const { width, height } = viewBox;
  if (!(width > 0) || !(height > 0)) return;
  const tol = Math.max(0.5, Math.min(width, height) * 0.001);
  root.querySelectorAll('rect').forEach((rect) => {
    const x = parseFloat(rect.getAttribute('x') ?? '0');
    const y = parseFloat(rect.getAttribute('y') ?? '0');
    const w = parseFloat(rect.getAttribute('width') ?? '0');
    const h = parseFloat(rect.getAttribute('height') ?? '0');
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    const stroke = (rect.getAttribute('stroke') ?? '').trim();
    const hasStroke = !!stroke && !TRANSPARENT_FILL_VALUES.has(stroke) && rect.getAttribute('stroke-width') !== '0';
    if (hasStroke) return;
    if (
      Math.abs(x) <= tol &&
      Math.abs(y) <= tol &&
      Math.abs(w - width) <= tol &&
      Math.abs(h - height) <= tol
    ) {
      rect.remove();
    }
  });
}

/**
 * Apply all cleanup passes to an SVG subtree. Mutates in place.
 *
 * @param root  The element to clean up (an `<svg>` root or any subtree).
 * @param opts  Options:
 *   - `dropClipPathGroups`: when true, removes `<clipPath>` defs whose only
 *     child is a `<path>` that traces the full bounding box (these are
 *     tldraw's per-shape frame-bound clip paths — visually no-ops).
 *   - `dropFullCoverRects`: when set, also strips `<rect>` elements that
 *     exactly cover the supplied viewBox. Use for per-component capture
 *     where dom-to-svg may emit a phantom background rect.
 */
export function cleanSvgTree(
  root: Element,
  opts: {
    dropClipPathGroups?: boolean;
    dropFullCoverRects?: { width: number; height: number } | null;
  } = {},
): void {
  // 1. Collect referenced ids BEFORE we strip anything; we need these to
  //    avoid breaking gradients/masks/clipPaths/filters.
  const referencedIds = collectReferencedIds(root);

  // 2. Strip noise attributes + auto-generated ids + stacking-layer classes
  //    from every element.
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of NOISE_ATTRIBUTES) {
      if (el.hasAttribute(attr)) el.removeAttribute(attr);
    }
    // ID: drop if auto-generated AND not referenced anywhere.
    const idAttr = el.getAttribute('id');
    if (idAttr && isAutoGeneratedId(idAttr) && !referencedIds.has(idAttr)) {
      el.removeAttribute('id');
    }
    // Class: filter out stacking-layer classes; if nothing meaningful
    // remains, drop the attribute entirely. CSS-module classes (e.g.
    // `JioRibbon-module__jNukoa__svg1`) are also stripped — they have no
    // styling effect once exported and just create noisy layer names.
    const cls = el.getAttribute('class');
    if (cls) {
      const cleaned = cls
        .split(/\s+/)
        .filter((c) => {
          if (!c) return false;
          if (STACKING_LAYER_CLASSES.has(c)) return false;
          // CSS-module hashes look like `Component-module__hash__name`.
          if (/-module__[\w-]+__/.test(c)) return false;
          // tldraw internal classes
          if (c.startsWith('tl-')) return false;
          return true;
        })
        .join(' ')
        .trim();
      if (cleaned) el.setAttribute('class', cleaned);
      else el.removeAttribute('class');
    }
  });

  // 2b. Drop full-cover background rects for the captured root. dom-to-svg
  //     emits these whenever ANY ancestor/descendant chain produces a
  //     non-transparent computed background-color — e.g. brand CSS rules
  //     resolving `--Brand-Bg-Default` on a `[data-surface]` ancestor.
  //     Removing the cover rect keeps the embedded <svg> fill-less so
  //     Figma doesn't paint the containing Frame with that color.
  if (opts.dropFullCoverRects) {
    stripFullCoverRects(root, opts.dropFullCoverRects);
  }

  // 3. Drop rects that contribute nothing (no visible fill, no stroke, no
  //    referenced fill via url(...)). These are dom-to-svg's empty
  //    background boxes for divs without a background.
  root.querySelectorAll('rect').forEach((rect) => {
    const fill = (rect.getAttribute('fill') ?? '').trim();
    const stroke = (rect.getAttribute('stroke') ?? '').trim();
    const hasUrlFill = fill.startsWith('url(');
    const hasFill = hasUrlFill || (!!fill && !TRANSPARENT_FILL_VALUES.has(fill));
    const hasStroke =
      !!stroke &&
      !TRANSPARENT_FILL_VALUES.has(stroke) &&
      rect.getAttribute('stroke-width') !== '0';
    if (!hasFill && !hasStroke) rect.remove();
  });

  // 4. Drop unreferenced <mask>, <clipPath>, <linearGradient>,
  //    <radialGradient>, <pattern>, <filter> defs.
  const refsAfterRectRemoval = collectReferencedIds(root);
  ['mask', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'filter'].forEach(
    (tag) => {
      root.querySelectorAll(tag).forEach((def) => {
        if (def.id && !refsAfterRectRemoval.has(def.id)) def.remove();
      });
    },
  );

  // 5. Optionally drop `<clipPath>`s whose path is just a full-bounds
  //    rectangle — these are tldraw's per-shape frame clips that don't
  //    actually clip anything visible (the frame already clips). Also
  //    unwrap the `<g clip-path="url(#…)">` that referenced them.
  if (opts.dropClipPathGroups) {
    const clipsToRemove = new Set<string>();
    root.querySelectorAll('clipPath').forEach((cp) => {
      const id = cp.id;
      if (!id) return;
      // A "trivial" frame clip has exactly one `<path>` child describing a
      // rectangle (M…L…L…L…Z, 4 points). Detection isn't perfect but works
      // for tldraw's emitted clips.
      const children = Array.from(cp.children);
      if (children.length !== 1) return;
      const path = children[0];
      if (path.tagName.toLowerCase() !== 'path') return;
      const d = path.getAttribute('d') ?? '';
      // tldraw emits `M{x},{y}L{x},{y}L{x},{y}L{x},{y}Z` — five segments,
      // four corners. Detect by counting commas or "L" segments.
      const lSegments = (d.match(/L/g) ?? []).length;
      const mSegments = (d.match(/M/g) ?? []).length;
      if (mSegments === 1 && lSegments === 3 && d.endsWith('Z')) {
        clipsToRemove.add(id);
      }
    });
    if (clipsToRemove.size > 0) {
      // Unwrap any `<g clip-path="url(#id)">` wrappers that reference these.
      root.querySelectorAll('g[clip-path]').forEach((g) => {
        const cp = g.getAttribute('clip-path') ?? '';
        const m = cp.match(/url\(['"]?#([^)'"]+)['"]?\)/);
        if (!m) return;
        if (clipsToRemove.has(m[1])) {
          g.removeAttribute('clip-path');
        }
      });
      // Now remove the clip path defs themselves.
      clipsToRemove.forEach((id) => {
        const def = root.querySelector(`clipPath#${CSS.escape(id)}`);
        if (def) def.remove();
      });
    }
  }

  // 5b. Strip identity translate transforms (`translate(0,0)`,
  //     `matrix(1,0,0,1,0,0)`) so subsequent collapse passes can unwrap
  //     the wrappers cleanly.
  stripIdentityTransforms(root);

  // 5c. Merge nested single-child `<g transform="translate(...)">` chains.
  //     dom-to-svg emits one `<g translate>` per nested div in the React
  //     tree; collapsing them yields a flat layer tree in Figma.
  mergeNestedTranslates(root);

  // 5d. Hoist a sole-child translate into the inner `<g>` so the empty
  //     wrapper can be unwrapped by step 6.
  hoistTranslateIntoChildG(root);

  // 6. Recursively remove empty `<g>`/`<defs>` AND collapse single-child
  //    `<g>` wrappers that have no meaningful presentation attributes.
  //    Multiple passes catch nested nesting in one go. Re-run the
  //    translate merger between passes — unwrapping a child can create
  //    new merge-able pairs.
  for (let pass = 0; pass < 16; pass++) {
    let changed = false;
    Array.from(root.querySelectorAll('g, defs')).forEach((g) => {
      // Remove if empty.
      if (g.childNodes.length === 0) {
        if (
          !g.hasAttribute('transform') &&
          !g.hasAttribute('mask') &&
          !g.hasAttribute('clip-path') &&
          !g.hasAttribute('filter') &&
          !g.hasAttribute('opacity')
        ) {
          g.remove();
          changed = true;
          return;
        }
      }
      // Collapse single-child <g> wrappers that carry NO presentation
      // attributes (i.e. they're pure structural noise).
      if (
        g.tagName.toLowerCase() === 'g' &&
        g.children.length === 1 &&
        g.childNodes.length === g.children.length && // no text nodes
        !g.hasAttribute('transform') &&
        !g.hasAttribute('mask') &&
        !g.hasAttribute('clip-path') &&
        !g.hasAttribute('filter') &&
        !g.hasAttribute('opacity') &&
        !g.hasAttribute('id') &&
        !g.hasAttribute('class')
      ) {
        unwrap(g);
        changed = true;
      }
    });
    if (changed) {
      // Unwrapping may have exposed new merge candidates.
      mergeNestedTranslates(root);
      hoistTranslateIntoChildG(root);
    } else {
      break;
    }
  }

  // 6b. Normalize `next/font`'s hashed family names back to their human
  //     names so Figma matches the imported `<text>` against the embedded
  //     `@font-face` (and against the user's font library). Runs BEFORE the
  //     empty-style cleanup so blocks we drop here can be removed in 7.
  normalizeFontFaceBlocks(root);
  normalizeFontFamilyAttributes(root);

  // 7. Drop empty `<style>` and `<defs>` elements left over from previous
  //    passes (font inlining + font-face culling can leave empty rules behind).
  root.querySelectorAll('style').forEach((el) => {
    if (!(el.textContent ?? '').trim()) el.remove();
  });
  root.querySelectorAll('defs').forEach((el) => {
    if (el.children.length === 0) el.remove();
  });
}

/**
 * Parse an SVG string, clean it, and return the cleaned XML string.
 * Use for the FINAL exported SVG (post-tldraw). Intentionally enables
 * `dropClipPathGroups: true` here because tldraw wraps every shape inside
 * a frame in a redundant per-shape clip path, all sized to the frame.
 */
export function cleanFinalSvgString(svg: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return svg;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() === 'parsererror') return svg;
    cleanSvgTree(root, { dropClipPathGroups: true });
    // Strip tldraw's default theme bg-color from the root <svg>'s `style`
    // attribute. The artboard's actual background is already supplied by
    // `OneUIFrameShapeUtil.toSvg()` (when "Include background" is on)
    // so the duplicate inline-style fill on the outer <svg> just shows
    // up in Figma as a redundant Frame fill (#f9fafb in light mode,
    // a near-black in dark mode) that overrides the real one.
    if (root.tagName.toLowerCase() === 'svg' && root.hasAttribute('style')) {
      const cleaned = (root.getAttribute('style') ?? '')
        .split(';')
        .map((d) => d.trim())
        .filter((d) => d && !/^background(-color)?\s*:/i.test(d))
        .join('; ');
      if (cleaned) root.setAttribute('style', cleaned);
      else root.removeAttribute('style');
    }
    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}

/**
 * Determine the absolute URL of the stylesheet that owns a given CSS rule.
 * Falls back to `window.location.href` when the sheet is inline or has no
 * `href` (e.g. a `<style>` element next/font injects, or a CSS-in-JS
 * runtime stylesheet).
 */
function getRuleBaseUrl(rule: CSSRule): string {
  let sheet: CSSStyleSheet | null = rule.parentStyleSheet;
  while (sheet) {
    if (sheet.href) return sheet.href;
    sheet = sheet.parentStyleSheet;
  }
  return window.location.href;
}

/**
 * Rewrite every `url(...)` inside a CSS source string to its absolute form
 * resolved against `baseUrl`. Already-absolute and `data:` URLs pass
 * through unchanged. Quotes inside the original `url()` are preserved.
 *
 * Why this exists: `CSSFontFaceRule.cssText` for stylesheets injected
 * inline (next/font, styled-components, CSS-in-JS) returns the source
 * URL verbatim — typically relative like `/_next/static/media/abc.woff2`
 * or `./fonts/Inter.woff2`. dom-to-svg's `inlineResources()` calls
 * `new URL(value)` directly on each url() argument, which THROWS on
 * relative URLs. The catch in `inlineCssFontUrlArgumentNode` swallows
 * the error and the substitution silently no-ops, so the exported SVG
 * ends up referencing a path that doesn't exist outside the dev server.
 *
 * Resolving to absolute up front is the canonical fix — once the URL is
 * absolute, `new URL(absolute).href` returns it verbatim and `fetch()`
 * can pull the bytes for base64 embedding.
 */
function absolutizeUrls(css: string, baseUrl: string): string {
  // Captures: url(  optional-quote  inner  optional-quote  )
  return css.replace(
    /url\(\s*(['"]?)([^'")\s][^'")]*)\1\s*\)/g,
    (_match, quote: string, inner: string) => {
      const trimmed = inner.trim();
      if (!trimmed) return _match;
      // Pass through data:, blob:, and absolute http(s):
      if (/^(data:|blob:|https?:|file:)/i.test(trimmed)) return _match;
      try {
        const absolute = new URL(trimmed, baseUrl).href;
        return `url(${quote}${absolute}${quote})`;
      } catch {
        return _match;
      }
    },
  );
}

/**
 * Extract @font-face declarations from the page's stylesheets that match
 * the font families used inside `element` (and its descendants). Returns
 * a single CSS string suitable for embedding into a `<style>` element.
 *
 * dom-to-svg's `inlineResources()` walks `<style>` children of the SVG and
 * inlines the `src: url(…)` URLs as base64 data URIs — but it doesn't add
 * a `<style>` itself. So fonts only get inlined if WE inject the
 * `@font-face` block first. We also pre-absolutize every `url(...)` so the
 * inliner's `new URL(value)` call succeeds (see `absolutizeUrls`).
 */
export function collectFontFaceCss(element: HTMLElement): string {
  if (typeof window === 'undefined') return '';

  // Step 1: collect every font-family used in the subtree (computed style).
  const familiesInUse = new Set<string>();
  const visit = (el: Element) => {
    const cs = window.getComputedStyle(el);
    const family = cs.fontFamily;
    if (family) {
      // font-family can be a comma-list of fallbacks. Strip quotes.
      family.split(',').forEach((f) => {
        const cleaned = f.trim().replace(/^["']|["']$/g, '');
        if (cleaned) familiesInUse.add(cleaned.toLowerCase());
      });
    }
    for (const child of Array.from(el.children)) visit(child);
  };
  visit(element);

  if (familiesInUse.size === 0) return '';

  // Step 2: walk every accessible stylesheet and find matching @font-face
  //         rules. CORS-blocked stylesheets throw on .cssRules access — we
  //         catch and skip them.
  const matched: string[] = [];
  const seen = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = (sheet as CSSStyleSheet).cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const fontFace = rule as CSSFontFaceRule;
      const family =
        fontFace.style
          .getPropertyValue('font-family')
          .trim()
          .replace(/^["']|["']$/g, '')
          .toLowerCase();
      if (!familiesInUse.has(family)) continue;
      const baseUrl = getRuleBaseUrl(fontFace);
      const text = absolutizeUrls(fontFace.cssText, baseUrl);
      if (seen.has(text)) continue;
      seen.add(text);
      matched.push(text);
    }
  }

  return matched.join('\n');
}
