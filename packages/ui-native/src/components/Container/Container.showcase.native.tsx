/**
 * Container.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Container/Container.stories.tsx` —
 * one section per web story.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Container } from './Container.native';
import { useSurfaceTokens } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

function Box({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View
      style={{
        backgroundColor: role.surfaces.subtle,
        padding: tokens.spacing['4-5'],
        borderRadius: tokens.shape.s,
      }}
    >
      <Text style={{ color: role.content.tintedA11y, fontSize: typography.size.s }}>
        {children}
      </Text>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

/* ========================================
   1. Fluid
   ======================================== */
export function ContainerFluid(): React.ReactElement {
  return (
    <View style={column}>
      <Label>fluid (default — grows with screen)</Label>
      <Container variant='fluid'>
        <Box>
          Fluid — fills viewport, applies the platform grid margin. For apps,
          dashboards, software tools (no upper limit).
        </Box>
      </Container>
    </View>
  );
}

/* ========================================
   2. Fixed
   ======================================== */
export function ContainerFixed(): React.ReactElement {
  return (
    <View style={column}>
      <Label>fixed (capped at the platform max-width)</Label>
      <Container variant='fixed'>
        <Box>
          Fixed — capped at the platform max-width (e.g. 600 dp on RN; web caps
          at 1280 / 1440 by viewport).
        </Box>
      </Container>
    </View>
  );
}

/* ========================================
   3. FullBleed
   ======================================== */
export function ContainerFullBleed(): React.ReactElement {
  return (
    <View style={column}>
      <Label>full-bleed (edge-to-edge, no padding)</Label>
      <Container variant='full-bleed'>
        <Box>Full-bleed — no margin, no cap. For hero sections and media strips.</Box>
      </Container>
    </View>
  );
}

/* ========================================
   4. CustomMaxWidth
   ======================================== */
export function ContainerCustomMaxWidth(): React.ReactElement {
  return (
    <View style={column}>
      <Label>fixed with maxWidth = 320</Label>
      <Container variant='fixed' maxWidth={320}>
        <Box>maxWidth=320 dp</Box>
      </Container>
      <Label>fixed with maxWidth = &quot;480px&quot;</Label>
      <Container variant='fixed' maxWidth='480px'>
        <Box>maxWidth=480 px (parsed)</Box>
      </Container>
    </View>
  );
}

/* ========================================
   Native-only aggregator — kept for back-compat with existing
   sample-app imports that reference `ContainerVariants`.
   ======================================== */
export function ContainerVariants(): React.ReactElement {
  return (
    <View style={column}>
      <ContainerFluid />
      <ContainerFixed />
      <ContainerFullBleed />
    </View>
  );
}
