/**
 * generate-native-html-report.mts
 *
 * Reads:
 *   apps/qa-playground/native/test-results/native-all.json   — Vitest JSON report
 *   apps/qa-playground/native/test-results/trees/*.ndjson    — per-file component trees
 *
 * Writes:
 *   apps/qa-playground/native/test-results/native-report.html
 *
 * Run via:
 *   pnpm --filter @oneui/qa-playground qa:native:report:html
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NATIVE_RESULTS = join(__dirname, '..', 'native', 'test-results');
const VITEST_JSON = join(NATIVE_RESULTS, 'native-all.json');
const TREES_DIR = join(NATIVE_RESULTS, 'trees');
const OUT_HTML = join(NATIVE_RESULTS, 'native-report.html');

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssertionResult {
  ancestorTitles: string[];
  fullName: string;
  title: string;
  status: 'passed' | 'failed' | 'pending' | 'todo';
  duration?: number;
  failureMessages: string[];
}

interface TestFileResult {
  name: string;
  status: 'passed' | 'failed';
  startTime: number;
  endTime: number;
  assertionResults: AssertionResult[];
}

interface VitestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numTotalTestSuites: number;
  startTime: number;
  success: boolean;
  testResults: TestFileResult[];
}

interface TreeEntry {
  id: string;
  name: string;
  suite: string;
  state: string;
  tree: unknown;
}

// ─── Load component trees ─────────────────────────────────────────────────────

function loadTrees(): Map<string, TreeEntry> {
  const map = new Map<string, TreeEntry>();
  if (!existsSync(TREES_DIR)) return map;

  for (const file of readdirSync(TREES_DIR)) {
    if (!file.endsWith('.ndjson')) continue;
    const content = readFileSync(join(TREES_DIR, file), 'utf8');
    for (const line of content.split('\n').filter(Boolean)) {
      try {
        const entry = JSON.parse(line) as TreeEntry;
        // Key by suiteName + testName for lookup
        const key = `${entry.suite}|||${entry.name}`;
        map.set(key, entry);
      } catch {
        // malformed line
      }
    }
  }
  return map;
}

// ─── Tree renderer ─────────────────────────────────────────────────────────────

interface RNTreeNode {
  type: string;
  props: Record<string, unknown>;
  children?: (RNTreeNode | string)[] | null;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProps(props: Record<string, unknown>): string {
  const ignore = new Set(['children', 'style', 'testID']);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (ignore.has(k)) continue;
    if (v === undefined || v === null || v === false) continue;
    if (k === 'testID') continue;
    if (typeof v === 'boolean') {
      parts.push(`<span class="prop-key">${escHtml(k)}</span>`);
    } else if (typeof v === 'string') {
      parts.push(`<span class="prop-key">${escHtml(k)}</span>=<span class="prop-str">"${escHtml(v)}"</span>`);
    } else if (typeof v === 'number') {
      parts.push(`<span class="prop-key">${escHtml(k)}</span>=<span class="prop-num">{${v}}</span>`);
    } else if (typeof v === 'object') {
      const json = JSON.stringify(v);
      if (json.length < 80) {
        parts.push(`<span class="prop-key">${escHtml(k)}</span>=<span class="prop-obj">{${escHtml(json)}}</span>`);
      }
    }
  }
  return parts.join(' ');
}

function renderTree(node: RNTreeNode | string | null, depth = 0): string {
  if (node === null || node === undefined) return '';
  const indent = '  '.repeat(depth);
  if (typeof node === 'string') {
    return `${indent}<span class="tree-text">"${escHtml(node)}"</span>\n`;
  }
  const props = renderProps(node.props ?? {});
  const propsStr = props ? ` ${props}` : '';
  const children = (node.children ?? []).filter(Boolean);

  if (children.length === 0) {
    return `${indent}<span class="tree-tag">&lt;${escHtml(node.type)}${propsStr} /&gt;</span>\n`;
  }

  const openTag = `${indent}<span class="tree-tag">&lt;${escHtml(node.type)}${propsStr}&gt;</span>\n`;
  const childHtml = children.map((c) => renderTree(c as RNTreeNode | string, depth + 1)).join('');
  const closeTag = `${indent}<span class="tree-tag">&lt;/${escHtml(node.type)}&gt;</span>\n`;
  return openTag + childHtml + closeTag;
}

function treeToHtml(tree: unknown): string {
  if (!tree) return '<em class="no-tree">Component unmounted before capture — run tests in watch mode to inspect trees live.</em>';
  const node = tree as RNTreeNode | RNTreeNode[];
  if (Array.isArray(node)) {
    return node.map((n) => renderTree(n)).join('');
  }
  return renderTree(node);
}

// ─── RN → CSS style converter ────────────────────────────────────────────────
//
// Maps the `style` prop from an RNTL tree node to an inline CSS string.
// Each node's own dimensions, colours, border-radius, and typography are
// preserved exactly — the sketch renders the component with its real paint,
// not with any imposed decoration.

function px(v: unknown): string {
  if (typeof v === 'number') return `${v}px`;
  if (typeof v === 'string') return v;   // '%', 'auto', etc.
  return String(v);
}

function rnStyleToCSS(style: unknown): string {
  if (!style || typeof style !== 'object') return '';

  // RNTL may give us an array of style objects (composed via StyleSheet).
  const layers = Array.isArray(style)
    ? (style as unknown[]).filter((s): s is Record<string, unknown> =>
        s !== null && typeof s === 'object' && !Array.isArray(s))
    : [style as Record<string, unknown>];
  const m: Record<string, unknown> = Object.assign({}, ...layers);

  const css: string[] = [];

  // ── Dimensions ────────────────────────────────────────────────
  if (m['width']     != null) css.push(`width:${px(m['width'])}`);
  if (m['height']    != null) css.push(`height:${px(m['height'])}`);
  if (m['minWidth']  != null) css.push(`min-width:${px(m['minWidth'])}`);
  if (m['minHeight'] != null) css.push(`min-height:${px(m['minHeight'])}`);
  if (m['maxWidth']  != null) css.push(`max-width:${px(m['maxWidth'])}`);
  if (m['maxHeight'] != null) css.push(`max-height:${px(m['maxHeight'])}`);

  // ── Border radius ──────────────────────────────────────────────
  if (m['borderRadius']            != null) css.push(`border-radius:${px(m['borderRadius'])}`);
  if (m['borderTopLeftRadius']     != null) css.push(`border-top-left-radius:${px(m['borderTopLeftRadius'])}`);
  if (m['borderTopRightRadius']    != null) css.push(`border-top-right-radius:${px(m['borderTopRightRadius'])}`);
  if (m['borderBottomLeftRadius']  != null) css.push(`border-bottom-left-radius:${px(m['borderBottomLeftRadius'])}`);
  if (m['borderBottomRightRadius'] != null) css.push(`border-bottom-right-radius:${px(m['borderBottomRightRadius'])}`);

  // ── Colours ────────────────────────────────────────────────────
  if (m['backgroundColor'] != null) css.push(`background-color:${m['backgroundColor']}`);
  if (m['color']           != null) css.push(`color:${m['color']}`);

  // ── Typography ─────────────────────────────────────────────────
  if (m['fontSize']      != null) css.push(`font-size:${px(m['fontSize'])}`);
  if (m['fontWeight']    != null) css.push(`font-weight:${m['fontWeight']}`);
  if (m['lineHeight']    != null) css.push(`line-height:${px(m['lineHeight'])}`);
  if (m['fontFamily']    != null) css.push(`font-family:${String(m['fontFamily']).replace(/"/g, "'")}`);
  if (m['textTransform'] != null) css.push(`text-transform:${m['textTransform']}`);
  if (m['letterSpacing'] != null) css.push(`letter-spacing:${px(m['letterSpacing'])}`);
  if (m['textAlign']     != null) css.push(`text-align:${m['textAlign']}`);

  // ── Flexbox ────────────────────────────────────────────────────
  if (m['flex']           != null) css.push(`flex:${m['flex']}`);
  if (m['flexDirection']  != null) css.push(`flex-direction:${m['flexDirection']}`);
  if (m['flexWrap']       != null) css.push(`flex-wrap:${m['flexWrap']}`);
  if (m['flexShrink']     != null) css.push(`flex-shrink:${m['flexShrink']}`);
  if (m['flexGrow']       != null) css.push(`flex-grow:${m['flexGrow']}`);
  if (m['alignItems']     != null) css.push(`align-items:${m['alignItems']}`);
  if (m['alignSelf'] != null) {
    css.push(`align-self:${m['alignSelf']}`);
    // In RN, alignSelf works because every parent is a flex container.
    // In HTML we can't guarantee the parent is flex, so emit width:fit-content
    // as the equivalent "shrink to content" instruction for non-stretch values.
    // This makes Badge (alignSelf:'flex-start') render compact instead of full-width.
    if (m['alignSelf'] !== 'stretch' && m['width'] == null) {
      css.push('width:fit-content');
    }
  }
  if (m['justifyContent'] != null) css.push(`justify-content:${m['justifyContent']}`);
  if (m['gap']            != null) css.push(`gap:${px(m['gap'])}`);
  if (m['rowGap']         != null) css.push(`row-gap:${px(m['rowGap'])}`);
  if (m['columnGap']      != null) css.push(`column-gap:${px(m['columnGap'])}`);

  // ── Padding ────────────────────────────────────────────────────
  if (m['padding']           != null) css.push(`padding:${px(m['padding'])}`);
  if (m['paddingHorizontal'] != null) {
    css.push(`padding-left:${px(m['paddingHorizontal'])}`);
    css.push(`padding-right:${px(m['paddingHorizontal'])}`);
  }
  if (m['paddingVertical'] != null) {
    css.push(`padding-top:${px(m['paddingVertical'])}`);
    css.push(`padding-bottom:${px(m['paddingVertical'])}`);
  }
  if (m['paddingTop']    != null) css.push(`padding-top:${px(m['paddingTop'])}`);
  if (m['paddingBottom'] != null) css.push(`padding-bottom:${px(m['paddingBottom'])}`);
  if (m['paddingLeft']   != null) css.push(`padding-left:${px(m['paddingLeft'])}`);
  if (m['paddingRight']  != null) css.push(`padding-right:${px(m['paddingRight'])}`);

  // ── Margin ─────────────────────────────────────────────────────
  if (m['margin']           != null) css.push(`margin:${px(m['margin'])}`);
  if (m['marginHorizontal'] != null) {
    css.push(`margin-left:${px(m['marginHorizontal'])}`);
    css.push(`margin-right:${px(m['marginHorizontal'])}`);
  }
  if (m['marginVertical'] != null) {
    css.push(`margin-top:${px(m['marginVertical'])}`);
    css.push(`margin-bottom:${px(m['marginVertical'])}`);
  }
  if (m['marginTop']    != null) css.push(`margin-top:${px(m['marginTop'])}`);
  if (m['marginBottom'] != null) css.push(`margin-bottom:${px(m['marginBottom'])}`);
  if (m['marginLeft']   != null) css.push(`margin-left:${px(m['marginLeft'])}`);
  if (m['marginRight']  != null) css.push(`margin-right:${px(m['marginRight'])}`);

  // ── Border ─────────────────────────────────────────────────────
  if (m['borderWidth'] != null) {
    css.push(`border-width:${px(m['borderWidth'])}`);
    // RN borders always render (no border-style default); CSS requires 'solid' to show a border.
    if (m['borderStyle'] == null) css.push('border-style:solid');
  }
  if (m['borderColor'] != null) css.push(`border-color:${m['borderColor']}`);
  if (m['borderStyle'] != null) css.push(`border-style:${m['borderStyle']}`);

  // ── Effects ────────────────────────────────────────────────────
  if (m['opacity']  != null) css.push(`opacity:${m['opacity']}`);
  if (m['overflow'] != null) css.push(`overflow:${m['overflow']}`);

  // ── Position ───────────────────────────────────────────────────
  if (m['position'] != null) css.push(`position:${m['position']}`);
  if (m['top']      != null) css.push(`top:${px(m['top'])}`);
  if (m['bottom']   != null) css.push(`bottom:${px(m['bottom'])}`);
  if (m['left']     != null) css.push(`left:${px(m['left'])}`);
  if (m['right']    != null) css.push(`right:${px(m['right'])}`);

  return css.join(';');
}

// ─── Visual sketch renderer ───────────────────────────────────────────────────
//
// Walks the RNTL JSON tree and produces HTML that mirrors the component's real
// appearance: each node's own `style` prop is converted to an inline CSS string,
// so the component's colours, shape, and typography render faithfully on white.
//
// Metadata (type-tag + a11y badges) is placed in a sibling `.sk-meta` wrapper
// OUTSIDE the styled element so it is never pulled inside by the component's
// own flex/align rules (e.g. a centred circle would otherwise centre the labels
// inside itself instead of the component's text).

function sketchNode(node: RNTreeNode | string | null, depth = 0): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') {
    const t = node.trim();
    return t ? `<span class="sk-str">${escHtml(t)}</span>` : '';
  }

  const typeName = node.type ?? 'View';
  const tl = typeName.toLowerCase();
  const children = ((node.children ?? []) as (RNTreeNode | string)[]).filter(Boolean);
  const props = node.props ?? {};

  const isText        = tl === 'text';
  const isImage       = tl === 'image';
  const isInteractive = /pressable|touchable|button/i.test(typeName);
  const isSvgRoot     = typeName === 'Svg';
  const isSvgChild    = /^(Path|Circle|Rect|Ellipse|Line|Polygon)$/.test(typeName);

  // A11y props for badges
  const a11yLabel = props['accessibilityLabel'] as string | undefined;
  const a11yRole  = props['accessibilityRole']  as string | undefined;
  const a11yState = props['accessibilityState'] as Record<string, unknown> | undefined;
  const isDisabled = a11yState?.['disabled'] === true;
  const isSelected = a11yState?.['selected'] === true;
  const isChecked  = a11yState?.['checked']  === true;

  // Suppress badges for nodes explicitly hidden from the accessibility tree.
  // Icon internals (IconShell) set accessible={false} + accessibilityElementsHidden={true}
  // to hide the glyph from screen readers. Showing their a11y role chip ("image") inside
  // a Button sketch creates visual clutter and breaks the layout (badge adds height that
  // pushes the SVG glyph outside the slot's overflow:hidden boundary).
  const isA11yHidden =
    props['accessible'] === false ||
    props['accessibilityElementsHidden'] === true;

  // State suffix for class
  let stateCls = '';
  if (isDisabled) stateCls += ' sk-disabled';
  if (isSelected) stateCls += ' sk-selected';
  if (isChecked)  stateCls += ' sk-checked';

  // Type tag — root node only. Inner nodes (textWrap, iconWrap, Text, Svg…) must
  // not emit a metadata block, otherwise it renders as a block element inside
  // small containers (e.g. the Avatar circle) and pushes content out of frame.
  const typeTag = depth === 0
    ? `<span class="sk-type-tag">${escHtml(typeName)}</span>` : '';

  // A11y / state badges — suppressed for accessibility-hidden nodes (Icon internals etc.)
  const badges: string[] = [];
  if (!isA11yHidden) {
    if (a11yRole)   badges.push(`<span class="sk-badge sk-role">${escHtml(a11yRole)}</span>`);
    if (a11yLabel)  badges.push(`<span class="sk-badge sk-a11y">&quot;${escHtml(a11yLabel)}&quot;</span>`);
    if (isSelected) badges.push(`<span class="sk-badge sk-state">selected</span>`);
    if (isChecked)  badges.push(`<span class="sk-badge sk-state">checked</span>`);
    if (isDisabled) badges.push(`<span class="sk-badge sk-state sk-state-disabled">disabled</span>`);
  }
  const badgesHtml = badges.length > 0
    ? `<div class="sk-badges">${badges.join('')}</div>` : '';

  // Metadata block rendered OUTSIDE the styled component element.
  // This prevents the component's own flex/align rules from repositioning labels.
  const metaHtml = (typeTag || badgesHtml)
    ? `<div class="sk-meta">${typeTag}${badgesHtml}</div>` : '';

  // ── SVG ──────────────────────────────────────────────────────────────────────
  if (isSvgRoot) {
    const viewBox = (props['viewBox'] as string | undefined) ?? '0 0 24 24';
    const w = (props['width']  as number | string | undefined) ?? 24;
    const h = (props['height'] as number | string | undefined) ?? 24;
    const pathHtml = children
      .filter((c): c is RNTreeNode => typeof c !== 'string')
      .map((c) => {
        const ct = (c as RNTreeNode).type ?? '';
        const cp = (c as RNTreeNode).props ?? {};
        if (ct === 'Path') {
          const d        = (cp['d']        as string | undefined) ?? '';
          const fill     = (cp['fill']     as string | undefined) ?? 'currentColor';
          const fillRule = (cp['fillRule'] as string | undefined) ?? '';
          const clipRule = (cp['clipRule'] as string | undefined) ?? '';
          return `<path d="${escHtml(d)}" fill="${escHtml(fill)}"` +
            (fillRule ? ` fill-rule="${escHtml(fillRule)}"` : '') +
            (clipRule ? ` clip-rule="${escHtml(clipRule)}"` : '') + ' />';
        }
        if (ct === 'Circle') {
          const cx            = (cp['cx']            as number | undefined) ?? 0;
          const cy            = (cp['cy']            as number | undefined) ?? 0;
          const r             = (cp['r']             as number | undefined) ?? 0;
          // Default fill to 'none' when not provided — many circles (spinners, rings)
          // are stroke-only shapes with no fill. 'currentColor' would paint them solid.
          const fill          = (cp['fill']          as string | undefined) ?? 'none';
          const stroke        = (cp['stroke']        as string | undefined);
          const strokeWidth   = (cp['strokeWidth']   as number | undefined);
          const strokeDash    = (cp['strokeDasharray'] as string | undefined);
          const strokeLinecap = (cp['strokeLinecap'] as string | undefined);
          let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${escHtml(fill)}"`;
          if (stroke)        out += ` stroke="${escHtml(stroke)}"`;
          if (strokeWidth)   out += ` stroke-width="${strokeWidth}"`;
          if (strokeDash)    out += ` stroke-dasharray="${escHtml(strokeDash)}"`;
          if (strokeLinecap) out += ` stroke-linecap="${escHtml(strokeLinecap)}"`;
          return out + ' />';
        }
        if (ct === 'Rect') {
          const x    = (cp['x']      as number | undefined) ?? 0;
          const y    = (cp['y']      as number | undefined) ?? 0;
          const rw   = (cp['width']  as number | undefined) ?? 0;
          const rh   = (cp['height'] as number | undefined) ?? 0;
          const fill = (cp['fill']   as string | undefined) ?? 'currentColor';
          return `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${escHtml(fill)}" />`;
        }
        return '';
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
      `viewBox="${escHtml(viewBox)}" class="sk-svg">${pathHtml}</svg>`;
  }
  if (isSvgChild) return '';

  // ── Image ─────────────────────────────────────────────────────────────────────
  if (isImage) {
    const source = props['source'];
    const uri = source && typeof source === 'object' && !Array.isArray(source)
      ? (source as { uri?: string }).uri ?? null : null;
    const imgCss = rnStyleToCSS(props['style']);
    const imgStyle = imgCss ? ` style="${escHtml(imgCss)}"` : '';
    if (uri) {
      return `<div class="sk-image-node"${imgStyle}>` +
        `<img class="sk-img" src="${escHtml(uri)}" alt="" ` +
        `onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` +
        `<div class="sk-img-fallback" style="display:none">🖼</div>` +
        `</div>`;
    }
    return `<div class="sk-image-node"${imgStyle}>🖼</div>`;
  }

  // ── Text ──────────────────────────────────────────────────────────────────────
  if (isText) {
    const textContent = children
      .filter((c): c is string => typeof c === 'string')
      .join('');
    const nestedNodes = children
      .filter((c): c is RNTreeNode => typeof c !== 'string')
      .map((c) => sketchNode(c, depth))
      .join('');
    const textCss  = rnStyleToCSS(props['style']);
    const textStyle = textCss ? ` style="${escHtml(textCss)}"` : '';
    const spanHtml = `<span class="sk-text-node${stateCls}"${textStyle}>${escHtml(textContent)}${nestedNodes}</span>`;
    if (metaHtml) {
      return `<div class="sk-node-outer">${metaHtml}${spanHtml}</div>`;
    }
    return spanHtml;
  }

  // ── Container (View / Pressable / ScrollView / TextInput …) ──────────────────
  //
  // React Native's layout model: every View is flex with column direction by
  // default. We prepend those defaults so the component's own style overrides
  // them where needed (e.g. flexDirection:'row' wins over the default 'column').
  const containerCss = rnStyleToCSS(props['style']);
  const viewStyle = `display:flex;flex-direction:column;${containerCss}`;

  let cls = isInteractive ? 'sk-interactive' : 'sk-view';

  const childHtml = children
    .map((c) => sketchNode(c as RNTreeNode | string, depth + 1))
    .join('');

  const el = `<div class="${cls}${stateCls}" style="${escHtml(viewStyle)}">${childHtml}</div>`;

  if (metaHtml) {
    return `<div class="sk-node-outer">${metaHtml}${el}</div>`;
  }
  return el;
}

function treeToSketch(tree: unknown): string {
  if (!tree) {
    return '<em class="no-tree">No component tree captured.</em>';
  }
  const node = tree as RNTreeNode | RNTreeNode[];
  if (Array.isArray(node)) {
    return node.map((n) => sketchNode(n)).join('');
  }
  return sketchNode(node);
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

function tagChip(title: string): string {
  if (title.startsWith('[smoke]')) return '<span class="tag tag-smoke">smoke</span>';
  if (title.startsWith('[fn]')) return '<span class="tag tag-fn">fn</span>';
  if (title.startsWith('[a11y]')) return '<span class="tag tag-a11y">a11y</span>';
  return '<span class="tag tag-other">other</span>';
}

// ─── Component name ───────────────────────────────────────────────────────────

/**
 * Extracts the component name from a test file path using the parent directory.
 *   /path/to/tests/Avatar/Avatar.test.tsx         →  'Avatar'
 *   /path/to/tests/BottomNavigationItem/...tsx    →  'BottomNavigationItem'
 */
