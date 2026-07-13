/**
 * Web ↔ native radius parity for Input and Tabs.
 *
 * These two components rendered the wrong corner radius for a long time and no
 * test noticed, because nothing asserted the radii at all. Native read the
 * static `tokens.shape` table, which had drifted from the dimension scale. Its
 * lowercase `s` rung (4px) sat next to web's t-shirt `Shape-3XS` (8px) looking
 * like the same step, and was not: that table is px-first (it skips 6/10/14),
 * while the scale is f-step-first. Renaming to the numeric scale made the gap
 * legible; this test keeps it closed.
 *
 * The web side of each expectation is transcribed from the component's own
 * token manifest / CSS fallback, cited inline. If web changes, this fails.
 */

import { describe, it, expect } from 'vitest';
import { buildNativeDimensions } from '@oneui/shared/engine';
import { INPUT_SIZE_METRICS } from './Input/Input.styles.native';
import { TAB_METRICS } from './Tabs/Tabs.styles.native';

const shape = buildNativeDimensions({ platform: 'S', density: 'default' }).shape;

describe('Input — corner radius matches web', () => {
  // Confirmed against Figma `.DNA/Input` (2026-07-08):
  //   XS  h=24 (dimension-6)  → shape 1.5 (6px)
  //   S   h=32 (dimension-8)  → shape 2   (8px)
  //   M   h=40 (dimension-10) → shape 2   (8px)
  //   L   h=48 (dimension-12) → shape 3   (12px)
  // Matches Input.tokens.ts `sizes` and the Input.module.css per-size fallbacks.
  it.each([
    [6, '1-5'],
    [8, '2'],
    [10, '2'],
    [12, '3'],
  ] as const)('size %i → Shape-%s', (size, step) => {
    expect(INPUT_SIZE_METRICS[size].borderRadius).toBe(shape[step]);
  });

  it('exact Figma pixels at the default breakpoint/density', () => {
    expect(INPUT_SIZE_METRICS[6].borderRadius).toBe(6); // was 2px
    expect(INPUT_SIZE_METRICS[8].borderRadius).toBe(8); // was 4px
    expect(INPUT_SIZE_METRICS[10].borderRadius).toBe(8); // was 4px
    expect(INPUT_SIZE_METRICS[12].borderRadius).toBe(12); // was 8px
  });
});

describe('Tabs — state-layer radius matches web', () => {
  // packages/ui/src/components/Tabs/Tabs.module.css:
  //   --Tabs-itemRadius-s → var(--Shape-2), -m → var(--Shape-1-5), -l → var(--Shape-2)
  // `.tab[data-orientation='vertical'] .stateLayer` changes only justify-content,
  // so vertical inherits the same per-size radius.
  //
  // Confirmed against Figma F7KEYdO8R8Nbe2N4gI8dIU (2026-07-08): the focus and
  // hover state-layer nodes (2564:1264, 2564:1272 — both size `m`) bind
  // Dimensions/Shape/1,5 = 6px. The TabGroup set (1:55590) uses only Shape 0,
  // 0.5, 1.5 and 2 — Shape/1 (4px), which native rendered, is not in the frame.
  it.each([
    ['s:horizontal', '2'],
    ['m:horizontal', '1-5'],
    ['l:horizontal', '2'],
    ['s:vertical', '2'],
    ['m:vertical', '1-5'],
    ['l:vertical', '2'],
  ] as const)('%s → Shape-%s', (key, step) => {
    expect(TAB_METRICS[key].stateLayerBorderRadius).toBe(shape[step]);
  });

  // NOTE: a "must read a shape token, not a spacing token" assertion was tried
  // here and removed. `spacing['1-5']` and `shape['1-5']` are both 6px, so no
  // value-based check can tell them apart — it only appeared to work because the
  // vitest `@oneui/tokens` mock leaves `spacing` undefined. The per-key
  // expectations above are the real guard.
});
