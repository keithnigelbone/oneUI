/**
 * ChipGroup.showcase.native.tsx — peer of ChipGroup.stories.tsx
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Chip } from '../Chip/Chip.native';
import { ChipGroup } from './ChipGroup.native';
import { useSurfaceTokens } from '../../theme';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        color: role.content.medium,
        fontWeight: typography.weight.medium,
      }}
    >
      {children}
    </Text>
  );
}

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>
  );
}

export function ChipGroupDefaultValueNormalization(): React.ReactElement {
  return (
    <View style={column}>
      <SectionLabel>Single-select defaultValue normalization</SectionLabel>
      <Caption>
        defaultValue={['a', 'b']} with multiple=false — only Alpha should render selected on load.
      </Caption>
      <ChipGroup aria-label="Normalized defaults" defaultValue={['a', 'b']}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>
    </View>
  );
}

export function ChipGroupDefault(): React.ReactElement {
  return (
    <ChipGroup aria-label="Category filter" size="m">
      <Chip value="all">All</Chip>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
    </ChipGroup>
  );
}

export function ChipGroupSingleSelect(): React.ReactElement {
  const [value, setValue] = useState<string[]>(['news']);
  return (
    <View style={column}>
      <SectionLabel>Controlled single-select</SectionLabel>
      <ChipGroup
        aria-label="Topics"
        value={value}
        onValueChange={setValue}
        appearance="secondary"
        variant="bold"
      >
        <Chip value="news">News</Chip>
        <Chip value="sport">Sport</Chip>
        <Chip value="tech">Tech</Chip>
      </ChipGroup>
    </View>
  );
}

export function ChipGroupMultiSelect(): React.ReactElement {
  return (
    <View style={column}>
      <SectionLabel>Multi-select</SectionLabel>
      <ChipGroup aria-label="Tags" multiple defaultValue={['news']} appearance="secondary">
        <Chip value="news">News</Chip>
        <Chip value="sport">Sport</Chip>
        <Chip value="tech">Tech</Chip>
        <Chip value="culture">Culture</Chip>
      </ChipGroup>
    </View>
  );
}

export function ChipGroupVariants(): React.ReactElement {
  const variants = ['bold', 'subtle', 'ghost'] as const;
  return (
    <View style={column}>
      {variants.map((variant) => (
        <View key={variant} style={column}>
          <SectionLabel>{variant}</SectionLabel>
          <ChipGroup aria-label={`${variant} chips`} variant={variant} defaultValue={['a']}>
            <Chip value="a">Alpha</Chip>
            <Chip value="b">Beta</Chip>
            <Chip value="c">Gamma</Chip>
          </ChipGroup>
        </View>
      ))}
    </View>
  );
}

export function ChipGroupVertical(): React.ReactElement {
  return (
    <ChipGroup aria-label="Vertical group" orientation="vertical" defaultValue={['news']}>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
    </ChipGroup>
  );
}

export function ChipGroupNoWrap(): React.ReactElement {
  return (
    <View style={{ maxWidth: tokens.spacing['32'] }}>
      <ChipGroup aria-label="Scroll row" wrap={false}>
        <Chip value="1">One</Chip>
        <Chip value="2">Two</Chip>
        <Chip value="3">Three</Chip>
        <Chip value="4">Four</Chip>
        <Chip value="5">Five</Chip>
        <Chip value="6">Six</Chip>
      </ChipGroup>
    </View>
  );
}

export function ChipGroupDisabled(): React.ReactElement {
  return (
    <ChipGroup aria-label="Disabled group" disabled defaultValue={['news']}>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
    </ChipGroup>
  );
}
