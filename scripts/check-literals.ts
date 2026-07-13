#!/usr/bin/env node
/**
 * Quality Gate: Zero Tolerance Literal Detection
 *
 * Scans all CSS and TSX files for hard-coded values:
 * - Hex colors (#fff, #000000)
 * - RGB/RGBA colors
 * - OkLCH colors (should use var(--token))
 * - Hard-coded pixel values (except 0, 999px, 100%)
 * - Hard-coded font sizes, weights
 *
 * CRITICAL: This script MUST pass before any component ships
 *
 * Usage: pnpm check:literals
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ── Patterns ─────────────────────────────────────────────────────────────────

const PATTERNS = {
  hexColor: /#[0-9a-fA-F]{3,8}\b/g,
  // Require a digit as the first non-whitespace char inside the parens, and not
  // be preceded by a letter — excludes function names like `linearToSrgb(value...)`
  // while still matching actual rgb color literals like `rgb(255, 0, 0)`.
  rgb: /(?<![A-Za-z])rgba?\s*\(\s*\d/g,
  oklch: /oklch\s*\([^)]+\)/g,
  fontWeight: /font-weight:\s*\d+(?!00)/g,
  fontSize: /font-size:\s*[0-9]+px/g,
  borderRadius: /border-radius:\s*(?!999px|var\()[0-9]+px/g,
  padding: /padding(?:-[a-z]+)?:\s*[0-9]+px(?!\))/g,
  margin: /margin(?:-[a-z]+)?:\s*[0-9]+px(?!\))/g,
  width: /width:\s*[0-9]+px/g,
  height: /height:\s*[0-9]+px/g,
  top: /top:\s*[0-9]+px/g,
  bottom: /bottom:\s*[0-9]+px/g,
  left: /left:\s*[0-9]+px/g,
  right: /right:\s*[0-9]+px/g,
};

// ── Native-specific patterns (applied to *.native.tsx files) ──────────────────

/** Hex color string literal in JS context: '#xxx' or "#xxxxxx". */
const NATIVE_HEX_COLOR = /(['"])#[0-9a-fA-F]{3,8}\1/g;

/** Quoted numeric font weight string like fontWeight: '700'. */
const NATIVE_QUOTED_FONT_WEIGHT = /\bfontWeight:\s*'[0-9]+'/g;

/**
 * Style-relevant numeric props inside StyleSheet/inline-style objects.
 * Matches `propName: <number>` only when NOT followed by an identifier or dot
 * (so `fontSize: tokens.x` and `fontSize: typography.size.m` don't trigger).
 */
const NATIVE_STYLE_NUMBER_PROPS = [
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'borderRadius',
  'borderWidth',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingVertical',
  'paddingHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginVertical',
  'marginHorizontal',
  'padding',
  'margin',
  'gap',
] as const;

const NATIVE_STYLE_NUMBER_PATTERN = new RegExp(
  `\\b(${NATIVE_STYLE_NUMBER_PROPS.join('|')}):\\s*(\\d+(?:\\.\\d+)?)(?![\\w.])`,
  'g',
);

/**
 * Numeric values that are explicitly allowed in native StyleSheet literals.
 * 0/1: zero spacing + hairline border. 44/40/48: WCAG touch targets
 * (CLAUDE.md acknowledges). 0.5/0.8: established disabled/loading opacity.
 */
const NATIVE_NUMERIC_ALLOWLIST = new Set([
  '0',
  '1',
  '44',
  '40',
  '48',
  '0.5',
  '0.8',
]);

// ── Known Exceptions (CLAUDE.md "Known Exceptions" section) ──────────────────
//
// Path substrings — any file whose normalised path contains one of these is
// skipped entirely.  Keep each entry documented with the reason.

const EXCLUDED_FILE_SUFFIXES: Array<{ path: string; reason: string }> = [
  // layout.tsx loading spinner (renders before tokens load)
  {
    path: 'apps/platform/src/app/layout.tsx',
    reason: 'loading spinner renders before tokens load — CLAUDE.md Known Exceptions',
  },
  {
    path: 'packages/ui/src/__tests__/',
    reason:
      'Figma matrix Vite harness + Playwright specs — layout tokens mirror dev tooling; parity expects rgb() strings from Figma API',
  },
  // BrandLogo / LayoutSkeleton in layout (skeleton/loading states)
  {
    path: 'apps/platform/src/components/BrandLogo',
    reason: 'skeleton/loading state — CLAUDE.md Known Exceptions',
  },
  {
    path: 'apps/platform/src/components/LayoutSkeleton',
    reason: 'skeleton/loading state — CLAUDE.md Known Exceptions',
  },
  // Expo playground — intentionally non-token-purified dev scratchpad.
  // Token purity is enforced on production component packages only. To
  // purify the playground, remove this entry and fix the violations.
  {
    path: 'apps/mobile',
    reason: 'Expo playground is a dev scratchpad — token purity enforced on packages, not app fixtures',
  },
  {
    path: 'apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/playground.module.css',
    reason:
      'Composition playground CSS contains intentional fixed device-frame geometry; TSX chrome is scanned separately',
  },
  {
    path: 'apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/DirectionPicker.module.css',
    reason:
      'Direction preview cards use fixed target-artboard geometry for miniature device previews',
  },
  {
    path: 'apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/CritiquePanel.module.css',
    reason:
      'Responsive critique grid uses CSS minmax pixel thresholds; not component styling tokens',
  },
  {
    path: 'apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground/RetrievalTracePanel.module.css',
    reason:
      'Debug trace panel uses source-code text affordances outside generated UI chrome',
  },
];

// ── Scan roots ────────────────────────────────────────────────────────────────

const SCAN_ROOTS = [
  'packages/ui/src',
  'packages/ui-native/src',
  'apps/platform/src/design-tools',
  'apps/platform/src/app/(platform)/(studio)/agents/design-composition/playground',
];

// ── P8: banned legacy breakpoint tokens ──────────────────────────────────────
//
// The responsive model migrated from 5 fixed-width platform ids
// (S-360/M-768/M-1024/L-1440/L-1920) + the `data-7-Platform` DOM attribute to 3
// fluid breakpoints (S/M/L) + `data-Breakpoint`. These tokens are banned repo-wide
// so they can't creep back. Mark a genuine exception with an `INTENTIONAL-LITERAL`
// comment within 50 lines above the occurrence.

const BANNED_BREAKPOINT_PATTERN =
  /(?<![\w-])(?:S-360|M-768|M-1024|L-1440|L-1920)(?![\w-])|data-7-Platform/g;

/** File extensions scanned for the banned breakpoint tokens (source + committed assets). */
const BREAKPOINT_SCAN_EXTS = ['.ts', '.tsx', '.css', '.mts', '.mjs', '.dart', '.json', '.md', '.html'];

/** Directory names never descended into for the banned-token scan. */
const BREAKPOINT_EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage',
  '.turbo', '.oneui-cache', 'test-results', 'playwright-report',
]);

