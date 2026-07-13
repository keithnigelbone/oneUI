#!/usr/bin/env node
/**
 * CLI for @oneui/native-cdn build-time prefetch.
 *
 *   oneui-native-cdn prefetch [--cdn-url <url>] [--config <file>]
 *                             [--cache-dir <dir>] [--out <manifest.js>]
 *                             [--offline] [--no-inject] [--entry <file>]
 *
 * By default `prefetch` also auto-injects `import '.oneui-cached';` into the
 * detected app entry file (app/_layout.tsx → App.tsx → index.tsx) so that
 * Metro statically includes the brand cache in the bundle — no manual edits
 * required. The injection is idempotent.
 *
 * Flags:
 *   --no-inject          Skip auto-injection; the import must be added manually.
 *   --entry <file>       Override the detected entry file path (relative to cwd).
 *
 * Typically wired ahead of the bundler:
 *
 *   "dev": "oneui-native-cdn prefetch && expo start"
 */

import { prefetchBrandData, type PrefetchOptions } from './prefetch';

function parseArgs(argv: string[]): PrefetchOptions & { _command?: string } {
  const out: PrefetchOptions & { _command?: string } = {};
  const valueFlags: Record<string, keyof PrefetchOptions> = {
    '--cdn-url': 'cdnUrl',
    '--config': 'configFile',
    '--cache-dir': 'cacheDir',
    '--out': 'manifestFile',
    '--entry': 'entryFile',
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--offline') {
      out.offline = true;
    } else if (arg === '--no-inject') {
      out.inject = false;
    } else if (arg in valueFlags) {
      const value = argv[++i];
      if (value === undefined) throw new Error(`[@oneui/native-cdn] missing value for ${arg}`);
      (out as Record<string, unknown>)[valueFlags[arg]] = value;
    } else if (!arg.startsWith('-') && !out._command) {
      out._command = arg; // e.g. "prefetch"
    } else {
      throw new Error(`[@oneui/native-cdn] unknown argument: ${arg}`);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const { _command, ...options } = parseArgs(process.argv.slice(2));
  if (_command && _command !== 'prefetch') {
    throw new Error(`[@oneui/native-cdn] unknown command "${_command}". Did you mean "prefetch"?`);
  }
  await prefetchBrandData(options);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
