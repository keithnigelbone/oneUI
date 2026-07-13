/**
 * Unit tests for check-literals.ts core logic
 *
 * Tests the two key invariants:
 * 1. The rgb-regex trap fix: function names like `linearToSrgb(...)` must NOT
 *    match the rgb pattern.
 * 2. The var() blind-spot fix: literals inside a CSS var() fallback must NOT
 *    flag, but literals that sit outside var() on the same line MUST flag.
 */

import { describe, it, expect } from 'vitest';

// ── Replicated logic (kept in sync with scripts/check-literals.ts) ────────────

const PATTERNS = {
  hexColor: /#[0-9a-fA-F]{3,8}\b/g,
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

/**
 * Returns all var(…) ranges on a line as [start, end] pairs (end exclusive).
 */
function getVarRanges(line: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let i = 0;
  while (i < line.length) {
    const idx = line.indexOf('var(', i);
    if (idx === -1) break;
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

function isInsideVarRange(pos: number, ranges: Array<[number, number]>): boolean {
  for (const [start, end] of ranges) {
    if (pos >= start && pos < end) return true;
  }
  return false;
}

/** Scan a single line and return violation type names (or empty array). */
function scanLine(line: string): string[] {
  if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return [];

  const varRanges = getVarRanges(line);
  const found: string[] = [];

  Object.entries(PATTERNS).forEach(([type, pattern]) => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(line)) !== null) {
      if (['0', '0px', '100%', '999px', 'transparent', 'inherit'].includes(match[0])) {
        continue;
      }
      if (isInsideVarRange(match.index, varRanges)) {
        continue;
      }
      found.push(type);
    }
  });

  return found;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('check-literals: var() blind-spot fix', () => {
  it('flags a bare pixel literal on a line that also has var()', () => {
    const violations = scanLine('  padding: 8px var(--Spacing-3-5);');
    expect(violations).toContain('padding');
  });

  it('does NOT flag a pixel that is inside a var() fallback', () => {
    const violations = scanLine('  padding: var(--Spacing-3-5);');
    expect(violations).toHaveLength(0);
  });

  it('does NOT flag a line with only a var()', () => {
    const violations = scanLine('  padding: var(--Spacing-3-5);');
    expect(violations).toHaveLength(0);
  });
});

describe('check-literals: rgb-regex trap fix', () => {
  it('does NOT flag a function named ending in rgb — regression for linearToSrgb trap', () => {
    const violations = scanLine(
      'function linearToSrgb(value: number): number {',
    );
    expect(violations).toHaveLength(0);
  });

  it('flags an actual rgb() color literal', () => {
    const violations = scanLine('  color: rgb(255, 0, 0);');
    expect(violations).toContain('rgb');
  });

  it('flags an actual rgba() color literal', () => {
    const violations = scanLine('  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);');
    expect(violations).toContain('rgb');
  });

  it('does NOT flag rgba inside a var() fallback', () => {
    // e.g. var(--Elevation-1, rgba(0,0,0,0.1)) — the rgba is a fallback
    const violations = scanLine(
      '  box-shadow: var(--Elevation-1, rgba(0, 0, 0, 0.1));',
    );
    expect(violations).toHaveLength(0);
  });
});
