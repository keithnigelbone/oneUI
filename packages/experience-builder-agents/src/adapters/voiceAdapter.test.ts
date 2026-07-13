/**
 * voiceAdapter.test.ts — GEN-02 behaviors, all credential-free (model mocked).
 *
 *   1. builds a per-section copy spec via compileVoiceRules + runToneGuard
 *      (validation loop), with the model call mocked.
 *   2. the copy spec is MARKUP-FREE: no string field contains tag-like `<...>`
 *      (D-01 "advises"; defence-in-depth with parseIR downstream).
 *   3. reuses the node-safe engine pieces, not the route executor (Pitfall A):
 *      no `apps/platform` / `@/lib` / `ai` / `@ai-sdk` import.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { __setCallModelImpl } from '../modelAdapter';
import { createModelMock } from '../testModelMock';
import { runVoiceAdapter, VoiceAdapterOutputSchema } from './voiceAdapter';

const SECTIONS = [
  { id: 's1', name: 'hero', intent: 'Grab attention with the plan offer' },
  { id: 's2', name: 'cta', intent: 'Drive sign-up' },
];

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('runVoiceAdapter — per-section markup-free copy spec (GEN-02)', () => {
  it('returns a schema-valid copy spec per section, scored by runToneGuard', async () => {
    const mock = createModelMock([
      { headline: 'More data, less fuss', body: 'The plan that keeps up with you.', cta: 'Get it' },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const out = await runVoiceAdapter({ sections: SECTIONS, artifactType: 'web-ui' });

    expect(VoiceAdapterOutputSchema.safeParse(out).success).toBe(true);
    expect(out.copySpecs).toHaveLength(2);
    for (const spec of out.copySpecs) {
      expect(typeof spec.headline).toBe('string');
      // runToneGuard ran (a numeric score is attached).
      expect(typeof spec.toneScore).toBe('number');
    }
    // Two sections → two bounded model calls.
    expect(mock.callCount()).toBe(2);
  });

  it('emits NO HTML/JSX/markup in any string field (markup-free, D-01)', async () => {
    const mock = createModelMock([
      {
        headline: '<h1>Sneaky markup</h1>',
        body: 'Plain copy <script>alert(1)</script> with smuggled tags',
        cta: '<a href="#">Click</a>',
      },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const out = await runVoiceAdapter({ sections: [SECTIONS[0]], artifactType: 'web-ui' });

    for (const spec of out.copySpecs) {
      for (const value of [spec.headline, spec.body, spec.cta ?? '']) {
        expect(value).not.toMatch(/<[^>]+>/);
      }
    }
  });
});

describe('isolation (Pitfall A) + single model seam', () => {
  it('voiceAdapter.ts imports no apps/platform, @/lib, ai, or @ai-sdk', () => {
    const src = readFileSync(fileURLToPath(new URL('./voiceAdapter.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"][^'"]*apps\/platform/);
    expect(src).not.toMatch(/from\s+['"]@\/lib/);
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
    // Reuses the node-safe engine prompt-builder + tone guard.
    expect(src).toMatch(/compileVoiceRules/);
    expect(src).toMatch(/runToneGuard/);
  });
});
