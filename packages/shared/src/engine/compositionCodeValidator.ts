/**
 * compositionCodeValidator.ts
 *
 * Server-side validator for AI-generated TSX composition output. Runs on
 * the executor before streaming the code to the client; failures trigger
 * one self-heal cycle before reaching the user. Mirror of the AST
 * validator (`compositionValidator.ts`) but for the new code-shape
 * pipeline.
 *
 * Checks (P0 — fail the validation):
 *   - banned imports (only `react` + `@oneui/playground` are allowed)
 *   - JSX tag identifiers exist in the playground allowlist
 *   - `<Surface mode="...">` value in the allowed set
 *   - generated UI is safe to render: token-only styling, root Surface,
 *     valid images/icons, no section-level raw layout containers
 *   - parse failure
 *
 * Implementation note: uses `@babel/parser` for an actual AST walk
 * because regex-on-source produces too many false positives (e.g.
 * matching colour-like strings inside JSX text content). Babel is
 * already available transitively in the workspace; we declare it
 * directly in `packages/shared/package.json` so the executor's bundle
 * resolution doesn't depend on hoisting.
 */

import { parse } from '@babel/parser';
import generate from '@babel/generator';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import { isPlaygroundComponent, PLAYGROUND_ICON_NAMES } from './compositionCodePrompt';
import {
  PLAYGROUND_IMAGE_FALLBACK_SRC,
  PLAYGROUND_IMAGE_URLS,
  isPlaygroundImageUrl,
} from './playgroundImageAssets';

const VALID_ICON_NAMES = new Set<string>(PLAYGROUND_ICON_NAMES);

// `@babel/traverse` ships its default export under `.default` when imported
// from CJS-shaped contexts (Next API routes, Convex actions). Normalise.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse: typeof _traverse = ((_traverse as any).default ?? _traverse) as typeof _traverse;

const SURFACE_MODES = new Set([
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
]);

const ALLOWED_IMPORTS = new Set(['react', '@oneui/playground']);

/** Properties on a JSX `style={{ ... }}` literal that must use tokens. */
const STYLE_PROPS_REQUIRING_TOKENS = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'fill',
  'stroke',
  'fontSize',
  'fontWeight',
  'lineHeight',
]);

const RAW_COLOUR_RE = /#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\(/;
const RAW_COLOUR_VALUE_RE = /#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\([^)]*\)/gi;
const RAW_DIMENSION_RE = /(?:^|\s|[(,])\d+(?:\.\d+)?(?:px|rem|em)\b/;
const RAW_NUMERIC_STYLE_STRING_RE = /^-?\d+(?:\.\d+)?$/;
const LEGACY_TOKEN_RE =
  /--(?:Typography-(?:Size|Weight|LineHeight)-|Surface-(?:Bold|Subtle|Minimal|Main)|Text-(?:High|Medium|Low|OnBold-High|On-Bold-High)|[A-Za-z]+(?:-[A-Za-z]+)?-(?:FG|BG|Default)-)/;
const BROKEN_IMAGE_SRC_RE = /^(?:placeholder(?:\.\w+)?|image(?:\.\w+)?|\/?placeholder|#)$/i;
const SECTION_HTML_TAGS = new Set(['div', 'section', 'main', 'article', 'header', 'footer', 'aside', 'nav']);
const TEXT_HTML_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'strong', 'em', 'small']);
const INTERACTIVE_COMPONENTS = new Set([
  'Button',
  'IconButton',
  'FAB',
  'Toggle',
  'ToggleGroup',
  'SegmentedControl',
  'Input',
  'InputField',
  'Checkbox',
  'CheckboxGroup',
  'Radio',
  'Switch',
  'Select',
  'Slider',
  'NumberField',
  'Stepper',
  'Tabs',
  'TabGroup',
  'TabItem',
  'BottomNavigation',
  'BottomNavItem',
  'WebHeader',
  'SearchInput',
  'NavigationMenu',
  'Toolbar',
  'Dialog',
  'Popover',
  'Menu',
  'Accordion',
  'Collapsible',
]);
const COMPONENTS_SUPPORTING_FULL_WIDTH = new Set([
  'Button',
  'IconButton',
  'InputField',
  'ToggleGroup',
]);
const UNITLESS_NUMERIC_STYLE_PROPS = new Set(['flexGrow', 'flexShrink', 'opacity']);

