/**
 * Shared validator machinery — platform-agnostic pieces used by both the web
 * and native rule-sets: the issue type, comment stripping, TSX parsing + AST
 * walk, the catalog-driven unknown-prop check, the non-released-import check,
 * font-literal extraction, and the markdown formatter.
 *
 * Platform-specific rules live in rules.web.ts / rules.native.ts; the tool
 * (validate.ts) resolves the PlatformPack, picks a rule-set, and composes them
 * with the shared checks here.
 */
import { createRequire } from 'node:module';
import { getComponentIndex, getComponent } from '../../lib/snapshot.js';

// ---- types ----------------------------------------------------------------

export type ValidationRule =
  | 'inline-surface-paint'
  | 'legacy-token'
  | 'unknown-prop'
  | 'hardcoded-font'
  | 'missing-font-family'
  | 'external-icon-import'
  | 'non-released-component'
  | 'undefined-component'
  | 'unknown-import-path'
  // web-only
  | 'forbidden-base-ui'
  // native-only
  | 'literal-color'
  | 'literal-spacing'
  | 'forbidden-rn-primitive'
  | 'banned-native-import';

export interface ValidationIssue {
  line: number;
  col: number;
  severity: 'error' | 'warning';
  rule: ValidationRule;
  message: string;
  suggestion: string;
}

/** Context handed to each platform rule-set. */
export interface RuleContext {
  /** Source split into lines, with comments blanked (line numbers preserved). */
  lines: string[];
  /** Parsed Babel AST (or null if parsing failed — AST checks then no-op). */
  ast: unknown;
  /** assets/ subdir for this platform's catalog ('' = web, 'native' = RN). */
  assetSubdir: string;
  /** Importable surface of the platform's runtime package. */
  released: ReadonlySet<string>;
  /** The platform's runtime package name (for import-source matching). */
  pkgName: string;
}

// ---- comment stripping (preserve line numbers) ----------------------------

export function stripComments(code: string): string[] {
  const noBlock = code.replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) ?? []).length));
  return noBlock.split('\n').map((line) => {
    const i = line.indexOf('//');
    return i === -1 ? line : line.slice(0, i);
  });
}

// ---- TSX parsing + AST walk -----------------------------------------------

const _require = createRequire(import.meta.url);

function getBabelParse(): ((code: string, opts: Record<string, unknown>) => unknown) | null {
  try {
    const mod = _require('@babel/parser') as {
      parse: (code: string, opts: Record<string, unknown>) => unknown;
    };
    return mod.parse;
  } catch {
    return null;
  }
}

const babelParse = getBabelParse();

/** Parse TSX once; returns null on failure (checks then skip, no false positives). */
export function parseTsx(tsx: string): unknown {
  if (!babelParse) return null;
  try {
    return babelParse(tsx, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: true });
  } catch {
    return null;
  }
}

/**
 * AST walker — avoids importing @babel/traverse. ITERATIVE (explicit stack) so a
 * pathologically deep or generated file cannot overflow the call stack and crash
 * the validator tool; the previous recursive version did. Visits pre-order DFS
 * (parent before children, siblings in source order) — callers depend on that
 * order (first-match / one-issue-per-name).
 */
export function walkAST(node: unknown, visitor: (n: Record<string, unknown>) => void): void {
  const stack: unknown[] = [node];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== 'object') continue;
    const n = cur as Record<string, unknown>;
    visitor(n);
    // Collect child nodes in forward traversal order, then push them REVERSED so
    // they pop in forward order — this reproduces the original recursion's
    // pre-order DFS exactly.
    const children: unknown[] = [];
    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'start' || key === 'end' || key === 'errors') continue;
      const val = n[key];
      if (Array.isArray(val)) {
        for (const child of val) {
          if (child && typeof child === 'object' && typeof (child as Record<string, unknown>).type === 'string') {
            children.push(child);
          }
        }
      } else if (val && typeof val === 'object' && typeof (val as Record<string, unknown>).type === 'string') {
        children.push(val);
      }
    }
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---- check: unknown props on known components (catalog-driven, shared) -----

