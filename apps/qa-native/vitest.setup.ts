/**
 * vitest.setup.ts — React Native test environment setup
 *
 * Mocks the React Native modules that require a native runtime so tests
 * can run in a Node (non-jsdom) environment without bridging.
 */

// ─── CJS require() intercept ──────────────────────────────────────────────────
// Vitest's `alias` only covers Vite's ESM pipeline. When RNTL's CJS files call
// require('react-native') at load time, Node.js bypasses that alias and hits the
// real react-native/index.js — which contains Flow `import typeof` syntax that
// Node cannot parse. We patch Module._resolveFilename here (before any imports
// that load RNTL) so every require('react-native') returns our plain-JS mock.
import { createRequire } from 'node:module';
import { resolve as pathResolve, dirname as pathDirname } from 'node:path';
import { fileURLToPath as pathFileURLToPath } from 'node:url';

const _require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Module = _require('node:module') as any;
const __dirname_setup = pathDirname(pathFileURLToPath(import.meta.url));
const RN_MOCK_PATH = pathResolve(__dirname_setup, '__mocks__/react-native.js');
const RN_SVG_MOCK_PATH = pathResolve(__dirname_setup, '__mocks__/react-native-svg.js');

const _origResolveFilename = Module._resolveFilename.bind(Module);
Module._resolveFilename = function (request: string, ...rest: unknown[]) {
  if (request === 'react-native') return RN_MOCK_PATH;
  if (request === 'react-native-svg') return RN_SVG_MOCK_PATH;
  return _origResolveFilename(request, ...rest);
};

import { vi, afterEach } from 'vitest';

// ─── React Native core mock ──────────────────────────────────────────────────
// Load the same plain-JS mock that the CJS Module._resolveFilename patch uses,
// so both Vite's ESM pipeline and Node's CJS require() see identical exports.
vi.mock('react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return _require(RN_MOCK_PATH) as Record<string, unknown>;
});

// ─── react-native-svg mock ───────────────────────────────────────────────────
// react-native-svg resolves to TypeScript source via the 'react-native'
// package.json field. Those .ts files cannot be loaded via CJS require().
// Replace with stub string host components — SVG rendering is not tested here.
vi.mock('react-native-svg', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return _require(RN_SVG_MOCK_PATH) as Record<string, unknown>;
});

// ─── Failure debug dump ───────────────────────────────────────────────────────
// On test failure, print the component tree to the test output.
// The HTML reporter captures this as failure context.
afterEach(async (ctx) => {
  if (ctx.task.result?.state === 'fail') {
    try {
      const { screen } = await import('@testing-library/react-native');
      screen.debug(undefined, Infinity);
    } catch {
      // screen not available if the test failed before render
    }
  }
});
