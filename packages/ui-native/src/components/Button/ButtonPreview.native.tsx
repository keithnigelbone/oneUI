/**
 * ButtonPreview.native.tsx
 *
 * Single-source-of-truth preview component for the native Button. Renders
 * a variant × size grid (showAllVariations) or a single-cell preview.
 * Used by the future native sample app and by Storybook stories.
 *
 * Mirrors the web `ButtonPreview` props 1:1 (size labels, variant labels,
 * showCondensed, showFullWidth, etc.) but renders with `<View>` instead
 * of `<table>` and pulls colours from `useSurfaceTokens` instead of CSS
 * variables.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import type { ButtonAppearance, ButtonSize, ButtonVariant } from './interface';
import { Button } from './Button.native';
import { useSurfaceTokens } from '../../theme';

const ATTENTION_LABELS: Record<ButtonVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

const BUTTON_VARIANTS: readonly ButtonVariant[] = ['bold', 'subtle', 'ghost'];

const BUTTON_SIZES: ReadonlyArray<{ size: ButtonSize; label: string }> = [
  { size: 6, label: 'XS' },
  { size: 8, label: 'S' },
  { size: 10, label: 'M' },
  { size: 12, label: 'L' },
];

export interface ButtonPreviewProps {
  /** Currently selected variant — receives a subtle outline. */
  selectedVariant?: ButtonVariant;
  /** Currently selected size — receives a subtle outline. */
  selectedSize?: ButtonSize;
  /** Show a leading icon placeholder (a coloured pill) in every cell. */
  showLeftIcon?: boolean;
  /** Show a trailing icon placeholder in every cell. */
  showRightIcon?: boolean;
  /** When true, render the full 4×3 grid; otherwise render a single cell. */
  showAllVariations?: boolean;
  /** Appearance role applied to every cell. */
  appearance?: ButtonAppearance;
  /** Render every cell in condensed mode. */
  showCondensed?: boolean;
  /** Append a full-width row beneath the grid. */
  showFullWidth?: boolean;
  /** Disabled state on every cell. */
  disabled?: boolean;
  /** Loading state on every cell. */
  loading?: boolean;
  /** Cell-tap callback — `(variant, sizeStr) => void`. */
  onCellSelect?: (variant: ButtonVariant, size: string) => void;
}

/**
 * Tiny placeholder slot — a coloured pill — used until `IconNative`
 * exists. Matches the icon-size token table in `Button.native.tsx`.
 * INTENTIONAL-LITERAL: visual placeholder, not a brand token.
 */
function IconPlaceholder({ color, size }: { color: string; size: number }): React.ReactElement {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.6,
      }}
    />
  );
}

export function ButtonPreview({
  selectedVariant,
  selectedSize,
  showLeftIcon = false,
  showRightIcon = false,
  showAllVariations = true,
  appearance,
  showCondensed = false,
  showFullWidth = false,
  disabled = false,
  loading = false,
  onCellSelect,
}: ButtonPreviewProps): React.ReactElement {
  const role = useSurfaceTokens(appearance ?? 'primary');
  const placeholderColor = role.content.medium;

  if (!showAllVariations) {
    return (
      <View>
        <Button variant={selectedVariant} size={selectedSize} appearance={appearance} disabled={disabled} loading={loading}>
          Button
        </Button>
      </View>
    );
  }

  const renderCell = (variant: ButtonVariant, size: ButtonSize): React.ReactElement => {
    const sizeStr = String(size);
    const isSelected = selectedVariant === variant && (selectedSize == null || String(selectedSize) === sizeStr);
    return (
      <View
        key={`${variant}-${sizeStr}`}
        style={{
          padding: tokens.spacing['3-5'],
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? role.surfaces.bold : 'transparent',
          borderRadius: tokens.shape['1'],
        }}
        onTouchEnd={onCellSelect ? () => onCellSelect(variant, sizeStr) : undefined}
      >
        <Button
          variant={variant}
          size={size}
          appearance={appearance}
          condensed={showCondensed}
          disabled={disabled}
          loading={loading}
          start={showLeftIcon ? <IconPlaceholder color={placeholderColor} size={tokens.spacing['4']} /> : undefined}
          end={showRightIcon ? <IconPlaceholder color={placeholderColor} size={tokens.spacing['4']} /> : undefined}
        >
          Button
        </Button>
      </View>
    );
  };

  return (
    <View style={{ padding: tokens.spacing['4'] }}>
      {/* Column header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacing['3-5'] }}>
        <View style={{ width: 60 }} />
        {BUTTON_SIZES.map(({ size, label }) => (
          <Text
            key={String(size)}
            style={{
              flex: 1,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium as '500',
              color: role.content.low,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Variant rows */}
      {BUTTON_VARIANTS.map((variant) => (
        <View key={variant} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacing['3-5'] }}>
          <Text
            style={{
              width: 60,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium as '500',
              color: role.content.low,
            }}
          >
            {ATTENTION_LABELS[variant]}
          </Text>
          {BUTTON_SIZES.map(({ size }) => (
            <View key={String(size)} style={{ flex: 1, alignItems: 'center' }}>
              {renderCell(variant, size)}
            </View>
          ))}
        </View>
      ))}

      {/* Optional fullWidth row */}
      {showFullWidth &&
        BUTTON_VARIANTS.map((variant) => (
          <View key={`${variant}-full`} style={{ marginTop: tokens.spacing['4'] }}>
            <Text
              style={{
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium as '500',
                color: role.content.low,
                marginBottom: tokens.spacing['2'],
              }}
            >
              {ATTENTION_LABELS[variant]} · fullWidth
            </Text>
            <Button variant={variant} size={10} appearance={appearance} fullWidth disabled={disabled} loading={loading}>
              Button
            </Button>
          </View>
        ))}
    </View>
  );
}