const HTML_ALWAYS_ALLOWED = new Set([
  'className', 'id', 'style', 'key', 'ref', 'children', 'slot',
  'tabIndex', 'tabindex', 'role', 'hidden', 'title', 'lang', 'dir',
  'draggable', 'contentEditable', 'spellCheck', 'autoFocus',
  // React Native universals
  'testID', 'accessibilityLabel', 'accessibilityHint', 'accessibilityRole', 'accessibilityState',
]);

function isAlwaysAllowed(propName: string): boolean {
  return (
    HTML_ALWAYS_ALLOWED.has(propName) ||
    propName.startsWith('aria-') ||
    propName.startsWith('data-') ||
    propName.startsWith('on')
  );
}

/** Build component → allowed-prop-names from the platform's baked catalog. */
function buildComponentPropsMap(assetSubdir: string): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const entry of getComponentIndex(assetSubdir)) {
    const comp = getComponent(entry.slug, assetSubdir) as Record<string, unknown> | null;
    if (!comp) continue;
    const schemaProps = (comp.propsSchema as Record<string, unknown> | undefined)?.properties;
    const propsArr = (comp.props as Array<{ name?: string }> | undefined) ?? [];
    const propNames = new Set<string>();
    if (schemaProps && typeof schemaProps === 'object') {
      for (const k of Object.keys(schemaProps as object)) propNames.add(k);
    }
    for (const p of propsArr) if (p.name) propNames.add(p.name);
    if (propNames.size > 0) map.set(entry.name, propNames);
  }
  return map;
}

export function checkUnknownProps(ast: unknown, assetSubdir: string): ValidationIssue[] {
  if (!ast) return [];
  const compMap = buildComponentPropsMap(assetSubdir);
  const issues: ValidationIssue[] = [];

  walkAST(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') return;
    const nameNode = node.name as Record<string, unknown>;
    if (nameNode.type !== 'JSXIdentifier') return;
    const compName = nameNode.name as string;
    if (!/^[A-Z]/.test(compName)) return;
    const allowed = compMap.get(compName);
    if (!allowed) return; // not in catalog — may be a user component

    for (const attr of (node.attributes as unknown[]) ?? []) {
      const a = attr as Record<string, unknown>;
      if (a.type !== 'JSXAttribute') continue;
      const attrName = a.name as Record<string, unknown>;
      const propName =
        attrName.type === 'JSXIdentifier'
          ? (attrName.name as string)
          : `${(attrName as Record<string, Record<string, unknown>>).namespace?.name}:${attrName.name}`;
      if (isAlwaysAllowed(propName)) continue;
      if (allowed.has(propName)) continue;

      const loc = (attrName.loc as Record<string, Record<string, number>> | undefined)?.start;
      const validSample = [...allowed].filter((p) => !HTML_ALWAYS_ALLOWED.has(p)).slice(0, 10).join(', ');
      issues.push({
        line: loc?.line ?? 0,
        col: (loc?.column ?? 0) + 1,
        severity: 'warning',
        rule: 'unknown-prop',
        message: `Unknown prop "${propName}" on <${compName}>. Not in the OneUI component API — will be silently ignored at runtime.`,
        suggestion: `Valid OneUI props: ${validSample}${allowed.size > 10 ? ', …' : ''}. Call get_component_info("${compName}") for the full API.`,
      });
    }
  });

  return issues;
}

// ---- check: non-released (WIP) component imports (shared) ------------------