export type CodeIssueSeverity = 'error' | 'warning' | 'info';

export interface CodeIssue {
  severity: CodeIssueSeverity;
  /** Stable id so callers can dedupe / silence specific checks. */
  id: string;
  /** Human-readable description. Used in the self-heal prompt. */
  message: string;
  /** 1-indexed line number when known. */
  line?: number;
}

export interface CodeValidationResult {
  /** True iff the generated TSX is safe to render in the playground. */
  valid: boolean;
  /** All issues, errors and warnings together. */
  issues: CodeIssue[];
  /** 0–100 score. 100 when no issues; warnings deduct 5 each, errors 25. */
  score: number;
}

export interface CodeRepairResult {
  code: string;
  changed: boolean;
  fixes: string[];
}

const LEGACY_TOKEN_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/--Text-On-Bold-High\b/g, '--Primary-Bold-High'],
  [/--Text-OnBold-High\b/g, '--Primary-Bold-High'],
  [/--Text-High\b/g, '--Primary-High'],
  [/--Text-Medium\b/g, '--Primary-Medium-Text'],
  [/--Text-Low\b/g, '--Primary-Low'],
  [/--Surface-Main\b/g, '--Surface-Default'],
  [/--Surface-Bold\b/g, '--Primary-Bold'],
  [/--Surface-Subtle\b/g, '--Primary-Subtle'],
  [/--Surface-Minimal\b/g, '--Primary-Minimal'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold-High\b/g, '--$1-Bold-High'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold-Medium\b/g, '--$1-Bold-Medium'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold-TintedA11y\b/g, '--$1-Bold-TintedA11y'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold-Hover\b/g, '--$1-Bold-Hover'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold-Pressed\b/g, '--$1-Bold-Pressed'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-FG-Bold\b/g, '--$1-Bold'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-BG-Minimal\b/g, '--$1-Minimal'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-BG-Subtle-Hover\b/g, '--$1-Subtle-Hover'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-BG-Subtle-Pressed\b/g, '--$1-Subtle-Pressed'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-BG-Subtle\b/g, '--$1-Subtle'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-BG-Moderate\b/g, '--$1-Moderate'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Accent-A11y\b/g, '--$1-TintedA11y'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Low-Stroke\b/g, '--$1-Stroke-Low'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Medium-Stroke\b/g, '--$1-Stroke-Medium'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-High\b/g, '--$1-High'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Medium\b/g, '--$1-Medium-Text'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Low\b/g, '--$1-Low'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Hover\b/g, '--$1-Hover'],
  [/--([A-Za-z]+(?:-[A-Za-z]+)?)-Default-Pressed\b/g, '--$1-Pressed'],
  [/--Typography-Size-([A-Za-z0-9-]+)\b/g, '--Body-$1-FontSize'],
  [/--Typography-Weight-Bold\b/g, '--Body-FontWeight-High'],
  [/--Typography-Weight-Medium\b/g, '--Body-FontWeight-Medium'],
  [/--Typography-Weight-Regular\b/g, '--Body-FontWeight-Low'],
  [/--Typography-LineHeight-Normal\b/g, '--Body-M-LineHeight'],
  [/--Typography-LineHeight-Tight\b/g, '--Body-S-LineHeight'],
  [/--Typography-LineHeight-Relaxed\b/g, '--Body-L-LineHeight'],
];

