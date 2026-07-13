import { defineConfig } from 'vitest/config';

// convex-test requires the edge-runtime VM so Convex functions execute in the
// same V8 isolate semantics as the real backend (per the Convex testing
// guidelines in convex/_generated/ai/guidelines.md). Pure-function tests under
// convex/__tests__ also run fine in this environment.
export default defineConfig({
  test: {
    environment: 'edge-runtime',
    server: { deps: { inline: ['convex-test'] } },
    include: ['convex/**/*.test.ts'],
  },
});