export function checkNonReleasedComponents(
  ast: unknown,
  released: ReadonlySet<string>,
  pkgName: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  const deepRe = new RegExp(`^${escapeRegExp(pkgName)}/components/([A-Za-z0-9]+)`);

  walkAST(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    if (node.importKind === 'type') return;
    const src = (node.source as Record<string, unknown> | undefined)?.value;
    if (typeof src !== 'string') return;

    const loc = (node.loc as Record<string, Record<string, number>> | undefined)?.start;
    const at = { line: loc?.line ?? 0, col: (loc?.column ?? 0) + 1 };

    const deep = src.match(deepRe);
    if (deep) {
      const name = deep[1];
      if (!released.has(name)) {
        issues.push({
          ...at,
          severity: 'error',
          rule: 'non-released-component',
          message: `"${name}" is not a released OneUI component (deep import ${src}) — it is not part of the published package, so this import will fail.`,
          suggestion: `Drop "${name}" (WIP/unreleased). Call list_components for the released set.`,
        });
      }
      return;
    }

    if (src !== pkgName) return;

    for (const s of (node.specifiers as unknown[]) ?? []) {
      const spec = s as Record<string, unknown>;
      if (spec.type !== 'ImportSpecifier') continue;
      if (spec.importKind === 'type') continue;
      const imported = spec.imported as Record<string, unknown> | undefined;
      const name =
        imported?.type === 'Identifier' ? (imported.name as string)
        : imported?.type === 'StringLiteral' ? (imported.value as string)
        : '';
      if (!name || !/^[A-Z]/.test(name)) continue;
      if (released.has(name)) continue;
      const sLoc = (spec.loc as Record<string, Record<string, number>> | undefined)?.start;
      issues.push({
        line: sLoc?.line ?? at.line,
        col: (sLoc?.column ?? 0) + 1,
        severity: 'error',
        rule: 'non-released-component',
        message: `"${name}" is not a released OneUI component — it is not exported by the published ${pkgName}, so this import will fail.`,
        suggestion: `Drop "${name}" (WIP/unreleased). Call list_components for the released set, or compose the same UI from released components.`,
      });
    }
  });

  return issues;
}

// ---- check: undefined / hallucinated component references (shared) ---------
// A capitalized JSX element that is neither imported nor declared anywhere in
// the file is an undefined reference — at best a missing import, at worst a
// hallucinated component name (e.g. <JioCard>, <PrimaryButton>, <InputBox>) that
// would crash at runtime. The catalog/non-released checks only see names the LLM
// imported FROM the OneUI package; this closes the bare-JSX / no-import gap.

/** Collect identifier names introduced by a binding pattern (destructuring incl.). */
function collectPatternNames(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== 'object') return;
  const n = node as Record<string, unknown>;
  switch (n.type) {
    case 'Identifier':
      out.add(n.name as string);
      break;
    case 'ObjectPattern':
      for (const p of (n.properties as unknown[]) ?? []) {
        const pp = p as Record<string, unknown>;
        collectPatternNames(pp.type === 'RestElement' ? pp.argument : pp.value, out);
      }
      break;
    case 'ArrayPattern':
      for (const e of (n.elements as unknown[]) ?? []) collectPatternNames(e, out);
      break;
    case 'AssignmentPattern':
      collectPatternNames(n.left, out);
      break;
    case 'RestElement':
      collectPatternNames(n.argument, out);
      break;
  }
}

/** All names bound in the file: imports, fn/class decls, variables, params. */
function collectBoundNames(ast: unknown): Set<string> {
  const bound = new Set<string>();
  walkAST(ast, (n) => {
    switch (n.type) {
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
      case 'ImportSpecifier': {
        const local = n.local as Record<string, unknown> | undefined;
        if (local?.type === 'Identifier') bound.add(local.name as string);
        break;
      }
      case 'FunctionDeclaration':
      case 'ClassDeclaration': {
        const id = n.id as Record<string, unknown> | undefined;
        if (id?.type === 'Identifier') bound.add(id.name as string);
        for (const p of (n.params as unknown[]) ?? []) collectPatternNames(p, bound);
        break;
      }
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ObjectMethod':
      case 'ClassMethod':
        for (const p of (n.params as unknown[]) ?? []) collectPatternNames(p, bound);
        break;
      case 'VariableDeclarator':
        collectPatternNames(n.id, bound);
        break;
    }
  });
  return bound;
}