function ensurePlaygroundImports(ast: t.File, names: ReadonlySet<string>): void {
  if (names.size === 0) return;

  let playgroundImport: t.ImportDeclaration | null = null;
  for (const statement of ast.program.body) {
    if (
      statement.type === 'ImportDeclaration' &&
      statement.source.value === '@oneui/playground'
    ) {
      playgroundImport = statement;
      break;
    }
  }

  const sortedNames = Array.from(names).sort();
  if (!playgroundImport) {
    ast.program.body.unshift(
      t.importDeclaration(
        sortedNames.map((name) => t.importSpecifier(t.identifier(name), t.identifier(name))),
        t.stringLiteral('@oneui/playground'),
      ),
    );
    return;
  }

  const imported = new Set<string>();
  for (const specifier of playgroundImport.specifiers) {
    if (
      specifier.type === 'ImportSpecifier' &&
      specifier.imported.type === 'Identifier'
    ) {
      imported.add(specifier.imported.name);
    }
  }

  for (const name of sortedNames) {
    if (imported.has(name)) continue;
    playgroundImport.specifiers.push(
      t.importSpecifier(t.identifier(name), t.identifier(name)),
    );
  }
}

function replaceLegacyTokens(value: string): { value: string; changed: boolean } {
  let next = value;
  for (const [pattern, replacement] of LEGACY_TOKEN_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return { value: next, changed: next !== value };
}

function findJSXAttr(opening: t.JSXOpeningElement, name: string): t.JSXAttribute | null {
  for (const attr of opening.attributes) {
    if (
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === name
    ) {
      return attr;
    }
  }
  return null;
}

function attrStringValue(attr: t.JSXAttribute | null): string | null {
  if (!attr?.value) return null;
  if (attr.value.type === 'StringLiteral') return attr.value.value;
  return null;
}

function setJSXStringAttr(opening: t.JSXOpeningElement, name: string, value: string): void {
  const existing = findJSXAttr(opening, name);
  if (existing) {
    existing.value = t.stringLiteral(value);
    return;
  }
  opening.attributes.push(t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value)));
}

function removeJSXAttr(opening: t.JSXOpeningElement, name: string): boolean {
  const before = opening.attributes.length;
  opening.attributes = opening.attributes.filter((attr) => {
    if (attr.type !== 'JSXAttribute') return true;
    return !(attr.name.type === 'JSXIdentifier' && attr.name.name === name);
  });
  return opening.attributes.length !== before;
}

/**
 * Deterministic cleanup for the failure modes models repeat most often.
 * This does not loosen the strict gate; it converts known legacy aliases
 * and unresolved image placeholders into the current OneUI contract before
 * the validator decides whether the preview is safe to render.
 */
