/**
 * SurfaceTokensScreen.tsx
 *
 * Tile grid of the 7 surface tokens × interaction states (idle / hover /
 * pressed) for the active appearance. Hover / pressed states are read from
 * `useSurfaceTokens(...).states`. The matrix mirrors what
 * `apps/v4-sample/src/pages/SurfaceTokensPage.tsx` shows on web.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { SURFACE_TOKENS } from '../tokens';
import { usePageContext } from '../PageContext';

export function SurfaceTokensScreen(): React.ReactElement {
  const { appearance } = usePageContext();
  const roles = useSurfaceTokens(appearance);
  const neutral = useSurfaceTokens('neutral');

  return (
    <ScreenScaffold
      title='Surface tokens'
      description={`7 surface tokens × idle / hover / pressed for ${appearance}.`}
    >
      <Section
        title='Idle surfaces'
        description='Pure surface fills — useSurfaceTokens(role).surfaces[mode].'
      >
        <View style={styles.grid}>
          {SURFACE_TOKENS.map((surface) => (
            <SurfaceCell
              key={surface}
              label={surface}
              fill={roles.surfaces[surface]}
              hex={roles.surfaces[surface]}
            />
          ))}
        </View>
      </Section>

      <Section
        title='Interaction states'
        description='`states.{hover,pressed}` resolve against the role’s saturated step. Bold/Subtle variants for the surface-mode-specific overlays.'
      >
        <View style={styles.grid}>
          <SurfaceCell label='hover'         fill={roles.states.hover}         hex={roles.states.hover} />
          <SurfaceCell label='pressed'       fill={roles.states.pressed}       hex={roles.states.pressed} />
          <SurfaceCell label='boldHover'     fill={roles.states.boldHover}     hex={roles.states.boldHover} />
          <SurfaceCell label='boldPressed'   fill={roles.states.boldPressed}   hex={roles.states.boldPressed} />
          <SurfaceCell label='subtleHover'   fill={roles.states.subtleHover}   hex={roles.states.subtleHover} />
          <SurfaceCell label='subtlePressed' fill={roles.states.subtlePressed} hex={roles.states.subtlePressed} />
          <SurfaceCell
            label='strokeMedium'
            fill={neutral.surfaces.default}
            hex={roles.content.strokeMedium}
            border={roles.content.strokeMedium}
          />
        </View>
      </Section>
    </ScreenScaffold>
  );
}

interface SurfaceCellProps {
  label: string;
  fill: string;
  hex: string;
  border?: string;
}

function SurfaceCell({ label, fill, hex, border }: SurfaceCellProps): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  return (
    <View style={[styles.cell, { borderColor: neutral.content.strokeLow }]}>
      <View
        style={[
          styles.preview,
          {
            backgroundColor: fill,
            borderColor: border ?? neutral.content.strokeLow,
            borderWidth: border ? tokens.borderWidth.thin : tokens.borderWidth.hairline,
          },
        ]}
      />
      <Text
        style={{
          color: neutral.content.high,
          fontSize: typography.size.s,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: neutral.content.medium,
          fontSize: typography.size['2xs'],
        }}
      >
        {hex}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  cell: {
    width: 100,
    gap: tokens.spacing['2'],
    padding: tokens.spacing['2-5'],
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.s,
  },
  preview: {
    height: 64,
    borderRadius: tokens.shape.xs,
  },
});
