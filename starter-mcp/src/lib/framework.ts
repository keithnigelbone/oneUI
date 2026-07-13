/**
 * Project lifecycle helpers — VENDORED from `@jds4/oneui-init`
 * (monorepo source: packages/init/src/index.ts + bin.ts).
 *
 * Reproduced here verbatim in intent so this MCP has ZERO runtime dependency
 * on the OneUI monorepo. Keep in sync when the init package changes.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export type Framework = 'next' | 'vite' | 'webpack' | 'esbuild' | 'unknown';
export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export const DEFAULT_CDN_URL = 'https://myjiostatic.cdn.jio.com/JDS/react';
export const CONFIG_FILENAME = 'oneui.brands.json';

/**
 * Brands with known named themes published on the CDN. When a brand appears
 * here, setup writes the object form `{ version, themes }` instead of a bare
 * version string, so the runtime resolves the theme-scoped CSS selectors
 * (e.g. `[data-brand="jio"][data-theme="myjio"]`).
 */
export const BRAND_DEFAULT_THEMES: Record<string, string[]> = {
  jio: ['myjio'],
};

/** Always-installed runtime packages. */
const RUNTIME_PACKAGES = ['@jds4/oneui-react', '@jds4/oneui-icons-jio'];

/** Framework → dev bundler plugin. */
const FRAMEWORK_PLUGIN: Record<Exclude<Framework, 'unknown'>, string> = {
  next: '@jds4/oneui-next-plugin',
  vite: '@jds4/oneui-vite-plugin',
  webpack: '@jds4/oneui-webpack-plugin',
  esbuild: '@jds4/oneui-esbuild-plugin',
};

function readPackageJson(projectRoot: string): Record<string, unknown> | null {
  const p = resolve(projectRoot, 'package.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function depNames(pkg: Record<string, unknown> | null): Set<string> {
  const names = new Set<string>();
  if (!pkg) return names;
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const block = pkg[key];
    if (block && typeof block === 'object') {
      for (const name of Object.keys(block as Record<string, unknown>)) names.add(name);
    }
  }
  return names;
}

function anyFileExists(projectRoot: string, files: string[]): boolean {
  return files.some((f) => existsSync(resolve(projectRoot, f)));
}

