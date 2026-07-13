#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(command: string): string {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

try {
  run('pnpm docs:machine');
  const diff = run(
    'git diff --name-only -- docs/components/generated apps/platform/src/generated/component-docs packages/shared/src/meta/generated',
  );
  if (diff.trim().length > 0) {
    console.error('Machine-readable docs / component meta are stale. Regenerate (pnpm docs:machine) and commit the generated files.');
    console.error(diff.trim());
    process.exit(1);
  }
  console.log('Machine-readable docs and component meta are up to date.');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
