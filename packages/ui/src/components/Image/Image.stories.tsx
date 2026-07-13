/**
 * Image.stories.tsx
 * Storybook documentation for Image component
 *
 * Stories: Default, AspectRatios, ObjectFitModes, States, WithFallback,
 * Interactive, Responsive, CornerRadius, WebHtmlAttributes
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Image } from './Image';
import type { ImageObjectFit } from './Image.shared';
import React from 'react';

const ASPECT_RATIO_OPTIONS = [
  'auto',
  '1:1',
  '1:2',
  '2:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '9:21',
  '21:9',
] as const;

const OBJECT_FIT_OPTIONS = [
  'cover',
  'contain',
  'fill',
  'none',
  'scale-down',
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
] as const;

/** Shared label style (role tokens) */
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
};

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';
const PORTRAIT_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';

const meta = {
  title: 'Components/Media/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Images display visual content with optional aspect ratio presets (including tall 9:21 and wide 21:9), full CSS object-fit vocabulary on the inner `<img>`, responsive `srcSet` / `sizes`, and optional interactive mode. Web-only: `crossOrigin`, `decoding`, `draggable`, `lottieAttributes` (`data-oneui-lottie`), `fallbackSrc`, and `fit` (alias for `objectFit`).',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: [...ASPECT_RATIO_OPTIONS],
      description: 'Aspect ratio preset',
      table: { defaultValue: { summary: 'auto' } },
    },
    fit: {
      control: 'select',
      options: [...OBJECT_FIT_OPTIONS],
      description: 'Figma alias for object-fit — wins over `objectFit` when both are set',
    },
    interactive: {
      control: 'boolean',
      description: 'When true: state layer overlay + focus ring + clickable',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — reduces opacity',
      table: { defaultValue: { summary: 'false' } },
    },
    objectFit: {
      control: 'select',
      options: [...OBJECT_FIT_OPTIONS],
      description: 'CSS object-fit for the inner image (via `--Image-objectFit`)',
      table: { defaultValue: { summary: 'cover' } },
    },
    objectPosition: {
      control: 'text',
      description: 'CSS object-position',
      table: { defaultValue: { summary: 'center' } },
    },
    loading: {
      control: 'select',
      options: ['auto', 'lazy', 'eager'],
      description: 'Native lazy loading; `auto` omits the HTML `loading` attribute',
      table: { defaultValue: { summary: 'lazy' } },
    },
    srcSet: {
      control: 'text',
      description: 'HTML `srcSet` for responsive images',
    },
    sizes: {
      control: 'text',
      description: 'HTML `sizes` hint paired with `srcSet`',
    },
    crossOrigin: {
      control: 'select',
      options: ['anonymous', 'use-credentials'],
      description: 'CORS mode for the image request',
    },
    decoding: {
      control: 'select',
      options: ['auto', 'sync', 'async'],
      description: 'Decode hint for the browser',
    },
    draggable: {
      control: 'boolean',
      description: 'Native drag behaviour on the inner `<img>`',
    },
    lottieAttributes: {
      control: false,
      description: 'Optional bag serialized to `data-oneui-lottie` JSON on the root',
    },
    fallbackSrc: {
      control: 'text',
      description: 'Fallback image URL when `src` fails (after `fallback` React node)',
    },
    fallback: {
      control: false,
      description: 'Custom React node on load error — wins over `fallbackSrc`',
    },
    testID: {
      control: 'text',
      description: 'Forwarded as `data-testid` on the root',
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// 1. Default
// ============================================================================
export const Default: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Mountain landscape',
    aspectRatio: '16:9',
    width: 320,
  },
};

