#!/usr/bin/env node
/**
 * Quality Gate: Legacy V1/V3 Token Detection
 *
 * Scans component CSS modules in the styled set for legacy V1/V3 token
 * references that should use V4 role-explicit tokens instead.
 *
 * The brand CSS engine still emits V1/V3 aliases (--Surface-Bold, --Text-High,
 * --Typography-Size-*, etc.) for backward compatibility with unstyled Tier 3
 * wrappers (Slider, Dialog, Menu, etc.) that haven't been migrated yet. This
 * script enforces that NEW or refactored code in the *styled* component set
 * uses the V4 role-explicit equivalents.
 *
 * Two modes:
 *   default (lenient): flag PRIMARY V3 references — i.e., when a V3 alias is
 *     used as the main token, not as a fallback inside a chain like
 *     `var(--Primary-FG-Bold, var(--Surface-Bold))`. Catches new mistakes
 *     while allowing the existing fallback chains to remain as a defensive
 *     net for FOUC.
 *   --strict: flag every V3 reference, including fallback positions. Use this
 *     when ready to fully eliminate the backward-compat layer.
 *
 * Scope:
 *   - Only `.module.css` files in `packages/ui/src/components/<StyledComponent>/`
 *   - Story / showcase / preview / meta / tokens / test files are NOT scanned
 *     (those are documentation and demonstration code, not production CSS).
 *   - Unstyled Tier 3 wrappers (Slider, Dialog, Menu, etc.) are NOT scanned —
 *     they still rely on V3 aliases until a future Phase 2 styling pass.
 *
 * Exemptions:
 *   - Lines marked with INTENTIONAL-LEGACY comment (within 50 lines context).
 *   - Comments (lines starting with `*`, `/*`, or `//`).
 *
 * Usage:
 *   pnpm check:legacy-tokens
 *   pnpm check:legacy-tokens --strict
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * The styled component set — components where V4 token discipline is enforced.
 * These are the components actively maintained by the design system team.
 * Unstyled Tier 3 Base UI wrappers are intentionally absent.
 */
const STYLED_COMPONENTS = new Set([
  'Avatar',
  'Badge',
  'Button',
  'Checkbox',
  'CheckboxGroup',
  'Chip',
  'ChipGroup',
  'CircularProgressIndicator',
  'ContentBlock',
  'CounterBadge',
  'Divider',
  'Icon',
  'IconButton',
  'IconContained',
  'Image',
  'IndicatorBadge',
  'Input',
  'JioRibbon',
  'Logo',
  'Radio',
  'SelectableButton',
  'SelectableIconButton',
  'SelectableSingleTextButton',
  'Stepper',
  'Switch',
  'Tooltip',
  'WebHeader',
]);

/**
 * Legacy V1/V3 token patterns to flag.
 *
 * Each pattern matches `var(--LegacyToken)` references. The script then
 * decides whether to flag the match based on lenient vs strict mode.
 *
 * Tokens that look V3-ish but are STILL VALID in V4 (and must NOT be flagged):
 *   - --Surface-Default        (page background, semantic anchor)
 *   - --Surface-Main           (page background alias, used in halo gap fallback)
 *   - --Surface-Halo-Gap       (V4 token added in 2026-04 for focus rings)
 *   - --Surface-Fill-{Mode}    (V4 root-only container fill tokens)
 *   - --Border-Subtle / --Border-Default (semantic stroke aliases)
 */
