/**
 * IconButton.showcase.native.tsx
 *
 * Mirrors `IconButton.stories.tsx` sections for the native-components-sample app.
 */

import React from 'react';
import {
  Animated,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  COMPONENT_APPEARANCE_ROLES,
  type IconComponent,
  type IconComponentProps,
} from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import { IcAddGlyph } from '../Button/buttonShowcaseJdsGlyphs';
import { Surface, useSurfaceTokens } from '../../theme';
import { useReduceMotion } from '../../theme';
import { IconButton } from './IconButton.native';
import type { IconButtonProps } from './interface';

const DEFAULT_APPEARANCE_ROLES = COMPONENT_APPEARANCE_ROLES.filter(
  (r) => r !== 'sparkle' && r !== 'brand-bg',
);

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

const surfaceCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['5'],
  borderRadius: tokens.shape.m,
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>
  );
}

/**
 * PreviewIcon — `IconComponent` (web parity). Accepts `size` + `color` props;
 * `<IconButton>` passes the appearance-resolved on-colour into them via the
 * design-system `<Icon>`.
 */
const PreviewIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' fill={color as string} />
  </Svg>
);

function iconButton(
  props: Partial<Omit<IconButtonProps, 'icon'>> &
    Pick<IconButtonProps, 'aria-label'> & { icon?: IconButtonProps['icon'] },
): React.ReactElement {
  const { icon: iconProp, 'aria-label': ariaLabel, ...rest } = props;
  return (
    <IconButton icon={iconProp ?? PreviewIcon} aria-label={ariaLabel} {...rest} />
  );
}

/* ============================================================================
 * Default — single instance, mirrors web `Default` story.
 * ========================================================================= */
export function IconButtonDefault(): React.ReactElement {
  return iconButton({ 'aria-label': 'Add item' });
}

export function IconButtonAttentionLevels(): React.ReactElement {
  return (
    <View style={row}>
      {iconButton({ attention: 'high', 'aria-label': 'High' })}
      {iconButton({ attention: 'medium', 'aria-label': 'Medium' })}
      {iconButton({ attention: 'low', 'aria-label': 'Low' })}
    </View>
  );
}

export function IconButtonSizes(): React.ReactElement {
  return (
    <View style={row}>
      {(['2xs', 'xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <View key={size} style={labeledItem}>
          {iconButton({ size, 'aria-label': size.toUpperCase() })}
          <Label>{size.toUpperCase()}</Label>
        </View>
      ))}
    </View>
  );
}

export function IconButtonCondensed(): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        {iconButton({ size: 's', 'aria-label': 'S' })}
        {iconButton({ size: 'm', 'aria-label': 'M' })}
        {iconButton({ size: 'l', 'aria-label': 'L' })}
      </View>
      <Label>Normal</Label>
      <View style={row}>
        {iconButton({ size: 's', condensed: true, 'aria-label': 'S condensed' })}
        {iconButton({ size: 'm', condensed: true, 'aria-label': 'M condensed' })}
        {iconButton({ size: 'l', condensed: true, 'aria-label': 'L condensed' })}
      </View>
      <Label>Condensed</Label>
    </View>
  );
}

export function IconButtonStates(): React.ReactElement {
  return (
    <View style={row}>
      {iconButton({ attention: 'high', 'aria-label': 'Default' })}
      {iconButton({ attention: 'high', disabled: true, 'aria-label': 'Disabled' })}
      {iconButton({ attention: 'high', loading: true, 'aria-label': 'Loading' })}
    </View>
  );
}

export function IconButtonAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {DEFAULT_APPEARANCE_ROLES.map((appearance) => (
        <View
          key={appearance}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'], flexWrap: 'wrap' }}
        >
          <View style={rowLabel}>
            <Label>{appearance}</Label>
          </View>
          <View style={row}>
            {iconButton({ appearance, attention: 'high', 'aria-label': `${appearance} high` })}
            {iconButton({ appearance, attention: 'medium', 'aria-label': `${appearance} medium` })}
            {iconButton({ appearance, attention: 'low', 'aria-label': `${appearance} low` })}
          </View>
        </View>
      ))}
    </View>
  );
}

export function IconButtonLayouts(): React.ReactElement {
  return (
    <View style={column}>
      <Label>1:1 (square)</Label>
      <View style={row}>
        {iconButton({ layout: '1:1', attention: 'high', 'aria-label': '1:1 high' })}
        {iconButton({ layout: '1:1', attention: 'medium', 'aria-label': '1:1 medium' })}
        {iconButton({ layout: '1:1', attention: 'low', 'aria-label': '1:1 low' })}
      </View>
      <Label>3:2 (wide)</Label>
      <View style={row}>
        {iconButton({ layout: '3:2', attention: 'high', 'aria-label': '3:2 high' })}
        {iconButton({ layout: '3:2', attention: 'medium', 'aria-label': '3:2 medium' })}
        {iconButton({ layout: '3:2', attention: 'low', 'aria-label': '3:2 low' })}
      </View>
    </View>
  );
}

