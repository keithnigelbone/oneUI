/**
 * IndicatorBadge.showcase.native.tsx
 *
 * Aligned with `packages/ui/src/components/IndicatorBadge/IndicatorBadge.stories.tsx` —
 * one section per portable web story (Interactive's Storybook play function
 * is web-only and skipped).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import type {
  IndicatorBadgeAppearance,
  IndicatorBadgeSize,
} from './interface';
import { IndicatorBadge } from './IndicatorBadge.native';
import { Surface, useReduceMotion, useSurfaceTokens, useTypographyTokens } from '../../theme';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const subsection: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

export function IndicatorBadgeDefault(): React.ReactElement {
  return <IndicatorBadge aria-label='New' size='m' />;
}

export function IndicatorBadgeSizes(): React.ReactElement {
  const sizes: IndicatorBadgeSize[] = ['xs', 's', 'm', 'l', 'xl'];
  return (
    <View style={row}>
      {sizes.map((s) => (
        <View key={s} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
          <IndicatorBadge size={s} aria-label={`Status ${s}`} />
          <Label>{s}</Label>
        </View>
      ))}
    </View>
  );
}

export function IndicatorBadgeAppearances(): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  const appearances = [...COMPONENT_APPEARANCE_ROLES] as IndicatorBadgeAppearance[];
  return (
    <View style={column}>
      {appearances.map((appearance) => (
        <View
          key={appearance}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
          }}
        >
          <IndicatorBadge appearance={appearance} aria-label={`${appearance} status`} />
          <Text
            style={{
              fontSize: typography.size.xs,
              color: neutral.content.low,
              textTransform: 'capitalize',
            }}
          >
            {appearance}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SurfaceContextRow({
  mode,
  label,
  desc,
}: {
  mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated';
  label: string;
  desc: string;
}): React.ReactElement {
  return (
    <View style={subsection}>
      <Label>
        {label} — {desc}
      </Label>
      <Surface
        mode={mode}
        appearance='primary'
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: tokens.spacing['4'],
          padding: tokens.spacing['5'],
          borderRadius: tokens.shape.m,
        }}
      >
        <IndicatorBadge aria-label='Status' />
        <IndicatorBadge appearance='positive' aria-label='Online' />
        <IndicatorBadge appearance='negative' aria-label='Offline' />
      </Surface>
    </View>
  );
}

export function IndicatorBadgeSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      <SurfaceContextRow mode='default' label='default' desc='page background' />
      <SurfaceContextRow mode='minimal' label='minimal' desc='light tint' />
      <SurfaceContextRow mode='subtle' label='subtle' desc='medium tint' />
      <SurfaceContextRow mode='moderate' label='moderate' desc='heavier tint' />
      <SurfaceContextRow mode='bold' label='bold' desc='full accent colour' />
      <SurfaceContextRow mode='elevated' label='elevated' desc='floating card / popover' />
    </View>
  );
}

const THEME_SURFACES = ['default', 'minimal', 'subtle', 'elevated'] as const;

export function IndicatorBadgeThemes(): React.ReactElement {
  return (
    <View style={column}>
      {THEME_SURFACES.map((mode) => (
        <View key={mode} style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}>
          <View style={{ width: tokens.spacing['9'] }}>
            <Label>{mode}</Label>
          </View>
          <Surface
            mode={mode}
            appearance='primary'
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: tokens.spacing['4'],
              padding: tokens.spacing['4'],
              borderRadius: tokens.shape.m,
            }}
          >
            <IndicatorBadge aria-label='Primary' />
            <IndicatorBadge appearance='positive' aria-label='Positive' />
            <IndicatorBadge appearance='negative' aria-label='Negative' />
            <IndicatorBadge appearance='warning' aria-label='Warning' />
            <IndicatorBadge appearance='informative' aria-label='Info' />
          </Surface>
        </View>
      ))}
    </View>
  );
}

function FakeAvatarTile(): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  const typo = useTypographyTokens('label', 'M', { emphasis: 'medium' });
  const side = tokens.spacing['9'];
  return (
    <View
      style={{
        width: side,
        height: side,
        borderRadius: tokens.shape.pill,
        backgroundColor: neutral.surfaces.subtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: typo.fontSize,
          lineHeight: typo.lineHeight,
          fontWeight: typo.fontWeight,
          fontFamily: typo.fontFamily,
          color: neutral.content.high,
        }}
      >
        A
      </Text>
    </View>
  );
}

function FakeIconTile(): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  const icon = tokens.spacing['5'];
  return (
    <View
      style={{
        width: tokens.spacing['9'],
        height: tokens.spacing['9'],
        borderRadius: tokens.shape.pill,
        backgroundColor: neutral.surfaces.subtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: icon,
          height: icon,
          borderRadius: tokens.shape.s,
          backgroundColor: neutral.content.medium,
        }}
      />
    </View>
  );
}

/* ========================================
   Responsive — same as Sizes but framed for mobile viewport.
   Mirrors web `Responsive` story (viewport: mobile1).
   ======================================== */
