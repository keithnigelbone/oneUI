/**
 * InteractionStatesScreen.tsx
 *
 * Side-by-side preview of idle / hover / pressed for the active role on
 * both the bold and subtle surface modes. RN doesn't expose hover, so
 * "hover" cards render the resolved hover token statically next to the
 * idle baseline. Pressed states are wired to a real `Pressable` for live
 * preview.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { usePageContext } from '../PageContext';

export function InteractionStatesScreen(): React.ReactElement {
  const { appearance } = usePageContext();
  const roles = useSurfaceTokens(appearance);
  const neutral = useSurfaceTokens('neutral');

  return (
    <ScreenScaffold
      title='Interaction states'
      description={`Idle / hover / pressed for ${appearance}. Native has no hover, so hover swatches show the resolved colour for parity with web. Press the live tile to preview the pressed state.`}
    >
      <Section title='Bold surface stack'>
        <View style={styles.row}>
          <Tile label='idle'          fill={roles.surfaces.bold}         text={roles.onBoldContent.high} />
          <Tile label='hover'         fill={roles.states.boldHover}      text={roles.onBoldContent.high} />
          <Tile label='pressed'       fill={roles.states.boldPressed}    text={roles.onBoldContent.high} />
          <LiveTile labelIdle='live · idle' fillIdle={roles.surfaces.bold} fillPressed={roles.states.boldPressed} text={roles.onBoldContent.high} />
        </View>
      </Section>
      <Section title='Subtle surface stack'>
        <View style={styles.row}>
          <Tile label='idle'    fill={roles.surfaces.subtle}      text={roles.onSubtleContent.high} />
          <Tile label='hover'   fill={roles.states.subtleHover}   text={roles.onSubtleContent.high} />
          <Tile label='pressed' fill={roles.states.subtlePressed} text={roles.onSubtleContent.high} />
        </View>
      </Section>
      <Section title='Generic role states'>
        <View style={styles.row}>
          <Tile label='hover'   fill={roles.states.hover}   text={neutral.content.high} />
          <Tile label='pressed' fill={roles.states.pressed} text={neutral.content.high} />
        </View>
      </Section>
    </ScreenScaffold>
  );
}

interface TileProps {
  label: string;
  fill: string;
  text: string;
}

function Tile({ label, fill, text }: TileProps): React.ReactElement {
  return (
    <View style={[styles.tile, { backgroundColor: fill }]}>
      <Text style={[styles.tileLabel, { color: text }]}>{label}</Text>
      <Text style={[styles.tileHex, { color: text }]}>{fill}</Text>
    </View>
  );
}

interface LiveTileProps {
  labelIdle: string;
  fillIdle: string;
  fillPressed: string;
  text: string;
}

function LiveTile({ labelIdle, fillIdle, fillPressed, text }: LiveTileProps): React.ReactElement {
  return (
    <Pressable accessibilityRole='button'>
      {({ pressed }) => (
        <View
          style={[
            styles.tile,
            { backgroundColor: pressed ? fillPressed : fillIdle },
          ]}
        >
          <Text style={[styles.tileLabel, { color: text }]}>
            {pressed ? 'pressed' : labelIdle}
          </Text>
          <Text style={[styles.tileHex, { color: text }]}>
            {pressed ? fillPressed : fillIdle}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  tile: {
    width: 132,
    height: 96,
    padding: tokens.spacing['3-5'],
    borderRadius: tokens.shape.m,
    justifyContent: 'space-between',
  },
  tileLabel: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.medium,
  },
  tileHex: {
    fontSize: typography.size['2xs'],
  },
});