/**
 * Path substrings excluded from the banned-token scan:
 *  - this guard script itself legitimately names the banned tokens;
 *  - local editor/agent settings are runtime state, not committed source.
 */
const BREAKPOINT_EXCLUDED_PATHS = [
  'scripts/check-literals.ts',
  'settings.local.json',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Violation {
  file: string;
  line: number;
  type: string;
  value: string;
  context: string;
}

/**
 * Returns all var(…) ranges on a line as [start, end] pairs (end exclusive).
 * We need this to check if a matched literal falls inside a CSS var() fallback
 * such as `var(--Spacing-3-5, 14px)`.
 */
function getVarRanges(line: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let i = 0;
  while (i < line.length) {
    const idx = line.indexOf('var(', i);
    if (idx === -1) break;
    // Walk forward counting parens to find the matching close-paren
    let depth = 0;
    let j = idx;
    while (j < line.length) {
      if (line[j] === '(') depth++;
      else if (line[j] === ')') {
        depth--;
        if (depth === 0) {
          ranges.push([idx, j + 1]);
          break;
        }
      }
      j++;
    }
    i = j + 1;
  }
  return ranges;
}

/** Returns true if position `pos` falls inside any of the given ranges. */
function isInsideVarRange(pos: number, ranges: Array<[number, number]>): boolean {
  for (const [start, end] of ranges) {
    if (pos >= start && pos < end) return true;
  }
  return false;
}

function getAllViolations(): Violation[] {
  const violations: Violation[] = [];

  // Recursively get all CSS and TSX files
  function walkDir(dir: string): string[] {
    const files: string[] = [];
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...walkDir(fullPath));
        } else if (entry.name.endsWith('.css') || entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (_e) {
      // Ignore permission errors
    }
    return files;
  }

  const allFiles: string[] = [];
  for (const root of SCAN_ROOTS) {
    allFiles.push(...walkDir(root));
  }

  for (const file of allFiles) {
    if (!existsSync(file)) continue;

    // Skip known-exception files
    const normalised = file.replace(/\\/g, '/');
    if (EXCLUDED_FILE_SUFFIXES.some(({ path }) => normalised.includes(path))) {
      continue;
    }

    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;

      // Skip lines marked as INTENTIONAL-LITERAL (intentional exception)
      // Checks current line and up to 50 lines before for marker
      let shouldSkip = false;
      for (let i = Math.max(0, lineNum - 50); i <= lineNum; i++) {
        if (lines[i].includes('INTENTIONAL-LITERAL')) {
          shouldSkip = true;
          break;
        }
      }
      if (shouldSkip) return;

      // Pre-compute var(…) ranges for this line so we can skip literals
      // that appear only as CSS custom-property fallback values, e.g.:
      //   var(--Spacing-3-5, 14px)  ← the 14px is a fallback, not a bare literal
      // A literal OUTSIDE every var() range IS a real violation, e.g.:
      //   padding: 8px var(--Spacing-3-5)  ← the 8px is a real violation
      const varRanges = getVarRanges(line);

      // Check each pattern
      Object.entries(PATTERNS).forEach(([type, pattern]) => {
        let match;
        // Reset regex
        pattern.lastIndex = 0;
        while ((match = pattern.exec(line)) !== null) {
          // Allowlist certain values
          if (['0', '0px', '100%', '999px', 'transparent', 'inherit'].includes(match[0])) {
            continue;
          }

          // Skip if the matched literal is inside a var(…) range (it's a fallback)
          if (isInsideVarRange(match.index, varRanges)) {
            continue;
          }

          violations.push({
            file,
            line: lineNum + 1,
            type,
            value: match[0],
            context: line.trim(),
          });
        }
      });

      // Native-specific scanning: only on *.native.tsx / *.native.ts files.
      // Catches hardcoded hex/quoted-weight/numeric style values that the
      // CSS-only PATTERNS miss because RN uses JSX-prop syntax, not CSS.
      const isNative = file.endsWith('.native.tsx') || file.endsWith('.native.ts');
      if (!isNative) return;

      // Hex color string literals (e.g. '#0066cc')
      NATIVE_HEX_COLOR.lastIndex = 0;
      let nativeMatch: RegExpExecArray | null;
      while ((nativeMatch = NATIVE_HEX_COLOR.exec(line)) !== null) {
        violations.push({
          file,
          line: lineNum + 1,
          type: 'nativeHexColor',
          value: nativeMatch[0],
          context: line.trim(),
        });
      }

      // Quoted numeric fontWeight (e.g. fontWeight: '700')
      NATIVE_QUOTED_FONT_WEIGHT.lastIndex = 0;
      while ((nativeMatch = NATIVE_QUOTED_FONT_WEIGHT.exec(line)) !== null) {
        violations.push({
          file,
          line: lineNum + 1,
          type: 'nativeQuotedFontWeight',
          value: nativeMatch[0],
          context: line.trim(),
        });
      }

      // Numeric style props (fontSize: 16, paddingVertical: 12, …)
      NATIVE_STYLE_NUMBER_PATTERN.lastIndex = 0;
      while ((nativeMatch = NATIVE_STYLE_NUMBER_PATTERN.exec(line)) !== null) {
        const propName = nativeMatch[1];
        const numValue = nativeMatch[2];
        if (NATIVE_NUMERIC_ALLOWLIST.has(numValue)) continue;
        violations.push({
          file,
          line: lineNum + 1,
          type: `native:${propName}`,
          value: `${propName}: ${numValue}`,
          context: line.trim(),
        });
      }
    });
  }

  return violations;
}