export function IndicatorBadgeResponsive(): React.ReactElement {
  const sizes: IndicatorBadgeSize[] = ['xs', 's', 'm', 'l', 'xl'];
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: tokens.spacing['4-5'],
      }}
    >
      {sizes.map((s) => (
        <IndicatorBadge key={s} size={s} aria-label={`${s.toUpperCase()} indicator`} />
      ))}
    </View>
  );
}

/* ========================================
   Motion — Entry/exit demo with reduced-motion fallback.
   Mirrors web `Motion` story (CSS keyframes -> RN Animated).
   ======================================== */
function MotionAtom({
  appearance,
  visible,
  reducedMotion,
}: {
  appearance: IndicatorBadgeAppearance;
  visible: boolean;
  reducedMotion: boolean;
}): React.ReactElement {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 240 : 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: reducedMotion ? 1 : visible ? 1 : 0.5,
        duration: visible ? 240 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, reducedMotion, opacity, scale]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <IndicatorBadge appearance={appearance} aria-label={`${appearance} status`} />
    </Animated.View>
  );
}

function MotionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: role.surfaces.subtle,
        borderRadius: tokens.shape.m,
        paddingHorizontal: tokens.spacing['3-5'],
        paddingVertical: tokens.spacing['1'],
      }}
      accessibilityRole='button'
    >
      <Text
        style={{
          color: role.content.tintedA11y,
          fontSize: typography.size.xs,
          fontWeight: typography.weight.medium as '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IndicatorBadgeMotion(): React.ReactElement {
  const reduceMotion = useReduceMotion();
  const [visible, setVisible] = useState(true);
  const roles: IndicatorBadgeAppearance[] = ['primary', 'positive', 'negative'];
  return (
    <View style={{ alignItems: 'center', gap: tokens.spacing['5'] }}>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['3-5'] }}>
        <MotionButton label='Entry' onPress={() => setVisible(true)} />
        <MotionButton label='Exit' onPress={() => setVisible(false)} />
        <MotionButton label='Reset' onPress={() => setVisible(true)} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing['4-5'],
        }}
      >
        {roles.map((appearance) => (
          <View key={appearance} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <Label>{appearance}</Label>
            <MotionAtom
              appearance={appearance}
              visible={visible}
              reducedMotion={reduceMotion}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export function IndicatorBadgeWithComponents(): React.ReactElement {
  const page = useSurfaceTokens('neutral');
  const ring = tokens.spacing['1-5'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['6'], alignItems: 'center' }}>
      <View style={{ position: 'relative' }}>
        <FakeAvatarTile />
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            borderWidth: ring,
            borderColor: page.surfaces.default,
            borderRadius: tokens.shape.pill,
          }}
        >
          <IndicatorBadge size='s' appearance='positive' aria-label='Online' />
        </View>
      </View>
      <View style={{ position: 'relative' }}>
        <FakeIconTile />
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <IndicatorBadge size='xs' appearance='negative' aria-label='3 notifications' />
        </View>
      </View>
    </View>
  );
}