export function repairGeneratedCompositionCode(code: string): CodeRepairResult {
  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: false,
    });
  } catch {
    return { code, changed: false, fixes: [] };
  }

  const fixes = new Set<string>();
  const requiredImports = new Set<string>();

  traverse(ast, {
    StringLiteral(path) {
      const repaired = replaceLegacyTokens(path.node.value);
      if (!repaired.changed) return;
      path.node.value = repaired.value;
      fixes.add('legacy-token-aliases');
    },

    JSXElement(path) {
      const tagName = getJSXName(path.node.openingElement.name);
      if (!tagName || !SECTION_HTML_TAGS.has(tagName)) return;

      const styleObject = getStyleObject(path.node.openingElement);
      if (!styleObject) return;

      const hasLayoutDisplay = styleHasDisplayLayout(styleObject);
      const wrapsInteractiveChildren =
        styleHasManualBackground(styleObject) && hasInteractiveDescendant(path.node);

      if (wrapsInteractiveChildren) {
        const mode = inferSurfaceModeFromStyle(styleObject);
        setJSXElementName(path.node, 'Surface');
        setJSXStringAttr(path.node.openingElement, 'mode', mode);
        if (removeObjectProperties(styleObject, new Set(['background', 'backgroundColor']))) {
          fixes.add('manual-background-surface');
        }
        requiredImports.add('Surface');
        return;
      }

      if (hasLayoutDisplay) {
        setJSXElementName(path.node, 'Container');
        requiredImports.add('Container');
        fixes.add('section-layout-container');
      }
    },

    JSXOpeningElement(path) {
      const tagName = getJSXName(path.node.name);
      if (
        tagName &&
        findJSXAttr(path.node, 'fullWidth') &&
        !COMPONENTS_SUPPORTING_FULL_WIDTH.has(tagName)
      ) {
        removeJSXAttr(path.node, 'fullWidth');
        fixes.add('unsupported-full-width');
      }

      const styleObject = getStyleObject(path.node);
      if (styleObject) {
        const stylePropsToRemove = new Set<string>();
        for (const prop of styleObject.properties) {
          if (
            prop.type !== 'ObjectProperty' ||
            (prop.key.type !== 'Identifier' && prop.key.type !== 'StringLiteral')
          ) {
            continue;
          }

          const key = propName(prop);
          if (!key) continue;

          if (prop.value.type === 'NumericLiteral') {
            if (key === 'flex') {
              prop.value = t.stringLiteral(`${prop.value.value} 1 var(--Spacing-0)`);
              fixes.add('numeric-flex-style');
            } else if (UNITLESS_NUMERIC_STYLE_PROPS.has(key)) {
              stylePropsToRemove.add(key);
              fixes.add('numeric-unitless-style');
            }
          }

          if (prop.value.type !== 'StringLiteral') continue;

          const value = prop.value.value.trim();
          if (value !== '0' && RAW_NUMERIC_STYLE_STRING_RE.test(value)) {
            stylePropsToRemove.add(key);
            fixes.add('numeric-string-style');
            continue;
          }
          if (RAW_COLOUR_RE.test(value)) {
            const repairedValue = tokeniseRawColourStyle(key, value);
            if (repairedValue) {
              prop.value = t.stringLiteral(repairedValue);
              fixes.add(key === 'boxShadow' ? 'raw-shadow-token' : 'raw-colour-token');
            } else {
              stylePropsToRemove.add(key);
              fixes.add('raw-colour-style');
            }
            continue;
          }
          if (RAW_DIMENSION_RE.test(value)) {
            const repairedValue = tokeniseRawDimensionStyle(key, value);
            if (repairedValue) {
              prop.value = t.stringLiteral(repairedValue);
              fixes.add('raw-dimension-token');
            } else {
              stylePropsToRemove.add(key);
              fixes.add('raw-dimension-style');
            }
          }
        }
        removeObjectProperties(styleObject, stylePropsToRemove);
      }

      if (tagName !== 'Image') return;

      const srcAttr = findJSXAttr(path.node, 'src');
      const src = attrStringValue(srcAttr);
      if (!src || isDisallowedImageSrc(src)) {
        setJSXStringAttr(path.node, 'src', PLAYGROUND_IMAGE_FALLBACK_SRC);
        fixes.add('image-src-local-fallback');
      }

      const altAttr = findJSXAttr(path.node, 'alt');
      const alt = attrStringValue(altAttr);
      if (!alt || alt.trim().length === 0) {
        setJSXStringAttr(path.node, 'alt', 'Generated composition image');
        fixes.add('image-alt');
      }
    },
  });

  ensurePlaygroundImports(ast, requiredImports);

  if (fixes.size === 0) return { code, changed: false, fixes: [] };

  return {
    code: generate(ast, { retainLines: true }).code,
    changed: true,
    fixes: Array.from(fixes),
  };
}

type JSXNameNode = t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName;

function getJSXName(name: JSXNameNode): string | null {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression') {
    const object = getJSXName(name.object);
    const property = getJSXName(name.property);
    return object && property ? `${object}.${property}` : null;
  }
  return null;
}

function getStringAttr(node: t.JSXOpeningElement, attrName: string): string | null {
  for (const attr of node.attributes) {
    if (
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === attrName &&
      attr.value?.type === 'StringLiteral'
    ) {
      return attr.value.value;
    }
  }
  return null;
}

function getStyleObject(node: t.JSXOpeningElement): t.ObjectExpression | null {
  for (const attr of node.attributes) {
    if (
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === 'style' &&
      attr.value?.type === 'JSXExpressionContainer' &&
      attr.value.expression.type === 'ObjectExpression'
    ) {
      return attr.value.expression;
    }
  }
  return null;
}

