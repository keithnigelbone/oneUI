/**
 * @oneui/init (published as @jds4/oneui-init)
 *
 * One-command setup CLI for OneUI consumers. Auto-detects the host
 * framework, installs the appropriate plugin, scaffolds `oneui.brands.json`,
 * and prints the small config-file patches the consumer needs to apply.
 *
 * Why doesn't it auto-edit `vite.config.ts` / `next.config.js`?
 *   Bundler config files vary too much in shape (CJS vs ESM, factory
 *   functions, plugin chains, comments the user cares about). Surgical
 *   regex edits are fragile, AST edits are heavy. Printing the diff
 *   means the user sees exactly what to add and where — and it's a
 *   one-time copy-paste. shadcn / Tailwind / Mantine all do this for
 *   the same reason.
 *
 * Usage:
 *
 *   $ npx @jds4/oneui-init
 *   ? Detected: Next.js. Continue? (Y/n)
 *   ? CDN base URL: https://myjiostatic.cdn.jio.com/JDS
 *   ? Brands to fetch (comma-separated slugs): jio
 *
 *   ✓ Installed @jds4/oneui-react @jds4/oneui-icons-jio @jds4/oneui-next-plugin
 *   ✓ Wrote oneui.brands.json
 *
 *   Next, add this to your next.config.js:
 *     const { withOneui } = require('@jds4/oneui-next-plugin');
 *     module.exports = withOneui({ ... })(yourConfig);
 *
 *   And import the brand stylesheet in your app entry:
 *     import '@jds4/oneui-react/styles';
 *
 * The library exports (this file) are also callable from scripts —
 * useful if a parent setup CLI wants to drive OneUI init programmatically.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export type Framework = 'next' | 'vite' | 'webpack' | 'esbuild' | 'unknown';

export interface DetectionResult {
  framework: Framework;
  /** Evidence used to make the call — surfaced for transparency. */
  reasons: string[];
}

/**
 * Look at the consumer's `package.json` + presence of config files to
 * decide which plugin they need.
 */
export function detectFramework(projectRoot: string): DetectionResult {
  const reasons: string[] = [];
  const pkgJsonPath = join(projectRoot, 'package.json');
  let deps: Record<string, string> = {};
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      reasons.push('package.json unparseable');
    }
  } else {
    reasons.push('no package.json — assuming bare project');
  }

  // Next.js wins outright — its config wraps webpack internally so we route
  // through @oneui/next-plugin rather than the raw webpack-plugin.
  if (
    'next' in deps
    || existsSync(join(projectRoot, 'next.config.js'))
    || existsSync(join(projectRoot, 'next.config.mjs'))
    || existsSync(join(projectRoot, 'next.config.ts'))
  ) {
    reasons.push('next dependency or next.config found');
    return { framework: 'next', reasons };
  }
  // Vite is detected by config files or the `vite` dev dep.
  if (
    'vite' in deps
    || existsSync(join(projectRoot, 'vite.config.js'))
    || existsSync(join(projectRoot, 'vite.config.mjs'))
    || existsSync(join(projectRoot, 'vite.config.ts'))
  ) {
    reasons.push('vite dependency or vite.config found');
    return { framework: 'vite', reasons };
  }
  // CRA / generic webpack: react-scripts or an explicit webpack.config.
  if (
    'react-scripts' in deps
    || 'webpack' in deps
    || existsSync(join(projectRoot, 'webpack.config.js'))
    || existsSync(join(projectRoot, 'webpack.config.ts'))
  ) {
    reasons.push('react-scripts / webpack dependency or config found');
    return { framework: 'webpack', reasons };
  }
  // esbuild / Bun: only check for an explicit config file. We don't sniff
  // `esbuild` in deps because Vite / Next / Storybook all carry it
  // transitively, and that would false-positive against vite/webpack apps.
  if (
    existsSync(join(projectRoot, 'esbuild.config.js'))
    || existsSync(join(projectRoot, 'esbuild.config.mjs'))
    || existsSync(join(projectRoot, 'esbuild.config.ts'))
    || existsSync(join(projectRoot, 'build.mjs'))
    || existsSync(join(projectRoot, 'bun.lockb'))
  ) {
    reasons.push('esbuild config or bun.lockb found');
    return { framework: 'esbuild', reasons };
  }
  reasons.push('no recognized framework markers');
  return { framework: 'unknown', reasons };
}

const FRAMEWORK_PLUGIN: Record<Exclude<Framework, 'unknown'>, string> = {
  next: '@jds4/oneui-next-plugin',
  vite: '@jds4/oneui-vite-plugin',
  webpack: '@jds4/oneui-webpack-plugin',
  esbuild: '@jds4/oneui-esbuild-plugin',
};

/**
 * What `oneui-init` should install for a given framework. Always includes
 * `@jds4/oneui-react` and `@jds4/oneui-icons-jio` — the icons-jio default
 * is non-negotiable because Checkbox/Stepper/FAB render badly without it.
 */
export function installSpec(framework: Framework): { runtime: string[]; dev: string[] } {
  const runtime = ['@jds4/oneui-react', '@jds4/oneui-icons-jio'];
  if (framework === 'unknown') return { runtime, dev: [] };
  return { runtime, dev: [FRAMEWORK_PLUGIN[framework]] };
}

