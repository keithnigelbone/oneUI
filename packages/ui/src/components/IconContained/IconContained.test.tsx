/**
 * IconContained.test.tsx
 * Smoke + accessibility coverage for the IconContained component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { IconContained } from './IconContained';

describe('IconContained', () => {
  it('renders with role="img" and the supplied aria-label', () => {
    render(<IconContained icon="star" aria-label="Favourite" />);
    const node = screen.getByRole('img', { name: 'Favourite' });
    expect(node).toBeInTheDocument();
  });

  it('emits data attributes for size, attention, and appearance', () => {
    render(
      <IconContained
        icon="star"
        size="l"
        attention="medium"
        appearance="secondary"
        aria-label="Star"
      />,
    );
    const node = screen.getByRole('img', { name: 'Star' });
    expect(node).toHaveAttribute('data-size', 'l');
    expect(node).toHaveAttribute('data-attention', 'medium');
    expect(node).toHaveAttribute('data-appearance', 'secondary');
  });

  it('resolves appearance="auto" to primary', () => {
    render(<IconContained icon="star" appearance="auto" aria-label="Auto" />);
    const node = screen.getByRole('img', { name: 'Auto' });
    expect(node).toHaveAttribute('data-appearance', 'primary');
  });

  it('renders a custom React element as the icon glyph', () => {
    render(
      <IconContained
        icon={<svg data-testid="custom-svg" />}
        aria-label="Custom"
      />,
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('forwards ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<IconContained ref={ref} icon="star" aria-label="Reffed" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('treats missing aria-label as decorative (aria-hidden, no role=img)', () => {
    const { container } = render(<IconContained icon="star" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role', 'img');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('treats whitespace-only aria-label as decorative', () => {
    const { container } = render(<IconContained icon="star" aria-label="   " />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role', 'img');
  });
});
