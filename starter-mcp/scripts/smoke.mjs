#!/usr/bin/env node
/**
 * Protocol smoke test — spawns the built server over stdio, runs the MCP
 * handshake, and ASSERTS on the results (tool set, prompts, resources,
 * server identity, offline tool calls). Exits non-zero on any mismatch,
 * so CI fails instead of green-lighting a broken server.
 * Usage: node scripts/smoke.mjs
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_TOOLS,
  EXPECTED_PROMPTS,
  EXPECTED_FIXED_RESOURCES,
  EXPECTED_RESOURCE_TEMPLATE_COUNT,
} from './expected-tools.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = resolve(HERE, '..', 'dist', 'index.js');
const PKG = JSON.parse(readFileSync(resolve(HERE, '..', 'package.json'), 'utf8'));

const WATCHDOG_MS = 60_000;

const child = spawn('node', [ENTRY], { stdio: ['pipe', 'pipe', 'inherit'] });

let failures = 0;
function check(ok, label, detail = '') {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function fatal(message) {
  console.error(`FATAL: ${message}`);
  child.kill();
  process.exit(1);
}

const watchdog = setTimeout(() => fatal(`smoke test timed out after ${WATCHDOG_MS / 1000}s (hung server?)`), WATCHDOG_MS);

let buf = '';
const pending = new Map();
child.stdout.on('data', (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});
child.on('exit', (code) => {
  if (pending.size > 0) fatal(`server exited early (code ${code}) with ${pending.size} request(s) in flight`);
});

function send(obj) { child.stdin.write(JSON.stringify(obj) + '\n'); }
function request(id, method, params) {
  return new Promise((res) => { pending.set(id, res); send({ jsonrpc: '2.0', id, method, params }); });
}

/** Call a tool and assert it returned non-empty, non-error text content. */
async function callTool(id, name, args) {
  const r = await request(id, 'tools/call', { name, arguments: args });
  const content = r.result?.content?.[0]?.text ?? '';
  check(!r.error && !r.result?.isError && content.length > 0, `tools/call ${name}`,
    r.error ? JSON.stringify(r.error) : r.result?.isError ? content.slice(0, 200) : 'empty content');
  return content;
}

const run = async () => {
  console.log('## initialize');
  const init = await request(1, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0' },
  });
  const info = init.result?.serverInfo ?? {};
  check(info.name === 'oneui', 'serverInfo.name is "oneui"', `got "${info.name}"`);
  check(info.version === PKG.version, `serverInfo.version matches package.json (${PKG.version})`, `got "${info.version}"`);

  send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  console.log('## tools/list');
  const tools = await request(2, 'tools/list', {});
  const names = (tools.result?.tools ?? []).map((t) => t.name).sort();
  const expected = [...EXPECTED_TOOLS].sort();
  const missing = expected.filter((n) => !names.includes(n));
  const unexpected = names.filter((n) => !expected.includes(n));
  check(missing.length === 0, 'no expected tool is missing', missing.join(', '));
  check(unexpected.length === 0, 'no unexpected tool is registered (update scripts/expected-tools.mjs + docs)', unexpected.join(', '));
  check(names.length === EXPECTED_TOOLS.length, `tool count is ${EXPECTED_TOOLS.length}`, `got ${names.length}`);

  console.log('## prompts/list');
  const prompts = await request(3, 'prompts/list', {});
  const promptNames = (prompts.result?.prompts ?? []).map((p) => p.name);
  for (const p of EXPECTED_PROMPTS) check(promptNames.includes(p), `prompt "${p}" registered`);

  console.log('## resources/list');
  const resources = await request(4, 'resources/list', {});
  const uris = new Set((resources.result?.resources ?? []).map((r) => r.uri));
  for (const uri of EXPECTED_FIXED_RESOURCES) check(uris.has(uri), `resource ${uri} registered`);
  const templates = await request(11, 'resources/templates/list', {});
  const templateCount = (templates.result?.resourceTemplates ?? []).length;
  check(
    templateCount === EXPECTED_RESOURCE_TEMPLATE_COUNT,
    `${EXPECTED_RESOURCE_TEMPLATE_COUNT} resource templates registered`,
    `got ${templateCount}`,
  );

  console.log('## offline tool calls');
  const inv = await callTool(5, 'get_core_invariants', {});
  check(inv.length > 200, 'invariants content is substantial');
  await callTool(6, 'list_brands', { includeSynthetic: false });
  const searchOut = await callTool(7, 'search_design_system', { query: 'how do surface modes work bold subtle', limit: 3 });
  check(/surface/i.test(searchOut), 'search finds surface docs');
  const comp = await callTool(8, 'get_component_info', { name: 'Button', section: 'variants' });
  check(/button/i.test(comp), 'component info mentions Button');
  await callTool(9, 'list_components', {});
  await callTool(10, 'list_skills', {});

  clearTimeout(watchdog);
  child.kill();
  if (failures > 0) {
    console.error(`\n${failures} smoke assertion(s) FAILED`);
    process.exit(1);
  }
  console.log('\nAll smoke assertions passed.');
  process.exit(0);
};

run().catch((e) => { console.error(e); child.kill(); process.exit(1); });
