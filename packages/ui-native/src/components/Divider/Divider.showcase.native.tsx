/**
 * Divider.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Divider/Divider.stories.tsx` —
 * one section per web story (the `Interactive` play-function story is
 * intentionally web-only and skipped).
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import type { DividerContentAlign } from './interface';
import { Divider } from './Divider.native';
import { Surface, useSurfaceTokens } from '../../theme';
import Icon from '../Icon';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};

const labeledRow: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  width: '100%',
};

const verticalRow: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  gap: tokens.spacing['7'],
  width: '100%',
  height: tokens.spacing['18'],
  alignItems: 'stretch',
};

const verticalCell: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium as '500',
        color: role.content.medium,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
  );
}

/* ========================================
   1. Default
   ======================================== */
export function DividerDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Divider />
    </View>
  );
}

/* ========================================
   2. Orientations
   ======================================== */
export function DividerOrientations(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const captionStyle = {
    fontSize: typography.size.s,
    color: role.content.medium,
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: tokens.spacing['6'],
        alignItems: 'stretch',
        height: tokens.spacing['18'],
        width: '100%',
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[captionStyle, { marginBottom: tokens.spacing['3-5'] }]}>Horizontal</Text>
        <Divider orientation="horizontal" />
      </View>
      <Divider orientation="vertical" />
      <View style={{ justifyContent: 'center' }}>
        <Text style={captionStyle}>Vertical</Text>
      </View>
    </View>
  );
}

/* ========================================
   3. Sizes
   ======================================== */
export function DividerSizes(): React.ReactElement {
  return (
    <View style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View key={size} style={labeledRow}>
          <Label>{`size ${size}`}</Label>
          <Divider size={size} />
        </View>
      ))}
    </View>
  );
}

/* ========================================
   4. Attention Levels
   ======================================== */
/** Alias for sample apps that used the old export name. */
export const DividerAttentions = DividerAttentionLevels;

export function DividerAttentionLevels(): React.ReactElement {
  return (
    <View style={column}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <View key={attention} style={labeledRow}>
          <Label>{attention}</Label>
          <Divider attention={attention} />
        </View>
      ))}
    </View>
  );
}

/* ========================================
   5. With Icon
   ======================================== */