export function checkUndefinedComponents(
  ast: unknown,
  released: ReadonlySet<string>,
  pkgName: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  const bound = collectBoundNames(ast);
  const reported = new Set<string>();

  walkAST(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') return;
    const nameNode = node.name as Record<string, unknown>;
    if (nameNode.type !== 'JSXIdentifier') return; // skip <Foo.Bar> member / namespaced
    const compName = nameNode.name as string;
    if (!/^[A-Z]/.test(compName)) return; // intrinsic host element (<div>, …)
    if (bound.has(compName)) return; // imported or declared in scope → fine
    if (reported.has(compName)) return; // one issue per name
    reported.add(compName);

    const loc = (nameNode.loc as Record<string, Record<string, number>> | undefined)?.start;
    const at = { line: loc?.line ?? 0, col: (loc?.column ?? 0) + 1 };

    if (released.has(compName)) {
      issues.push({
        ...at,
        severity: 'error',
        rule: 'undefined-component',
        message: `<${compName}> is used but never imported. It is a released OneUI component, so this missing import will crash at runtime.`,
        suggestion: `Add: import { ${compName} } from '${pkgName}';`,
      });
    } else {
      issues.push({
        ...at,
        severity: 'error',
        rule: 'undefined-component',
        message: `<${compName}> is not defined in this file and is not a OneUI component — it looks like a hallucinated or incorrect component name.`,
        suggestion: `Use a released OneUI component (call list_components for the set), or import/define <${compName}> if it is your own. Common slips: InputBox→Input/InputField, PrimaryButton→Button (attention="high"), JioCard/Card→Container or <Surface mode="subtle">.`,
      });
    }
  });

  return issues;
}

/** Bare-module import sources that are OneUI's real surfaces (never flagged). */
export function isAllowedOneuiImport(src: string, pkgName: string, extras: readonly string[]): boolean {
  if (src === pkgName || src.startsWith(`${pkgName}/`)) return true;
  return extras.some((a) => src === a || src.startsWith(`${a}/`));
}

// ---- check: OneUI-looking import from the wrong package (shared) -----------
// Catches `import { Button } from '@oneui/ui'` / '@jds4/oneui' / 'oneui-react'
// etc. — module specifiers that look like OneUI but are not the published
// package, so the import (and any component the LLM "imported" through it) fails.

export function checkUnknownOneuiImportPath(
  ast: unknown,
  pkgName: string,
  extras: readonly string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;

  walkAST(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    const src = (node.source as Record<string, unknown> | undefined)?.value;
    if (typeof src !== 'string') return;
    if (src.startsWith('.')) return; // relative/local import
    if (!/oneui/i.test(src)) return; // only OneUI-looking specifiers
    if (isAllowedOneuiImport(src, pkgName, extras)) return;

    const loc = (node.loc as Record<string, Record<string, number>> | undefined)?.start;
    issues.push({
      line: loc?.line ?? 0,
      col: (loc?.column ?? 0) + 1,
      severity: 'error',
      rule: 'unknown-import-path',
      message: `Import source "${src}" looks like OneUI but is not the published package — this import will fail to resolve.`,
      suggestion: `Import components from '${pkgName}'${extras.length ? ` (and icons from '${extras[0]}')` : ''}. Call list_components for the released set.`,
    });
  });

  return issues;
}

// ---- shared: banned module imports ----------------------------------------

const IMPORT_SOURCE_RE = /(?:from|require\()\s*['"]([^'"]+)['"]/g;

/** Flag imports whose module specifier matches a banned library (exact or `<lib>/…`). */
export function checkBannedModuleImports(
  lines: string[],
  banned: readonly string[],
  build: (lib: string) => Pick<ValidationIssue, 'message' | 'suggestion'>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < lines.length; i++) {
    IMPORT_SOURCE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = IMPORT_SOURCE_RE.exec(lines[i])) !== null) {
      const spec = m[1];
      const hit = banned.find((lib) => spec === lib || spec.startsWith(`${lib}/`));
      if (!hit) continue;
      issues.push({ line: i + 1, col: m.index + 1, severity: 'error', rule: 'external-icon-import', ...build(hit) });
    }
  }
  return issues;
}

