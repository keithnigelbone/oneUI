#!/usr/bin/env node
/**
 * Quality Gate: AI Vocabulary Drift
 *
 * Scans agent knowledge sources (and, in full scope, docs) for deprecated
 * surface vocabulary that must not reach the model's system prompt:
 *
 *   - `fg-bold`, `fg-subtle`, `fg-minimal`
 *   - `bg-bold`, `bg-subtle`, `bg-minimal`
 *   - `--{Role}-FG-*`, `--{Role}-BG-*`
 *
 * These token families are still emitted by the engine for backward
 * compatibility, but new code and AI-facing prose must use the unified
 * vocabulary (`default` | `ghost` | `minimal` | `subtle` | `moderate` |
 * `bold` | `elevated`) and the role-explicit token names
 * (`--Primary-Bold`, `--Primary-Subtle`, etc.).
 *
 * Scope flag:
 *   --scope=agent  (default) — scans:
 *                                packages/shared/src/agent/**\/*.{ts,tsx}
 *                                packages/shared/src/engine/composition*.ts
 *                                docs/exports/**\/*.DESIGN.md
 *                                .claude/skills/design-composition/**\/*.md
 *                                CLAUDE.md
 *   --scope=all              — also scans docs/**\/*.md
 *
 * Intentional exceptions can be marked with an `INTENTIONAL-LEGACY-VOCAB`
 * comment on the same line or up to 50 lines before.
 *
 * Usage: pnpm check:ai-vocab [--scope=agent|all]
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';

const ROOT = resolve(__dirname, '..');

const BANNED_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'fg-mode',      pattern: /\bfg-(bold|subtle|minimal)\b/g },
  { name: 'bg-mode',      pattern: /\bbg-(bold|subtle|minimal)\b/g },
  { name: 'role-fg-bg',   pattern: /--\w+-(FG|BG)-/g },
];

// Docs files owned by the WS5 docs workstream. This script must be able to
// pass in CI before WS5 lands; these paths are explicitly excluded until the
// docs PR is merged. FIXME(WS5): drop this exclude list once WS5 lands.
const DOCS_EXCLUDES = new Set<string>([
  'docs/DEVELOPER_GUIDE.md',
  'docs/storybook-platform-sync.md',
  'docs/canvas.md',
  'docs/surface-context-awareness.md',
  'docs/surface-logic-refactor-handoff.md',
]);

type Scope = 'agent' | 'all';

interface Violation {
  file: string;
  line: number;
  type: string;
  match: string;
  context: string;
}

function parseScope(): Scope {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--scope=')) {
      const value = arg.slice('--scope='.length);
      if (value === 'agent' || value === 'all') return value;
      console.error(`Unknown --scope value: "${value}" (expected "agent" or "all")`);
      process.exit(2);
    }
  }
  return 'agent';
}

function walkDir(dir: string, accept: (path: string) => boolean): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full, accept));
    } else if (entry.isFile() && accept(full)) {
      files.push(full);
    }
  }
  return files;
}

function collectFiles(scope: Scope): string[] {
  const files: string[] = [];

  // Always: agent context (ts/tsx) excluding tests.
  const agentDir = join(ROOT, 'packages/shared/src/agent');
  files.push(
    ...walkDir(agentDir, (p) => p.endsWith('.ts') || p.endsWith('.tsx')).filter(
      (p) => !p.includes(`${agentDir}/__tests__`),
    ),
  );

  // Always: composition rules in engine — these are the seed for DesignMD output
  // and the design-composition agent prompt. Drift here propagates to LLMs.
  const engineDir = join(ROOT, 'packages/shared/src/engine');
  files.push(
    ...walkDir(engineDir, (p) =>
      /\/composition[\w-]*\.ts$/.test(p) && !p.includes('/__tests__/'),
    ),
  );

  // Always: Convex composition skills/rules — these are the LLM-facing system
  // prompts threaded through the design-composition agent.
  const convexDir = join(ROOT, 'packages/convex/convex');
  files.push(
    ...walkDir(convexDir, (p) =>
      /\/composition[\w-]*\.ts$/.test(p) && !p.includes('/__tests__/'),
    ),
  );

  // Always: exported DESIGN.md files — these are the brand-resolved authoring
  // briefs consumed by AI tools and human designers.
  const exportsDir = join(ROOT, 'docs/exports');
  files.push(...walkDir(exportsDir, (p) => p.endsWith('.DESIGN.md')));

  // Always: design-composition skill (used by Claude in this repo).
  const skillDir = join(ROOT, '.claude/skills/design-composition');
  files.push(...walkDir(skillDir, (p) => p.endsWith('.md')));

  // Always: CLAUDE.md (project-level instructions read by every Claude session).
  const claudeMd = join(ROOT, 'CLAUDE.md');
  if (existsSync(claudeMd)) files.push(claudeMd);

  if (scope === 'all') {
    const docsDir = join(ROOT, 'docs');
    const docsFiles = walkDir(docsDir, (p) => p.endsWith('.md'));
    for (const docFile of docsFiles) {
      const rel = relative(ROOT, docFile);
      if (DOCS_EXCLUDES.has(rel)) continue;
      // Skip exports — they're already covered above.
      if (rel.startsWith('docs/exports/')) continue;
      files.push(docFile);
    }
  }

  // De-duplicate (some always-paths can overlap with --scope=all).
  return Array.from(new Set(files));
}

function hasIntentionalMarker(lines: string[], lineNum: number): boolean {
  const start = Math.max(0, lineNum - 50);
  for (let i = start; i <= lineNum; i++) {
    if (lines[i]?.includes('INTENTIONAL-LEGACY-VOCAB')) return true;
  }
  return false;
}

function scanFile(file: string): Violation[] {
  if (!existsSync(file) || !statSync(file).isFile()) return [];
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, idx) => {
    if (hasIntentionalMarker(lines, idx)) return;

    for (const { name, pattern } of BANNED_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        violations.push({
          file,
          line: idx + 1,
          type: name,
          match: match[0],
          context: line.trim(),
        });
      }
    }
  });

  return violations;
}

function main(): void {
  const scope = parseScope();
  const files = collectFiles(scope);
  const violations: Violation[] = [];
  for (const file of files) violations.push(...scanFile(file));

  if (violations.length === 0) {
    console.log(`AI vocabulary check PASSED (scope=${scope})`);
    console.log(`   Scanned ${files.length} file(s). No deprecated surface vocabulary found.`);
    return;
  }

  console.error(`AI vocabulary check FAILED (scope=${scope})\n`);
  console.error(`Found ${violations.length} violation(s):\n`);

  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    const rel = relative(ROOT, v.file);
    if (!byFile.has(rel)) byFile.set(rel, []);
    byFile.get(rel)!.push(v);
  }

  for (const [file, fileViolations] of byFile) {
    console.error(`\n${file}:`);
    for (const v of fileViolations) {
      console.error(`  ${file}:${v.line}  [${v.type}]  "${v.match}"`);
      console.error(`    ${v.context}`);
    }
  }

  console.error('\nFix guidance:');
  console.error('  - Use unified surface modes: default | ghost | minimal | subtle | moderate | bold | elevated');
  console.error('  - Use role-explicit tokens: --Primary-Bold, --Primary-Subtle, --Primary-TintedA11y, etc.');
  console.error('  - To intentionally keep legacy vocabulary (quoting an old token for migration docs),');
  console.error('    add an `INTENTIONAL-LEGACY-VOCAB` comment within 50 lines above.');

  process.exit(1);
}

main();