export function DividerWithIcon(): React.ReactElement {
  return (
    <View style={column}>
      {(['start', 'center', 'end'] as DividerContentAlign[]).map((align) => (
        <View key={align} style={labeledRow}>
          <Label>{align}</Label>
          <Divider contentAlign={align} attention="medium">
            <Icon icon={'star'} />
          </Divider>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   6. With Label
   ======================================== */
export function DividerWithLabel(): React.ReactElement {
  return (
    <View style={column}>
      {(['start', 'center', 'end'] as DividerContentAlign[]).map((align) => (
        <View key={align} style={labeledRow}>
          <Label>{align}</Label>
          <Divider contentAlign={align} attention="medium">
            Section
          </Divider>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   7. Round Caps
   ======================================== */
export function DividerRoundCaps(): React.ReactElement {
  return (
    <View style={column}>
      <View style={labeledRow}>
        <Label>sharp (default)</Label>
        <Divider size="l" attention="high" />
      </View>
      <View style={labeledRow}>
        <Label>round caps</Label>
        <Divider size="l" attention="high" roundCaps />
      </View>
      <View style={labeledRow}>
        <Label>round caps with label</Label>
        <Divider size="l" attention="high" roundCaps>
          Section
        </Divider>
      </View>
    </View>
  );
}

/* ========================================
   8. Surface Context
   ======================================== */
export function DividerSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      <View style={labeledRow}>
        <Label>Default surface</Label>
        <Divider attention="medium">
          Default
        </Divider>
      </View>
      <Surface mode="minimal" style={{ padding: tokens.spacing['5'] }}>
        <View style={{ gap: tokens.spacing['3-5'] }}>
          <Label>Minimal surface</Label>
          <Divider attention="medium">
            On Minimal
          </Divider>
        </View>
      </Surface>
      <Surface mode="subtle" style={{ padding: tokens.spacing['5'] }}>
        <View style={{ gap: tokens.spacing['3-5'] }}>
          <Label>Subtle surface</Label>
          <Divider attention="medium">
            On Subtle
          </Divider>
        </View>
      </Surface>
      <Surface mode="bold" style={{ padding: tokens.spacing['5'] }}>
        <View style={{ gap: tokens.spacing['3-5'] }}>
          <Label>Bold surface</Label>
          <Divider attention="medium">
            On Bold
          </Divider>
        </View>
      </Surface>
    </View>
  );
}

/* ========================================
   9. Vertical Sizes
   ======================================== */
export function DividerVerticalSizes(): React.ReactElement {
  return (
    <View style={verticalRow}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View key={size} style={verticalCell}>
          <Label>{size}</Label>
          <Divider orientation="vertical" size={size} />
        </View>
      ))}
    </View>
  );
}

/* ========================================
   10. Vertical Attention Levels
   ======================================== */
export function DividerVerticalAttentionLevels(): React.ReactElement {
  return (
    <View style={verticalRow}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <View key={attention} style={verticalCell}>
          <Label>{attention}</Label>
          <Divider orientation="vertical" attention={attention} />
        </View>
      ))}
    </View>
  );
}

/* ========================================
   11. Vertical With Icon
   ======================================== */
export function DividerVerticalWithIcon(): React.ReactElement {
  return (
    <View style={verticalRow}>
      {(['start', 'center', 'end'] as DividerContentAlign[]).map((align) => (
        <View key={align} style={verticalCell}>
          <Label>{align}</Label>
          <Divider orientation="vertical" contentAlign={align} attention="medium">
            <Icon icon={'star'} />
          </Divider>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   12. Vertical With Label
   ======================================== */
export function DividerVerticalWithLabel(): React.ReactElement {
  return (
    <View style={verticalRow}>
      {(['start', 'center', 'end'] as DividerContentAlign[]).map((align) => (
        <View key={align} style={verticalCell}>
          <Label>{align}</Label>
          <Divider orientation="vertical" contentAlign={align} attention="medium">
            OR
          </Divider>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   13. Vertical Inline Usage
   (web story name: VerticalInlineUsage)
   ======================================== */
export function DividerVertical(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const navText = {
    fontSize: typography.size.s,
    color: role.content.high,
  };
  const inlineRow: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['4'],
    height: tokens.spacing['7'],
  };

  return (
    <View style={column}>
      <View style={inlineRow}>
        <Text style={navText}>Home</Text>
        <Divider orientation="vertical" />
        <Text style={navText}>Products</Text>
        <Divider orientation="vertical" />
        <Text style={navText}>About</Text>
        <Divider orientation="vertical" />
        <Text style={navText}>Contact</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing['4-5'],
          height: tokens.spacing['9'],
        }}
      >
        <Text style={navText}>Section A</Text>
        <Divider orientation="vertical" attention="high" size="l" />
        <Text style={navText}>Section B</Text>
        <Divider orientation="vertical" attention="medium" />
        <Text style={navText}>Section C</Text>
      </View>
    </View>
  );
}

/* ========================================
   Native-only: Appearances matrix
   (no equivalent web story, retained for visual debugging)
   ======================================== */
export function DividerAppearances(): React.ReactElement {
  const appearances = [
    'neutral',
    'primary',
    'secondary',
    'sparkle',
    'positive',
    'negative',
    'warning',
    'informative',
  ] as const;
  return (
    <View style={column}>
      {appearances.map((appearance) => (
        <View key={appearance} style={labeledRow}>
          <Label>{appearance}</Label>
          <Divider appearance={appearance} attention="medium">
            <Icon icon={'star'} />
          </Divider>
        </View>
      ))}
    </View>
  );
}
