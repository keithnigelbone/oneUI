/**
 * vitest.setup.ts — React Native QA test environment setup
 *
 * Intercepts ALL require('react-native') and require('react-native-svg') calls —
 * both Vite's ESM pipeline (via vitest.config.ts alias) and Node's CJS require()
 * (via Module._resolveFilename patch below) — replacing them with plain-JS mocks
 * so tests run in Node without a native runtime.
 */

// ─── React Native global: __DEV__ ─────────────────────────────────────────────
// Metro bundler injects `__DEV__ = true` at build time. Vitest does not; any
// component that references it (e.g. Button slot-warning guard) throws
// "ReferenceError: __DEV__ is not defined". Define it once here so all tests
// see it as truthy (development mode), matching the real app behaviour during
// development.
(globalThis as Record<string, unknown>)['__DEV__'] = true;

// ─── Disable RNTL auto-cleanup ────────────────────────────────────────────────
// MUST be set before any import of @testing-library/react-native.
// RNTL registers its own afterEach(cleanup) when imported. Because setup files
// run before test files, RNTL's afterEach is registered AFTER ours (LIFO order
// means it runs FIRST), wiping the rendered tree before our tree-capture hook
// can call screen.toJSON(). Setting this env var prevents RNTL from registering
// its auto-cleanup afterEach. We call cleanup() manually at the end of our hook.
process.env['RNTL_SKIP_AUTO_CLEANUP'] = 'true';

// ─── CJS require() intercept ──────────────────────────────────────────────────
// Vitest's alias only covers Vite's ESM pipeline. RNTL's CJS files call
// require('react-native') at load time, bypassing that alias and hitting the
// real react-native/index.js which contains Flow syntax Node cannot parse.
// Patching Module._resolveFilename before any RNTL import fixes this.
import { createRequire } from 'node:module';
import { resolve as pathResolve, dirname as pathDirname } from 'node:path';
import { fileURLToPath as pathFileURLToPath } from 'node:url';

const _require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Module = _require('node:module') as any;
const __dirname_setup = pathDirname(pathFileURLToPath(import.meta.url));
const RN_MOCK_PATH = pathResolve(__dirname_setup, '__mocks__/react-native.cjs');
const RN_SVG_MOCK_PATH = pathResolve(__dirname_setup, '__mocks__/react-native-svg.cjs');

const _origResolveFilename = Module._resolveFilename.bind(Module);
Module._resolveFilename = function (request: string, ...rest: unknown[]) {
  if (request === 'react-native') return RN_MOCK_PATH;
  if (request === 'react-native-svg') return RN_SVG_MOCK_PATH;
  return _origResolveFilename(request, ...rest);
};

import { vi, afterEach } from 'vitest';

// ─── ESM mock registration ────────────────────────────────────────────────────
vi.mock('react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return _require(RN_MOCK_PATH) as Record<string, unknown>;
});

vi.mock('react-native-svg', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return _require(RN_SVG_MOCK_PATH) as Record<string, unknown>;
});

// ─── Component tree capture ───────────────────────────────────────────────────
// After every test: capture the rendered component tree to a per-file NDJSON
// in test-results/trees/. The HTML report reads these to display a tree section
// alongside each test result. On failure, also prints to console for verbose output.
//
// Tree data is stored per-test-file so parallel worker execution is safe.
// The Set tracks which files have been initialised in this worker (first write
// clears the previous run's data; subsequent writes append).
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const _initialisedTreeFiles = new Set<string>();

afterEach(async (ctx) => {
  try {
    // Import both screen AND cleanup — auto-cleanup is disabled above so we
    // must call cleanup() ourselves after capturing the tree.
    const { screen, cleanup } = await import('@testing-library/react-native');

    // ── 1. Capture tree BEFORE cleanup ─────────────────────────────────────
    // screen.toJSON() returns null once cleanup() has run, so we capture here
    // while the rendered component is still mounted.
    let tree: unknown = null;
    try {
      tree = screen.toJSON();
    } catch {
      // toJSON unavailable if nothing was rendered
    }

    // ── 2. Write to per-file NDJSON ─────────────────────────────────────────
    const testFileName = ctx.task.file?.name
      ? basename(ctx.task.file.name, '.tsx').replace('.test', '')
      : 'unknown';
    const treesDir = './test-results/trees';
    const treesFile = `${treesDir}/${testFileName}.ndjson`;

    mkdirSync(treesDir, { recursive: true });

    // First write for this file in this worker: clear stale data from previous run
    if (!_initialisedTreeFiles.has(testFileName)) {
      _initialisedTreeFiles.add(testFileName);
      writeFileSync(treesFile, '');
    }

    const entry = JSON.stringify({
      id: ctx.task.id,
      name: ctx.task.name,
      suite: ctx.task.suite?.name ?? '',
      state: ctx.task.result?.state ?? 'unknown',
      tree,
    });
    appendFileSync(treesFile, entry + '\n');

    // ── 3. On failure: print debug tree to console (visible in Vitest UI) ───
    if (ctx.task.result?.state === 'fail') {
      screen.debug(undefined, Infinity);
    }

    // ── 4. Manual cleanup (replaces RNTL auto-cleanup we disabled above) ────
    cleanup();
  } catch {
    // screen not available if the test failed before render
  }
});
