/**
 * Text.showcase.tsx
 *
 * Shared variant displays for Text. Imported by Storybook and the
 * platform documentation page so both stay in sync.
 */

import React from 'react';
import { Text } from './Text';
import {
  TEXT_APPEARANCES,
  TEXT_ATTENTIONS,
  TEXT_VARIANTS,
  BODY_VALID_ORDER,
  type TextAppearance,
  type TextVariant,
} from './Text.shared';

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Body-XS-FontSize)',
  lineHeight: 'var(--Body-XS-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  fontFamily: 'var(--Typography-Font-Text)',
  color: 'var(--Text-Low)',
  margin: 0,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--Spacing-4-5)',
  paddingBlock: 'var(--Spacing-3)',
};

const colStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
};

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
};

/**
 * Variants — every typography role at its default size.
 */
export function TextVariants() {
  const samples: Record<TextVariant, string> = {
    display: 'Display headline copy',
    headline: 'Headline section title',
    title: 'Title for a card',
    body: 'Body paragraph copy that wraps across multiple lines and reads comfortably.',
    label: 'Label / caption',
    code: 'const example = true;',
  };
  return (
    <div style={stackStyle}>
      {TEXT_VARIANTS.map((variant) => (
        <div key={variant} style={rowStyle}>
          <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>{variant}</span>
          <Text variant={variant} as={variant === 'code' ? 'code' : 'span'}>
            {samples[variant]}
          </Text>
        </div>
      ))}
    </div>
  );
}

/**
 * Sizes — Body variant across every allowed size plus invalid 3XS (clamped in dev).
 */
export function TextSizes() {
  return (
    <div style={stackStyle}>
      {BODY_VALID_ORDER.map((size) => (
        <div key={size} style={rowStyle}>
          <span style={{ ...labelStyle, minWidth: 'var(--Spacing-9)' }}>{size}</span>
          <Text variant="body" size={size}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </div>
      ))}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-9)' }}>3XS (invalid → 2XS)</span>
        {/* Intentional invalid size — runtime clamp + dev warning */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Text variant="body" size={'3XS' as any}>
          The quick brown fox jumps over the lazy dog
        </Text>
      </div>
    </div>
  );
}

/**
 * Attention × Weight — body M across every attention level, three weights.
 */
export function TextAttentionAndWeight() {
  return (
    <div style={stackStyle}>
      {TEXT_ATTENTIONS.map((attention) => (
        <div key={attention} style={rowStyle}>
          <span style={{ ...labelStyle, minWidth: 'var(--Spacing-10)' }}>{attention}</span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)' }}>
            <Text variant="body" attention={attention} weight="high">
              High weight
            </Text>
            <Text variant="body" attention={attention} weight="medium">
              Medium weight
            </Text>
            <Text variant="body" attention={attention} weight="low">
              Low weight
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Appearances — all roles at attention=high and tintedA11y.
 */
export function TextAppearances() {
  return (
    <div style={stackStyle}>
      {(['high', 'tintedA11y'] as const).map((attention) => (
        <div key={attention} style={colStyle}>
          <span style={labelStyle}>attention = {attention}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4-5)' }}>
            {TEXT_APPEARANCES.map((appearance: Exclude<TextAppearance, 'auto'>) => (
              <div
                key={appearance}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-2)',
                  alignItems: 'flex-start',
                }}
              >
                <Text variant="title" size="M" appearance={appearance} attention={attention}>
                  {appearance}
                </Text>
                <span style={{ ...labelStyle, fontSize: 'var(--Body-2XS-FontSize)' }}>
                  {appearance}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Decorations — italic, underline, strikethrough, combined.
 */
export function TextDecorations() {
  return (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>plain</span>
        <Text>The quick brown fox</Text>
      </div>
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>italic</span>
        <Text italic>The quick brown fox</Text>
      </div>
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>underline</span>
        <Text underline>The quick brown fox</Text>
      </div>
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>strikethrough</span>
        <Text strikethrough>The quick brown fox</Text>
      </div>
      <div style={rowStyle}>
        <span style={{ ...labelStyle, minWidth: 'var(--Spacing-12)' }}>combined</span>
        <Text italic underline strikethrough>
          The quick brown fox
        </Text>
      </div>
    </div>
  );
}
