/**
 * FAB.test.tsx
 * Unit tests for FAB component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAB } from './FAB';

/** Helper: check if element's className contains a substring (CSS Modules-safe) */
function expectClassContains(element: HTMLElement, substring: string) {
  expect(element.className).toMatch(new RegExp(substring));
}

describe('FAB', () => {
  describe('rendering', () => {
    it('renders with icon', () => {
      render(<FAB icon="add" aria-label="Add item" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<FAB icon="add" aria-label="Add item" />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Add item');
    });

    it('applies custom className', () => {
      render(<FAB icon="add" aria-label="Add" className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('applies data-testid', () => {
      render(<FAB icon="add" aria-label="Add" data-testid="fab-btn" />);
      expect(screen.getByTestId('fab-btn')).toBeInTheDocument();
    });
  });

  describe('extended mode', () => {
    it('renders label when provided', () => {
      render(<FAB icon="add" label="Create new" />);
      expect(screen.getByText('Create new')).toBeInTheDocument();
    });

    it('uses label as accessible name when no aria-label', () => {
      render(<FAB icon="add" label="Create new" />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Create new');
    });

    it('prefers aria-label over label for accessible name', () => {
      render(<FAB icon="add" label="Create" aria-label="Create new item" />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Create new item');
    });

    it('applies extended class when label is provided', () => {
      render(<FAB icon="add" label="Create" />);
      expectClassContains(screen.getByRole('button'), 'extended');
    });
  });

  describe('variants', () => {
    it.each(['primary', 'secondary', 'surface'] as const)(
      'renders %s variant correctly',
      (variant) => {
        render(<FAB icon="add" aria-label="Add" variant={variant} />);
        expectClassContains(screen.getByRole('button'), variant);
      }
    );

    it('defaults to primary variant', () => {
      render(<FAB icon="add" aria-label="Add" />);
      expectClassContains(screen.getByRole('button'), 'primary');
    });
  });

  describe('sizes', () => {
    it.each(['small', 'medium', 'large'] as const)(
      'renders %s size correctly',
      (size) => {
        render(<FAB icon="add" aria-label="Add" size={size} />);
        expectClassContains(screen.getByRole('button'), size);
      }
    );

    it('defaults to medium size', () => {
      render(<FAB icon="add" aria-label="Add" />);
      expectClassContains(screen.getByRole('button'), 'medium');
    });
  });

  describe('positions', () => {
    it.each(['bottom-right', 'bottom-left', 'bottom-center'] as const)(
      'renders %s position correctly',
      (position) => {
        render(<FAB icon="add" aria-label="Add" position={position} />);
        // Position class may be hyphenated or camelCased by CSS Modules
        const className = screen.getByRole('button').className;
        expect(className).toMatch(new RegExp(position.replace('-', '[-_]?')));
      }
    );

    it('defaults to bottom-right position', () => {
      render(<FAB icon="add" aria-label="Add" />);
      const className = screen.getByRole('button').className;
      expect(className).toMatch(/bottom[-_]?right/i);
    });
  });

  describe('states', () => {
    it('handles disabled state', () => {
      render(<FAB icon="add" aria-label="Add" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expectClassContains(button, 'disabled');
    });

    it('handles loading state', () => {
      render(<FAB icon="add" aria-label="Add" loading />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expectClassContains(button, 'loading');
    });

    it('is disabled when loading', () => {
      render(<FAB icon="add" aria-label="Add" loading />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows spinner when loading', () => {
      const { container } = render(<FAB icon="add" aria-label="Add" loading />);
      const spinner = container.querySelector('[class*="spinner"]');
      expect(spinner).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onPress when clicked', () => {
      const onPress = vi.fn();
      render(<FAB icon="add" aria-label="Add" onPress={onPress} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = vi.fn();
      render(<FAB icon="add" aria-label="Add" disabled onPress={onPress} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('is focusable', () => {
      render(<FAB icon="add" aria-label="Add" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has correct role', () => {
      render(<FAB icon="add" aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('announces disabled state', () => {
      render(<FAB icon="add" aria-label="Add" disabled />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('announces loading state', () => {
      render(<FAB icon="add" aria-label="Add" loading />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });
});
