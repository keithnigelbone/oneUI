/**
 * CounterBadge.showcase.native.tsx
 *
 * Aligned with `packages/ui/src/components/CounterBadge/CounterBadge.stories.tsx` —
 * one section per portable web story (Interactive's play function is web-only).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import type { CounterBadgeAppearance, CounterBadgeSize } from './interface';
import { CounterBadge } from './CounterBadge.native';
import { Surface, useReduceMotion, useSurfaceTokens } from '../../theme';

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

export function CounterBadgeDefault(): React.ReactElement {
  return (
    <CounterBadge value={5} attention='high' size='m' aria-label='5 notifications' />
  );
}

export function CounterBadgeVariants(): React.ReactElement {
  return (
    <View style={row}>
      <CounterBadge value={5} attention='high' aria-label='5 notifications' />
      <CounterBadge value={5} attention='medium' aria-label='5 notifications' />
      <CounterBadge value={5} attention='low' aria-label='5 notifications' />
    </View>
  );
}

export function CounterBadgeSizes(): React.ReactElement {
  const sizes: CounterBadgeSize[] = ['xs', 's', 'm', 'l'];
  return (
    <View style={row}>
      {sizes.map((s) => (
        <CounterBadge key={s} size={s} value={5} aria-label='5 notifications' />
      ))}
    </View>
  );
}

/** Storybook "Max Value" + value ladder + zero handling. */
export function CounterBadgeMaxValue(): React.ReactElement {
  return (
    <View style={column}>
      <View style={subsection}>
        <Label>Default max (99)</Label>
        <View style={row}>
          <CounterBadge value={50} aria-label='50 notifications' />
          <CounterBadge value={99} aria-label='99 notifications' />
          <CounterBadge value={150} aria-label='150 notifications' />
        </View>
      </View>
      <View style={subsection}>
        <Label>Custom max (9)</Label>
        <View style={row}>
          <CounterBadge value={5} max={9} aria-label='5 notifications' />
          <CounterBadge value={9} max={9} aria-label='9 notifications' />
          <CounterBadge value={15} max={9} aria-label='15 notifications' />
        </View>
      </View>
      <View style={subsection}>
        <Label>More values</Label>
        <View style={row}>
          <CounterBadge value={1} aria-label='1 notification' />
          <CounterBadge value={9} aria-label='9 notifications' />
          <CounterBadge value={42} aria-label='42 notifications' />
          <CounterBadge value={99} aria-label='99 notifications' />
          <CounterBadge value={1000} max={999} aria-label='1000 notifications' />
        </View>
      </View>
      <View style={subsection}>
        <Label>Invalid max (falls back to 99)</Label>
        <View style={row}>
          <CounterBadge value={1} max={0} aria-label='1 notification' />
          <CounterBadge value={150} max={0} aria-label='150 notifications' />
          <Label>↑ max=0 shows 1 and 99+, not 0+</Label>
        </View>
      </View>
      <View style={subsection}>
        <Label>Zero and negative handling</Label>
        <View style={row}>
          <CounterBadge value={0} aria-label='zero hidden' />
          <Label>↑ hidden (showZero=false)</Label>
          <CounterBadge value={0} showZero aria-label='zero shown' />
          <Label>↑ showZero</Label>
          <CounterBadge value={-1} aria-label='negative hidden' />
          <Label>↑ -1 hidden</Label>
        </View>
      </View>
    </View>
  );
}