/** Recursively collect files with a banned-token-scannable extension from `dir`. */
function walkRepoForBreakpointScan(dir: string): string[] {
  const files: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (BREAKPOINT_EXCLUDED_DIRS.has(entry.name)) continue;
      files.push(...walkRepoForBreakpointScan(join(dir, entry.name)));
    } else if (BREAKPOINT_SCAN_EXTS.some((ext) => entry.name.endsWith(ext))) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

/** Repo-wide scan for the banned legacy breakpoint tokens (P8). */
function getBreakpointBanViolations(): Violation[] {
  const violations: Violation[] = [];
  const files = walkRepoForBreakpointScan('.');

  for (const file of files) {
    const normalised = file.replace(/\\/g, '/');
    if (BREAKPOINT_EXCLUDED_PATHS.some((p) => normalised.includes(p))) continue;
    let content: string;
    try {
      content = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    if (!content.includes('S-360') && !content.includes('M-768') &&
        !content.includes('M-1024') && !content.includes('L-1440') &&
        !content.includes('L-1920') && !content.includes('data-7-Platform')) {
      continue; // fast reject
    }
    const lines = content.split('\n');
    lines.forEach((line, lineNum) => {
      // Honor INTENTIONAL-LITERAL marker on the line or up to 50 lines above.
      for (let i = Math.max(0, lineNum - 50); i <= lineNum; i++) {
        if (lines[i].includes('INTENTIONAL-LITERAL')) return;
      }
      BANNED_BREAKPOINT_PATTERN.lastIndex = 0;
      let match;
      while ((match = BANNED_BREAKPOINT_PATTERN.exec(line)) !== null) {
        violations.push({
          file: file.replace(/^\.\//, ''),
          line: lineNum + 1,
          type: 'legacyBreakpoint',
          value: match[0],
          context: line.trim().slice(0, 140),
        });
      }
    });
  }
  return violations;
}

function main() {
  const violations = getAllViolations();
  const breakpointViolations = getBreakpointBanViolations();

  if (breakpointViolations.length > 0) {
    console.error('❌ Banned legacy breakpoint token(s) detected\n');
    console.error(
      `Found ${breakpointViolations.length} occurrence(s) of a banned token ` +
      `(S-360 / M-768 / M-1024 / L-1440 / L-1920 / data-7-Platform).\n` +
      `Use the S/M/L breakpoints + data-Breakpoint instead.\n`,
    );
    const byFile = new Map<string, Violation[]>();
    breakpointViolations.forEach((v) => {
      if (!byFile.has(v.file)) byFile.set(v.file, []);
      byFile.get(v.file)!.push(v);
    });
    byFile.forEach((fv, file) => {
      console.error(`\n${file}:`);
      fv.forEach((v) => console.error(`  Line ${v.line}: "${v.value}"  —  ${v.context}`));
    });
    console.error('\n💡 Mark a genuine exception with an INTENTIONAL-LITERAL comment.');
    process.exit(1);
  }

  if (violations.length === 0) {
    console.log('✅ Zero tolerance check PASSED');
    console.log('   No hard-coded values detected in UI components');
    console.log('   No banned legacy breakpoint tokens detected');
    return 0;
  }

  console.error('❌ Zero tolerance check FAILED\n');
  console.error(`Found ${violations.length} literal value(s):\n`);

  // Group by file
  const byFile = new Map<string, Violation[]>();
  violations.forEach((v) => {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file)!.push(v);
  });

  // Print violations
  byFile.forEach((fileViolations, file) => {
    console.error(`\n${file}:`);
    fileViolations.forEach((v) => {
      console.error(`  Line ${v.line}: ${v.type}`);
      console.error(`    Value: "${v.value}"`);
      console.error(`    Context: ${v.context}`);
      const native =
        v.type.startsWith('native:') ||
        v.type === 'nativeHexColor' ||
        v.type === 'nativeQuotedFontWeight';
      console.error(
        native
          ? `    Fix: Replace with tokens.<group>.<name> or typography.size.<x>`
          : `    Fix: Replace with token: var(--Token-Name)`,
      );
    });
  });

  console.error(`\n💡 Remember: ALL styling must use tokens`);
  console.error('   Web: var(--Token-Name)');
  console.error('   Native: tokens.category.name');

  process.exit(1);
}

main();
