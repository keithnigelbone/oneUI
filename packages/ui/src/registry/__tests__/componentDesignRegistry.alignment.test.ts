import { describe, expect, it } from 'vitest';

import { COMPONENT_DESIGN_REGISTRY } from '../componentDesignRegistry';
import { COMPONENT_REGISTRY } from '../componentRegistry';

describe('COMPONENT_DESIGN_REGISTRY', () => {
  it('has the same keys as COMPONENT_REGISTRY (Convex token map parity)', () => {
    expect(new Set(Object.keys(COMPONENT_DESIGN_REGISTRY))).toEqual(
      new Set(Object.keys(COMPONENT_REGISTRY)),
    );
  });
});
