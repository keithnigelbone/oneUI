/**
 * Card showcase (native)
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../Text';
import { Button } from '../Button';
import { Surface } from '../../theme';
import { Card } from './Card.native';
import { tokens } from '@oneui/tokens';

const SampleContent = ({ title = 'Card title' }: { title?: string }) => (
  <>
    <Text variant="title" size="S">
      {title}
    </Text>
    <Text variant="body" size="S" attention="medium">
      Supporting copy that explains what this card groups. Geometry follows the brand's
      Cards theme family.
    </Text>
  </>
);

export function CardDefault(): React.ReactElement {
  return (
    <View style={{ padding: tokens.spacing['4'] }}>
      <Card>
        <SampleContent />
      </Card>
    </View>
  );
}

export function CardInteractive(): React.ReactElement {
  return (
    <View style={{ padding: tokens.spacing['4'] }}>
      <Card interactive onPress={() => console.log('Card pressed')}>
        <SampleContent title="Clickable card" />
      </Card>
    </View>
  );
}

export function CardSurfaceModes(): React.ReactElement {
  return (
    <ScrollView style={{ padding: tokens.spacing['4'] }}>
      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        Subtle tinted card
      </Text>
      <Card surface="subtle" appearance='primary' style={{ marginBottom: tokens.spacing['4'] }}>
        <SampleContent title="Subtle tinted card" />
      </Card>

      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        Elevated card
      </Text>
      <Card surface="elevated" style={{ marginBottom: tokens.spacing['4'] }}>
        <SampleContent title="Elevated card" />
      </Card>

      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        Bold brand card
      </Text>
      <Card surface="bold">
        <SampleContent title="Bold brand card" />
        <View style={{ flexDirection: 'row', gap: tokens.spacing['3'], marginTop: tokens.spacing['2'] }}>
          <Button variant="bold">Primary</Button>
          <Button variant="ghost">Secondary</Button>
        </View>
      </Card>
    </ScrollView>
  );
}

export function CardAppearances(): React.ReactElement {
  return (
    <View style={{ padding: tokens.spacing['4'] }}>
      <Card surface="subtle" appearance="secondary">
        <SampleContent title="Secondary-tinted card" />
      </Card>
    </View>
  );
}

export function CardNestedOnBold(): React.ReactElement {
  return (
    <Surface mode="bold" style={{ padding: tokens.spacing['5'] }}>
      <Card surface="elevated">
        <SampleContent title="Card on bold surface" />
      </Card>
    </Surface>
  );
}
