/**
 * IconButton.test.tsx
 * Comprehensive unit and accessibility tests for IconButton component
 */

import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './IconButton';

/** Helper: check if element's className contains a substring (CSS Modules-safe) */
function expectClassContains(element: HTMLElement, substring: string) {
  expect(element.className).toMatch(new RegExp(substring));
}

/** Helper: check if element's className does NOT contain a substring */
function expectClassNotContains(element: HTMLElement, substring: string) {
  expect(element.className).not.toMatch(new RegExp(substring));
}

// Inline test icon element
const TestIcon = <svg data-testid="test-icon" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>;

describe('IconButton', () => {
  // ========================================
  // RENDERING
  // ========================================

  describe('rendering', () => {
    it('renders with a React element icon', () => {
      render(<IconButton icon={TestIcon} aria-label="Add item" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with semantic icon name', () => {
      render(<IconButton icon="add" aria-label="Add item" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<IconButton icon={TestIcon} aria-label="Add item" />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Add item');
    });

    it('applies semantic icon fallback when aria-label is omitted', () => {
      // @ts-expect-error — runtime guard for consumers omitting required aria-label
      render(<IconButton icon="star" />);
      expect(screen.getByRole('button', { name: 'Star' })).toBeInTheDocument();
    });

    it('applies generic fallback when aria-label and semantic icon are unavailable', () => {
      // @ts-expect-error — runtime guard for custom icon without aria-label
      render(<IconButton icon={TestIcon} />);
      expect(screen.getByRole('button', { name: 'Icon button' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('applies data-testid', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" data-testid="icon-btn" />);
      expect(screen.getByTestId('icon-btn')).toBeInTheDocument();
    });

    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<IconButton ref={ref} icon={TestIcon} aria-label="Add" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });

  // ========================================
  // ATTENTION / VARIANTS
  // ========================================

  describe('attention/variants', () => {
    it('maps attention=high to bold variant', () => {
      render(<IconButton icon={TestIcon} attention="high" aria-label="High" />);
      expectClassContains(screen.getByRole('button'), 'bold');
    });

    it('maps attention=medium to subtle variant', () => {
      render(<IconButton icon={TestIcon} attention="medium" aria-label="Medium" />);
      expectClassContains(screen.getByRole('button'), 'subtle');
    });

    it('maps attention=low to ghost variant', () => {
      render(<IconButton icon={TestIcon} attention="low" aria-label="Low" />);
      expectClassContains(screen.getByRole('button'), 'ghost');
    });

    it('defaults to bold variant when attention is not set', () => {
      render(<IconButton icon={TestIcon} aria-label="Default" />);
      expectClassContains(screen.getByRole('button'), 'bold');
    });

    it.each([
      ['high', 'bold'],
      ['medium', 'subtle'],
      ['low', 'ghost'],
    ] as const)(
      'attention="%s" renders %s variant correctly',
      (attention, variant) => {
        render(<IconButton icon={TestIcon} aria-label="Test" attention={attention} />);
        expectClassContains(screen.getByRole('button'), variant);
      },
    );
  });

  // ========================================
  // SIZES
  // ========================================

  describe('sizes', () => {
    it.each([
      [4, '4'],
      [6, '6'],
      [8, '8'],
      [10, '10'],
      [12, '12'],
      [14, '14'],
    ] as const)('numeric size %i renders data-size="%s"', (size, expected) => {
      render(<IconButton icon={TestIcon} aria-label="Test" size={size} />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', expected);
    });

    it('defaults to size 10 when no size prop', () => {
      render(<IconButton icon={TestIcon} aria-label="Default" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
    });

    it.each([
      ['2xs', '4'],
      ['xs', '6'],
      ['s', '8'],
      ['m', '10'],
      ['l', '12'],
      ['xl', '14'],
    ] as const)('t-shirt alias "%s" resolves to data-size="%s"', (alias, expected) => {
      render(<IconButton icon={TestIcon} aria-label="Test" size={alias} />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', expected);
    });

    it('legacy alias "small" resolves to size 8', () => {
      render(<IconButton icon={TestIcon} aria-label="Test" size="small" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', '8');
    });

    it('legacy alias "medium" resolves to size 10', () => {
      render(<IconButton icon={TestIcon} aria-label="Test" size="medium" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', '10');
    });

    it('legacy alias "large" resolves to size 12', () => {
      render(<IconButton icon={TestIcon} aria-label="Test" size="large" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
    });
  });

  // ========================================
  // APPEARANCES
  // ========================================

  describe('appearances', () => {
    it.each([
      ['neutral', 'appearanceNeutral'],
      ['secondary', 'appearanceSecondary'],
      ['sparkle', 'appearanceSparkle'],
      ['brand-bg', 'appearanceBrandBg'],
      ['positive', 'appearancePositive'],
      ['negative', 'appearanceNegative'],
      ['warning', 'appearanceWarning'],
      ['informative', 'appearanceInformative'],
    ] as const)('appearance="%s" applies %s class', (role, expectedClass) => {
      render(<IconButton icon={TestIcon} appearance={role} aria-label="Test" />);
      expectClassContains(screen.getByRole('button'), expectedClass);
    });

    it('primary appearance does not add extra appearance class', () => {
      render(<IconButton icon={TestIcon} appearance="primary" aria-label="Primary" />);
      const button = screen.getByRole('button');
      expectClassNotContains(button, 'appearanceNeutral');
      expectClassNotContains(button, 'appearanceSecondary');
      expectClassNotContains(button, 'appearanceSparkle');
    });

    it('appearance=auto resolves to primary (no extra class)', () => {
      render(<IconButton icon={TestIcon} appearance="auto" aria-label="Auto" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-appearance', 'primary');
      expectClassNotContains(button, 'appearanceNeutral');
    });
  });

  // ========================================
  // CONTAINED
  // ========================================

  describe('contained', () => {
    it('defaults data-contained to "true"', () => {
      render(<IconButton icon={TestIcon} aria-label="Default" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'true');
    });

    it('sets data-contained="false" when contained=false', () => {
      render(<IconButton icon={TestIcon} aria-label="Icon only" contained={false} />);
      expect(screen.getByRole('button')).toHaveAttribute('data-contained', 'false');
    });

    it('renders data-attention from resolved variant', () => {
      render(<IconButton icon={TestIcon} attention="medium" aria-label="Medium" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-attention', 'medium');
    });

    it('does not set data-condensed when contained=false even if condensed=true', () => {
      render(<IconButton icon={TestIcon} aria-label="Uncontained" contained={false} condensed />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
    });

    it('does not apply fullWidth class when contained=false', () => {
      render(<IconButton icon={TestIcon} aria-label="Uncontained" contained={false} fullWidth />);
      expectClassNotContains(screen.getByRole('button'), 'fullWidth');
    });

    it('does not set data-layout when contained=false even if layout is 3:2', () => {
      render(<IconButton icon={TestIcon} aria-label="Uncontained" contained={false} layout="3:2" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-layout');
    });
  });

  // ========================================
  // CONDENSED
  // ========================================

  describe('condensed', () => {
    it('renders data-condensed attribute when condensed=true', () => {
      render(<IconButton icon={TestIcon} condensed aria-label="Condensed" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-condensed', '');
    });

    it('does not render data-condensed when condensed is false/undefined', () => {
      render(<IconButton icon={TestIcon} aria-label="Normal" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-condensed');
    });

    it('condensed works with all 6 sizes', () => {
      const sizes = ['2xs', 'xs', 's', 'm', 'l', 'xl'] as const;
      for (const size of sizes) {
        const { unmount } = render(<IconButton icon={TestIcon} size={size} condensed aria-label={size} />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('data-condensed', '');
        expect(button).toHaveAttribute('data-size');
        unmount();
      }
    });
  });

  // ========================================
  // LAYOUT
  // ========================================

  describe('layout', () => {
    it('renders data-layout="3:2" when layout is 3:2', () => {
      render(<IconButton icon={TestIcon} layout="3:2" aria-label="Wide" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-layout', '3:2');
    });

    it('does not render data-layout when layout is 1:1 (default)', () => {
      render(<IconButton icon={TestIcon} layout="1:1" aria-label="Square" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-layout');
    });

    it('does not render data-layout when layout is omitted', () => {
      render(<IconButton icon={TestIcon} aria-label="Default" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-layout');
    });
  });

  // ========================================
  // FULL WIDTH
  // ========================================

  describe('fullWidth', () => {
    it('applies fullWidth class when fullWidth=true', () => {
      render(<IconButton icon={TestIcon} fullWidth aria-label="Full Width" />);
      expectClassContains(screen.getByRole('button'), 'fullWidth');
    });

    it('does not apply fullWidth class when omitted', () => {
      render(<IconButton icon={TestIcon} aria-label="Default" />);
      expectClassNotContains(screen.getByRole('button'), 'fullWidth');
    });
  });

  // ========================================
  // STATES
  // ========================================

  describe('states', () => {
    it('handles disabled state — button is disabled', () => {
      render(<IconButton icon={TestIcon} disabled aria-label="Disabled" />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('handles disabled state — applies disabled class', () => {
      render(<IconButton icon={TestIcon} disabled aria-label="Disabled" />);
      expectClassContains(screen.getByRole('button'), 'disabled');
    });

    it('handles loading state — aria-busy is true', () => {
      render(<IconButton icon={TestIcon} loading aria-label="Loading" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('handles loading state — button is disabled', () => {
      render(<IconButton icon={TestIcon} loading aria-label="Loading" />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('handles loading state — spinner SVG is present', () => {
      render(<IconButton icon={TestIcon} loading aria-label="Loading" />);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg circle');
      expect(spinner).toBeInTheDocument();
    });

    it('renders icon when not loading', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('hides icon when loading (shows spinner instead)', () => {
      render(<IconButton icon={TestIcon} loading aria-label="Loading" />);
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // INTERACTIONS
  // ========================================

  describe('interactions', () => {
    it('calls onPress when clicked', () => {
      const onPress = vi.fn();
      render(<IconButton icon={TestIcon} aria-label="Add" onPress={onPress} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = vi.fn();
      render(<IconButton icon={TestIcon} aria-label="Add" disabled onPress={onPress} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = vi.fn();
      render(<IconButton icon={TestIcon} aria-label="Add" loading onPress={onPress} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('onClick alias works as onPress', () => {
      const onClick = vi.fn();
      render(<IconButton icon={TestIcon} aria-label="Add" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('onPress takes precedence over onClick', () => {
      const onPress = vi.fn();
      const onClick = vi.fn();
      render(<IconButton icon={TestIcon} aria-label="Add" onPress={onPress} onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // ACCESSIBILITY
  // ========================================

  describe('accessibility', () => {
    it('is focusable', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has correct role', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('announces disabled state', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" disabled />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('announces loading state', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" loading />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('icon content is hidden from screen readers', () => {
      render(<IconButton icon={TestIcon} aria-label="Add" />);
      const button = screen.getByRole('button');
      const iconWrapper = button.querySelector('[aria-hidden="true"]');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  // ========================================
  // DATA ATTRIBUTES
  // ========================================

  describe('data attributes', () => {
    it('renders data-variant attribute derived from attention', () => {
      render(<IconButton icon={TestIcon} attention="medium" aria-label="Subtle" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle');
    });

    it('renders data-appearance attribute', () => {
      render(<IconButton icon={TestIcon} appearance="neutral" aria-label="Neutral" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-appearance', 'neutral');
    });

    it('renders data-size attribute', () => {
      render(<IconButton icon={TestIcon} size={12} aria-label="Large" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', '12');
    });

    it('renders data-loading when loading', () => {
      render(<IconButton icon={TestIcon} loading aria-label="Loading" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-loading', '');
    });

    it('does not render data-loading when not loading', () => {
      render(<IconButton icon={TestIcon} aria-label="Normal" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-loading');
    });

    it('renders data-condensed when condensed', () => {
      render(<IconButton icon={TestIcon} condensed aria-label="Condensed" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-condensed', '');
    });

    it('renders data-layout="3:2" when layout is 3:2', () => {
      render(<IconButton icon={TestIcon} layout="3:2" aria-label="Wide" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-layout', '3:2');
    });
  });
});