const LEGACY_PATTERNS: Record<string, RegExp> = {
  // --Surface-Bold, --Surface-Subtle, --Surface-Minimal, --Surface-Ghost,
  // --Surface-Elevated and their -Hover/-Pressed states.
  // Excludes --Surface-Default, --Surface-Main, --Surface-Halo-Gap, --Surface-Fill-*.
  surfaceLegacy:
    /var\(\s*--Surface-(?:Bold|Subtle|Minimal|Ghost|Elevated)(?:-(?:Hover|Pressed))?\b/g,

  // --Surface-BG-* and --Surface-FG-* aliases (V3/V4 compat).
  surfaceBgFgLegacy: /var\(\s*--Surface-(?:BG|FG)-(?:Bold|Subtle|Minimal)\b/g,

  // --Text-High, --Text-Medium, --Text-Low, --Text-Medium-Stroke, --Text-Low-Stroke,
  // --Text-OnBold-High, --Text-OnBold-Medium, --Text-OnBold-Low.
  textLegacy:
    /var\(\s*--Text-(?:High|Medium|Low|Medium-Stroke|Low-Stroke|OnBold-High|OnBold-Medium|OnBold-Low)\b/g,

  // --Typography-Size-*, --Typography-Weight-*, --Typography-LineHeight-*,
  // --Typography-LetterSpacing-*. Note: --Typography-Font-* (Primary, Secondary,
  // Script, Code) is still valid as it has no V4 replacement.
  typographyLegacy:
    /var\(\s*--Typography-(?:Size|Weight|LineHeight|LetterSpacing)-[A-Za-z0-9]+/g,
};

/**
 * Recommended V4 replacements for each pattern type. Used in error messages.
 */
const REPLACEMENT_HINTS: Record<string, string> = {
  surfaceLegacy:
    'Use --{Role}-FG-Bold / --{Role}-BG-Subtle / etc. (e.g., --Primary-FG-Bold, --Neutral-FG-Subtle)',
  surfaceBgFgLegacy:
    'Use the role-explicit form: --{Role}-FG-Bold / --{Role}-BG-Subtle (e.g., --Primary-FG-Bold)',
  textLegacy:
    'Use --{Role}-Default-High / -Medium-Text / -Low-Text / -Medium-Stroke / -Low-Stroke (e.g., --Neutral-Default-High)',
  typographyLegacy:
    'Use V2 role tokens: --Body-M-FontSize, --Label-FontWeight-Medium, --Body-M-LineHeight, etc.',
};

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

interface Violation {
  file: string;
  line: number;
  type: string;
  match: string;
  context: string;
  hint: string;
}

const STRICT = process.argv.includes('--strict');

function isFallbackPosition(line: string, matchIndex: number): boolean {
  // A V3 reference is in fallback position if the character to its left
  // (skipping whitespace) is a comma. We look backward from the start of the
  // matched `var(` token.
  // The matchIndex points at the `v` of `var(...)`.
  for (let i = matchIndex - 1; i >= 0; i--) {
    const ch = line[i];
    if (ch === ' ' || ch === '\t') continue;
    return ch === ',';
  }
  return false;
}

function scanFile(file: string, violations: Violation[]): void {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, lineNum) => {
    // Skip pure comment lines
    const trimmed = line.trim();
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
      return;
    }

    // Skip lines marked INTENTIONAL-LEGACY (within 50 lines context)
    let exempted = false;
    for (let i = Math.max(0, lineNum - 50); i <= lineNum; i++) {
      if (lines[i].includes('INTENTIONAL-LEGACY')) {
        exempted = true;
        break;
      }
    }
    if (exempted) return;

    Object.entries(LEGACY_PATTERNS).forEach(([type, pattern]) => {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        // In lenient mode, ignore matches in fallback positions
        if (!STRICT && isFallbackPosition(line, match.index)) {
          continue;
        }
        violations.push({
          file,
          line: lineNum + 1,
          type,
          match: match[0],
          context: line.trim(),
          hint: REPLACEMENT_HINTS[type] ?? '',
        });
      }
    });
  });
}

function getStyledModuleCssFiles(): string[] {
  const root = 'packages/ui/src/components';
  const files: string[] = [];
  if (!existsSync(root)) return files;

  for (const componentName of readdirSync(root)) {
    if (!STYLED_COMPONENTS.has(componentName)) continue;
    const componentDir = join(root, componentName);
    let entries: string[];
    try {
      entries = readdirSync(componentDir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.endsWith('.module.css')) {
        files.push(join(componentDir, entry));
      }
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function main(): void {
  const files = getStyledModuleCssFiles();
  const violations: Violation[] = [];
  for (const file of files) {
    scanFile(file, violations);
  }

  const mode = STRICT ? 'STRICT' : 'lenient';

  if (violations.length === 0) {
    console.log(`✅ Legacy token check PASSED (${mode} mode)`);
    console.log(`   Scanned ${files.length} module.css files across ${STYLED_COMPONENTS.size} styled components.`);
    if (!STRICT) {
      console.log('   Run with --strict to also flag V3 fallback chain references.');
    }
    return;
  }

  console.error(`❌ Legacy token check FAILED (${mode} mode)\n`);
  console.error(`Found ${violations.length} legacy V1/V3 token reference(s) in the styled set:\n`);

  const byFile = new Map<string, Violation[]>();
  violations.forEach((v) => {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file)!.push(v);
  });

  byFile.forEach((fileViolations, file) => {
    console.error(`\n${file}:`);
    for (const v of fileViolations) {
      console.error(`  Line ${v.line}: ${v.type}`);
      console.error(`    Found:   ${v.match}`);
      console.error(`    Context: ${v.context}`);
      console.error(`    Fix:     ${v.hint}`);
    }
  });

  console.error('\n💡 Reference: see CLAUDE.md → "V4 Tokens — For New Component Code"');
  if (!STRICT) {
    console.error('   Lenient mode is on — only PRIMARY (non-fallback) V3 references are flagged.');
    console.error('   Use `pnpm check:legacy-tokens --strict` to also flag fallback chains.');
  }
  console.error('   Mark a justified exception with an INTENTIONAL-LEGACY comment within 50 lines.');

  process.exit(1);
}

main();