function propName(prop: t.ObjectProperty): string | null {
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'StringLiteral') return prop.key.value;
  return null;
}

function propStringValue(prop: t.ObjectProperty): string | null {
  if (prop.value.type === 'StringLiteral') return prop.value.value;
  return null;
}

function findObjectProperty(object: t.ObjectExpression, name: string): t.ObjectProperty | null {
  for (const prop of object.properties) {
    if (prop.type !== 'ObjectProperty') continue;
    if (propName(prop) === name) return prop;
  }
  return null;
}

function removeObjectProperties(object: t.ObjectExpression, names: ReadonlySet<string>): boolean {
  const before = object.properties.length;
  object.properties = object.properties.filter((prop) => {
    if (prop.type !== 'ObjectProperty') return true;
    const name = propName(prop);
    return !name || !names.has(name);
  });
  return object.properties.length !== before;
}

function styleHasDisplayLayout(object: t.ObjectExpression): boolean {
  const displayProp = findObjectProperty(object, 'display');
  if (!displayProp) return false;
  const value = propStringValue(displayProp);
  return value === 'flex' || value === 'grid';
}

function styleHasManualBackground(object: t.ObjectExpression): boolean {
  return Boolean(findObjectProperty(object, 'background') || findObjectProperty(object, 'backgroundColor'));
}

function inferSurfaceModeFromStyle(object: t.ObjectExpression): string {
  const backgroundProp =
    findObjectProperty(object, 'background') ?? findObjectProperty(object, 'backgroundColor');
  const background =
    backgroundProp ? propStringValue(backgroundProp) ?? '' : '';
  if (/Bold\b/.test(background)) return 'bold';
  if (/Moderate\b/.test(background)) return 'moderate';
  if (/Subtle\b/.test(background)) return 'subtle';
  if (/Minimal\b/.test(background)) return 'minimal';
  if (/Elevated\b/.test(background)) return 'elevated';
  return 'subtle';
}

function isDisallowedImageSrc(src: string): boolean {
  const trimmed = src.trim();
  return BROKEN_IMAGE_SRC_RE.test(trimmed) || !isPlaygroundImageUrl(trimmed);
}

function tokeniseRawDimensionStyle(key: string, value: string): string | null {
  const exact = /^(\d+(?:\.\d+)?)(px|rem|em)$/.exec(value.trim());
  if (!exact) return null;
  const amount = Number(exact[1]);
  const unit = exact[2];
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const px = unit === 'px' ? amount : amount * 16;
  const multiplier = Math.max(0.125, px / 80);
  const rounded = Math.round(multiplier * 1000) / 1000;
  const formatted = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/0+$/, '').replace(/\.$/, '');

  if (key === 'width' && px >= 320) return '100%';
  if (key === 'maxWidth' && px >= 320) return '100%';
  return `calc(var(--Spacing-40) * ${formatted})`;
}

function tokeniseRawColourStyle(key: string, value: string): string | null {
  if (key === 'boxShadow') return 'var(--Elevation-2)';
  if (key === 'background' || key === 'backgroundColor') {
    if (/gradient\(/i.test(value)) {
      return value.replace(RAW_COLOUR_VALUE_RE, 'var(--Neutral-Bold)');
    }
    return 'var(--Surface-Subtle)';
  }
  if (key === 'color' || key === 'fill' || key === 'stroke') return 'var(--Primary-High)';
  if (key === 'borderColor') return 'var(--Primary-Stroke-Low)';
  return null;
}

function setJSXElementName(element: t.JSXElement, name: string): void {
  element.openingElement.name = t.jsxIdentifier(name);
  if (element.closingElement) {
    element.closingElement.name = t.jsxIdentifier(name);
  }
}

function jsxElementFromReturnArgument(node: t.Node | null | undefined): t.JSXElement | null {
  if (!node) return null;
  if (node.type === 'JSXElement') return node;
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression' || node.type === 'TypeCastExpression') {
    return jsxElementFromReturnArgument(node.expression);
  }
  return null;
}