// ============================================================================
// 2. Aspect Ratios — all presets side by side
// ============================================================================
export const AspectRatios = {
  name: 'Aspect Ratios',
  render: () => {
    const ratios = [...ASPECT_RATIO_OPTIONS];
    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {ratios.map((ratio) => (
          <div key={ratio} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image
              src={SAMPLE_IMAGE}
              alt={`${ratio} ratio`}
              aspectRatio={ratio}
              width={ratio === 'auto' ? 120 : ratio === '9:21' ? 72 : ratio === '21:9' ? 160 : 100}
              height={ratio === 'auto' ? 80 : undefined}
            />
            <span style={labelStyle}>{ratio}</span>
          </div>
        ))}
      </div>
    );
  },
} as unknown as Story;

// ============================================================================
// 3. Object Fit Modes — baseline + extended CSS keywords
// ============================================================================
export const ObjectFitModes = {
  name: 'Object Fit Modes',
  render: () => {
    const baseline = ['cover', 'contain', 'fill', 'none'] as const;
    const extended = ['scale-down', 'inherit', 'initial', 'revert', 'revert-layer', 'unset'] as const;
    const cell = (fit: ImageObjectFit) => (
      <div key={fit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <div style={{ border: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
          <Image src={PORTRAIT_IMAGE} alt={`${fit} mode`} aspectRatio="1:1" width={150} objectFit={fit} />
        </div>
        <span style={labelStyle}>{fit}</span>
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <div>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>Common</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>{baseline.map(cell)}</div>
        </div>
        <div>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>Extended keywords</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>{extended.map(cell)}</div>
        </div>
      </div>
    );
  },
} as unknown as Story;

// ============================================================================
// 4. States — Default, interactive, disabled, error/fallback
// ============================================================================
export const States = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src={SAMPLE_IMAGE} alt="Default" aspectRatio="1:1" width={120} />
        <span style={labelStyle}>Default</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src={SAMPLE_IMAGE} alt="Interactive" aspectRatio="1:1" width={120} interactive onPress={() => {}} />
        <span style={labelStyle}>Interactive</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src={SAMPLE_IMAGE} alt="Disabled" aspectRatio="1:1" width={120} disabled />
        <span style={labelStyle}>Disabled</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src="https://invalid.example/broken.jpg" alt="Error fallback" aspectRatio="1:1" width={120} />
        <span style={labelStyle}>Default icon</span>
      </div>
    </div>
  ),
} as unknown as Story;

// ============================================================================
// 5. With Fallback — valid, default icon, custom React fallback, fallbackSrc
// ============================================================================
export const WithFallback = {
  name: 'With Fallback',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src={SAMPLE_IMAGE} alt="Valid image" aspectRatio="16:9" width={200} />
        <span style={labelStyle}>Valid Image</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image src="https://invalid.example/broken.jpg" alt="Default fallback" aspectRatio="16:9" width={200} />
        <span style={labelStyle}>Default icon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image
          src="https://invalid.example/broken.jpg"
          alt="Custom fallback"
          aspectRatio="16:9"
          width={200}
          fallback={
            <span
              style={{
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Body-S-FontSize)',
                lineHeight: 'var(--Body-S-LineHeight)',
                fontWeight: 'var(--Body-FontWeight-Low)',
                color: 'var(--Text-Low)',
              }}
            >
              No image
            </span>
          }
        />
        <span style={labelStyle}>Custom fallback</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <Image
          src="https://invalid.example/broken.jpg"
          alt="URL fallback"
          aspectRatio="16:9"
          width={200}
          fallbackSrc={SAMPLE_IMAGE}
        />
        <span style={labelStyle}>fallbackSrc</span>
      </div>
    </div>
  ),
} as unknown as Story;

// ============================================================================
// 6. Interactive — play function: focus, click, Enter/Space
// ============================================================================
export const Interactive: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Clickable image',
    aspectRatio: '16:9',
    width: 320,
    interactive: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Clickable image');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.click(button);
  },
};

// ============================================================================
// 7. Responsive — different container widths
// ============================================================================
export const Responsive = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {[
        { width: '100%', label: 'Full width' },
        { width: '75%', label: '75%' },
        { width: '50%', label: '50%' },
      ].map(({ width, label }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={labelStyle}>{label}</span>
          <Image src={SAMPLE_IMAGE} alt={`${label} image`} aspectRatio="16:9" width={width} />
        </div>
      ))}
    </div>
  ),
} as unknown as Story;

