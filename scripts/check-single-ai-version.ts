/**
 * check-single-ai-version.ts
 *
 * Isolation CI gate (LAB-03 / Pitfall 1 + 3): assert that at most ONE
 * `ai@6.x` version resolves inside the Experience Lab dependency subtree.
 *
 * Why scoped, not repo-wide: the base repo already legitimately resolves
 * multiple `ai@6.x` versions (e.g. 6.0.111 + 6.2.2) across unrelated packages
 * (see RESEARCH Open Question #2). A repo-wide single-version assertion would
 * fail on day one for reasons that have nothing to do with the Lab. The risk
 * we actually guard against is Mastra (`@mastra/core` / `@mastra/ai-sdk`,
 * installed in plan 04) pulling in a SECOND `ai@6` copy alongside the one the
 * Lab agents use — a duplicate that silently breaks streaming/structured
 * output. So we scope the assertion to the Lab packages' resolution subtree.
 *
 * Today (before plan 04 installs Mastra) the Lab subtree resolves ZERO `ai`
 * versions, which trivially satisfies "at most one" → exit 0. Once Mastra +
 * `ai` land in `@oneui/experience-builder-agents`, this gate starts doing real
 * work: if more than one `ai@6.x` resolves there, it fails CI.
 *
 * Mechanism: `pnpm why ai --json` reports the resolution tree. We filter to
 * paths rooted at the Lab packages and collect the distinct resolved `ai`
 * versions. Implemented defensively so an empty/!found result is a pass, never
 * a crash.
 */

import { execFileSync } from 'node:child_process';

/** Package-name prefixes that constitute the Experience Lab subtree. */
const LAB_PACKAGE_PREFIXES = ['@oneui/experience-builder-'] as const;

/** The dependency we are policing — Vercel AI SDK v6 line. */
const TARGET = 'ai';
const TARGET_MAJOR = 6;

function runPnpmWhy(): unknown {
  try {
    const out = execFileSync('pnpm', ['why', TARGET, '--json', '--recursive'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    });
    const trimmed = out.trim();
    if (!trimmed) return [];
    return JSON.parse(trimmed);
  } catch {
    // `pnpm why ai` exits non-zero when nothing depends on `ai`. In the Lab
    // subtree before plan 04 that is the expected state → treat as empty.
    return [];
  }
}

/** Does a project entry belong to the Lab subtree? */
function isLabProject(name: string | undefined): boolean {
  if (!name) return false;
  return LAB_PACKAGE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/**
 * Walk a pnpm dependency node tree, collecting every resolved version of the
 * target package. The shape of `pnpm why --json` is an array of project
 * entries, each with `dependencies` / `devDependencies` maps whose leaves may
 * carry `{ version, dependencies }`.
 */
function collectTargetVersions(node: unknown, found: Set<string>): void {
  if (!node || typeof node !== 'object') return;

  for (const key of ['dependencies', 'devDependencies', 'optionalDependencies'] as const) {
    const deps = (node as Record<string, unknown>)[key];
    if (!deps || typeof deps !== 'object') continue;
    for (const [depName, depNode] of Object.entries(deps as Record<string, unknown>)) {
      if (depNode && typeof depNode === 'object') {
        const version = (depNode as Record<string, unknown>).version;
        if (depName === TARGET && typeof version === 'string') {
          const major = Number.parseInt(version.split('.')[0] ?? '', 10);
          if (major === TARGET_MAJOR) found.add(version);
        }
        collectTargetVersions(depNode, found);
      }
    }
  }
}

function main(): void {
  const report = runPnpmWhy();
  const entries = Array.isArray(report) ? report : [report];

  const labVersions = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const name = (entry as Record<string, unknown>).name as string | undefined;
    if (!isLabProject(name)) continue;
    collectTargetVersions(entry, labVersions);
  }

  if (labVersions.size <= 1) {
    const detail =
      labVersions.size === 0
        ? `no \`${TARGET}@${TARGET_MAJOR}.x\` resolves in the Lab subtree yet (pre-Mastra-install state)`
        : `single version: ${[...labVersions][0]}`;
    // eslint-disable-next-line no-console
    console.log(`✓ check:single-ai — ${detail}`);
    process.exit(0);
  }

  // eslint-disable-next-line no-console
  console.error(
    `✗ check:single-ai — multiple \`${TARGET}@${TARGET_MAJOR}.x\` versions resolve inside the ` +
      `Experience Lab subtree:\n  ${[...labVersions].sort().join('\n  ')}\n\n` +
      `A duplicate \`${TARGET}\` copy (typically pulled in by @mastra/* alongside the Lab ` +
      `agents' own copy) silently breaks streaming/structured output. Add a pnpm override or ` +
      `align the @mastra/ai-sdk peer range so exactly one \`${TARGET}@${TARGET_MAJOR}.x\` resolves ` +
      `in the Lab packages.`,
  );
  process.exit(1);
}

main();
