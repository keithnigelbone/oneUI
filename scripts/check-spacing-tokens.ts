#!/usr/bin/env node
/**
 * Quality Gate: Spacing token naming
 *
 * Platform source must use canonical numeric spacing tokens:
 *   --Spacing-0, --Spacing-0-5, ... --Spacing-40,
 *   --Spacing-Negative-0-5, ... --Spacing-Negative-8,
 *   --Spacing-Margin, --Spacing-Gutter.
 * Native/source objects must use the same numeric keys:
 *   tokens.spacing['0'], tokens.spacing['0-5'], ... tokens.spacing['40'].
 *
 * Deprecated t-shirt/semantic aliases must not appear in platform source,
 * native source, generated platform design-md guidance, or composition prompt
 * vocabulary.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SCAN_ROOTS = [
  'apps/platform/src',
  'apps/native-sample',
  'apps/native-components-sample',
  'packages/convex/convex',
  'packages/tokens/src',
  'packages/ui-native/src',
  'packages/shared/src/engine',
  'packages/shared/src/types/componentTokens.ts',
  'scripts/scaffold-figma-validation-matrix.ts',
];

const LEGACY_SPACING_PATTERN =
  /Spacing-(?:None|6XS|5XS|4XS|3XS|2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL|7XL|8XL|9XL|10XL|11XL|12XL|13XL|14XL|15XL)\b/g;

const LEGACY_SPACING_OBJECT_PATTERN =
  /\b(?:tokens\.)?spacing(?:\[['"](?:5xs|4xs|3xs|2xs|xs|s|m|l|xl|2xl|3xl|4xl|5xl|sm|md|lg)['"]\]|\.(?:xs|s|m|l|xl|sm|md|lg|2xl|3xl|4xl|5xl)\b)/g;

const LEGACY_SPACING_LABEL_PATTERN =
  /\{\s*(?:value|token):\s*['"]Spacing-[^'"]+['"],\s*label:\s*['"](?:6XS|5XS|4XS|3XS|2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL|7XL|8XL|9XL|10XL|11XL|12XL|13XL|14XL|15XL)['"]/g;

const RAW_LEGACY_SPACING_INTERPOLATION_PATTERN =
  /Spacing-\$\{(?:scale\.token|fStep\.spacingToken)\}/g;

const IGNORE_PATH_PARTS = [
  '/node_modules/',
  '/.next/',
  '/dist/',
  '/storybook-build/',
];

interface Violation {
  file: string;
  line: number;
  match: string;
  context: string;
}

function walk(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!readdirSafe(path)) return [path];

  const files: string[] = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name);
    const normalised = fullPath.replace(/\\/g, '/');
    if (IGNORE_PATH_PARTS.some((part) => normalised.includes(part))) continue;
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(?:css|ts|tsx|md|json)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function readdirSafe(path: string): boolean {
  try {
    return readdirSync(path, { withFileTypes: true }).some(() => true) || true;
  } catch {
    return false;
  }
}

function scanFile(file: string): Violation[] {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, index) => {
    for (const pattern of [
      LEGACY_SPACING_PATTERN,
      LEGACY_SPACING_OBJECT_PATTERN,
      LEGACY_SPACING_LABEL_PATTERN,
      RAW_LEGACY_SPACING_INTERPOLATION_PATTERN,
    ]) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        violations.push({
          file,
          line: index + 1,
          match: match[0],
          context: line.trim(),
        });
      }
    }
  });

  return violations;
}

function main(): void {
  const files = SCAN_ROOTS.flatMap(walk);
  const violations = files.flatMap(scanFile);

  if (violations.length === 0) {
    console.log(`✅ Numeric spacing token check PASSED (${files.length} files scanned)`);
    return;
  }

  console.error('❌ Numeric spacing token check FAILED\n');
  console.error('Use numeric spacing tokens such as --Spacing-2-5, --Spacing-4, --Spacing-6, and --Spacing-40.\n');

  const byFile = new Map<string, Violation[]>();
  for (const violation of violations) {
    const list = byFile.get(violation.file) ?? [];
    list.push(violation);
    byFile.set(violation.file, list);
  }

  for (const [file, fileViolations] of byFile) {
    console.error(file);
    for (const violation of fileViolations) {
      console.error(`  ${violation.line}: ${violation.match}`);
      console.error(`     ${violation.context}`);
    }
  }

  process.exit(1);
}

main();
