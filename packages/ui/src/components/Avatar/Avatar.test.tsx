/**
 * Avatar.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';
import { getInitials, resolveAvatarSize } from './Avatar.shared';

describe('Avatar', () => {
  // === Variant tests ===

  it('renders image variant with src', () => {
    render(<Avatar content="image" src="https://example.com/photo.jpg" alt="John Doe" />);
    const avatar = screen.getByRole('img', { name: 'John Doe' });
    expect(avatar).toBeInTheDocument();
    const img = avatar.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('forwards data-testid to the root element', () => {
    render(<Avatar content="text" alt="AB" size="m" data-testid="avatar-root" />);
    const el = screen.getByTestId('avatar-root');
    expect(el).toHaveAttribute('role', 'img');
  });

  it('renders text variant with initials', () => {
    render(<Avatar content="text" alt="John Doe" size="xl" />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveTextContent('JD');
  });

  it('renders icon variant with icon prop', () => {
    render(
      <Avatar content="icon" alt="User" icon={<span data-testid="user-icon">U</span>} />
    );
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('renders custom fallback content', () => {
    render(
      <Avatar content="text" alt="John" fallback={<span data-testid="custom">Custom</span>} size="xl" />
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  // === Size tests ===

  it('renders data-size attribute for each size', () => {
    const sizes = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Avatar content="text" alt="JD" size={size} />);
      expect(screen.getByRole('img')).toHaveAttribute('data-size', size);
      unmount();
    }
  });

  it('defaults to size m when no size prop', () => {
    render(<Avatar content="text" alt="JD" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-size', 'm');
  });

  it('renders custom size with inline style', () => {
    render(<Avatar content="text" alt="JD" size="custom" customSize={48} />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('data-size', 'custom');
    expect(avatar.style.getPropertyValue('--Avatar-customSize')).toBe('48px');
  });

  // === Attention tests ===

  it('renders data-attention attribute', () => {
    render(<Avatar content="text" alt="JD" attention="medium" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-attention', 'medium');
  });

  it('applies high attention class', () => {
    render(<Avatar content="text" alt="JD" attention="high" />);
    expect(screen.getByRole('img').className).toContain('high');
  });

  it('applies medium attention class', () => {
    render(<Avatar content="text" alt="JD" attention="medium" />);
    expect(screen.getByRole('img').className).toContain('medium');
  });

  it('applies low attention class', () => {
    render(<Avatar content="text" alt="JD" attention="low" />);
    expect(screen.getByRole('img').className).toContain('low');
  });

  it('defaults to high attention', () => {
    render(<Avatar content="text" alt="JD" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-attention', 'high');
  });

  // === Appearance tests ===

  it('applies appearance class for neutral', () => {
    render(<Avatar content="text" alt="JD" appearance="neutral" />);
    expect(screen.getByRole('img').className).toContain('appearanceNeutral');
  });

  it('applies appearance class for secondary', () => {
    render(<Avatar content="text" alt="JD" appearance="secondary" />);
    expect(screen.getByRole('img').className).toContain('appearanceSecondary');
  });

  it('applies appearance class for sparkle', () => {
    render(<Avatar content="text" alt="JD" appearance="sparkle" />);
    expect(screen.getByRole('img').className).toContain('appearanceSparkle');
  });

  it('applies appearance class for positive', () => {
    render(<Avatar content="text" alt="JD" appearance="positive" />);
    expect(screen.getByRole('img').className).toContain('appearancePositive');
  });

  it('applies appearance class for negative', () => {
    render(<Avatar content="text" alt="JD" appearance="negative" />);
    expect(screen.getByRole('img').className).toContain('appearanceNegative');
  });

  it('applies appearance class for warning', () => {
    render(<Avatar content="text" alt="JD" appearance="warning" />);
    expect(screen.getByRole('img').className).toContain('appearanceWarning');
  });

  it('applies appearance class for informative', () => {
    render(<Avatar content="text" alt="JD" appearance="informative" />);
    expect(screen.getByRole('img').className).toContain('appearanceInformative');
  });

  it('applies appearance class for brand-bg', () => {
    render(<Avatar content="text" alt="JD" appearance="brand-bg" />);
    expect(screen.getByRole('img').className).toContain('appearanceBrandBg');
  });

  it('resolves appearance auto to primary (no extra class)', () => {
    render(<Avatar content="text" alt="JD" appearance="auto" />);
    const avatar = screen.getByRole('img');
    expect(avatar.className).not.toContain('appearanceNeutral');
    expect(avatar.className).not.toContain('appearanceSecondary');
    expect(avatar).toHaveAttribute('data-appearance', 'primary');
  });

  // === Image error fallback ===

  it('shows default person icon when image fails to load', () => {
    render(<Avatar content="image" src="https://invalid.example/broken.jpg" alt="Jane Smith" size="xl" />);
    const avatar = screen.getByRole('img', { name: 'Jane Smith' });
    const img = avatar.querySelector('img');
    fireEvent.error(img!);
    // After error, image is replaced with fallback icon (SVG)
    const svg = avatar.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(avatar.querySelector('img')).toBeNull();
  });

  it('shows custom fallback when image fails', () => {
    render(
      <Avatar
        content="image"
        src="https://invalid.example/broken.jpg"
        alt="User"
        fallback={<span data-testid="fallback-icon">!</span>}
      />
    );
    const avatar = screen.getByRole('img', { name: 'User' });
    const img = avatar.querySelector('img');
    fireEvent.error(img!);
    expect(screen.getByTestId('fallback-icon')).toBeInTheDocument();
  });

  // === Text variant falls back to icon at small sizes ===

  it('text variant at 2xs renders as icon (too small for text)', () => {
    render(<Avatar content="text" alt="John Doe" size="2xs" />);
    const avatar = screen.getByRole('img');
    // Should render icon class, not text class
    const iconSpan = avatar.querySelector('[class*="icon"]');
    const textSpan = avatar.querySelector('[class*="text"]');
    expect(iconSpan).toBeInTheDocument();
    expect(textSpan).toBeNull();
  });

  it('text variant at xs renders as icon (too small for text)', () => {
    render(<Avatar content="text" alt="John Doe" size="xs" />);
    const avatar = screen.getByRole('img');
    const iconSpan = avatar.querySelector('[class*="icon"]');
    expect(iconSpan).toBeInTheDocument();
  });

  // === Disabled state ===

  it('applies disabled class when disabled', () => {
    render(<Avatar content="text" alt="JD" disabled />);
    expect(screen.getByRole('img').className).toContain('disabled');
  });

  it('does not apply disabled class when not disabled', () => {
    render(<Avatar content="text" alt="JD" />);
    expect(screen.getByRole('img').className).not.toContain('disabled');
  });

  // === Ref forwarding ===

  it('forwards ref to the DOM element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} content="text" alt="JD" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });

  // === Accessibility ===

  it('has role="img"', () => {
    render(<Avatar content="text" alt="JD" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has aria-label from alt prop', () => {
    render(<Avatar content="text" alt="John Doe" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'John Doe');
  });

  // === Data attributes ===

  it('renders data-content attribute', () => {
    render(<Avatar content="icon" alt="User" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-content', 'icon');
  });

  it('renders data-appearance attribute', () => {
    render(<Avatar content="text" alt="JD" appearance="neutral" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-appearance', 'neutral');
  });

  // === Custom className and style ===

  it('accepts custom className', () => {
    render(<Avatar content="text" alt="JD" className="custom-class" />);
    expect(screen.getByRole('img').className).toContain('custom-class');
  });

  it('accepts custom style', () => {
    render(<Avatar content="text" alt="JD" style={{ opacity: 0.5 }} />);
    expect(screen.getByRole('img')).toHaveStyle({ opacity: 0.5 });
  });

  // === Image variant with transparent bg ===

  it('image variant has data-showing-image when image loads', () => {
    render(<Avatar content="image" src="https://example.com/photo.jpg" alt="User" />);
    const avatar = screen.getByRole('img', { name: 'User' });
    expect(avatar).toHaveAttribute('data-content', 'image');
    expect(avatar).toHaveAttribute('data-showing-image');
  });

  it('image variant removes data-showing-image when image fails', () => {
    render(<Avatar content="image" src="https://invalid.example/broken.jpg" alt="User" />);
    const avatar = screen.getByRole('img', { name: 'User' });
    expect(avatar).toHaveAttribute('data-showing-image');
    const img = avatar.querySelector('img');
    fireEvent.error(img!);
    expect(avatar).not.toHaveAttribute('data-showing-image');
  });

  it('icon variant renders default person icon when no icon prop', () => {
    render(<Avatar content="icon" alt="User" size="xl" />);
    const avatar = screen.getByRole('img');
    const svg = avatar.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

// === getInitials utility tests ===

describe('getInitials', () => {
  it('extracts two initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('extracts single initial from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('caps at 2 characters for long names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });

  it('uppercases initials', () => {
    expect(getInitials('jane doe')).toBe('JD');
  });

  it('handles single character name', () => {
    expect(getInitials('J')).toBe('J');
  });
});

// === resolveAvatarSize utility tests ===

describe('resolveAvatarSize', () => {
  it('passes through canonical sizes', () => {
    expect(resolveAvatarSize('2xs')).toBe('2xs');
    expect(resolveAvatarSize('m')).toBe('m');
    expect(resolveAvatarSize('2xl')).toBe('2xl');
    expect(resolveAvatarSize('custom')).toBe('custom');
  });
});
