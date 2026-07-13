/**
 * Spinner.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Spinner/Spinner.stories.tsx` —
 * one section per web story.
 */

import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import type { SpinnerSize } from './interface';
import { Spinner } from './Spinner.native';
import { Surface, useSurfaceTokens } from '../../theme';

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

/* ========================================
   1. Default
   ======================================== */
export function SpinnerDefault(): React.ReactElement {
  return (
    <View style={row}>
      <Spinner />
      <Label>Default (M)</Label>
    </View>
  );
}

/* ========================================
   2. Sizes (web story name: All sizes)
   ======================================== */
export function SpinnerSizes(): React.ReactElement {
  const sizes: SpinnerSize[] = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  return (
    <View style={{ gap: tokens.spacing['3-5'] }}>
      <Label>All sizes</Label>
      <View style={row}>
        {sizes.map((s) => (
          <View key={s} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <Spinner size={s} />
            <Label>{s}</Label>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ========================================
   3. OnSurfaceContext (web story name: On surface context)
   ======================================== */
export function SpinnerSurfaceContext(): React.ReactElement {
  const sizes: SpinnerSize[] = ['M', 'XL'];
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['3'] }}>
        <Label>Default surface</Label>
        <View style={row}>
          {sizes.map((s) => (
            <Spinner key={s} size={s} />
          ))}
        </View>
      </View>
      <Surface mode='subtle' style={{ padding: tokens.spacing['5'], gap: tokens.spacing['3'] }}>
        <Label>Subtle surface</Label>
        <View style={row}>
          {sizes.map((s) => (
            <Spinner key={s} size={s} />
          ))}
        </View>
      </Surface>
      <Surface mode='bold' style={{ padding: tokens.spacing['5'], gap: tokens.spacing['3'] }}>
        <Label>Bold surface</Label>
        <View style={row}>
          {sizes.map((s) => (
            <Spinner key={s} size={s} />
          ))}
        </View>
      </Surface>
    </View>
  );
}

/* ========================================
   4. Motion
   ======================================== */
export function SpinnerMotion(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const [paused, setPaused] = React.useState(false);

  return (
    <View style={[row, { gap: tokens.spacing['5'] }]}>
      {/* Mounting / unmounting toggles the rotation loop — RN equivalent
          of CSS `animation-play-state: paused`. */}
      {paused ? (
        <View
          style={{
            width: tokens.spacing['16'],
            height: tokens.spacing['16'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessible
          accessibilityRole='image'
          accessibilityLabel='Spinner paused'
        >
          <View
            style={{
              width: tokens.spacing['16'],
              height: tokens.spacing['16'],
              borderRadius: tokens.spacing['16'],
              borderWidth: tokens.borderWidth.thin,
              borderColor: 'transparent',
              borderTopColor: role.content.tintedA11y,
            }}
          />
        </View>
      ) : (
        <Spinner size='2XL' />
      )}
      <Pressable
        onPress={() => setPaused((p) => !p)}
        style={{
          backgroundColor: role.surfaces.bold,
          borderRadius: tokens.shape.pill,
          paddingHorizontal: tokens.spacing['4-5'],
          paddingVertical: tokens.spacing['1-5'],
        }}
        accessibilityRole='button'
      >
        <Text
          style={{
            color: role.onBoldContent.high,
            fontSize: typography.size.s,
            fontWeight: typography.weight.medium as '500',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </Text>
      </Pressable>
    </View>
  );
}
