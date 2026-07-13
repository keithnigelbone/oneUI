/**
 * designAdapter.test.ts — GEN-03 behaviors, all credential-free (model mocked).
 *
 *   1. emits a per-section layout/component spec via compileCompositionRules +
 *      getDefaultCompositionConfig, with the model mocked.
 *   2. every chosen component is a registry member; a hallucinated component is
 *      DROPPED (Pitfall #9 / T-02-08).
 *   3. reuses the node-safe engine pieces, not the route executor (Pitfall A):
 *      no `apps/platform` / `@/lib` / `ai` / `@ai-sdk` import.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { __setCallModelImpl } from '../modelAdapter';
import { createModelMock } from '../testModelMock';
import { runDesignAdapter, DesignAdapterOutputSchema } from './designAdapter';
import { queryRegistry } from '@oneui/experience-builder-registry';

const SECTIONS = [{ id: 's1', name: 'hero', intent: 'Grab attention' }];

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('runDesignAdapter — per-section layout/component spec (GEN-03)', () => {
  it('returns a schema-valid design spec per section using registry-member components', async () => {
    const registryIds = queryRegistry().map((i) => i.id);
    const valid = registryIds.slice(0, 2);
    const mock = createModelMock([{ surfaceMode: 'bold', components: valid }]);
    restore = __setCallModelImpl(mock.impl);

    const out = await runDesignAdapter({ sections: SECTIONS, artifactType: 'web-ui' });

    expect(DesignAdapterOutputSchema.safeParse(out).success).toBe(true);
    expect(out.designSpecs).toHaveLength(1);
    expect(out.designSpecs[0].surfaceMode).toBe('bold');
    // Every chosen component is a registry member.
    for (const id of out.designSpecs[0].components) {
      expect(registryIds).toContain(id);
    }
  });

  it('DROPS a hallucinated/unregistered component (Pitfall #9 / T-02-08)', async () => {
    const registryIds = queryRegistry().map((i) => i.id);
    const oneValid = registryIds[0];
    const mock = createModelMock([
      { surfaceMode: 'default', components: [oneValid, 'TotallyFakeComponent', 'AnotherHallucination'] },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const out = await runDesignAdapter({ sections: SECTIONS, artifactType: 'web-ui' });

    const chosen = out.designSpecs[0].components;
    expect(chosen).toContain(oneValid);
    expect(chosen).not.toContain('TotallyFakeComponent');
    expect(chosen).not.toContain('AnotherHallucination');
    // Only registry members survive.
    for (const id of chosen) {
      expect(registryIds).toContain(id);
    }
  });
});

describe('isolation (Pitfall A) + single model seam', () => {
  it('designAdapter.ts imports no apps/platform, @/lib, ai, or @ai-sdk', () => {
    const src = readFileSync(fileURLToPath(new URL('./designAdapter.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"][^'"]*apps\/platform/);
    expect(src).not.toMatch(/from\s+['"]@\/lib/);
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
    // Reuses the node-safe composition prompt-builder.
    expect(src).toMatch(/compileCompositionRules/);
  });
});
