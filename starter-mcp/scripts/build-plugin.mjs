#!/usr/bin/env node
/**
 * Plugin build step.
 *
 * Assembles the agent-native plugin layer on top of the MCP package:
 *   1. Copies the baked skills (assets/skills/*) → top-level skills/* so the agent
 *      loads them natively (the MCP still serves them via get_skill). The new
 *      `figma-to-native` skill authored directly under skills/ is preserved.
 *   2. Validates that dist/index.js exists (the .mcp.json entrypoint) and that the
 *      manifests + command files are consistent.
 *
 * Run after `npm run build` (+ `npm run build:snapshot` if assets changed):
 *   npm run build:plugin
 */
import {
  cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_TOOLS } from './expected-tools.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const ASSETS_SKILLS = join(PKG, 'assets', 'skills');
const SKILLS = join(PKG, 'skills');

// Skills authored directly under skills/ (NOT copied from assets) — preserved.
const PLUGIN_AUTHORED_SKILLS = new Set(['figma-to-native']);

const problems = [];
const notes = [];

/* --------------------- 1. copy baked skills --------------------- */
if (!existsSync(ASSETS_SKILLS)) {
  problems.push(`assets/skills not found — run "npm run build:snapshot" first (${ASSETS_SKILLS}).`);
} else {
  mkdirSync(SKILLS, { recursive: true });
  // Clear previously-copied skills (but keep plugin-authored ones).
  for (const entry of readdirSync(SKILLS)) {
    if (PLUGIN_AUTHORED_SKILLS.has(entry)) continue;
    const p = join(SKILLS, entry);
    if (statSync(p).isDirectory()) rmSync(p, { recursive: true, force: true });
  }
  let copied = 0;
  for (const name of readdirSync(ASSETS_SKILLS)) {
    const src = join(ASSETS_SKILLS, name);
    if (!statSync(src).isDirectory()) continue;
    if (PLUGIN_AUTHORED_SKILLS.has(name)) {
      // Also baked into the MCP corpus (for get_skill / search), but the
      // plugin-authored copy under skills/ is canonical for the agent — keep it.
      notes.push(`skill "${name}" is plugin-authored AND baked; keeping the authored skills/ copy.`);
      continue;
    }
    cpSync(src, join(SKILLS, name), { recursive: true });
    copied++;
  }
  notes.push(`Copied ${copied} baked skill(s) → skills/.`);
}

// Confirm plugin-authored skills are present (warn, don't fail).
for (const name of PLUGIN_AUTHORED_SKILLS) {
  if (existsSync(join(SKILLS, name, 'SKILL.md'))) notes.push(`Plugin-authored skill present: ${name}.`);
  else notes.push(`(note) plugin-authored skill "${name}" not found yet at skills/${name}/SKILL.md.`);
}

/* --------------------- 2. validate manifests --------------------- */
function readJson(p) {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    problems.push(`Could not parse ${p}: ${e.message}`);
    return null;
  }
}

const distEntry = join(PKG, 'dist', 'index.js');
if (!existsSync(distEntry)) problems.push(`dist/index.js missing — run "npm run build" (tsc). (${distEntry})`);

const pluginJson = readJson(join(PKG, '.claude-plugin', 'plugin.json'));
if (pluginJson && !pluginJson.name) problems.push('.claude-plugin/plugin.json: missing "name".');

const mcpJson = readJson(join(PKG, '.mcp.json'));
if (mcpJson && !mcpJson.mcpServers?.oneui) problems.push('.mcp.json: missing mcpServers.oneui.');

const market = readJson(join(PKG, '.claude-plugin', 'marketplace.json'));
const declaredCommands = market?.plugins?.[0]?.commands ?? [];
const commandFiles = existsSync(join(PKG, 'commands'))
  ? readdirSync(join(PKG, 'commands')).filter((f) => f.endsWith('.md')).map((f) => `/oneui:${f.replace(/\.md$/, '')}`)
  : [];
for (const c of declaredCommands) {
  if (!commandFiles.includes(c)) problems.push(`marketplace.json lists command ${c} but commands/ has no matching file.`);
}
for (const c of commandFiles) {
  if (!declaredCommands.includes(c)) notes.push(`(note) command file ${c} is not listed in marketplace.json commands[].`);
}

/* --------------------- 3. consistency: counts, versions, licenses ---------- */
// "N tools" claims in prose must match the canonical list — a new/removed tool
// fails the plugin build until scripts/expected-tools.mjs AND the docs are updated.
const TOOL_COUNT = EXPECTED_TOOLS.length;
function checkToolCountClaims(label, content) {
  for (const m of content.matchAll(/\b(\d+)\s+tools\b/g)) {
    if (Number(m[1]) !== TOOL_COUNT) {
      problems.push(`${label} claims "${m[0]}" but the server registers ${TOOL_COUNT} tools (scripts/expected-tools.mjs).`);
    }
  }
}
// Same self-policing for "N slash commands" claims, against the commands/ dir.
function checkCommandCountClaims(label, content) {
  for (const m of content.matchAll(/\b(\d+)\s+(?:slash commands|`\/oneui:\*` slash commands)\b/g)) {
    if (Number(m[1]) !== commandFiles.length) {
      problems.push(`${label} claims "${m[0]}" but commands/ has ${commandFiles.length} command files.`);
    }
  }
}
const marketPlugin = market?.plugins?.[0];
if (marketPlugin?.description) {
  checkToolCountClaims('marketplace.json plugin description', marketPlugin.description);
  checkCommandCountClaims('marketplace.json plugin description', marketPlugin.description);
}
const installMd = join(PKG, 'INSTALL.md');
if (existsSync(installMd)) checkToolCountClaims('INSTALL.md', readFileSync(installMd, 'utf8'));

// Version + license must agree across package.json / plugin.json / marketplace.json.
const pkgJson = readJson(join(PKG, 'package.json'));
if (pkgJson && pluginJson && marketPlugin) {
  for (const [label, v] of [['plugin.json', pluginJson.version], ['marketplace.json plugins[0]', marketPlugin.version]]) {
    if (v !== pkgJson.version) problems.push(`${label} version "${v}" ≠ package.json version "${pkgJson.version}".`);
  }
  for (const [label, l] of [['plugin.json', pluginJson.license], ['marketplace.json plugins[0]', marketPlugin.license]]) {
    if (l !== pkgJson.license) problems.push(`${label} license "${l}" ≠ package.json license "${pkgJson.license}".`);
  }
}

/* --------------------- report --------------------- */
for (const n of notes) console.log(`• ${n}`);
if (problems.length) {
  console.error('\nPlugin build problems:');
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log('\n✅ Plugin layer assembled and consistent.');
