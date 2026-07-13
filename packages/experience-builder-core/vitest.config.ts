import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Wave-0 scaffold ships before any test file exists (tasks 3 & 4 add them).
    // Without this, vitest 4 exits non-zero on an empty suite and fails the
    // "zero tests OK, exit 0" scaffold acceptance gate.
    passWithNoTests: true,
  },
});
