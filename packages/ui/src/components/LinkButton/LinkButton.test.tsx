/**
 * LinkButton.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  // === Basic rendering ===

  it('renders with children', () => {
    render(<LinkButton>Test LinkButton</LinkButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Test LinkButton');
  });

  it('renders as a <button> element (not an <a>)', () => {
    render(<LinkButton>Link Action</LinkButton>);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<LinkButton onPress={handlePress}>Click me</LinkButton>);

    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('calls onClick when clicked (web alias)', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<LinkButton onClick={handleClick}>Click me</LinkButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('prefers onPress over onClick', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    const handleClick = vi.fn();
    render(<LinkButton onPress={handlePress} onClick={handleClick}>Click me</LinkButton>);

    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
    expect(handleClick).not.toHaveBeenCalled();
  });

  // === Attention / Variant tests ===

  it('maps attention alias to variant (high -> bold)', () => {
    render(<LinkButton attention="high">High Attention</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bold');
  });

  it('maps attention alias to variant (medium -> subtle)', () => {
    render(<LinkButton attention="medium">Medium Attention</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('subtle');
  });

  it('maps attention alias to variant (low -> ghost)', () => {
    render(<LinkButton attention="low">Low Attention</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('ghost');
  });

  it('defaults to bold variant when no attention', () => {
    render(<LinkButton>Default Variant</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bold');
  });

  it('maps attention medium to subtle variant', () => {
    render(<LinkButton attention="medium">Subtle</LinkButton>);
    expect(screen.getByRole('button').className).toContain('subtle');
  });

  // === Size tests ===

  it('renders data-size with numeric f-step value', () => {
    render(<LinkButton size={12}>Large</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  it('resolves t-shirt alias to numeric size', () => {
    render(<LinkButton size="s">Small</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
  });

  it('resolves legacy "small" to numeric size 8', () => {
    render(<LinkButton size="small">Small</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
  });

  it('resolves legacy "medium" to numeric size 10', () => {
    render(<LinkButton size="medium">Medium</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('resolves legacy "large" to numeric size 12', () => {
    render(<LinkButton size="large">Large</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  it('defaults to size 10 when no size prop', () => {
    render(<LinkButton>Default Size</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('renders all three Figma sizes', () => {
    const sizes = [8, 10, 12] as const;
    for (const size of sizes) {
      const { unmount } = render(<LinkButton size={size}>Size {size}</LinkButton>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', String(size));
      unmount();
    }
  });

  it('falls back to size 10 for invalid numeric size', () => {
    // @ts-expect-error — testing runtime fallback for invalid size
    render(<LinkButton size={99}>Invalid</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<LinkButton appearance="neutral">Neutral</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<LinkButton appearance="secondary">Secondary</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceSecondary');
  });

  it('applies appearance class for sparkle', () => {
    render(<LinkButton appearance="sparkle">Sparkle</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceSparkle');
  });

  it('applies appearance class for positive', () => {
    render(<LinkButton appearance="positive">Positive</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearancePositive');
  });

  it('applies appearance class for negative', () => {
    render(<LinkButton appearance="negative">Negative</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceNegative');
  });

  it('applies appearance class for warning', () => {
    render(<LinkButton appearance="warning">Warning</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceWarning');
  });

  it('applies appearance class for informative', () => {
    render(<LinkButton appearance="informative">Informative</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceInformative');
  });

  it('resolves appearance auto to primary (no extra class)', () => {
    render(<LinkButton appearance="auto">Auto</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('appearanceNeutral');
    expect(button.className).not.toContain('appearanceSecondary');
    expect(button.className).not.toContain('appearanceSparkle');
  });

  it('resolves undefined appearance to primary (no extra class)', () => {
    render(<LinkButton>Default Appearance</LinkButton>);
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('appearanceNeutral');
    expect(button.className).not.toContain('appearanceSecondary');
  });

  // === State tests ===

  it('is disabled when disabled prop is true', () => {
    render(<LinkButton disabled>Disabled</LinkButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies disabled class when disabled', () => {
    render(<LinkButton disabled>Disabled</LinkButton>);
    expect(screen.getByRole('button').className).toContain('disabled');
  });

  it('is disabled when loading', () => {
    render(<LinkButton loading>Loading</LinkButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<LinkButton onPress={handlePress} disabled>Disabled</LinkButton>);

    await user.click(screen.getByRole('button'));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('shows loading state via aria-busy', () => {
    render(<LinkButton loading>Loading</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies loading class when loading', () => {
    render(<LinkButton loading>Loading</LinkButton>);
    expect(screen.getByRole('button').className).toContain('loading');
  });

  // === Slot tests (start/end) ===

  it('renders start slot content', () => {
    render(<LinkButton start={<span data-testid="start-icon">*</span>}>With Start</LinkButton>);
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders end slot content', () => {
    render(<LinkButton end={<span data-testid="end-icon">{'>'}</span>}>With End</LinkButton>);
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders both start and end slots', () => {
    render(
      <LinkButton
        start={<span data-testid="start">*</span>}
        end={<span data-testid="end">{'>'}</span>}
      >
        Both Slots
      </LinkButton>
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('start/end slots accept any ReactNode', () => {
    render(
      <LinkButton start={<div data-testid="custom-node" />}>
        Custom Node
      </LinkButton>
    );
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  // === Spinner tests ===

  it('renders spinner when loading', () => {
    render(<LinkButton loading>Loading</LinkButton>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('svg circle');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render spinner when not loading', () => {
    render(<LinkButton>Normal</LinkButton>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('svg circle');
    expect(spinner).toBeNull();
  });

  it('keeps label visible when loading', () => {
    render(<LinkButton loading>Still Here</LinkButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Still Here');
  });

  // === Data attribute tests ===

  it('renders data-variant attribute', () => {
    render(<LinkButton attention="medium">Subtle</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
  });

  it('renders data-appearance attribute', () => {
    render(<LinkButton appearance="neutral">Neutral</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'neutral');
  });

  it('renders data-loading when loading', () => {
    render(<LinkButton loading>Loading</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', '');
  });

  it('does not render data-loading when not loading', () => {
    render(<LinkButton>Normal</LinkButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-loading');
  });

  it('renders data-size attribute', () => {
    render(<LinkButton size="l">Large</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  // === Accessibility ===

  it('supports aria-label', () => {
    render(<LinkButton aria-label="Learn more about pricing">Learn more</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Learn more about pricing');
  });

  it('renders aria-disabled when disabled', () => {
    render(<LinkButton disabled>Disabled</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  // === forwardRef ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLElement>();
    render(<LinkButton ref={ref}>Ref Button</LinkButton>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  // === HTML type attribute ===

  it('supports type="submit"', () => {
    render(<LinkButton type="submit">Submit</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('supports type="reset"', () => {
    render(<LinkButton type="reset">Reset</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  // === className / style passthrough ===

  it('accepts custom className', () => {
    render(<LinkButton className="custom-class">Custom</LinkButton>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });

  it('accepts inline style', () => {
    render(<LinkButton style={{ opacity: 0.5 }}>Styled</LinkButton>);
    expect(screen.getByRole('button')).toHaveStyle({ opacity: 0.5 });
  });

  // === showUnderline — underline visibility contract ===

  it('does NOT emit data-underline by default (showUnderline defaults to true)', () => {
    render(<LinkButton>Default</LinkButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-underline');
  });

  it('does NOT emit data-underline when showUnderline is explicitly true', () => {
    render(<LinkButton showUnderline>Explicit true</LinkButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-underline');
  });

  it('emits data-underline="none" when showUnderline={false}', () => {
    render(<LinkButton showUnderline={false}>Hidden underline</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-underline', 'none');
  });
});
