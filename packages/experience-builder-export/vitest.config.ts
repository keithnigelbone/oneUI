import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Mirrors the sibling experience-builder-* packages. Tasks add the emitter
    // tests; passWithNoTests keeps the scaffold green between tasks.
    passWithNoTests: true,
  },
});
