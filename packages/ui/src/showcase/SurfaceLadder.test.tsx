/**
 * SurfaceLadder.test.tsx
 *
 * Locks the doc-primitive contract: one real `<Surface>` row per mode (so the
 * [data-surface] cascade actually drives adaptation), render-prop support, and
 * mode/label overrides.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SurfaceLadder, SURFACE_LADDER_MODES } from './SurfaceLadder';

describe('SurfaceLadder', () => {
  it('renders one data-surface row per default ladder mode', () => {
    const { container } = render(
      <SurfaceLadder>
        <button type="button">child</button>
      </SurfaceLadder>,
    );
    const surfaces = container.querySelectorAll('[data-surface]');
    expect(surfaces).toHaveLength(SURFACE_LADDER_MODES.length);
    expect(
      Array.from(surfaces).map((el) => el.getAttribute('data-surface')),
    ).toEqual(SURFACE_LADDER_MODES);
  });

  it('repeats plain children on every row', () => {
    render(
      <SurfaceLadder>
        <button type="button">Do it</button>
      </SurfaceLadder>,
    );
    expect(screen.getAllByRole('button', { name: 'Do it' })).toHaveLength(
      SURFACE_LADDER_MODES.length,
    );
  });

  it('honors custom modes and label overrides', () => {
    const { container } = render(
      <SurfaceLadder modes={['subtle']} labels={{ subtle: 'Tinted' }}>
        <span>x</span>
      </SurfaceLadder>,
    );
    expect(container.querySelectorAll('[data-surface]')).toHaveLength(1);
    expect(screen.getByText('Tinted')).toBeInTheDocument();
  });
});
