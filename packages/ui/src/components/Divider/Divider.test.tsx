/**
 * Divider.test.tsx
 * Unit tests for Divider component
 */

import type { CSSProperties } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from './Divider';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import { DIVIDER_ICON_SIZE, DIVIDER_TEXT_SIZE } from './Divider.shared';

describe('Divider', () => {
  it('renders with default props as a separator', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
  });

  it('sets horizontal orientation by default', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.orientation).toBe('horizontal');
  });

  it('sets vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.orientation).toBe('vertical');
  });

  it('sets size data attribute', () => {
    render(<Divider size="l" />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.size).toBe('l');
  });

  it('defaults size to m', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.size).toBe('m');
  });

  it('sets attention data attribute', () => {
    render(<Divider attention="high" />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.attention).toBe('high');
  });

  it('defaults attention to low', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator.dataset.attention).toBe('low');
  });

  it('renders bare separator without children', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('data-content', 'none');
    expect(separator.className).not.toMatch(/withContent/);
  });

  it('renders icon child from children', () => {
    render(
      <Divider attention="medium">
        <Icon icon="check" aria-hidden />
      </Divider>,
    );
    expect(screen.getByTestId('divider-child-icon')).toBeInTheDocument();
  });

  it('maps divider attention to icon emphasis and Figma icon size', () => {
    const { container } = render(
      <Divider attention="medium">
        <Icon icon="star" aria-hidden />
      </Divider>,
    );
    const iconRoot = container.querySelector('[data-emphasis]');
    expect(iconRoot).toHaveAttribute('data-size', DIVIDER_ICON_SIZE);
    expect(iconRoot).toHaveAttribute('data-emphasis', 'medium');
  });

  it('renders explicit <Text /> child', () => {
    render(
      <Divider attention="medium">
        <Text variant="label" size="S" weight="medium" text="OR" />
      </Divider>,
    );
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('defaults Text to Label XS when size is omitted', () => {
    render(
      <Divider attention="low">
        <Text text="Label" />
      </Divider>,
    );
    expect(screen.getByText('Label')).toBeInTheDocument();
    const textRoot = screen.getByText('Label').closest('[data-size]');
    expect(textRoot).toHaveAttribute('data-size', DIVIDER_TEXT_SIZE);
  });

  it('wraps a plain string child in a Label XS Medium Text', () => {
    render(<Divider attention="medium">Section</Divider>);
    const textRoot = screen.getByText('Section').closest('[data-size]');
    expect(textRoot).toHaveAttribute('data-size', DIVIDER_TEXT_SIZE);
    expect(textRoot).toHaveAttribute('data-variant', 'label');
  });

  it('renders with-content layout when children is a string', () => {
    render(<Divider>Section</Divider>);
    const separator = screen.getByRole('separator');
    expect(separator.className).toMatch(/withContent/);
  });

  it('does not render with-content layout when children is empty', () => {
    render(<Divider>{''}</Divider>);
    const separator = screen.getByRole('separator');
    expect(separator.className).not.toMatch(/withContent/);
  });

  it('rejects unsupported children and renders bare separator', () => {
    render(
      <Divider>
        <span data-testid="invalid">Nope</span>
      </Divider>,
    );
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('data-content', 'none');
    expect(screen.queryByTestId('invalid')).not.toBeInTheDocument();
  });

  it('writes data-content for icon and text children', () => {
    const { rerender } = render(
      <Divider>
        <Icon icon="star" aria-hidden />
      </Divider>,
    );
    expect(screen.getByRole('separator')).toHaveAttribute('data-content', 'icon');
    rerender(<Divider>Section</Divider>);
    expect(screen.getByRole('separator')).toHaveAttribute('data-content', 'text');
    rerender(<Divider />);
    expect(screen.getByRole('separator')).toHaveAttribute('data-content', 'none');
  });

  it('has aria-orientation when content divider is vertical', () => {
    render(
      <Divider orientation="vertical">
        <Text variant="label" size="S" weight="medium" text="Label" />
      </Divider>,
    );
    const separator = screen.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('applies custom className', () => {
    render(<Divider className="custom-class" />);
    const separator = screen.getByRole('separator');
    expect(separator.classList.contains('custom-class')).toBe(true);
  });

  it('applies inline style', () => {
    render(<Divider style={{ opacity: 0.5 } as CSSProperties} />);
    const separator = screen.getByRole('separator');
    expect(separator.style.opacity).toBe('0.5');
  });

  it('forwards data-testid to simple root separator', () => {
    render(<Divider data-testid="divider-root" />);
    expect(screen.getByTestId('divider-root')).toBeInTheDocument();
  });

  it('forwards data-testid to content divider root', () => {
    render(
      <Divider data-testid="divider-with-text">
        <Text variant="label" size="S" weight="medium" text="Text" />
      </Divider>,
    );
    expect(screen.getByTestId('divider-with-text')).toBeInTheDocument();
  });
});
