/**
 * Progress.showcase.native.tsx
 *
 * Variant matrix mirroring the web showcase: three sizes × determinate /
 * indeterminate state.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { Progress } from './Progress.native';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const typo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  return (
    <Text
      style={{
        fontSize: typo.fontSize,
        lineHeight: typo.lineHeight,
        fontWeight: typo.fontWeight,
        color: role.content.medium,
      }}
    >
      {children}
    </Text>
  );
}

/* ============================================================================
 * Default — single mid-state Progress at default size.
 * ========================================================================= */
export function ProgressDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Progress value={50} aria-label='Progress at 50%' />
    </View>
  );
}

export function ProgressSizes(): React.ReactElement {
  return (
    <View style={column}>
      <View style={column}>
        <Label>Small (60%)</Label>
        <Progress size='small' value={60} aria-label='Small progress' />
      </View>
      <View style={column}>
        <Label>Medium (40%)</Label>
        <Progress size='medium' value={40} aria-label='Medium progress' />
      </View>
      <View style={column}>
        <Label>Large (80%)</Label>
        <Progress size='large' value={80} aria-label='Large progress' />
      </View>
    </View>
  );
}

export function ProgressIndeterminate(): React.ReactElement {
  return (
    <View style={column}>
      <Label>Indeterminate</Label>
      <Progress aria-label='Loading' />
    </View>
  );
}

export function ProgressBoundaries(): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        <View style={{ flex: 1 }}>
          <Progress size='medium' value={0} aria-label='Zero' />
        </View>
        <Label>0%</Label>
      </View>
      <View style={row}>
        <View style={{ flex: 1 }}>
          <Progress size='medium' value={100} aria-label='Full' />
        </View>
        <Label>100%</Label>
      </View>
    </View>
  );
}

/* ============================================================================
 * ValueRange — sweep across 0 / 25 / 50 / 75 / 100.
 * ========================================================================= */
export function ProgressValueRange(): React.ReactElement {
  return (
    <View style={column}>
      {[0, 25, 50, 75, 100].map((value) => (
        <View key={value} style={row}>
          <View style={{ flex: 1 }}>
            <Progress size='medium' value={value} aria-label={`${value}%`} />
          </View>
          <Label>{value}%</Label>
        </View>
      ))}
    </View>
  );
}

/* ============================================================================
 * SurfaceContext — every surface mode contains the same Progress matrix so
 * the engine's [data-surface] cascade is exercised.
 * ========================================================================= */
const SURFACE_MODES = [
  { mode: 'default' as const, label: 'default' },
  { mode: 'minimal' as const, label: 'minimal' },
  { mode: 'subtle' as const, label: 'subtle' },
  { mode: 'moderate' as const, label: 'moderate' },
  { mode: 'bold' as const, label: 'bold' },
  { mode: 'elevated' as const, label: 'elevated' },
];

const surfaceCell: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.l,
};

export function ProgressSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      {SURFACE_MODES.map(({ mode, label }) => (
        <View key={mode} style={{ flexDirection: 'column', gap: tokens.spacing['3'] }}>
          <Label>{label}</Label>
          <Surface mode={mode} style={surfaceCell}>
            <Progress size='small' value={30} aria-label={`${label} 30%`} />
            <Progress size='medium' value={60} aria-label={`${label} 60%`} />
            <Progress size='large' value={90} aria-label={`${label} 90%`} />
          </Surface>
        </View>
      ))}
    </View>
  );
}