export function IconButtonFullWidth(): React.ReactElement {
  return (
    <View style={{ width: '100%', gap: tokens.spacing['3-5'] }}>
      {iconButton({ fullWidth: true, attention: 'high', 'aria-label': 'Full width high' })}
      {iconButton({ fullWidth: true, attention: 'medium', 'aria-label': 'Full width medium' })}
      {iconButton({ fullWidth: true, attention: 'low', 'aria-label': 'Full width low' })}
    </View>
  );
}

export function IconButtonWithJdsIcon(): React.ReactElement {
  return (
    <View style={row}>
      {iconButton({ icon: IcAddGlyph, 'aria-label': 'Add' })}
      {iconButton({ icon: IcAddGlyph, attention: 'medium', 'aria-label': 'Add medium' })}
    </View>
  );
}

export function IconButtonSurfaceContext(): React.ReactElement {
  const modes = [
    { mode: 'default' as const, label: 'default — page background' },
    { mode: 'minimal' as const, label: 'minimal — light tint' },
    { mode: 'subtle' as const, label: 'subtle — medium tint' },
    { mode: 'moderate' as const, label: 'moderate — heavier tint' },
    { mode: 'bold' as const, label: 'bold — full accent colour' },
  ];

  return (
    <View style={column}>
      {modes.map(({ mode, label }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Label>{label}</Label>
          <Surface mode={mode} appearance='primary' style={surfaceCell}>
            {iconButton({ attention: 'high', 'aria-label': `${label} high` })}
            {iconButton({ attention: 'medium', 'aria-label': `${label} medium` })}
            {iconButton({ attention: 'low', 'aria-label': `${label} low` })}
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function IconButtonLoadingSizes(): React.ReactElement {
  return (
    <View style={row}>
      {(['2xs', 'xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <View key={size} style={labeledItem}>
          {iconButton({ size, loading: true, 'aria-label': `Loading ${size}` })}
          <Label>{size.toUpperCase()}</Label>
        </View>
      ))}
    </View>
  );
}

/* ============================================================================
 * Responsive — even spread row mirroring a narrow viewport navbar.
 * Mirrors web `Responsive` story.
 * ========================================================================= */
export function IconButtonResponsive(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {iconButton({ 'aria-label': 'Menu' })}
      {iconButton({ 'aria-label': 'Search' })}
      {iconButton({ 'aria-label': 'Notifications' })}
      {iconButton({ 'aria-label': 'Profile' })}
    </View>
  );
}

/* ============================================================================
 * LoadingStates — attention × size matrices.
 * Mirrors web `LoadingStates` story (more thorough than LoadingSizes).
 * ========================================================================= */
export function IconButtonLoadingStates(): React.ReactElement {
  return (
    <View style={[column, { gap: tokens.spacing['4-5'] }]}>
      <View style={row}>
        {iconButton({ loading: true, attention: 'high', 'aria-label': 'Loading high' })}
        {iconButton({ loading: true, attention: 'medium', 'aria-label': 'Loading medium' })}
        {iconButton({ loading: true, attention: 'low', 'aria-label': 'Loading low' })}
      </View>
      <View style={row}>
        {(['2xs', 'xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
          <View key={size} style={labeledItem}>
            {iconButton({ loading: true, size, 'aria-label': `Loading ${size}` })}
            <Label>{size.toUpperCase()}</Label>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ============================================================================
 * Motion — Tap interaction: scale up 7% (1:1, default) on press.
 * Mirrors web `Motion` story; honours `useReduceMotion` for the subtle path.
 * ========================================================================= */
const SCALE_UP = 1.07;
const SCALE_DEFAULT = 1.0;

function MotionWrap({
  children,
  reduceMotion,
}: {
  children: React.ReactNode;
  reduceMotion: boolean;
}): React.ReactElement {
  const scale = React.useRef(new Animated.Value(SCALE_DEFAULT)).current;
  const motion = React.useMemo(
    () => ({
      onPressIn: () => {
        if (reduceMotion) return;
        Animated.spring(scale, {
          toValue: SCALE_UP,
          useNativeDriver: true,
          friction: 5,
          tension: 100,
        }).start();
      },
      onPressOut: () => {
        Animated.spring(scale, {
          toValue: SCALE_DEFAULT,
          useNativeDriver: true,
          friction: 5,
          tension: 100,
        }).start();
      },
    }),
    [reduceMotion, scale],
  );

  return (
    <Animated.View
      style={{ transform: [{ scale }] }}
      onTouchStart={motion.onPressIn}
      onTouchEnd={motion.onPressOut}
      onTouchCancel={motion.onPressOut}
    >
      {children}
    </Animated.View>
  );
}

export function IconButtonMotion(): React.ReactElement {
  const reduceMotion = useReduceMotion();
  return (
    <View style={[column, { gap: tokens.spacing['4-5'] }]}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <View key={attention} style={labeledItem}>
          <Label>{attention.charAt(0).toUpperCase() + attention.slice(1)}</Label>
          <MotionWrap reduceMotion={reduceMotion}>
            {iconButton({ attention, 'aria-label': `${attention} icon button` })}
          </MotionWrap>
        </View>
      ))}
    </View>
  );
}
