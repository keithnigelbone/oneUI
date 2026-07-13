/**
 * Icon.showcase.native.tsx — design-system Icon Storybook parity.
 *
 * Mirrors `packages/ui/src/components/Icon/Icon.showcase.tsx`. Color is
 * handled INTERNALLY by the design-system `<Icon>` (via `appearance` and
 * the surrounding surface context), so the showcase only ever passes
 * design-system primitives — never a hex string, never an emphasis level.
 *
 *   <Icon icon="heart" appearance="primary" size="8" />
 *
 * The semantic-name path (`icon="heart"`) goes through the resolver +
 * registered loader (the host calls `initJdsJioIcons(JdsIcons)` once at
 * startup). A direct-component subsection in `IconWithIcons` uses
 * self-contained inline SVGs so the showcase keeps working without any
 * host wiring.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { IconComponentProps, SemanticIconName } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '../../theme';
import { Icon } from './Icon.native';
import {
  ICON_SIZES,
  type IconAppearance,
  type IconEmphasis,
} from './interface';

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

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

const surfaceCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.m,
};

const APPEARANCES: IconAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

const EMPHASIS_LEVELS: IconEmphasis[] = [
  'high',
  'medium',
  'low',
  'tinted',
  'tintedA11y',
];

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Inline SVGs — used by `IconWithIcons` direct-component subsection so the
// showcase stays usable even without a registered Jio loader.
// ---------------------------------------------------------------------------

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const STAR_PATH =
  'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

const InlineHeart = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path fill={color as string} d={HEART_PATH} />
  </Svg>
);

const InlineStar = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24'>
    <Path fill={color as string} d={STAR_PATH} />
  </Svg>
);

// ---------------------------------------------------------------------------
// Storybook-parity exports
// ---------------------------------------------------------------------------

/** 1. Default — semantic name, neutral. */
export function IconDefault(): React.ReactElement {
  return <Icon icon='heart' size='5' appearance='neutral' aria-label='Heart' />;
}

/** 2. Sizes — all 20 spacing indices. */
export function IconSizes(): React.ReactElement {
  return (
    <View style={row}>
      {ICON_SIZES.map((size) => (
        <View key={size} style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}>
          <Icon icon='heart' size={size} appearance='neutral' aria-label={`Size ${size}`} />
          <Label>{size}</Label>
        </View>
      ))}
    </View>
  );
}

/** 3. Appearances — 8 colour roles × 3 emphasis levels at size 8 (web parity). */
export function IconAppearances(): React.ReactElement {
  const emphasisRows: IconEmphasis[] = ['high', 'tinted', 'tintedA11y'];
  return (
    <View style={column}>
      {emphasisRows.map((emphasis) => (
        <View
          key={emphasis}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <View style={{ minWidth: tokens.spacing['10'] }}>
            <Label>{emphasis}</Label>
          </View>
          <View style={row}>
            {APPEARANCES.map((appearance) => (
              <View
                key={appearance}
                style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}
              >
                <Icon
                  icon='heart'
                  appearance={appearance}
                  emphasis={emphasis}
                  size='8'
                  aria-label={`${emphasis} ${appearance}`}
                />
                <Label>{appearance}</Label>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** 3b. Emphasis levels — all 5 levels at size 8 using the primary role. */
export function IconEmphasisLevels(): React.ReactElement {
  return (
    <View style={row}>
      {EMPHASIS_LEVELS.map((emphasis) => (
        <View key={emphasis} style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}>
          <Icon
            icon='heart'
            emphasis={emphasis}
            appearance='primary'
            size='8'
            aria-label={emphasis}
          />
          <Label>{emphasis}</Label>
        </View>
      ))}
    </View>
  );
}

/**
 * 4. WithIcons — common semantic gallery + direct-component escape hatch.
 *    Both subsections use the design-system `<Icon>` (color resolved
 *    internally from appearance); the only difference is whether `icon` is
 *    a string (semantic name) or a component (direct).
 */
export function IconWithIcons(): React.ReactElement {
  const semanticIcons: { name: SemanticIconName; label: string }[] = [
    { name: 'heart', label: 'heart' },
    { name: 'star', label: 'star' },
    { name: 'check', label: 'check' },
    { name: 'search', label: 'search' },
    { name: 'settings', label: 'settings' },
    { name: 'home', label: 'home' },
  ];

  const directIcons: { icon: typeof InlineHeart; label: string }[] = [
    { icon: InlineHeart, label: 'Inline heart' },
    { icon: InlineStar, label: 'Inline star' },
  ];

  return (
    <View style={column}>
      <Label>By semantic name (`icon="…"`)</Label>
      <View style={row}>
        {semanticIcons.map(({ name, label }) => (
          <View key={label} style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}>
            <Icon icon={name} size='8' appearance='neutral' aria-label={label} />
            <Label>{label}</Label>
          </View>
        ))}
      </View>

      <Label>By direct component (`icon={'{Component}'}`)</Label>
      <View style={row}>
        {directIcons.map(({ icon, label }) => (
          <View key={label} style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}>
            <Icon icon={icon} size='8' appearance='neutral' aria-label={label} />
            <Label>{label}</Label>
          </View>
        ))}
      </View>
    </View>
  );
}

/** 5. Interactive — Storybook args mirror (static preview). */
export function IconInteractive(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={column}>
      <Icon icon='heart' size='5' appearance='neutral' aria-label='Interactive heart' />
      <Text style={{ fontSize: typography.size.m, color: role.content.medium }}>
        Default interactive props: size 5, neutral
      </Text>
    </View>
  );
}

/**
 * 6. Surface Context — token remap demo across all surface modes.
 * Same `<Icon appearance='primary'>` paints differently in every Surface
 * because `--Primary-TintedA11y` remaps to its on-context variant.
 */
export function IconSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
  ];

  const iconRow = (
    <>
      <Icon icon='heart' appearance='neutral' size='8' aria-label='Neutral' />
      <Icon icon='heart' appearance='primary' size='8' aria-label='Primary' />
      <Icon icon='heart' appearance='secondary' size='8' aria-label='Secondary' />
      <Icon icon='heart' appearance='positive' size='8' aria-label='Positive' />
      <Icon icon='heart' appearance='negative' size='8' aria-label='Negative' />
    </>
  );

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <View key={mode} style={{ gap: tokens.spacing['3-5'] }}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface mode={mode} style={surfaceCell}>
            {iconRow}
          </Surface>
        </View>
      ))}
    </View>
  );
}

/** 7. In Context — icons inline with text (web parity: each row uses `emphasis`). */
export function IconInContext(): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  const positive = useSurfaceTokens('positive');

  return (
    <View style={column}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3-5'] }}>
        <Icon
          icon='heart'
          size='5'
          appearance='negative'
          emphasis='tinted'
          aria-hidden
        />
        <Text style={{ fontSize: typography.size.m, color: neutral.content.high }}>
          Favourited item
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3-5'] }}>
        <Icon icon='search' size='3.5' emphasis='medium' aria-hidden />
        <Text style={{ fontSize: typography.size.s, color: neutral.content.medium }}>
          Search results
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3-5'] }}>
        <Icon
          icon='check'
          size='3'
          appearance='positive'
          emphasis='tintedA11y'
          aria-hidden
        />
        <Text style={{ fontSize: typography.size.s, color: positive.content.tinted }}>
          Verified
        </Text>
      </View>
    </View>
  );
}
