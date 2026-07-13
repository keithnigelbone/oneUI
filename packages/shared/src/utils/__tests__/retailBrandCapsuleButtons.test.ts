import { describe, expect, it } from 'vitest';
import {
  maybeApplyRetailTiraCapsuleButtons,
  retailBrandUsesTiraCapsuleActions,
  withRetailTiraCapsuleButtonRadii,
} from '../retailBrandCapsuleButtons';

describe('retailBrandUsesTiraCapsuleActions', () => {
  it('matches slug tira case-insensitive', () => {
    expect(retailBrandUsesTiraCapsuleActions('tira', null)).toBe(true);
    expect(retailBrandUsesTiraCapsuleActions('Tira', null)).toBe(true);
  });

  it('matches name tira when slug empty', () => {
    expect(retailBrandUsesTiraCapsuleActions('', 'Tira')).toBe(true);
  });

  it('matches tira- prefix slug', () => {
    expect(retailBrandUsesTiraCapsuleActions('tira-marketing', '')).toBe(true);
  });

  it('rejects unrelated brands', () => {
    expect(retailBrandUsesTiraCapsuleActions('jio-default', '')).toBe(false);
    expect(retailBrandUsesTiraCapsuleActions('contira', '')).toBe(false);
  });
});

describe('maybeApplyRetailTiraCapsuleButtons', () => {
  it('overlays pill radii for Tira', () => {
    const base = { '--Button-borderRadius': 'var(--Shape-3)', '--Other': '1' };
    const out = maybeApplyRetailTiraCapsuleButtons(base, 'tira', 'Tira');
    expect(out['--Button-borderRadius']).toBe('var(--Shape-Pill)');
    expect(out['--IconButton-borderRadius']).toBe('var(--Shape-Pill)');
    expect(out['--Other']).toBe('1');
  });

  it('does not mutate for non-Tira', () => {
    const base = { '--Button-borderRadius': 'var(--Shape-3)' };
    const out = maybeApplyRetailTiraCapsuleButtons(base, 'jio-default', '');
    expect(out).toBe(base);
    expect(out['--Button-borderRadius']).toBe('var(--Shape-3)');
  });

  it('preserves an explicit Button shape decision (capsule is a default, not an override)', () => {
    const base = {
      '--Button-borderRadius': 'var(--Shape-0)',
      '--IconButton-borderRadius': 'var(--Shape-2)',
    };
    const out = maybeApplyRetailTiraCapsuleButtons(
      base,
      'tira',
      'Tira',
      new Set(['Button'])
    );
    // Button had an explicit decision → kept; IconButton had none → forced pill.
    expect(out['--Button-borderRadius']).toBe('var(--Shape-0)');
    expect(out['--IconButton-borderRadius']).toBe('var(--Shape-Pill)');
  });

  it('forces pill for both when no explicit decision', () => {
    const out = maybeApplyRetailTiraCapsuleButtons(
      { '--Button-borderRadius': 'var(--Shape-0)' },
      'tira',
      'Tira',
      new Set()
    );
    expect(out['--Button-borderRadius']).toBe('var(--Shape-Pill)');
    expect(out['--IconButton-borderRadius']).toBe('var(--Shape-Pill)');
  });
});

describe('withRetailTiraCapsuleButtonRadii', () => {
  it('overlays both button components when no skip set', () => {
    const out = withRetailTiraCapsuleButtonRadii({});
    expect(out['--Button-borderRadius']).toBe('var(--Shape-Pill)');
    expect(out['--IconButton-borderRadius']).toBe('var(--Shape-Pill)');
  });

  it('skips components with an explicit decision', () => {
    const out = withRetailTiraCapsuleButtonRadii(
      { '--Button-borderRadius': 'var(--Shape-4)' },
      new Set(['Button'])
    );
    expect(out['--Button-borderRadius']).toBe('var(--Shape-4)');
    expect(out['--IconButton-borderRadius']).toBe('var(--Shape-Pill)');
  });
});
