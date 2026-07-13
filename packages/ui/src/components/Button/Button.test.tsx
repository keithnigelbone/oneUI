/**
 * Button.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DecorationConfig } from '@oneui/shared';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Button } from './Button';
import styles from './Button.module.css';
import { DecorationProvider } from '../../hooks/useDecorationContext';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEST_DECORATION: DecorationConfig = {
  componentName: 'Button',
  svgContent: '<svg viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg"><style>.outline{fill:none;stroke:currentColor;stroke-width:2}</style><path class="outline" fill="none" stroke="currentColor" stroke-width="2" style="fill:none;stroke:currentColor;stroke-width:2" d="M0 0 L10 0 L10 20 L0 20 Z" /></svg>',
  aspectRatio: 0.5,
  mirror: true,
  placement: 'edges',
};

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('marks the element for scoped brand component overrides', () => {
    render(<Button>Scoped Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-oneui-component', 'Button');
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<Button onPress={handlePress}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('accepts attention prop', () => {
    render(<Button attention="medium">Medium Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('leaves default appearance unpinned so brand component themes can choose the role', () => {
    const { rerender } = render(<Button>Default Button</Button>);
    expect(screen.getByRole('button')).not.toHaveClass(styles.appearancePrimary);

    rerender(<Button appearance="primary">Primary Button</Button>);
    expect(screen.getByRole('button')).toHaveClass(styles.appearancePrimary);
  });

  // === Size tests (f-step system) ===

  it('renders data-size with numeric f-step value', () => {
    render(<Button size={12}>Large Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  it('resolves t-shirt alias to numeric size', () => {
    render(<Button size="s">Small Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
  });

  it('resolves legacy "small" to numeric size 8', () => {
    render(<Button size="small">Small Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
  });

  it('resolves legacy "medium" to numeric size 10', () => {
    render(<Button size="medium">Medium Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('resolves legacy "large" to numeric size 12', () => {
    render(<Button size="large">Large Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  it('defaults to size 10 when no size prop', () => {
    render(<Button>Default Size</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
  });

  it('renders all four Figma sizes', () => {
    const sizes = [6, 8, 10, 12] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>Size {size}</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', String(size));
      unmount();
    }
  });

  it('warns and falls back for deprecated numeric size 14', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Button size={14}>Deprecated</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('size={14} is deprecated'));
    warnSpy.mockRestore();
  });

  // === Condensed mode tests ===

  it('renders data-condensed attribute when condensed prop is true', () => {
    render(<Button condensed>Condensed</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-condensed', '');
  });

  it('does not render data-condensed when condensed is false', () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
  });

  it('condensed prop works with all three sizes', () => {
    const sizes = ['s', 'm', 'l'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size} condensed>{size}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-condensed', '');
      expect(button).toHaveAttribute('data-size');
      unmount();
    }
  });

  // === Slot tests (start/end) ===

  it('renders start slot content', () => {
    render(<Button start={<span data-testid="start-icon">★</span>}>With Start</Button>);
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders end slot content', () => {
    render(<Button end={<span data-testid="end-icon">→</span>}>With End</Button>);
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders both start and end slots', () => {
    render(
      <Button
        start={<span data-testid="start">←</span>}
        end={<span data-testid="end">→</span>}
      >
        Both Slots
      </Button>
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('start/end slots accept any ReactNode', () => {
    render(
      <Button start={<div data-testid="custom-node" style={{ width: 24, height: 24 }} />}>
        Custom Node
      </Button>
    );
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  // === Backward compat: leftIcon/rightIcon still work ===

  it('renders leftIcon via start slot (backward compat)', () => {
    render(<Button leftIcon="arrowLeft">Back</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Back');
  });

  it('renders rightIcon via end slot (backward compat)', () => {
    render(<Button rightIcon="arrowRight">Next</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Next');
  });

  it('start prop takes precedence over leftIcon', () => {
    render(
      <Button
        start={<span data-testid="start-slot">★</span>}
        leftIcon="arrowLeft"
      >
        Precedence
      </Button>
    );
    expect(screen.getByTestId('start-slot')).toBeInTheDocument();
  });

  // === Ghost border tests ===

  it('ghost variant renders without border by default', () => {
    render(<Button attention="low">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('ghost');
    // The CSS sets --_btn-bw to 0px by default for ghost
  });

  it('ghost variant opts out of CSS-only decoration stroke and clipping', () => {
    const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
    const ghostBlock = css.match(/\.ghost\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';

    expect(ghostBlock).toContain('--Button-cssDecorationInsetStrokeWidth-active: var(--Spacing-0);');
    expect(ghostBlock).toContain('--Button-cssDecorationUnderlineWidth-active: var(--Spacing-0);');
    expect(ghostBlock).toContain('--Button-cssDecorationClipPath: none;');
    expect(ghostBlock).not.toContain('--Button-cssDecorationInsetStrokeWidth-ghost');
    expect(ghostBlock).not.toContain('--Button-cssDecorationUnderlineWidth-ghost');
  });

  it('start/end slots publish --Icon-color: currentColor so nested Icons track label colour', () => {
    const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
    expect(css).toMatch(/\.start\s*\{[\s\S]*?--Icon-color:\s*currentColor/);
    expect(css).toMatch(/\.end\s*\{[\s\S]*?--Icon-color:\s*currentColor/);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<Button appearance="neutral">Neutral</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<Button appearance="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceSecondary');
  });

  it('applies appearance class for sparkle', () => {
    render(<Button appearance="sparkle">Sparkle</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('appearanceSparkle');
  });

  it('resolves appearance auto to primary at page root (no extra class)', () => {
    render(<Button appearance="auto">Auto</Button>);
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('appearanceNeutral');
    expect(button.className).not.toContain('appearanceSecondary');
    expect(button.className).not.toContain('appearanceSparkle');
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('fullWidth');
  });

  // === Attention alias tests ===

  it('maps attention alias to variant (high → bold)', () => {
    render(<Button attention="high">High Attention</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bold');
  });

  it('maps attention alias to variant (medium → subtle)', () => {
    render(<Button attention="medium">Medium Attention</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('subtle');
  });

  it('maps attention alias to variant (low → ghost)', () => {
    render(<Button attention="low">Low Attention</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('ghost');
  });

  // === forwardRef tests ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  // === Data attribute tests ===

  it('renders data-variant attribute', () => {
    render(<Button attention="medium">Subtle</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
  });

  it('renders data-appearance attribute', () => {
    render(<Button appearance="neutral">Neutral</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'neutral');
  });

  it('renders data-loading when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', '');
  });

  it('does not render data-loading when not loading', () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-loading');
  });

  // === Spinner tests ===

  it('renders spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('svg circle');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render spinner when not loading', () => {
    render(<Button>Normal</Button>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('svg circle');
    expect(spinner).toBeNull();
  });

  it('keeps label visible when loading', () => {
    render(<Button loading>Still Here</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Still Here');
  });

  // === Decoration tests ===

  it('does not render ornament DOM without decoration', () => {
    render(<Button>Plain</Button>);
    const button = screen.getByRole('button');

    expect(button).not.toHaveAttribute('data-has-decoration');
    expect(button.querySelector('[data-ornament]')).toBeNull();
  });

  it('renders left and right ornaments when decoration is provided', () => {
    render(<Button decoration={TEST_DECORATION}>Decorated</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('data-has-decoration', '');
    expect(button.querySelectorAll('[data-ornament]')).toHaveLength(2);
    expect(button.querySelector('[data-ornament="left"]')).toBeInTheDocument();
    expect(button.querySelector('[data-ornament="right"]')).toBeInTheDocument();
    expect(button.querySelectorAll('[data-ornament-fill]')).toHaveLength(2);
    expect(button.querySelector('[data-ornament-fill]')).not.toHaveAttribute('stroke');
    expect(button.querySelector('[data-ornament-fill]')).not.toHaveAttribute('class');
    expect(button.querySelector('[data-ornament-fill]')).toHaveStyle({
      fill: 'transparent',
      stroke: 'none',
    });
    expect(button.querySelector('[data-gradient-layer]')).toBeInTheDocument();
  });

  it('allows decoration null to opt out when context provides Button decoration', () => {
    const decorations = new Map<string, DecorationConfig>([['Button', TEST_DECORATION]]);

    render(
      <DecorationProvider decorations={decorations}>
        <Button decoration={null}>Opt out</Button>
      </DecorationProvider>
    );
    const button = screen.getByRole('button');

    expect(button).not.toHaveAttribute('data-has-decoration');
    expect(button.querySelector('[data-ornament]')).toBeNull();
    expect(button.style.getPropertyValue('--Button-ornament-width-left')).toBe('var(--Spacing-0)');
  });

  it('wires ornament height scale into emitted ornament width vars', () => {
    render(<Button decoration={TEST_DECORATION}>Scaled</Button>);
    const button = screen.getByRole('button');

    expect(button.style.getPropertyValue('--Button-ornament-width-left')).toContain(
      'var(--Button-ornamentHeightScale, 1)',
    );
    expect(button.style.getPropertyValue('--Button-ornament-width-right')).toContain(
      'var(--Button-ornamentHeightScale, 1)',
    );
  });

  // === Contained prop (Figma variant) — delegation to LinkButton ===

  it('renders the contained form by default', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    // Contained form emits Button-specific data-variant / data-size and is
    // NOT marked as uncontained underlined via data-underline.
    expect(button).toHaveAttribute('data-variant');
    expect(button).toHaveAttribute('data-size');
    expect(button).not.toHaveAttribute('data-underline');
  });

  it('delegates to LinkButton when contained={false}', () => {
    // LinkButton shares the `button` role and data-variant/data-size, but
    // is emitted with data-underline="none" from Button's delegation path
    // to match the Figma spec (underline transparent by default).
    render(<Button contained={false}>Uncontained</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-underline', 'none');
    expect(button).toHaveTextContent('Uncontained');
  });

  it('LinkButton does NOT emit data-underline by default (only Button sets it)', async () => {
    const { LinkButton } = await import('../LinkButton/LinkButton');
    render(<LinkButton>Link</LinkButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-underline');
  });

  it('contained={false} drops condensed / fullWidth from the rendered element', () => {
    render(
      <Button
        contained={false}
        condensed
        fullWidth
      >
        Uncontained
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('data-condensed');
    // fullWidth is a class toggle, not a data attr, but the LinkButton
    // output class list should not include Button's fullWidth class.
    expect(button.className).not.toMatch(/fullWidth/);
  });

  it('contained={false} forwards size correctly (including XS f6)', () => {
    const { rerender } = render(<Button contained={false} size="xs">XS</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '6');
    rerender(<Button contained={false} size="l">L</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
  });

  it('contained={false} still fires onPress', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<Button contained={false} onPress={handlePress}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });
});