function hasInteractiveDescendant(node: t.JSXElement): boolean {
  const stack = [...node.children];
  while (stack.length > 0) {
    const child = stack.pop();
    if (!child || child.type !== 'JSXElement') continue;
    const name = getJSXName(child.openingElement.name);
    if (name && INTERACTIVE_COMPONENTS.has(name)) return true;
    stack.push(...child.children);
  }
  return false;
}

export interface ValidateCompositionCodeOptions {
  /**
   * Override the allowed JSX-component allowlist. Defaults to the
   * `@oneui/playground` re-export list. Tests use this to assert
   * specific components are rejected.
   */
  allowedComponents?: ReadonlySet<string>;
}

/**
 * Validate AI-generated TSX. Returns a structured result; never throws
 * on malformed input — parse failures become a single error issue so
 * the executor can pass them straight to the self-heal prompt.
 */
export function validateCompositionCode(
  code: string,
  options: ValidateCompositionCodeOptions = {},
): CodeValidationResult {
  const issues: CodeIssue[] = [];
  const isAllowedComponent = options.allowedComponents
    ? (name: string) => options.allowedComponents!.has(name)
    : isPlaygroundComponent;

  // ── Parse ──────────────────────────────────────────────────────────
  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      score: 0,
      issues: [{ severity: 'error', id: 'parse-failure', message: `TSX parse failed: ${msg}` }],
    };
  }

  // ── Walk ───────────────────────────────────────────────────────────
  let hasDefaultExport = false;
  let hasRootSurface = false;

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      // Allow our two roots and any subpath thereof — but `react/jsx-runtime`
      // and similar internal subpaths are fine because they're intercepted
      // by the bundler / the playground entry.
      const root = source.split('/')[0];
      const fullyAllowed = ALLOWED_IMPORTS.has(source) || ALLOWED_IMPORTS.has(root);
      if (!fullyAllowed) {
        issues.push({
          severity: 'error',
          id: 'banned-import',
          message: `Disallowed import "${source}". Only \`react\` and \`@oneui/playground\` may be imported.`,
          line: path.node.loc?.start.line,
        });
      }
    },

    ExportDefaultDeclaration(path) {
      hasDefaultExport = true;
      const declaration = path.node.declaration;
      if (declaration.type === 'FunctionDeclaration') {
        path.traverse({
          ReturnStatement(returnPath) {
            const returned = jsxElementFromReturnArgument(returnPath.node.argument);
            if (!returned) return;
            const rootName = getJSXName(returned.openingElement.name);
            if (rootName === 'Surface') hasRootSurface = true;
            returnPath.stop();
          },
        });
      } else if (declaration.type === 'ArrowFunctionExpression') {
        const returned = jsxElementFromReturnArgument(declaration.body);
        const rootName = returned ? getJSXName(returned.openingElement.name) : null;
        if (rootName === 'Surface') hasRootSurface = true;
      }
    },

    JSXOpeningElement(path) {
      const name = path.node.name;
      const tagName = getJSXName(name);

      // Capitalised JSX tag → component reference. Validate against allowlist.
      if (tagName && /^[A-Z]/.test(tagName)) {
        if (!isAllowedComponent(tagName)) {
          issues.push({
            severity: 'error',
            id: 'unknown-component',
            message: `Unknown component <${tagName}>. Not exported from @oneui/playground.`,
            line: path.node.loc?.start.line,
          });
        }
      }

      if (
        tagName &&
        findJSXAttr(path.node, 'fullWidth') &&
        !COMPONENTS_SUPPORTING_FULL_WIDTH.has(tagName)
      ) {
        issues.push({
          severity: 'error',
          id: 'unsupported-full-width',
          message: `<${tagName}> does not support fullWidth. Use a OneUI layout primitive around it or a width token on the parent container.`,
          line: path.node.loc?.start.line,
        });
      }

      // <Surface mode="..."> — verify the literal value is in the allowed set.
      const isSurface = tagName === 'Surface';
      if (isSurface) {
        for (const attr of path.node.attributes) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'mode' &&
            attr.value &&
            attr.value.type === 'StringLiteral' &&
            !SURFACE_MODES.has(attr.value.value)
          ) {
            issues.push({
              severity: 'error',
              id: 'invalid-surface-mode',
              message: `Surface mode "${attr.value.value}" is not valid. Allowed: ${Array.from(SURFACE_MODES).join(', ')}.`,
              line: attr.loc?.start.line,
            });
          }
        }
      }

      // <Icon name="..."> — verify the literal value is a known semantic
      // name. Catches camelCase typos and invented names before they
      // render as a red warning box at runtime.
      const isIcon = tagName === 'Icon';
      if (isIcon) {
        for (const attr of path.node.attributes) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'name' &&
            attr.value &&
            attr.value.type === 'StringLiteral' &&
            !VALID_ICON_NAMES.has(attr.value.value)
          ) {
              issues.push({
              severity: 'error',
              id: 'unknown-icon-name',
              message: `Icon name "${attr.value.value}" is not in the semantic mapping. Renders as a missing-icon placeholder. Use camelCase names from the allowlist, such as "chevronRight" or "add".`,
              line: attr.loc?.start.line,
            });
          }
        }
      }

      // Inline SVG icons bypass the active brand icon set. Generated UIs
      // must render icons through <Icon name="..."> so the iframe's
      // IconProvider can resolve the brand-selected library.
      if (tagName === 'svg') {
        issues.push({
          severity: 'error',
          id: 'raw-svg-icon',
          message: 'Inline SVG is not allowed for icons. Use <Icon name="..."> with a semantic icon name from the active brand icon set.',
          line: path.node.loc?.start.line,
        });
      }

      if (tagName === 'Image') {
        const src = getStringAttr(path.node, 'src');
        const alt = getStringAttr(path.node, 'alt');
        if (!src || isDisallowedImageSrc(src)) {
          issues.push({
            severity: 'error',
            id: 'broken-image-src',
            message: `Image requires a local playground asset src. Allowed: ${PLAYGROUND_IMAGE_URLS.join(', ')}.`,
            line: path.node.loc?.start.line,
          });
        }
        if (!alt || alt.trim().length === 0) {
          issues.push({
            severity: 'error',
            id: 'missing-image-alt',
            message: 'Image requires meaningful alt text.',
            line: path.node.loc?.start.line,
          });
        }
      }

      // Inline style literal scan. Look for `style={{ color: '#fff' }}`
      // patterns that bypass the token system.
      const styleObject = getStyleObject(path.node);
      if (styleObject) {
        let hasFontSize = false;
        let hasLineHeight = false;
        let hasFontFamily = false;
        let hasLayoutDisplay = false;
        let hasManualBackground = false;
        for (const prop of styleObject.properties) {
          if (
            prop.type !== 'ObjectProperty' ||
            (prop.key.type !== 'Identifier' && prop.key.type !== 'StringLiteral')
          ) {
            continue;
          }
          const key = propName(prop);
          const value = propStringValue(prop);
          if (!key) continue;
          if (key === 'fontSize') hasFontSize = true;
          if (key === 'lineHeight') hasLineHeight = true;
          if (key === 'fontFamily') hasFontFamily = true;
          if (key === 'display' && (value === 'flex' || value === 'grid')) hasLayoutDisplay = true;
          if ((key === 'background' || key === 'backgroundColor') && value) hasManualBackground = true;

          if (prop.value.type === 'NumericLiteral' && prop.value.value !== 0) {
            issues.push({
              severity: 'error',
              id: 'raw-style-number',
              message: `Inline style \`${key}: ${prop.value.value}\` uses a raw numeric React style value. Use OneUI layout primitives, design tokens, or component props.`,
              line: prop.loc?.start.line,
            });
            continue;
          }

          if (!value) continue;
          const trimmedValue = value.trim();

          if (trimmedValue !== '0' && RAW_NUMERIC_STYLE_STRING_RE.test(trimmedValue)) {
            issues.push({
              severity: 'error',
              id: 'raw-style-number',
              message: `Inline style \`${key}: "${value}"\` uses a raw numeric CSS string. Use OneUI layout primitives, design tokens, or component props.`,
              line: prop.loc?.start.line,
            });
            continue;
          }

          if (LEGACY_TOKEN_RE.test(value)) {
            issues.push({
              severity: 'error',
              id: 'legacy-token',
              message: `Inline style \`${key}\` uses a legacy token reference. Use role-explicit tokens such as --Body-M-FontSize, --Primary-Bold, or --Primary-High.`,
              line: prop.loc?.start.line,
            });
          }

          // var(--...) is the legitimate token shape for token-governed properties.
          if (STYLE_PROPS_REQUIRING_TOKENS.has(key) && value.startsWith('var(--')) continue;
          if (RAW_COLOUR_RE.test(value)) {
            issues.push({
              severity: 'error',
              id: 'inline-raw-colour',
              message: `Inline style \`${key}: '${value}'\` uses a raw colour. Prefer \`var(--Token-Name)\` or a component appearance prop.`,
              line: prop.loc?.start.line,
            });
          } else if (RAW_DIMENSION_RE.test(value)) {
            issues.push({
              severity: 'error',
              id: 'inline-raw-dimension',
              message: `Inline style \`${key}: '${value}'\` uses a raw pixel/rem value. Prefer \`var(--Body-M-FontSize)\` etc.`,
              line: prop.loc?.start.line,
            });
          }
        }

        if (tagName && SECTION_HTML_TAGS.has(tagName) && hasLayoutDisplay) {
          issues.push({
            severity: 'error',
            id: 'section-div-layout',
            message: `Use OneUI layout primitives (<Surface>, <Container>, <Grid>, <ScrollArea>) instead of <${tagName}> with display flex/grid for page structure.`,
            line: path.node.loc?.start.line,
          });
        }

        if (
          tagName &&
          SECTION_HTML_TAGS.has(tagName) &&
          hasManualBackground &&
          path.parentPath.node.type === 'JSXElement' &&
          hasInteractiveDescendant(path.parentPath.node)
        ) {
          issues.push({
            severity: 'error',
            id: 'manual-background-container',
            message: `Do not set manual background on <${tagName}> around interactive components. Use <Surface mode="..."> so child tokens remap through data-surface.`,
            line: path.node.loc?.start.line,
          });
        }

        if (tagName && TEXT_HTML_TAGS.has(tagName) && hasFontSize) {
          if (!hasLineHeight) {
            issues.push({
              severity: 'error',
              id: 'missing-typography-line-height',
              message: `<${tagName}> sets fontSize without a matching role-specific lineHeight token.`,
              line: path.node.loc?.start.line,
            });
          }
          if (!hasFontFamily) {
            issues.push({
              severity: 'error',
              id: 'missing-typography-family',
              message: `<${tagName}> sets fontSize without fontFamily: var(--Typography-Font-Primary).`,
              line: path.node.loc?.start.line,
            });
          }
        }
      }
    },
  });

  if (!hasDefaultExport) {
    issues.push({
      severity: 'error',
      id: 'missing-default-export',
      message: 'App.tsx must default-export the React component.',
    });
  }
  if (hasDefaultExport && !hasRootSurface) {
    issues.push({
      severity: 'error',
      id: 'missing-root-surface',
      message: 'App must return a root <Surface mode="default" as="main"> so brand CSS and surface context wrap the generated UI.',
    });
  }

  // ── Score ──────────────────────────────────────────────────────────
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 25 - warningCount * 5);

  return {
    valid: errorCount === 0,
    score,
    issues,
  };
}

/**
 * Format validation issues as a human-readable bullet list — for
 * inclusion in the self-heal prompt and for surfacing in the chat UI.
 */
export function formatValidationIssues(result: CodeValidationResult): string {
  if (result.issues.length === 0) return '';
  return result.issues
    .map((issue) => {
      const where = issue.line ? ` (line ${issue.line})` : '';
      const tag = issue.severity === 'error' ? 'ERROR' : 'warn';
      return `- [${tag}]${where} ${issue.message}`;
    })
    .join('\n');
}