export interface BrandsConfig {
  cdnUrl: string;
  brands: Record<string, string>;
}

/** Write `oneui.brands.json` in the project root. Refuses to clobber. */
export function writeBrandsConfig(
  projectRoot: string,
  config: BrandsConfig,
  force = false,
): { written: boolean; path: string; reason?: string } {
  const path = join(projectRoot, 'oneui.brands.json');
  if (existsSync(path) && !force) {
    return { written: false, path, reason: 'file exists — pass --force to overwrite' };
  }
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  return { written: true, path };
}

/** Detect which package manager the project uses (default: npm). */
export function detectPackageManager(projectRoot: string): 'pnpm' | 'yarn' | 'npm' {
  if (existsSync(join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectRoot, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Run the install command. Returns success + the command that ran so callers
 * can surface it (and rerun manually on failure).
 */
export function runInstall(
  projectRoot: string,
  runtime: string[],
  dev: string[],
  pm: 'pnpm' | 'yarn' | 'npm',
): { ok: boolean; commands: string[] } {
  const commands: string[] = [];

  function buildInstallArgs(packages: string[], asDev: boolean): string[] {
    if (pm === 'pnpm') return [asDev ? 'add' : 'add', ...(asDev ? ['-D'] : []), ...packages];
    if (pm === 'yarn') return ['add', ...(asDev ? ['-D'] : []), ...packages];
    return ['install', ...(asDev ? ['-D'] : ['--save']), ...packages];
  }

  function exec(args: string[]): boolean {
    commands.push(`${pm} ${args.join(' ')}`);
    const res = spawnSync(pm, args, { cwd: projectRoot, stdio: 'inherit' });
    return res.status === 0;
  }

  if (runtime.length > 0) {
    if (!exec(buildInstallArgs(runtime, false))) return { ok: false, commands };
  }
  if (dev.length > 0) {
    if (!exec(buildInstallArgs(dev, true))) return { ok: false, commands };
  }
  return { ok: true, commands };
}

/**
 * Snippets to print after install — never auto-applied. The user copies
 * them into the right file.
 */
export function patchSnippets(framework: Framework): { configFile: string; snippet: string } {
  const importSnippet = "// Add at the top of your app entry (main.tsx / _app.tsx):\nimport '@jds4/oneui-react/styles';\n";
  if (framework === 'next') {
    return {
      configFile: 'next.config.js',
      snippet:
        `${importSnippet}\n`
        + `// next.config.js — wrap your config with withOneui:\n`
        + `const { withOneui } = require('@jds4/oneui-next-plugin');\n`
        + `\n`
        + `/** @type {import('next').NextConfig} */\n`
        + `const config = {\n`
        + `  transpilePackages: ['@jds4/oneui-react', '@jds4/oneui-icons-jio'],\n`
        + `  // ...your existing config\n`
        + `};\n`
        + `\n`
        + `module.exports = withOneui()(config);\n`,
    };
  }
  if (framework === 'vite') {
    return {
      configFile: 'vite.config.ts',
      snippet:
        `${importSnippet}\n`
        + `// vite.config.ts — add the oneui plugin:\n`
        + `import { defineConfig } from 'vite';\n`
        + `import react from '@vitejs/plugin-react';\n`
        + `import { oneui } from '@jds4/oneui-vite-plugin';\n`
        + `\n`
        + `export default defineConfig({\n`
        + `  plugins: [react(), oneui()],\n`
        + `});\n`,
    };
  }
  if (framework === 'webpack') {
    return {
      configFile: 'webpack.config.js',
      snippet:
        `${importSnippet}\n`
        + `// webpack.config.js — add the oneui plugin:\n`
        + `const { oneui } = require('@jds4/oneui-webpack-plugin');\n`
        + `\n`
        + `module.exports = {\n`
        + `  // ...your existing config\n`
        + `  plugins: [\n`
        + `    // ...your existing plugins\n`
        + `    oneui(),\n`
        + `  ],\n`
        + `};\n`,
    };
  }
  if (framework === 'esbuild') {
    return {
      configFile: 'esbuild.config.mjs (or your build script)',
      snippet:
        `${importSnippet}\n`
        + `// esbuild build script — add the oneui plugin:\n`
        + `import { build } from 'esbuild';\n`
        + `import { oneui } from '@jds4/oneui-esbuild-plugin';\n`
        + `\n`
        + `await build({\n`
        + `  // ...your existing options\n`
        + `  plugins: [\n`
        + `    // ...your existing plugins\n`
        + `    oneui(),\n`
        + `  ],\n`
        + `});\n`,
    };
  }
  return {
    configFile: 'your bundler config',
    snippet:
      `${importSnippet}\n`
      + `# Couldn't detect your framework. OneUI ships plugins for Vite, Webpack,\n`
      + `# and Next.js. Install whichever fits your stack:\n`
      + `#   @jds4/oneui-vite-plugin\n`
      + `#   @jds4/oneui-webpack-plugin\n`
      + `#   @jds4/oneui-next-plugin\n`
      + `# Each exposes the same oneui()/withOneui() API.\n`,
  };
}
