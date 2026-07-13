/**
 * Link.test.tsx
 * Unit tests for Link component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Link } from './Link';

/** Helper: check if element's className contains a substring (CSS Modules-safe) */
function expectClassContains(element: HTMLElement, substring: string) {
  expect(element.className).toMatch(new RegExp(substring));
}

describe('Link', () => {
  describe('rendering', () => {
    it('renders with href', () => {
      render(<Link href="/test">Test Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders children', () => {
      render(<Link href="#">Click me</Link>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Link href="#" className="custom-class">
          Link
        </Link>
      );
      expect(screen.getByRole('link')).toHaveClass('custom-class');
    });

    it('applies data-testid', () => {
      render(
        <Link href="#" data-testid="test-link">
          Link
        </Link>
      );
      expect(screen.getByTestId('test-link')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it.each(['default', 'subtle', 'bold'] as const)(
      'renders %s variant correctly',
      (variant) => {
        render(
          <Link href="#" variant={variant}>
            Link
          </Link>
        );
        expectClassContains(screen.getByRole('link'), variant);
      }
    );

    it('defaults to default variant', () => {
      render(<Link href="#">Link</Link>);
      expectClassContains(screen.getByRole('link'), 'default');
    });
  });

  describe('sizes', () => {
    it.each(['small', 'medium', 'large'] as const)(
      'renders %s size correctly',
      (size) => {
        render(
          <Link href="#" size={size}>
            Link
          </Link>
        );
        expectClassContains(screen.getByRole('link'), size);
      }
    );

    it('defaults to medium size', () => {
      render(<Link href="#">Link</Link>);
      expectClassContains(screen.getByRole('link'), 'medium');
    });
  });

  describe('external links', () => {
    it('adds target="_blank" for external links', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('adds rel="noopener noreferrer" for external links', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    });

    it('does not add target/rel for internal links', () => {
      render(<Link href="/internal">Internal</Link>);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });
  });

  describe('states', () => {
    it('handles disabled state', () => {
      render(
        <Link href="#" disabled>
          Disabled
        </Link>
      );
      // Disabled link loses href → no longer role="link", query by text
      const el = screen.getByText('Disabled').closest('a')!;
      expectClassContains(el, 'disabled');
      expect(el).toHaveAttribute('aria-disabled', 'true');
    });

    it('removes href when disabled', () => {
      render(
        <Link href="/test" disabled>
          Disabled
        </Link>
      );
      const el = screen.getByText('Disabled').closest('a')!;
      expect(el).not.toHaveAttribute('href');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(
        <Link href="#" onClick={onClick}>
          Link
        </Link>
      );
      fireEvent.click(screen.getByRole('link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <Link href="#" disabled onClick={onClick}>
          Link
        </Link>
      );
      const el = screen.getByText('Link').closest('a')!;
      fireEvent.click(el);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('icons', () => {
    it('renders left icon', () => {
      const { container } = render(
        <Link href="#" leftIcon="arrowLeft">
          Back
        </Link>
      );
      // CSS Modules mangles class names, check for partial match
      const iconEl = container.querySelector('[class*="leftIcon"], [class*="left"]');
      expect(iconEl || container.querySelector('svg')).toBeTruthy();
    });

    it('renders right icon', () => {
      const { container } = render(
        <Link href="#" rightIcon="arrowRight">
          Next
        </Link>
      );
      const iconEl = container.querySelector('[class*="rightIcon"], [class*="right"]');
      expect(iconEl || container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('is focusable', () => {
      render(<Link href="#">Link</Link>);
      const link = screen.getByRole('link');
      link.focus();
      expect(link).toHaveFocus();
    });

    it('has correct role', () => {
      render(<Link href="#">Link</Link>);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('announces disabled state', () => {
      render(
        <Link href="#" disabled>
          Disabled
        </Link>
      );
      const el = screen.getByText('Disabled').closest('a')!;
      expect(el).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