function getComponentName(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 2] ?? 'Unknown';
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildHtml(report: VitestReport, trees: Map<string, TreeEntry>): string {
  const totalDuration = report.testResults.reduce(
    (sum, f) => sum + (f.endTime - f.startTime),
    0,
  );
  const durationSec = (totalDuration / 1000).toFixed(2);
  const runDate = new Date(report.startTime).toLocaleString();

  let testSections = '';
  const seenComponents: string[] = [];

  for (const fileResult of report.testResults) {
    const fileName = basename(fileResult.name);
    const componentName = getComponentName(fileResult.name);
    if (!seenComponents.includes(componentName)) seenComponents.push(componentName);

    const fileDuration = ((fileResult.endTime - fileResult.startTime) / 1000).toFixed(2);
    const filePass = fileResult.assertionResults.filter((a) => a.status === 'passed').length;
    const fileFail = fileResult.assertionResults.filter((a) => a.status === 'failed').length;
    const fileStatusCls = fileFail > 0 ? 'file-fail' : 'file-pass';

    // Group by suite (ancestorTitles[0])
    const suiteMap = new Map<string, AssertionResult[]>();
    for (const assertion of fileResult.assertionResults) {
      const suite = assertion.ancestorTitles[0] ?? 'Tests';
      if (!suiteMap.has(suite)) suiteMap.set(suite, []);
      suiteMap.get(suite)!.push(assertion);
    }

    let suiteRows = '';
    for (const [suiteName, assertions] of suiteMap) {
      let testRows = '';
      for (const assertion of assertions) {
        const passed = assertion.status === 'passed';
        const statusIcon = passed ? '✓' : '✗';
        const statusCls = passed ? 'pass' : 'fail';
        const dur = assertion.duration != null ? `${assertion.duration.toFixed(0)}ms` : '—';

        const treeKey = `${suiteName}|||${assertion.title}`;
        const treeEntry = trees.get(treeKey);
        const treeHtml   = treeToHtml(treeEntry?.tree ?? null);
        const sketchHtml = treeToSketch(treeEntry?.tree ?? null);

        // Strip ANSI escape codes before HTML-escaping — RNTL failure messages
        // include terminal colour sequences (e.g. \x1b[36m) that render as raw
        // text in the browser.
        // eslint-disable-next-line no-control-regex
        const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');
        const errorBlock = !passed && assertion.failureMessages.length > 0
          ? `<div class="error-block"><pre>${escHtml(stripAnsi(assertion.failureMessages[0] ?? ''))}</pre></div>`
          : '';

        const treeId = `tree-${Math.random().toString(36).slice(2)}`;
        // Failed tests: tree open by default so the rendered state is immediately visible.
        // Passed tests: tree collapsed by default (toggle to inspect).
        const treeOpenByDefault = !passed;
        const treeDisplay = treeOpenByDefault ? 'block' : 'none';
        const treeToggleLabel = treeOpenByDefault ? '▼ tree' : '▶ tree';
        const treeToggleCls = treeOpenByDefault ? 'tree-toggle open' : 'tree-toggle';

        testRows += `
          <div class="test-row ${statusCls}">
            <div class="test-header" onclick="toggleTree('${treeId}')">
              <span class="status-icon ${statusCls}">${statusIcon}</span>
              <span class="test-name">${escHtml(assertion.title)}</span>
              ${tagChip(assertion.title)}
              <span class="test-dur">${dur}</span>
              <span class="${treeToggleCls}" id="toggle-${treeId}">${treeToggleLabel}</span>
            </div>
            ${errorBlock}
            <div class="tree-panel" id="${treeId}" style="display:${treeDisplay}">
              <div class="panels-row">
                <div class="panel-col">
                  <div class="tree-label">Visual Sketch</div>
                  <div class="sketch-area">${sketchHtml}</div>
                </div>
                <div class="panel-col panel-col-tree">
                  <div class="tree-label">Component Tree</div>
                  <pre class="tree-code">${treeHtml}</pre>
                </div>
              </div>
            </div>
          </div>`;
      }

      suiteRows += `
        <div class="suite-block">
          <div class="suite-name">${escHtml(suiteName)}</div>
          ${testRows}
        </div>`;
    }

    testSections += `
      <details class="file-block ${fileStatusCls}" data-component="${escHtml(componentName)}" open>
        <summary class="file-summary">
          <span class="file-icon">${fileFail > 0 ? '✗' : '✓'}</span>
          <span class="file-path">${escHtml(fileName)}</span>
          <span class="file-counts">
            <span class="pass-count">${filePass} passed</span>
            ${fileFail > 0 ? `<span class="fail-count">${fileFail} failed</span>` : ''}
          </span>
          <span class="file-dur">${fileDuration}s</span>
        </summary>
        ${suiteRows}
      </details>`;
  }

  // Build dropdown <option> list sorted alphabetically.
  const sortedComponents = [...seenComponents].sort((a, b) => a.localeCompare(b));
  const dropdownOptions = sortedComponents
    .map((name) => `<option value="${escHtml(name)}">${escHtml(name)}</option>`)
    .join('\n            ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native QA — Vitest Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      min-height: 100vh;
    }

    /* ── Header ──────────────────────────────────────────────── */
    .header {
      background: #ffffff;
      border-bottom: 2px solid #e2e8f0;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .header-title { font-size: 18px; font-weight: 700; color: #1e293b; }
    .header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 16px;
      border-radius: 8px;
      min-width: 80px;
    }
    .stat-value { font-size: 22px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
    .stat-total  { background: #f1f5f9; }
    .stat-pass   { background: #dcfce7; }
    .stat-fail   { background: #fee2e2; }
    .stat-time   { background: #f1f5f9; }
    .stat-pass .stat-value { color: #15803d; }
    .stat-fail .stat-value { color: #dc2626; }
    .stat-total .stat-value, .stat-time .stat-value { color: #334155; }

    .status-banner {
      margin-left: auto;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-banner.all-pass { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-banner.has-fail { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }

    /* ── Content ─────────────────────────────────────────────── */
    .content { padding: 24px 32px; max-width: 1100px; margin: 0 auto; }

    .file-block {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .file-block.file-fail { border-color: #fca5a5; }
    .file-block.file-pass { border-color: #86efac; }

    .file-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      cursor: pointer;
      list-style: none;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      user-select: none;
    }
    .file-summary::-webkit-details-marker { display: none; }
    .file-icon { font-size: 14px; }
    .file-block.file-pass .file-icon { color: #16a34a; }
    .file-block.file-fail .file-icon { color: #dc2626; }
    .file-path { font-size: 13px; font-weight: 500; color: #3730a3; font-family: 'JetBrains Mono', monospace; }
    .file-counts { display: flex; gap: 8px; font-size: 12px; }
    .pass-count { color: #16a34a; font-weight: 600; }
    .fail-count { color: #dc2626; font-weight: 600; }
    .file-dur { margin-left: auto; font-size: 12px; color: #94a3b8; }

    /* ── Suite ───────────────────────────────────────────────── */
    .suite-block { padding: 4px 16px 8px; }
    .suite-name {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #94a3b8;
      padding: 10px 0 4px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 4px;
    }

    /* ── Test row ────────────────────────────────────────────── */
    .test-row { border-radius: 6px; margin: 2px 0; }
    .test-row.fail { background: #fff5f5; }

    .test-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.1s;
    }
    .test-header:hover { background: #f1f5f9; }

    .status-icon {
      font-size: 13px;
      font-weight: 700;
      width: 18px;
      flex-shrink: 0;
    }
    .status-icon.pass { color: #16a34a; }
    .status-icon.fail { color: #dc2626; }

    .test-name { flex: 1; font-size: 13px; color: #334155; }
    .test-dur { font-size: 11px; color: #94a3b8; flex-shrink: 0; }

    .tree-toggle {
      font-size: 11px;
      color: #94a3b8;
      flex-shrink: 0;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .tree-toggle:hover { color: #475569; border-color: #94a3b8; }
    .tree-toggle.open { color: #4f46e5; border-color: #818cf8; }

    /* ── Tags ────────────────────────────────────────────────── */
    .tag {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 10px;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }
    .tag-smoke  { background: #dbeafe; color: #1d4ed8; }
    .tag-fn     { background: #ede9fe; color: #6d28d9; }
    .tag-a11y   { background: #dcfce7; color: #15803d; }
    .tag-other  { background: #f1f5f9; color: #64748b; }

    /* ── Error block ─────────────────────────────────────────── */
    .error-block {
      margin: 4px 10px 4px 36px;
      padding: 8px 12px;
      background: #fff1f2;
      border-left: 3px solid #dc2626;
      border-radius: 0 4px 4px 0;
    }
    .error-block pre {
      font-size: 11px;
      color: #9f1239;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      max-height: 200px;
      overflow: auto;
    }

    /* ── Component tree + sketch ─────────────────────────────── */
    .tree-panel {
      margin: 4px 10px 8px 36px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .panels-row {
      display: flex;
    }
    /* Left column: visual sketch (fixed width) */
    .panel-col {
      flex: 0 0 280px;
      min-width: 0;
      border-right: 1px solid #e2e8f0;
    }
    /* Right column: code tree (fills remaining space) */
    .panel-col-tree {
      flex: 1 1 auto;
      min-width: 0;
      border-right: none;
    }
    .tree-label {
      background: #f8fafc;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      padding: 4px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .tree-code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.7;
      padding: 10px 14px;
      overflow: auto;
      max-height: 400px;
      background: #f8fafc;
      color: #334155;
      white-space: pre;
    }
    .tree-tag  { color: #1d4ed8; }
    .prop-key  { color: #b45309; }
    .prop-str  { color: #15803d; }
    .prop-num  { color: #c2410c; }
    .prop-obj  { color: #475569; }
    .tree-text { color: #1e293b; }
    .no-tree   { color: #94a3b8; font-style: italic; font-size: 11px; }

    /* ── Visual sketch ────────────────────────────────────────── */
    .sketch-area {
      padding: 14px 16px;
      background: #ffffff;
      overflow: auto;
      max-height: 400px;
      min-height: 48px;
    }
    .sk-node-outer {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 6px;
    }
    .sk-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: 4px; }

    .sk-view,
    .sk-interactive,
    .sk-input-node,
    .sk-scroll-node,
    .sk-image-node {
      border: none;
      background: none;
      padding: 0;
      margin: 0;
    }
    .sk-image-node { display: inline-flex; align-items: center; justify-content: center; line-height: 0; }
    .sk-text-node {
      color: #111827;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: inline;
    }
    .sk-disabled { opacity: 0.38; }
    .sk-selected { outline: 2px solid #16a34a; outline-offset: 2px; }
    .sk-checked  { outline: 2px solid #2563eb; outline-offset: 2px; }
    .sk-type-tag {
      display: block;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 9px;
      color: #94a3b8;
      margin-bottom: 2px;
      letter-spacing: 0.3px;
    }
    .sk-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
    .sk-badge  {
      font-size: 9px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 10px;
      letter-spacing: 0.2px;
    }
    .sk-role           { background: #dbeafe; color: #1d4ed8; }
    .sk-a11y           { background: #dcfce7; color: #15803d; }
    .sk-state          { background: #ede9fe; color: #6d28d9; }
    .sk-state-disabled { background: #fee2e2; color: #dc2626; }
    .sk-str { color: #111827; font-size: 12px; }
    .sk-svg { display: inline-block; vertical-align: middle; overflow: visible; }
    .sk-img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .sk-img-fallback {
      width: 40px;
      height: 40px;
      background: #e2e8f0;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    /* ── Toolbar ─────────────────────────────────────────────── */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .toolbar-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-expand-all {
      background: #ffffff;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.1s, color 0.1s;
    }
    .btn-expand-all:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }

    /* ── Component filter dropdown ───────────────────────────── */
    .comp-filter {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .comp-filter-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .comp-select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .comp-select-wrap::after {
      content: '';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid #64748b;
      pointer-events: none;
    }
    .comp-select {
      appearance: none;
      -webkit-appearance: none;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 32px 6px 12px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      outline: none;
      min-width: 180px;
      transition: border-color 0.15s;
    }
    .comp-select:hover { border-color: #94a3b8; }
    .comp-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.15); }
    .comp-select option { background: #ffffff; color: #1e293b; }
    .comp-filter-count {
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
    }

    /* ── Footer ──────────────────────────────────────────────── */
    .footer {
      text-align: center;
      padding: 32px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">Native QA — Vitest Report</div>
      <div class="header-sub">RNTL · Node.js · Run: ${escHtml(runDate)}</div>
    </div>
    <div class="stat-card stat-total">
      <div class="stat-value">${report.numTotalTests}</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat-card stat-pass">
      <div class="stat-value">${report.numPassedTests}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card stat-fail">
      <div class="stat-value">${report.numFailedTests}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card stat-time">
      <div class="stat-value">${durationSec}s</div>
      <div class="stat-label">Duration</div>
    </div>
    <div class="status-banner ${report.numFailedTests === 0 ? 'all-pass' : 'has-fail'}">
      ${report.numFailedTests === 0 ? '✓ All tests passed' : `✗ ${report.numFailedTests} failed`}
    </div>
  </div>

  <div class="content">
    <div class="toolbar">
      <div class="comp-filter">
        <span class="comp-filter-label">Component</span>
        <div class="comp-select-wrap">
          <select class="comp-select" id="comp-select" onchange="filterComponent(this.value)">
            <option value="">All Components</option>
            ${dropdownOptions}
          </select>
        </div>
        <span class="comp-filter-count" id="comp-filter-count"></span>
      </div>
      <div class="toolbar-actions">
        <button class="btn-expand-all" onclick="expandAllTrees(true)">▼ Expand All Trees</button>
        <button class="btn-expand-all" onclick="expandAllTrees(false)">▶ Collapse All Trees</button>
      </div>
    </div>
    ${testSections}
  </div>

  <div class="footer">
    Generated by <code>generate-native-html-report.mts</code> · OneUI QA Playground
  </div>

  <script>
    function toggleTree(id) {
      const panel = document.getElementById(id);
      const toggle = document.getElementById('toggle-' + id);
      if (!panel || !toggle) return;
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'block';
      toggle.textContent = isOpen ? '▶ tree' : '▼ tree';
      toggle.classList.toggle('open', !isOpen);
    }

    function expandAllTrees(expand) {
      // Only act on tree-panels inside currently visible file-blocks.
      var visibleBlocks = Array.from(document.querySelectorAll('.file-block')).filter(function(b) {
        return b.style.display !== 'none';
      });
      visibleBlocks.forEach(function(block) {
        block.querySelectorAll('.tree-panel').forEach(function(panel) {
          panel.style.display = expand ? 'block' : 'none';
        });
        block.querySelectorAll('.tree-toggle').forEach(function(toggle) {
          toggle.textContent = expand ? '▼ tree' : '▶ tree';
          toggle.classList.toggle('open', expand);
        });
      });
    }

    function filterComponent(name) {
      var blocks = document.querySelectorAll('.file-block');
      var shown = 0;
      var total = 0;
      blocks.forEach(function(block) {
        var match = !name || block.getAttribute('data-component') === name;
        block.style.display = match ? '' : 'none';
        if (match) {
          shown += block.querySelectorAll('.test-row').length;
        }
        total += block.querySelectorAll('.test-row').length;
      });
      var countEl = document.getElementById('comp-filter-count');
      if (countEl) {
        countEl.textContent = name ? ('Showing ' + shown + ' of ' + total + ' tests') : '';
      }
    }

    // Initialise count display on load.
    window.addEventListener('DOMContentLoaded', function() {
      filterComponent('');
    });
  </script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync(NATIVE_RESULTS, { recursive: true });

  if (!existsSync(VITEST_JSON)) {
    console.error(`\nNo Vitest JSON found at:\n  ${VITEST_JSON}\n\nRun tests first:\n  pnpm qa:native:test\n`);
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(VITEST_JSON, 'utf8')) as VitestReport;
  const trees = loadTrees();

  console.log(`Loaded ${report.numTotalTests} tests from ${report.testResults.length} file(s).`);
  console.log(`Loaded ${trees.size} component tree snapshot(s).`);

  const html = buildHtml(report, trees);
  writeFileSync(OUT_HTML, html, 'utf8');
  console.log(`\nReport written → ${OUT_HTML}`);
  console.log(`Open with:  open "${OUT_HTML}"\n`);
}

main();
