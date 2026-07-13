/**
 * Scrim.test.tsx
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Scrim } from './Scrim';

describe('Scrim', () => {
  it('renders as aria-hidden decorative overlay', () => {
    const { container } = render(
      <div style={{ position: 'relative' }}>
        <Scrim data-testid="scrim" />
      </div>,
    );
    const scrim = container.querySelector('[data-testid="scrim"]');
    expect(scrim).toBeInTheDocument();
    expect(scrim).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to Figma symbol 4301:4757 props', () => {
    const { container } = render(<Scrim data-testid="scrim" />);
    const scrim = container.querySelector('[data-testid="scrim"]');
    expect(scrim?.getAttribute('data-position')).toBe('bottom');
    expect(scrim?.getAttribute('data-size')).toBe('s');
    expect(scrim?.getAttribute('data-attention')).toBe('medium');
    expect(scrim?.getAttribute('data-variant')).toBe('gradient');
  });

  it('overlay always renders as center+full regardless of internal state', () => {
    const { container } = render(
      <Scrim variant="overlay" attention="high" data-testid="scrim" />,
    );
    const scrim = container.querySelector('[data-testid="scrim"]');
    expect(scrim?.getAttribute('data-variant')).toBe('overlay');
    expect(scrim?.getAttribute('data-position')).toBe('center');
    expect(scrim?.getAttribute('data-size')).toBe('full');
    expect(scrim?.getAttribute('data-attention')).toBe('high');
  });

  it('exposes data-oneui-component for QA selectors', () => {
    const { container } = render(<Scrim data-testid="scrim" />);
    const scrim = container.querySelector('[data-testid="scrim"]');
    expect(scrim?.getAttribute('data-oneui-component')).toBe('Scrim');
  });
});