// ---- shared: font-literal extraction --------------------------------------

const GENERIC_FONTS = new Set([
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
  'inherit', 'initial', 'unset', 'revert', 'revert-layer', 'normal', 'none',
  '-apple-system', 'blinkmacsystemfont',
]);

function stripVars(value: string): string {
  let prev: string;
  let v = value;
  do {
    prev = v;
    v = v.replace(/var\([^()]*\)/g, '');
  } while (v !== prev);
  return v;
}

/** Literal (non-token, non-generic) typeface names in a font-family / font value. */
export function literalFontNames(value: string, shorthand: boolean): string[] {
  const stripped = stripVars(value);
  const parts = shorthand ? stripped.split(/[,/\s]+/) : stripped.split(',');
  const out: string[] = [];
  for (let p of parts) {
    p = p.replace(/^['"`]+|['"`]+$/g, '').trim();
    if (!p) continue;
    if (/\d/.test(p)) continue;
    if (GENERIC_FONTS.has(p.toLowerCase())) continue;
    if (/[A-Za-z]/.test(p)) out.push(p);
  }
  return out;
}

const FONT_QUOTED_RE = /\b(font-family|fontFamily|font)\s*[:=]\s*(['"`])([\s\S]*?)\2/g;
const FONT_FAMILY_UNQUOTED_RE = /\bfont-family\s*:\s*([^;{}\n'"`]+)/g;

/** Flag hardcoded literal typefaces in font-family/fontFamily/font, with a platform hint. */
export function collectFontLiterals(lines: string[], hint: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    FONT_QUOTED_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = FONT_QUOTED_RE.exec(line)) !== null) {
      const literals = literalFontNames(m[3], m[1] === 'font');
      if (literals.length) {
        issues.push({
          line: i + 1,
          col: m.index + 1,
          severity: 'error',
          rule: 'hardcoded-font',
          message: `Hardcoded font ${literals.map((l) => `"${l}"`).join(', ')} in \`${m[1]}\`. Literal typefaces are not allowed.`,
          suggestion: hint,
        });
      }
    }

    FONT_FAMILY_UNQUOTED_RE.lastIndex = 0;
    while ((m = FONT_FAMILY_UNQUOTED_RE.exec(line)) !== null) {
      const value = m[1];
      if (value.includes('"') || value.includes("'") || value.includes('`')) continue;
      const literals = literalFontNames(value, false);
      if (literals.length) {
        issues.push({
          line: i + 1,
          col: m.index + 1,
          severity: 'error',
          rule: 'hardcoded-font',
          message: `Hardcoded font ${literals.map((l) => `"${l}"`).join(', ')} in \`font-family\`. Literal typefaces are not allowed.`,
          suggestion: hint,
        });
      }
    }
  }
  return issues;
}

// ---- shared: markdown formatter -------------------------------------------

export function formatIssues(all: ValidationIssue[]): string {
  if (all.length === 0) {
    return 'All clear — no OneUI rule violations found. Code is compliant.';
  }
  const sorted = [...all].sort((a, b) => a.line - b.line || a.col - b.col);
  const errors = sorted.filter((i) => i.severity === 'error').length;
  const warnings = sorted.filter((i) => i.severity === 'warning').length;
  return [
    `## ${sorted.length} issue${sorted.length !== 1 ? 's' : ''} found (${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''})`,
    '',
    '| # | Line | Col | Severity | Rule | Message |',
    '| --- | --- | --- | --- | --- | --- |',
    ...sorted.map(
      (iss, i) => `| ${i + 1} | ${iss.line} | ${iss.col} | **${iss.severity}** | \`${iss.rule}\` | ${iss.message} |`,
    ),
    '',
    '## How to fix',
    ...sorted.map((iss, i) => `**${i + 1}.** Line ${iss.line} — ${iss.suggestion}`),
  ].join('\n');
}
