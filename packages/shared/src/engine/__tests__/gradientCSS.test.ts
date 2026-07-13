/**
 * gradientCSS.test.ts
 *
 * Tests for the brand gradient CSS generator — the pipeline segment that turns
 * the `gradients` foundation config (a list of gradient definitions + on-colors)
 * into `--Gradient-{n}` / `--Gradient-{n}-On` declarations.
 */

import { describe, it, expect } from 'vitest';
import { generateGradientCSS, gradientToCSS } from '../gradientCSS';
import { filterBrandDeclarations } from '../tokenBoundary';
import type { GradientDef, GradientsFoundationConfig } from '../../types/gradients';

const LINEAR: GradientDef = {
  id: 'g1',
  name: 'Gradient 1',
  type: 'linear',
  angle: 90,
  stops: [
    { id: 's1', color: '#ff0000', position: 0 },
    { id: 's2', color: '#0000ff', position: 100 },
  ],
  onColor: '#ffffff',
};

const RADIAL: GradientDef = {
  id: 'g2',
  name: 'Gradient 2',
  type: 'radial',
  shape: 'circle',
  size: 'farthest-corner',
  centerX: 30,
  centerY: 70,
  stops: [
    { id: 's1', color: '#000000', position: 0 },
    { id: 's2', color: '#ffffff', position: 100 },
  ],
  onColor: '#000000',
};

const CONIC: GradientDef = {
  id: 'g3',
  name: 'Gradient 3',
  type: 'conic',
  angle: 45,
  centerX: 50,
  centerY: 50,
  stops: [
    { id: 's1', color: '#f00', position: 0 },
    { id: 's2', color: '#0f0', position: 50 },
    { id: 's3', color: '#00f', position: 100 },
  ],
  onColor: '#111111',
};

describe('gradientToCSS', () => {
  it('emits a linear-gradient with angle + sorted stops', () => {
    expect(gradientToCSS(LINEAR)).toBe(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    );
  });

  it('emits a radial-gradient with shape, size and centre', () => {
    expect(gradientToCSS(RADIAL)).toBe(
      'radial-gradient(circle farthest-corner at 30% 70%, #000000 0%, #ffffff 100%)',
    );
  });

  it('emits a conic-gradient with start angle and centre', () => {
    expect(gradientToCSS(CONIC)).toBe(
      'conic-gradient(from 45deg at 50% 50%, #f00 0%, #0f0 50%, #00f 100%)',
    );
  });

  it('sorts stops by position regardless of input order', () => {
    const unsorted: GradientDef = {
      ...LINEAR,
      stops: [
        { id: 's2', color: '#0000ff', position: 100 },
        { id: 's1', color: '#ff0000', position: 0 },
      ],
    };
    expect(gradientToCSS(unsorted)).toBe(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    );
  });

  it('folds per-stop opacity into an 8-digit hex, leaving full-opacity stops as-is', () => {
    const withOpacity: GradientDef = {
      ...LINEAR,
      stops: [
        { id: 's1', color: '#ff0000', position: 0, opacity: 50 },
        { id: 's2', color: '#0000ff', position: 100, opacity: 100 },
      ],
    };
    // 50% → 0x80, 100% stays #0000ff
    expect(gradientToCSS(withOpacity)).toBe(
      'linear-gradient(90deg, #ff000080 0%, #0000ff 100%)',
    );
  });

  it('leaves non-6-digit-hex colours unchanged when opacity is set', () => {
    const g: GradientDef = {
      ...LINEAR,
      stops: [
        { id: 's1', color: 'rgb(255,0,0)', position: 0, opacity: 50 },
        { id: 's2', color: '#0000ff', position: 100 },
      ],
    };
    expect(gradientToCSS(g)).toContain('rgb(255,0,0) 0%');
  });

  it('falls back to sensible geometry defaults when omitted', () => {
    const bare: GradientDef = {
      id: 'g',
      name: 'g',
      type: 'radial',
      stops: LINEAR.stops,
      onColor: '#fff',
    };
    // ellipse / farthest-corner / centre 50% 50% defaults
    expect(gradientToCSS(bare)).toContain('radial-gradient(ellipse farthest-corner at 50% 50%');
  });

  it('renders a blank stop colour as transparent instead of invalid CSS', () => {
    const g: GradientDef = {
      ...LINEAR,
      stops: [
        { id: 's1', color: '  ', position: 0 },
        { id: 's2', color: '#0000ff', position: 100 },
      ],
    };
    expect(gradientToCSS(g)).toBe(
      'linear-gradient(90deg, transparent 0%, #0000ff 100%)',
    );
  });
});

describe('generateGradientCSS', () => {
  it('returns empty string for null/undefined/empty config (no override injected)', () => {
    expect(generateGradientCSS(null)).toBe('');
    expect(generateGradientCSS(undefined)).toBe('');
    expect(generateGradientCSS({ gradients: [] })).toBe('');
  });

  it('emits a fill + on-color token per gradient, indexed 1-based', () => {
    const config: GradientsFoundationConfig = { gradients: [LINEAR, RADIAL] };
    const css = generateGradientCSS(config);
    expect(css).toContain('--Gradient-1: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);');
    expect(css).toContain('--Gradient-1-On: #ffffff;');
    expect(css).toContain('--Gradient-2: radial-gradient(circle farthest-corner at 30% 70%, #000000 0%, #ffffff 100%);');
    expect(css).toContain('--Gradient-2-On: #000000;');
  });

  it('omits the -On token when the on-color is blank (no empty declaration)', () => {
    const css = generateGradientCSS({ gradients: [{ ...LINEAR, onColor: '   ' }] });
    expect(css).toContain('--Gradient-1: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);');
    expect(css).not.toContain('--Gradient-1-On:');
  });

  it('passes the token boundary filter (--Gradient- is an allowed family)', () => {
    const css = generateGradientCSS({ gradients: [LINEAR, RADIAL, CONIC] });
    const declarations = css
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--'));
    expect(declarations.length).toBeGreaterThan(0);
    const filtered = filterBrandDeclarations(declarations);
    expect(filtered).toEqual(declarations);
  });
});