/** Detect the host bundler/framework, with human-readable reasons. */
export function detectFramework(projectRoot: string): {
  framework: Framework;
  reasons: string[];
} {
  const pkg = readPackageJson(projectRoot);
  const deps = depNames(pkg);
  const reasons: string[] = [];

  // Next.js wins outright.
  if (deps.has('next')) reasons.push('found "next" dependency');
  if (anyFileExists(projectRoot, ['next.config.js', 'next.config.mjs', 'next.config.ts'])) {
    reasons.push('found next.config.*');
  }
  if (deps.has('next') || anyFileExists(projectRoot, ['next.config.js', 'next.config.mjs', 'next.config.ts'])) {
    return { framework: 'next', reasons };
  }

  // Vite.
  if (deps.has('vite')) reasons.push('found "vite" dependency');
  if (anyFileExists(projectRoot, ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'])) {
    reasons.push('found vite.config.*');
  }
  if (deps.has('vite') || anyFileExists(projectRoot, ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'])) {
    return { framework: 'vite', reasons };
  }

  // Webpack (includes Create React App via react-scripts).
  if (deps.has('react-scripts')) reasons.push('found "react-scripts" (CRA → webpack)');
  if (deps.has('webpack')) reasons.push('found "webpack" dependency');
  if (anyFileExists(projectRoot, ['webpack.config.js', 'webpack.config.ts'])) {
    reasons.push('found webpack.config.*');
  }
  if (deps.has('react-scripts') || deps.has('webpack') || anyFileExists(projectRoot, ['webpack.config.js', 'webpack.config.ts'])) {
    return { framework: 'webpack', reasons };
  }

  // esbuild (also Bun). Do NOT sniff "esbuild" as a dep (false-positives).
  if (anyFileExists(projectRoot, ['esbuild.config.js', 'esbuild.config.mjs', 'esbuild.config.ts', 'build.mjs'])) {
    reasons.push('found an esbuild build script');
  }
  if (existsSync(resolve(projectRoot, 'bun.lockb'))) reasons.push('found bun.lockb');
  if (anyFileExists(projectRoot, ['esbuild.config.js', 'esbuild.config.mjs', 'esbuild.config.ts', 'build.mjs']) || existsSync(resolve(projectRoot, 'bun.lockb'))) {
    return { framework: 'esbuild', reasons };
  }

  reasons.push('no framework markers found');
  return { framework: 'unknown', reasons };
}

/** Detect the package manager from lockfiles (defaults to npm). */
export function detectPackageManager(projectRoot: string): PackageManager {
  if (existsSync(resolve(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(projectRoot, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/** Packages to install for a given framework. */
export function installSpec(framework: Framework): { runtime: string[]; dev: string[] } {
  const dev = framework === 'unknown' ? [] : [FRAMEWORK_PLUGIN[framework]];
  return { runtime: [...RUNTIME_PACKAGES], dev };
}

/** A brand entry is either a bare version string or a version + named themes. */
export type BrandEntry = string | { version: string; themes?: string[] };

export interface BrandsConfig {
  cdnUrl: string;
  brands: Record<string, BrandEntry>; // slug → "latest" or { version, themes }
}

/**
 * Build the `brands` map for a list of slugs. Brands with known themes
 * (see BRAND_DEFAULT_THEMES) get the object form; the rest get a bare
 * version string. Reproduces the canonical oneui.brands.json shape.
 */
export function buildBrandsMap(
  slugs: string[],
  version = 'latest',
): Record<string, BrandEntry> {
  const out: Record<string, BrandEntry> = {};
  for (const slug of slugs) {
    const themes = BRAND_DEFAULT_THEMES[slug];
    out[slug] = themes && themes.length ? { version, themes } : version;
  }
  return out;
}

/** Write `oneui.brands.json`. Refuses to overwrite unless `force`. */
export function writeBrandsConfig(
  projectRoot: string,
  config: BrandsConfig,
  force = false,
): { written: boolean; path: string; reason?: string } {
  const path = resolve(projectRoot, CONFIG_FILENAME);
  if (existsSync(path) && !force) {
    return { written: false, path, reason: 'file exists — pass force=true to overwrite' };
  }
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n', 'utf8');
  return { written: true, path };
}

/** The config-file snippet a user must paste, per framework. */
export function patchSnippets(framework: Framework): { configFile: string; snippet: string } {
  const importSnippet = [
    "// Add at the top of your app entry (main.tsx / _app.tsx):",
    "import '@jds4/oneui-react/styles';",
    "import '@jds4/oneui-icons-jio';",
  ].join('\n');

  switch (framework) {
    case 'next':
      return {
        configFile: 'next.config.js',
        snippet: `${importSnippet}

// next.config.js — wrap your config with withOneui:
const { withOneui } = require('@jds4/oneui-next-plugin');

/** @type {import('next').NextConfig} */
const config = {
  // ...your existing config
};

module.exports = withOneui()(config);`,
      };
    case 'vite':
      return {
        configFile: 'vite.config.ts',
        snippet: `${importSnippet}

// vite.config.ts — add the oneui plugin:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { oneui } from '@jds4/oneui-vite-plugin';

export default defineConfig({
  plugins: [react(), oneui()],
});`,
      };
    case 'webpack':
      return {
        configFile: 'webpack.config.js',
        snippet: `${importSnippet}

// webpack.config.js — add the oneui plugin:
const { oneui } = require('@jds4/oneui-webpack-plugin');

module.exports = {
  // ...your existing config
  plugins: [
    // ...your existing plugins
    oneui(),
  ],
};`,
      };
    case 'esbuild':
      return {
        configFile: 'esbuild.config.mjs',
        snippet: `${importSnippet}

// esbuild build script — add the oneui plugin:
import { build } from 'esbuild';
import { oneui } from '@jds4/oneui-esbuild-plugin';

await build({
  // ...your existing options
  plugins: [
    // ...your existing plugins
    oneui(),
  ],
});`,
      };
    default:
      return {
        configFile: '(unknown)',
        snippet: `${importSnippet}

# Couldn't detect your framework. OneUI ships plugins for Vite, Webpack,
# and Next.js. Install whichever fits your stack:
#   @jds4/oneui-vite-plugin
#   @jds4/oneui-webpack-plugin
#   @jds4/oneui-next-plugin
# Each exposes the same oneui()/withOneui() API.`,
      };
  }
}

/** The provider wiring snippet to verify the install. */
export function providerSnippet(defaultBrand = 'jio'): string {
  return `import { BrandProvider, Container, Icon } from '@jds4/oneui-react';

export default function App() {
  return (
    <BrandProvider brand="${defaultBrand}" density="default">
      <Container surface="minimal" variant="full-bleed">
        <Icon name="home" />
        {/* your app */}
      </Container>
    </BrandProvider>
  );
}`;
}

/** Build the install commands for a package manager (no execution). */
export function buildInstallCommands(
  runtime: string[],
  dev: string[],
  pm: PackageManager,
): string[] {
  const commands: string[] = [];
  const add = (pkgs: string[], isDev: boolean) => {
    if (pkgs.length === 0) return;
    const list = pkgs.join(' ');
    if (pm === 'pnpm') commands.push(`pnpm add ${isDev ? '-D ' : ''}${list}`);
    else if (pm === 'yarn') commands.push(`yarn add ${isDev ? '-D ' : ''}${list}`);
    else commands.push(`npm install ${isDev ? '-D' : '--save'} ${list}`);
  };
  add(runtime, false);
  add(dev, true);
  return commands;
}

/** Run the install commands. Returns ok + the commands attempted. */
export function runInstall(
  projectRoot: string,
  runtime: string[],
  dev: string[],
  pm: PackageManager,
): { ok: boolean; commands: string[]; output: string } {
  const commands = buildInstallCommands(runtime, dev, pm);
  let ok = true;
  let output = '';
  for (const cmd of commands) {
    const [bin, ...args] = cmd.split(' ');
    const res = spawnSync(bin, args, { cwd: projectRoot, encoding: 'utf8' });
    output += `$ ${cmd}\n${res.stdout ?? ''}${res.stderr ?? ''}\n`;
    if (res.status !== 0) {
      ok = false;
      break;
    }
  }
  return { ok, commands, output };
}