// ============================================================================
// 8. Corner Radius — Shape token scale applied to images
// ============================================================================
export const CornerRadius = {
  name: 'Corner Radius',
  render: () => {
    const shapes = [
      { token: 'Shape-0-5', label: '1 · 6XS' },
      { token: 'Shape-1', label: '2 · 5XS' },
      { token: 'Shape-1-5', label: '3 · 4XS' },
      { token: 'Shape-2', label: '4 · 3XS' },
      { token: 'Shape-3', label: '6 · XS' },
      { token: 'Shape-3-5', label: '7 · S' },
      { token: 'Shape-4', label: '8 · M' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <div>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>1:1</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {shapes.map(({ token, label }) => (
              <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
                <Image
                  src={SAMPLE_IMAGE}
                  alt={label}
                  aspectRatio="1:1"
                  width={120}
                  style={{ '--Image-borderRadius': `var(--${token})` } as React.CSSProperties}
                />
                <span style={labelStyle}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>16:9</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {shapes.map(({ token, label }) => (
              <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
                <Image
                  src={SAMPLE_IMAGE}
                  alt={label}
                  aspectRatio="16:9"
                  width={180}
                  style={{ '--Image-borderRadius': `var(--${token})` } as React.CSSProperties}
                />
                <span style={labelStyle}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>4:3</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {shapes.map(({ token, label }) => (
              <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
                <Image
                  src={SAMPLE_IMAGE}
                  alt={label}
                  aspectRatio="4:3"
                  width={160}
                  style={{ '--Image-borderRadius': `var(--${token})` } as React.CSSProperties}
                />
                <span style={labelStyle}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
} as unknown as Story;

// ============================================================================
// 9. Web HTML attributes — srcSet/sizes, loading, fit vs objectFit, lottie payload
// ============================================================================
export const WebHtmlAttributes = {
  name: 'Web HTML attributes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', maxWidth: 'var(--Spacing-40)' }}>
      <div>
        <span style={{ ...labelStyle, display: 'block', marginBottom: 'var(--Spacing-3)' }}>srcSet + sizes (narrow vs wide candidate)</span>
        <Image
          src={`${SAMPLE_IMAGE.split('?')[0]}?w=320&h=180&fit=crop`}
          alt="Responsive mountain"
          aspectRatio="16:9"
          width="100%"
          srcSet={`${SAMPLE_IMAGE.split('?')[0]}?w=320&h=180&fit=crop 320w, ${SAMPLE_IMAGE.split('?')[0]}?w=640&h=360&fit=crop 640w`}
          sizes="(max-width: 600px) 90vw, 400px"
        />
      </div>
      <div style={{ display: 'flex', gap: 'var(--Spacing-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Image src={SAMPLE_IMAGE} alt="loading lazy" aspectRatio="16:9" width={200} loading="lazy" />
          <span style={labelStyle}>loading=&quot;lazy&quot;</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Image src={SAMPLE_IMAGE} alt="loading auto" aspectRatio="16:9" width={200} loading="auto" />
          <span style={labelStyle}>loading=&quot;auto&quot; (attr omitted)</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--Spacing-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Image
            src={PORTRAIT_IMAGE}
            alt="fit wins"
            aspectRatio="1:1"
            width={120}
            fit="contain"
            objectFit="fill"
          />
          <span style={labelStyle}>fit=contain overrides objectFit=fill</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Image
            src={SAMPLE_IMAGE}
            alt="with lottie payload"
            aspectRatio="16:9"
            width={220}
            lottieAttributes={{ host: 'storybook', variant: 'demo' }}
          />
          <span style={labelStyle}>data-oneui-lottie on root</span>
        </div>
      </div>
    </div>
  ),
} as unknown as Story;
