/**
 * Image.test.tsx
 * Unit and accessibility tests
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Image } from './Image';
import { parseAspectRatio } from './Image.shared';

describe('Image', () => {
  // === Basic rendering ===

  it('renders with src and alt', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Test photo" />);
    const root = screen.getByRole('img', { name: 'Test photo' });
    expect(root).toBeInTheDocument();
    const img = root.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    // Inner img uses alt="" + role="presentation" (same pattern as Avatar)
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('role', 'presentation');
  });

  // === Aspect ratio ===

  it('applies correct data-aspect-ratio for 1:1', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Square" aspectRatio="1:1" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-aspect-ratio', '1:1');
  });

  it('applies correct data-aspect-ratio for 16:9', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Wide" aspectRatio="16:9" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-aspect-ratio', '16:9');
  });

  it('does not set data-aspect-ratio for auto', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Auto" aspectRatio="auto" />);
    expect(screen.getByRole('img')).not.toHaveAttribute('data-aspect-ratio');
  });

  it('does not set data-aspect-ratio when no aspectRatio prop', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Default" />);
    expect(screen.getByRole('img')).not.toHaveAttribute('data-aspect-ratio');
  });

  // === Non-interactive rendering ===

  it('renders as div when not interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Static" />);
    const root = screen.getByRole('img');
    expect(root.tagName).toBe('DIV');
  });

  it('has role="img" when not interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Static" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  // === Interactive rendering ===

  it('renders as button when interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('has type="button" when interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onPress when interactive and clicked', async () => {
    const onPress = vi.fn();
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive onPress={onPress} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when interactive and clicked', async () => {
    const onClick = vi.fn();
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive onClick={onClick} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keyboard activation with Enter when interactive', async () => {
    const onPress = vi.fn();
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive onPress={onPress} />);
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalled();
  });

  it('keyboard activation with Space when interactive', async () => {
    const onPress = vi.fn();
    render(<Image src="https://example.com/photo.jpg" alt="Clickable" interactive onPress={onPress} />);
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalled();
  });

  it('uses aria-label prop when interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" interactive aria-label="Open gallery" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open gallery');
  });

  it('falls back to alt for aria-label when interactive', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" interactive />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Photo');
  });

  // === Disabled state ===

  it('applies disabled class when disabled', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Disabled" disabled />);
    expect(screen.getByRole('img').className).toContain('disabled');
  });

  it('does not apply disabled class when not disabled', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Normal" />);
    expect(screen.getByRole('img').className).not.toContain('disabled');
  });

  it('interactive + disabled renders as disabled button', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Disabled gallery"
        interactive
        disabled
      />,
    );
    const button = screen.getByRole('button', { name: 'Disabled gallery' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('does not call onPress when interactive and disabled', async () => {
    const onPress = vi.fn();
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Disabled"
        interactive
        disabled
        onPress={onPress}
      />,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies disabled class on interactive button when disabled', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Disabled"
        interactive
        disabled
      />,
    );
    expect(screen.getByRole('button').className).toContain('disabled');
  });

  // === Error / fallback ===

  it('shows default fallback icon when image fails to load', () => {
    render(<Image src="https://invalid.example/broken.jpg" alt="Broken" />);
    const root = screen.getByRole('img');
    const img = root.querySelector('img');
    fireEvent.error(img!);
    const svg = root.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(root.querySelector('img')).toBeNull();
  });

  it('shows custom fallback when image fails to load', () => {
    render(
      <Image
        src="https://invalid.example/broken.jpg"
        alt="Broken"
        fallback={<span data-testid="custom-fallback">No image</span>}
      />
    );
    const root = screen.getByRole('img');
    const img = root.querySelector('img');
    fireEvent.error(img!);
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });

  // === Callbacks ===

  it('calls onLoad when image loads', () => {
    const onLoad = vi.fn();
    render(<Image src="https://example.com/photo.jpg" alt="Photo" onLoad={onLoad} />);
    const img = screen.getByRole('img').querySelector('img');
    fireEvent.load(img!);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError when image fails', () => {
    const onError = vi.fn();
    render(<Image src="https://invalid.example/broken.jpg" alt="Broken" onError={onError} />);
    const img = screen.getByRole('img').querySelector('img');
    fireEvent.error(img!);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  // === Ref forwarding ===

  it('forwards ref to the DOM element (non-interactive)', () => {
    const ref = createRef<HTMLElement>();
    render(<Image ref={ref} src="https://example.com/photo.jpg" alt="Photo" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards ref to the DOM element (interactive)', () => {
    const ref = createRef<HTMLElement>();
    render(<Image ref={ref} src="https://example.com/photo.jpg" alt="Photo" interactive />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  // === Custom className and style ===

  it('accepts custom className', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" className="custom-class" />);
    expect(screen.getByRole('img').className).toContain('custom-class');
  });

  it('accepts custom style', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" style={{ opacity: 0.5 }} />);
    expect(screen.getByRole('img')).toHaveStyle({ opacity: 0.5 });
  });

  // === Width and height ===

  it('applies numeric width as px', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" width={200} />);
    expect(screen.getByRole('img')).toHaveStyle({ width: '200px' });
  });

  it('applies string width directly', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" width="50%" />);
    expect(screen.getByRole('img')).toHaveStyle({ width: '50%' });
  });

  // === Loading attribute ===

  it('defaults to lazy loading', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" />);
    const img = screen.getByRole('img').querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('supports eager loading', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" loading="eager" />);
    const img = screen.getByRole('img').querySelector('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('omits loading attribute when loading is auto', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" loading="auto" />);
    const img = screen.getByRole('img').querySelector('img');
    expect(img).not.toHaveAttribute('loading');
  });

  it('passes srcSet and sizes to img', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        srcSet="https://example.com/photo-400.jpg 400w"
        sizes="(max-width: 600px) 400px, 800px"
      />
    );
    const img = screen.getByRole('img').querySelector('img');
    expect(img).toHaveAttribute('srcSet', 'https://example.com/photo-400.jpg 400w');
    expect(img).toHaveAttribute('sizes', '(max-width: 600px) 400px, 800px');
  });

  it('passes crossOrigin and decoding to img', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        crossOrigin="anonymous"
        decoding="async"
      />
    );
    const img = screen.getByRole('img').querySelector('img');
    expect(img).toHaveAttribute('crossorigin', 'anonymous');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('uses fit over objectFit when both are set', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        fit="contain"
        objectFit="fill"
      />
    );
    expect(screen.getByRole('img')).toHaveStyle({ '--Image-objectFit': 'contain' } as Record<string, string>);
  });

  it('shows fallbackSrc image when primary fails and no custom fallback', () => {
    render(
      <Image
        src="https://invalid.example/broken.jpg"
        alt="Broken"
        fallbackSrc="https://example.com/fallback.jpg"
      />
    );
    const root = screen.getByRole('img');
    const primary = root.querySelector('img');
    fireEvent.error(primary!);
    const imgs = root.querySelectorAll('img');
    expect(imgs.length).toBe(1);
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/fallback.jpg');
    expect(imgs[0]?.className).toContain('fallbackImg');
  });

  it('sets data-oneui-lottie when lottieAttributes is non-empty', () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        lottieAttributes={{ loop: true, speed: 1.2 }}
      />
    );
    const root = screen.getByRole('img');
    expect(root).toHaveAttribute('data-oneui-lottie', '{"loop":true,"speed":1.2}');
  });

  it('forwards testID as data-testid on root', () => {
    render(<Image src="https://example.com/photo.jpg" alt="Photo" testID="hero-image" />);
    expect(screen.getByTestId('hero-image')).toBeInTheDocument();
  });
});

// === parseAspectRatio utility tests ===

describe('parseAspectRatio', () => {
  it('returns undefined for auto', () => {
    expect(parseAspectRatio('auto')).toBeUndefined();
  });

  it('parses 16:9 to CSS value', () => {
    expect(parseAspectRatio('16:9')).toBe('16 / 9');
  });

  it('parses 1:1 to CSS value', () => {
    expect(parseAspectRatio('1:1')).toBe('1 / 1');
  });

  it('parses 9:16 to CSS value', () => {
    expect(parseAspectRatio('9:16')).toBe('9 / 16');
  });

  it('parses 4:3 to CSS value', () => {
    expect(parseAspectRatio('4:3')).toBe('4 / 3');
  });

  it('parses 3:4 to CSS value', () => {
    expect(parseAspectRatio('3:4')).toBe('3 / 4');
  });

  it('parses 2:3 to CSS value', () => {
    expect(parseAspectRatio('2:3')).toBe('2 / 3');
  });

  it('parses 3:2 to CSS value', () => {
    expect(parseAspectRatio('3:2')).toBe('3 / 2');
  });

  it('parses 1:2 to CSS value', () => {
    expect(parseAspectRatio('1:2')).toBe('1 / 2');
  });

  it('parses 9:21 to CSS value', () => {
    expect(parseAspectRatio('9:21')).toBe('9 / 21');
  });

  it('parses 21:9 to CSS value', () => {
    expect(parseAspectRatio('21:9')).toBe('21 / 9');
  });

  it('parses 2:1 to CSS value', () => {
    expect(parseAspectRatio('2:1')).toBe('2 / 1');
  });
});
