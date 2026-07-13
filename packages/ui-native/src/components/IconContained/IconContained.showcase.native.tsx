/**
 * IconContained.showcase.native.tsx
 *
 * RN mirror of `IconContained.showcase.tsx` and the story matrix in
 * `IconContained.stories.tsx`:
 *
 *   - AttentionLevels  (high, medium)
 *   - Sizes            (xs … xl × both attentions)
 *   - States           (enabled / disabled × both attentions)
 *   - WithIcons        (multiple inline SVG glyphs)
 *   - Appearances      (9 roles × 2 attentions)
 *   - SurfaceContext   (default + minimal/subtle/moderate/bold/elevated)
 *   - Themes           (default / minimal / subtle / elevated)
 *
 * The glyphs below are inline RN SVGs implemented as `IconComponent`s
 * (accept `size`, `color` props) — `<IconContained>` passes them through
 * the design-system `<Icon>`, which derives colour from `appearance` and
 * the surrounding `<Surface>` context.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens, typography } from '@oneui/tokens';
import {
  COMPONENT_APPEARANCE_ROLES,
  type IconComponent,
  type IconComponentProps,
} from '@oneui/shared';
import { Surface, useSurfaceTokens } from '../../theme';
import { IconContained } from './IconContained.native';
import type { IconContainedSize } from './interface';

// ─── Layout helpers ─────────────────────────────────────────────────────────

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const labeledItem: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing['3'],
};

const rowLabel: StyleProp<ViewStyle> = {
  minWidth: tokens.spacing['8'],
};

const themeCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.m,
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

// ─── Inline SVG glyphs as IconComponents ────────────────────────────────────
// These accept `size` + `color` directly so the design-system `<Icon>`
// (rendered internally by `<IconContained icon={…} />`) can pass the
// appearance-resolved on-colour into them. No context coupling.

const HeartIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path
      fill={color as string}
      d='M12 21s-7.5-4.534-9.5-10A5.5 5.5 0 0 1 12 7a5.5 5.5 0 0 1 9.5 4C19.5 16.466 12 21 12 21Z'
    />
  </Svg>
);

const StarIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path
      fill={color as string}
      d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
    />
  </Svg>
);

const CheckIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path fill={color as string} d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
  </Svg>
);

const HomeIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path fill={color as string} d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' />
  </Svg>
);

const SIZES: readonly IconContainedSize[] = ['xs', 's', 'm', 'l', 'xl'];
const SIZE_LABELS: Record<IconContainedSize, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

const DEFAULT_APPEARANCE_ROLES = COMPONENT_APPEARANCE_ROLES.filter(
  (r) => r !== 'sparkle' && r !== 'brand-bg',
);

// ─── Showcase exports ───────────────────────────────────────────────────────

export function IconContainedDefault(): React.ReactElement {
  return (
    <View style={column}>
      <IconContained icon={HeartIcon} aria-label='Heart' />
    </View>
  );
}

export function IconContainedAttentionLevels(): React.ReactElement {
  return (
    <View style={row}>
      {(['high', 'medium'] as const).map((attention) => (
        <View key={attention} style={labeledItem}>
          <IconContained icon={HeartIcon} attention={attention} aria-label={attention} />
          <Label>{attention}</Label>
        </View>
      ))}
    </View>
  );
}

export function IconContainedSizes(): React.ReactElement {
  return (
    <View style={column}>
      {(['high', 'medium'] as const).map((attention) => (
        <View
          key={attention}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
          }}
        >
          <View style={rowLabel}>
            <Label>{attention}</Label>
          </View>
          <View style={row}>
            {SIZES.map((size) => (
              <View key={size} style={labeledItem}>
                <IconContained
                  icon={HomeIcon}
                  attention={attention}
                  size={size}
                  aria-label={`${attention} ${SIZE_LABELS[size]}`}
                />
                <Label>{SIZE_LABELS[size]}</Label>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function IconContainedStates(): React.ReactElement {
  return (
    <View style={row}>
      <View style={labeledItem}>
        <IconContained icon={HomeIcon} attention='high' aria-label='High enabled' />
        <Label>High</Label>
      </View>
      <View style={labeledItem}>
        <IconContained icon={HomeIcon} attention='high' disabled aria-label='High disabled' />
        <Label>High Disabled</Label>
      </View>
      <View style={labeledItem}>
        <IconContained icon={HomeIcon} attention='medium' aria-label='Medium enabled' />
        <Label>Medium</Label>
      </View>
      <View style={labeledItem}>
        <IconContained
          icon={HomeIcon}
          attention='medium'
          disabled
          aria-label='Medium disabled'
        />
        <Label>Medium Disabled</Label>
      </View>
    </View>
  );
}

export function IconContainedWithIcons(): React.ReactElement {
  return (
    <View style={row}>
      <IconContained icon={HeartIcon} aria-label='Heart' />
      <IconContained icon={CheckIcon} aria-label='Check' />
      <IconContained icon={StarIcon} aria-label='Star' />
      <IconContained icon={HeartIcon} attention='medium' aria-label='Heart medium' />
      <IconContained icon={CheckIcon} attention='medium' aria-label='Check medium' />
      <IconContained icon={StarIcon} attention='medium' aria-label='Star medium' />
    </View>
  );
}

export function IconContainedAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {DEFAULT_APPEARANCE_ROLES.map((appearance) => (
        <View
          key={appearance}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
            flexWrap: 'wrap',
          }}
        >
          <View style={rowLabel}>
            <Label>{appearance}</Label>
          </View>
          <View style={row}>
            <IconContained
              icon={HeartIcon}
              size='l'
              attention='high'
              appearance={appearance}
              aria-label={`high ${appearance}`}
            />
            <IconContained
              icon={HeartIcon}
              size='l'
              attention='medium'
              appearance={appearance}
              aria-label={`medium ${appearance}`}
            />
          </View>
        </View>
      ))}
      <Label>Sparkle and brand-bg omitted in most demo brands.</Label>
    </View>
  );
}

export function IconContainedThemes(): React.ReactElement {
  const bgModes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];

  return (
    <View style={column}>
      {bgModes.map(({ mode, label }) => (
        <View
          key={mode}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
            flexWrap: 'wrap',
          }}
        >
          <View style={rowLabel}>
            <Label>{label}</Label>
          </View>
          <Surface mode={mode} style={themeCell}>
            <IconContained icon={HeartIcon} size='l' attention='high' aria-label='High' />
            <IconContained icon={HeartIcon} size='l' attention='medium' aria-label='Medium' />
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function IconContainedSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card' },
  ];

  const containedRow = (
    <>
      <IconContained icon={HeartIcon} size='l' attention='high' aria-label='High' />
      <IconContained icon={HeartIcon} size='l' attention='medium' aria-label='Medium' />
    </>
  );

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <View key={mode} style={{ flexDirection: 'column', gap: tokens.spacing['3-5'] }}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface mode={mode} style={themeCell}>
            {containedRow}
          </Surface>
        </View>
      ))}
    </View>
  );
}
