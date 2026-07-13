#!/usr/bin/env node
/**
 * Flutter hygiene gate — blocks two recurring PR review failures:
 *
 * 1. Tracked `.dart_tool/` / `.flutter-plugins-dependencies` artifacts
 *    (machine-local paths; see PRs #380 / #381).
 * 2. `pubspec.lock` SDK downgrades below Dart 3.10 pre-release on canonical
 *    Flutter lockfiles (e.g. `>=3.8.0` after `flutter pub get` on an older SDK).
 *
 * Usage: pnpm check:flutter-hygiene
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

/** Minimum Dart SDK recorded in committed Flutter lockfiles. */
const MIN_DART_SDK = '>=3.10.0-0';

const LOCKFILES = [
  'packages/ui_flutter/pubspec.lock',
  'apps/storybook_flutter/pubspec.lock',
] as const;

const GITIGNORE_REQUIREMENTS: Array<{ path: string; needle: string }> = [
  { path: 'packages/ui_flutter/.gitignore', needle: '.dart_tool/' },
];

const TRACKED_ARTIFACT_PATTERNS = [
  /\.dart_tool\//,
  /\.flutter-plugins-dependencies$/,
];

interface Violation {
  id: string;
  detail: string;
}

function gitLsFiles(): string[] {
  try {
    return execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseDartSdkFromLock(relPath: string): string | null {
  const full = resolve(REPO_ROOT, relPath);
  if (!existsSync(full)) return null;
  const text = readFileSync(full, 'utf8');
  const match = text.match(/^sdks:\s*\r?\n\s*dart:\s*"([^"]+)"/m);
  return match?.[1] ?? null;
}

/** Parse `>=3.10.0-0 <4.0.0` lower bound for ordering. */
function parseLowerBound(constraint: string): { major: number; minor: number; patch: number; pre: number } | null {
  const match = constraint.match(/>=\s*(\d+)\.(\d+)\.(\d+)(?:-(\d+))?/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] != null ? Number(match[4]) : Number.MAX_SAFE_INTEGER,
  };
}

function sdkAtLeast(actual: string, minimum: string): boolean {
  const a = parseLowerBound(actual);
  const b = parseLowerBound(minimum);
  if (!a || !b) return false;
  if (a.major !== b.major) return a.major > b.major;
  if (a.minor !== b.minor) return a.minor > b.minor;
  if (a.patch !== b.patch) return a.patch > b.patch;
  return a.pre >= b.pre;
}

function checkTrackedArtifacts(): Violation[] {
  const violations: Violation[] = [];
  for (const path of gitLsFiles()) {
    if (TRACKED_ARTIFACT_PATTERNS.some((re) => re.test(path))) {
      violations.push({
        id: 'tracked-artifact',
        detail: `Remove from git and add to .gitignore: ${path}`,
      });
    }
  }
  return violations;
}

function checkGitignore(): Violation[] {
  const violations: Violation[] = [];
  for (const { path, needle } of GITIGNORE_REQUIREMENTS) {
    const full = resolve(REPO_ROOT, path);
    if (!existsSync(full)) {
      violations.push({
        id: 'missing-gitignore',
        detail: `Missing ${path} — add "${needle}" so .dart_tool/ is never committed.`,
      });
      continue;
    }
    const text = readFileSync(full, 'utf8');
    if (!text.includes(needle)) {
      violations.push({
        id: 'gitignore-entry',
        detail: `${path} must include "${needle}".`,
      });
    }
  }
  return violations;
}

function checkLockfileSdks(): Violation[] {
  const violations: Violation[] = [];
  for (const relPath of LOCKFILES) {
    const sdk = parseDartSdkFromLock(relPath);
    if (sdk == null) {
      violations.push({
        id: 'missing-lockfile',
        detail: `Could not read sdks.dart from ${relPath}.`,
      });
      continue;
    }
    if (!sdkAtLeast(sdk, MIN_DART_SDK)) {
      violations.push({
        id: 'lockfile-sdk-downgrade',
        detail:
          `${relPath} pins "${sdk}" — regenerate with Dart ${MIN_DART_SDK}+ / Flutter 3.44.x ` +
          `(canonical toolchain). Do not commit lockfiles from older SDKs.`,
      });
    }
  }
  return violations;
}

function main() {
  const violations = [
    ...checkTrackedArtifacts(),
    ...checkGitignore(),
    ...checkLockfileSdks(),
  ];

  if (violations.length === 0) {
    console.log('check:flutter-hygiene — OK');
    process.exit(0);
  }

  console.error('check:flutter-hygiene — FAILED\n');
  for (const v of violations) {
    console.error(`  [${v.id}] ${v.detail}`);
  }
  console.error(
    '\nFix: untrack .dart_tool/, ensure packages/ui_flutter/.gitignore exists, ' +
      'then restore pubspec.lock from main or run `flutter pub get` on Dart 3.10+.',
  );
  process.exit(1);
}

main();