export function CounterBadgeAppearances(): React.ReactElement {
  const appearances = [...COMPONENT_APPEARANCE_ROLES] as CounterBadgeAppearance[];
  return (
    <View style={column}>
      {appearances.map((appearance) => (
        <View key={appearance} style={subsection}>
          <Label>{appearance.charAt(0).toUpperCase() + appearance.slice(1)}</Label>
          <View style={row}>
            <CounterBadge
              value={5}
              appearance={appearance}
              attention='high'
              aria-label='5 notifications'
            />
            <CounterBadge
              value={5}
              appearance={appearance}
              attention='medium'
              aria-label='5 notifications'
            />
            <CounterBadge
              value={5}
              appearance={appearance}
              attention='low'
              aria-label='5 notifications'
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Responsive — same matrix as Sizes, framed for narrow viewports.
   ======================================== */
export function CounterBadgeResponsive(): React.ReactElement {
  const sizes: CounterBadgeSize[] = ['xs', 's', 'm', 'l'];
  return (
    <View style={[row, { alignItems: 'center' }]}>
      {sizes.map((s) => (
        <CounterBadge
          key={s}
          value={3}
          size={s}
          aria-label={`${s.toUpperCase()} 3 notifications`}
        />
      ))}
    </View>
  );
}

/* ========================================
   Motion — Entry/exit + increment pulse demo.
   Web uses CSS keyframes + interpolate-size; native uses Animated.parallel.
   ======================================== */
function MotionCounterAtom({
  value,
  attention,
  visible,
  reducedMotion,
  pulseTrigger,
}: {
  value: number;
  attention: 'high' | 'medium' | 'low';
  visible: boolean;
  reducedMotion: boolean;
  pulseTrigger: number;
}): React.ReactElement {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const visibleScale = useRef(new Animated.Value(visible ? 1 : 0.5)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const lastPulse = useRef(pulseTrigger);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 240 : 180,
        useNativeDriver: true,
      }),
      Animated.timing(visibleScale, {
        toValue: reducedMotion ? 1 : visible ? 1 : 0.5,
        duration: visible ? 240 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, reducedMotion, opacity, visibleScale]);

  useEffect(() => {
    if (lastPulse.current === pulseTrigger || reducedMotion) return;
    lastPulse.current = pulseTrigger;
    Animated.sequence([
      Animated.timing(pulseScale, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseTrigger, reducedMotion, pulseScale]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale: visibleScale }, { scale: pulseScale }],
      }}
    >
      <CounterBadge
        value={value}
        attention={attention}
        aria-label={`${value} notifications`}
      />
    </Animated.View>
  );
}

function MotionPill({
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

export function CounterBadgeMotion(): React.ReactElement {
  const reduceMotion = useReduceMotion();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(5);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  const handleIncrement = () => {
    setCount((c) => c + 1);
    setPulseTrigger((t) => t + 1);
  };

  const handleDecrement = () => {
    setCount((c) => Math.max(0, c - 1));
  };

  return (
    <View style={{ alignItems: 'center', gap: tokens.spacing['5'] }}>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['3-5'], flexWrap: 'wrap', justifyContent: 'center' }}>
        <MotionPill label='Entry' onPress={() => setVisible(true)} />
        <MotionPill label='Exit' onPress={() => setVisible(false)} />
        <MotionPill label='Increment' onPress={handleIncrement} />
        <MotionPill label='Decrement' onPress={handleDecrement} />
        <MotionPill
          label='Reset'
          onPress={() => {
            setCount(5);
            setVisible(true);
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing['4-5'],
        }}
      >
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <View key={attention} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <Label>{attention}</Label>
            <MotionCounterAtom
              value={count}
              attention={attention}
              visible={visible}
              reducedMotion={reduceMotion}
              pulseTrigger={pulseTrigger}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const THEME_SURFACES = ['default', 'minimal', 'subtle', 'elevated'] as const;

export function CounterBadgeThemes(): React.ReactElement {
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
              gap: tokens.spacing['3-5'],
              padding: tokens.spacing['4'],
              borderRadius: tokens.shape.m,
            }}
          >
            <CounterBadge value={5} attention='high' aria-label='5 notifications' />
            <CounterBadge value={5} attention='medium' aria-label='5 notifications' />
            <CounterBadge value={5} attention='low' aria-label='5 notifications' />
          </Surface>
        </View>
      ))}
    </View>
  );
}
