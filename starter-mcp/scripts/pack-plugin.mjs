#!/usr/bin/env node
/**
 * Package the oneui-coding plugin into a distributable .zip.
 *
 * Two flavors (pass --mode):
 *   --mode=full  (default) — SELF-CONTAINED / OFFLINE. esbuild-bundles the server
 *                 into a single dist/index.mjs (all node deps inlined — no
 *                 node_modules needed) + the baked snapshot (assets/) + the plugin
 *                 shell (manifests, commands, skills, hooks). The bundled .mcp.json
 *                 runs node ${CLAUDE_PLUGIN_ROOT}/dist/index.mjs. Recipient unzips →
 *                 /plugin marketplace add ./<dir> → install. No network, no feed
 *                 needed to RUN (only to install @jds4/* packages into their app).
 *
 *   --mode=npm   — THIN. Ships only the plugin shell (manifests, commands, skills,
 *                 hooks). The bundled .mcp.json runs the PUBLISHED server via
 *                 npx -y @jds4/oneui-mcp, so the server + snapshot come from the
 *                 registry at runtime. Smaller; requires the package be published to
 *                 a registry the recipient's .npmrc can reach (the @jds4 scope → JDS
 *                 feed, or public npm).
 *
 * Prereqs: `npm run build` (dist/) and `npm run build:plugin` (skills/) first — this
 * script runs both to be safe. Output → releases/oneui-coding-plugin-<ver>-<mode>.zip
 *
 * Usage:
 *   node scripts/pack-plugin.mjs --mode=full
 *   node scripts/pack-plugin.mjs --mode=npm
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');

const mode = (process.argv.find((a) => a.startsWith('--mode=')) ?? '--mode=full').split('=')[1];
if (!['full', 'npm'].includes(mode)) {
  console.error(`Unknown --mode "${mode}". Use --mode=full or --mode=npm.`);
  process.exit(1);
}

const version = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).version;
const NPM_PACKAGE = '@jds4/oneui-mcp';

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: PKG, stdio: 'inherit' });
}

/** Locate the esbuild binary (local package, then monorepo root, then npx). */
function esbuildBin() {
  for (const p of [join(PKG, 'node_modules', '.bin', 'esbuild'), join(PKG, '..', 'node_modules', '.bin', 'esbuild')]) {
    if (existsSync(p)) return { cmd: p, pre: [] };
  }
  return { cmd: 'npx', pre: ['-y', 'esbuild'] };
}

/** Bundle src/index.ts into a single self-contained ESM file (no node_modules). */
function bundleServer(outFile) {
  const { cmd, pre } = esbuildBin();
  run(cmd, [
    ...pre,
    'src/index.ts',
    '--bundle',
    '--platform=node',
    '--format=esm',
    '--target=node18',
    // ESM-for-node needs a real `require` so transitive deps (cross-spawn) that
    // dynamic-require node built-ins work.
    "--banner:js=import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);",
    `--outfile=${outFile}`,
  ]);
}

/* ---- 1. build (tsc + plugin layer) ---- */
console.log('• Building server + plugin layer…');
run('npm', ['run', 'build']);
run('npm', ['run', 'build:plugin']);

/* ---- 2. stage the payload ---- */
const staging = mkdtempSync(join(tmpdir(), 'oneui-plugin-'));
const pluginDirName = 'oneui-coding-plugin';
const dest = join(staging, pluginDirName);
mkdirSync(dest, { recursive: true });

// Plugin shell — always shipped.
const SHELL = ['.claude-plugin', 'commands', 'skills', 'hooks', 'README.md', 'INSTALL.md'];

for (const rel of SHELL) {
  const src = join(PKG, rel);
  if (existsSync(src)) cpSync(src, join(dest, rel), { recursive: true });
}
if (mode === 'full') {
  // Self-contained runtime: a single bundled server file (no node_modules) + the
  // baked snapshot. esbuild inlines @modelcontextprotocol/sdk, zod, @babel/parser.
  const assetsSrc = join(PKG, 'assets');
  if (!existsSync(join(assetsSrc, 'manifest.json'))) {
    console.error('✗ assets/ snapshot missing — run "npm run build:snapshot" first.');
    process.exit(1);
  }
  mkdirSync(join(dest, 'dist'), { recursive: true });
  console.log('• Bundling self-contained server (esbuild)…');
  bundleServer(join(dest, 'dist', 'index.mjs'));
  cpSync(assetsSrc, join(dest, 'assets'), { recursive: true });
}

/* ---- 3. write the flavor-specific .mcp.json ---- */
const mcp =
  mode === 'full'
    ? { mcpServers: { oneui: { command: 'node', args: ['${CLAUDE_PLUGIN_ROOT}/dist/index.mjs'], env: {} } } }
    : { mcpServers: { oneui: { command: 'npx', args: ['-y', NPM_PACKAGE], env: {} } } };
writeFileSync(join(dest, '.mcp.json'), JSON.stringify(mcp, null, 2) + '\n');

/* ---- 4. minimal package.json so the plugin dir is self-describing ---- */
const fullPkg = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'));
const slimPkg = {
  name: 'oneui-coding-plugin',
  version,
  private: true,
  description: `One UI coding plugin (${mode} flavor). ${fullPkg.description}`,
};
writeFileSync(join(dest, 'package.json'), JSON.stringify(slimPkg, null, 2) + '\n');

/* ---- 5. zip ---- */
mkdirSync(join(PKG, 'releases'), { recursive: true });
const zipName = `oneui-coding-plugin-${version}-${mode}.zip`;
const zipPath = join(PKG, 'releases', zipName);
rmSync(zipPath, { force: true });
// `zip` is available on macOS/Linux; -r recursive, -q quiet. Run from staging so the
// archive root is the plugin dir (oneui-coding-plugin/…).
execFileSync('zip', ['-r', '-q', zipPath, pluginDirName], { cwd: staging });
rmSync(staging, { recursive: true, force: true });

const sizeMB = (statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`\n✅ ${mode} plugin packaged → releases/${zipName} (${sizeMB} MB)`);
console.log(
  mode === 'full'
    ? '   Self-contained: unzip → /plugin marketplace add ./oneui-coding-plugin → /plugin install oneui'
    : `   Thin: requires ${NPM_PACKAGE} reachable via the recipient's .npmrc (npx pulls it at runtime).`,
);
