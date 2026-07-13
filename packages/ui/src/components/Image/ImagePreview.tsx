/**
 * ImagePreview.tsx
 *
 * Self-contained preview component for the Image.
 * Shows various configurations: aspect ratios, interactive, disabled, fallback.
 * Used by both the docs page and the token editor.
 */

'use client';

import React from 'react';
import { Image } from './Image';
import { Surface } from '../Surface';

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';

export interface ImagePreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
}

export function ImagePreview({ tokens }: ImagePreviewProps) {
  return (
    <div style={{ ...tokens, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }} data-draggable="false">
      {/* Default surface */}
      <Surface mode="default" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
        <span style={{
          fontSize: 'var(--Typography-Size-2XS)',
          fontWeight: 'var(--Typography-Weight-Medium)',
          color: 'var(--Text-Low)',
          display: 'block',
          marginBottom: 'var(--Spacing-3-5)',
        }}>
          Default Surface
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="1:1" width={80} />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>1:1</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="16:9" width={120} />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>16:9</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="4:3" width={100} />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>4:3</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src={SAMPLE_IMAGE} alt="Interactive" aspectRatio="1:1" width={80} interactive onPress={() => {}} />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>Interactive</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src={SAMPLE_IMAGE} alt="Disabled" aspectRatio="1:1" width={80} disabled />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>Disabled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <Image src="https://invalid.example/broken.jpg" alt="Fallback" aspectRatio="1:1" width={80} />
            <span style={{ fontSize: 'var(--Typography-Size-2XS)', color: 'var(--Text-Low)' }}>Fallback</span>
          </div>
        </div>
      </Surface>

      {/* Bold surface */}
      <Surface mode="bold" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
        <span style={{
          fontSize: 'var(--Typography-Size-2XS)',
          fontWeight: 'var(--Typography-Weight-Medium)',
          color: 'inherit',
          display: 'block',
          marginBottom: 'var(--Spacing-3-5)',
        }}>
          Bold Surface
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="1:1" width={80} />
          <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="16:9" width={120} />
          <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="4:3" width={100} />
        </div>
      </Surface>
    </div>
  );
}

export default ImagePreview;
