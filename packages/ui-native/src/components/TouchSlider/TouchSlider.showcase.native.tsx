/**
 * TouchSlider.showcase.native.tsx
 *
 * Native peer of `packages/ui/src/components/TouchSlider/TouchSlider.showcase.tsx`.
 */

import React from 'react';
import { View, Text, ScrollView, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { TouchSlider } from './TouchSlider.native';
import { Surface, useSurfaceTokens } from '../../theme';
import { Icon } from '../Icon/Icon.native';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const stack: ViewStyle = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
  padding: tokens.spacing['4'],
};

const row: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: tokens.spacing['5'],
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
        minWidth: tokens.spacing['12'],
      }}
    >
      {children}
    </Text>
  );
}

// ─── Showcases ────────────────────────────────────────────────────────────────

export function TouchSliderProgressStyles(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={row}>
        <CaptionLabel>rounded</CaptionLabel>
        <TouchSlider defaultValue={60} progressStyle="rounded" aria-label="Rounded" />
      </View>
      <View style={row}>
        <CaptionLabel>sharp</CaptionLabel>
        <TouchSlider defaultValue={30} progressStyle="sharp" aria-label="Sharp" />
      </View>
    </View>
  );
}

export function TouchSliderWithSlots(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={row}>
        <CaptionLabel>start slot</CaptionLabel>
        <TouchSlider
          defaultValue={60}
          start={<Icon icon="volumeOn" size="4" />}
          aria-label="Volume with icon"
        />
      </View>
      <View style={row}>
        <CaptionLabel>both slots</CaptionLabel>
        <TouchSlider
          defaultValue={60}
          start={<Icon icon="volumeOff" size="4" />}
          aria-label="Volume with both icons"
        />
      </View>
      <View style={row}>
        <CaptionLabel>no slots</CaptionLabel>
        <TouchSlider defaultValue={60} aria-label="Volume no icon" />
      </View>
    </View>
  );
}

const APPEARANCES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

export function TouchSliderAppearances(): React.ReactElement {
  return (
    <ScrollView style={{ width: '100%' }}>
      <View style={stack}>
        {APPEARANCES.map((role) => (
          <View key={role} style={row}>
            <CaptionLabel>{role}</CaptionLabel>
            <TouchSlider start={<Icon icon="volumeOn" size="4" />} defaultValue={0} appearance={role} aria-label={`${role} touch`} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function TouchSliderStates(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={row}>
        <CaptionLabel>default</CaptionLabel>
        <TouchSlider defaultValue={60} aria-label="Default" />
      </View>
      <View style={row}>
        <CaptionLabel>disabled</CaptionLabel>
        <TouchSlider defaultValue={60} disabled aria-label="Disabled" />
      </View>
      <View style={row}>
        <CaptionLabel>readOnly</CaptionLabel>
        <TouchSlider defaultValue={60} readOnly aria-label="Read only" />
      </View>
    </View>
  );
}

export function TouchSliderVertical(): React.ReactElement {
  return (
    <View style={[row, { alignItems: 'flex-start', padding: tokens.spacing['4'] }]}>
      <TouchSlider
        defaultValue={60}
        orientation="vertical"
        progressStyle="rounded"
        aria-label="Vertical rounded"
      />
      <TouchSlider
        defaultValue={60}
        orientation="vertical"
        progressStyle="sharp"
        aria-label="Vertical sharp"
      />
      <TouchSlider
        defaultValue={60}
        orientation="vertical"
        start={<Icon icon="volumeOn" size="4" />}
        aria-label="Vertical start icon"
      />
      <TouchSlider
        defaultValue={60}
        orientation="vertical"
        start={<Icon icon="volumeOff" size="4" />}
        aria-label="Vertical both icons"
      />
    </View>
  );
}

export function TouchSliderSurfaceContext(): React.ReactElement {
  const rows = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'bold' as const, label: 'bold' },
  ];

  return (
    <View style={stack}>
      {rows.map(({ mode, label }) => (
        <View key={mode} style={row}>
          <CaptionLabel>{label}</CaptionLabel>
          <Surface
            mode={mode}
            appearance="secondary"
            style={{
              padding: tokens.spacing['4'],
              borderRadius: tokens.shape.m,
              flex: 1,
            }}
          >
            <TouchSlider
              defaultValue={60}
              appearance="secondary"
              start={<Icon icon="volumeOff" size="4" />}
              aria-label={`TouchSlider on ${label}`}
            />
          </Surface>
        </View>
      ))}
    </View>
  );
}
