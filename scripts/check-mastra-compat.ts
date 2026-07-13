/**
 * check-mastra-compat.ts
 *
 * Phase 5 compatibility spike for the Experience Lab orchestration stack.
 * This intentionally does not upgrade packages. It verifies the exact runtime
 * APIs the Lab depends on, reports installed versions, and optionally compares
 * them with npm latest via `--latest`.
 */

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

type CheckResult = {
  label: string;
  passed: boolean;
  detail?: string;
};

const require = createRequire(import.meta.url);
const includeLatest = process.argv.includes('--latest');

const PACKAGES = [
  '@mastra/core',
  '@mastra/ai-sdk',
  'ai',
  '@ai-sdk/anthropic',
  'zod',
] as const;

function packageVersion(pkg: string): string {
  const pkgJson = require(`${pkg}/package.json`) as { version?: string };
  if (!pkgJson.version) throw new Error(`No version found for ${pkg}`);
  return pkgJson.version;
}

function npmLatest(pkg: string): string {
  return execFileSync('npm', ['view', pkg, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30_000,
  }).trim();
}

function check(label: string, fn: () => boolean | string): CheckResult {
  try {
    const out = fn();
    return {
      label,
      passed: out === true || typeof out === 'string',
      detail: typeof out === 'string' ? out : undefined,
    };
  } catch (err) {
    return {
      label,
      passed: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main(): Promise<void> {
  const [
    workflows,
    tools,
    backgroundTasks,
    events,
    mastraAiSdk,
    aiSdk,
    anthropicProvider,
    zod,
  ] = await Promise.all([
    import('@mastra/core/workflows'),
    import('@mastra/core/tools'),
    import('@mastra/core/background-tasks'),
    import('@mastra/core/events'),
    import('@mastra/ai-sdk'),
    import('ai'),
    import('@ai-sdk/anthropic'),
    import('zod'),
  ]);

  const versions = PACKAGES.map((pkg) => {
    const installed = packageVersion(pkg);
    const latest = includeLatest ? npmLatest(pkg) : undefined;
    return { pkg, installed, latest };
  });

  const results: CheckResult[] = [
    check('@mastra/core/workflows exports createWorkflow/createStep', () =>
      typeof workflows.createWorkflow === 'function' &&
      typeof workflows.createStep === 'function',
    ),
    check('@mastra/core/tools exports createTool', () =>
      typeof tools.createTool === 'function',
    ),
    check('@mastra/core/background-tasks exports required submission APIs', () =>
      typeof backgroundTasks.BackgroundTaskManager === 'function' &&
      typeof backgroundTasks.createBackgroundTask === 'function',
    ),
    check('@mastra/core/events exports EventEmitterPubSub', () =>
      typeof events.EventEmitterPubSub === 'function',
    ),
    check('@mastra/ai-sdk exports toAISdkStream', () =>
      typeof mastraAiSdk.toAISdkStream === 'function',
    ),
    check('AI SDK v6 exports generateText and Output.object', () =>
      typeof aiSdk.generateText === 'function' &&
      typeof aiSdk.Output === 'object' &&
      typeof aiSdk.Output.object === 'function',
    ),
    check('@ai-sdk/anthropic exports anthropic provider factory', () =>
      typeof anthropicProvider.anthropic === 'function',
    ),
    check('zod v4 object parsing is available from one resolved package', () => {
      const schema = zod.z.object({ ok: zod.z.boolean() });
      const parsed = schema.parse({ ok: true });
      return parsed.ok === true;
    }),
  ];

  // eslint-disable-next-line no-console
  console.log('\nMastra / AI SDK compatibility report');
  // eslint-disable-next-line no-console
  console.log('Installed versions:');
  for (const row of versions) {
    const suffix =
      row.latest && row.latest !== row.installed
        ? ` (npm latest ${row.latest})`
        : row.latest
          ? ' (matches npm latest)'
          : '';
    // eslint-disable-next-line no-console
    console.log(`  - ${row.pkg}: ${row.installed}${suffix}`);
  }

  const failed = results.filter((result) => !result.passed);
  // eslint-disable-next-line no-console
  console.log('\nAPI checks:');
  for (const result of results) {
    // eslint-disable-next-line no-console
    console.log(`  ${result.passed ? '✓' : '✗'} ${result.label}${result.detail ? ` — ${result.detail}` : ''}`);
  }

  if (failed.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `\n✗ Mastra compatibility failed (${failed.length} check${failed.length === 1 ? '' : 's'}).`,
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log('\n✓ Mastra compatibility surface is intact.');
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
