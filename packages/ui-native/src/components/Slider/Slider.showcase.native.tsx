import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Slider } from './Slider.native';
import { Text } from '../Text';
import { Surface } from '../../theme';
import { Icon } from '../Icon';
import { tokens } from '@oneui/tokens';

export function SliderShowcase(): React.ReactElement {
  const [val1, setVal1] = useState(25);
  const [val2, setVal2] = useState([20, 80]);

  return (
    <ScrollView style={{ flex: 1, padding: tokens.spacing['4'] }}>
      <Text size="L" weight="high" style={{ marginBottom: tokens.spacing['4'] }}>
        Slider Showcase
      </Text>

      <Section title="Basic Slider">
        <Slider
          value={val1}
          onValueChange={(v) => setVal1(v as number)}
          aria-label="Basic slider"
        />
        <Text size="S">Value: {val1}</Text>
      </Section>

      <Section title="Range Slider">
        <Slider
          value={val2}
          onValueChange={(v) => setVal2(v as number[])}
          aria-label="Range slider"
          minStepsBetweenValues={20}
        />
        <Text size="S">Value: {val2.join(' - ')}</Text>
      </Section>

      <Section title="Sizes">
        <View style={{ gap: tokens.spacing['4'] }}>
          <Text size="S">Small (s)</Text>
          <Slider defaultValue={50} size="s" />
          <Text size="S">Medium (m - default)</Text>
          <Slider defaultValue={50} size="m" />
          <Text size="S">Large (l)</Text>
          <Slider defaultValue={50} size="l" />
        </View>
        <Text size="S">Knob Style Inside</Text>
        <View style={{ gap: tokens.spacing['4'] }}>
          <Text size="S">Small (s)</Text>
          <Slider knobStyle="inside" defaultValue={50} size="s" />
          <Text size="S">Medium (m - default)</Text>
          <Slider knobStyle="inside" defaultValue={50} size="m" />
          <Text size="S">Large (l)</Text>
          <Slider knobStyle="inside" defaultValue={50} size="l" />
        </View>
      </Section>

      <Section title="Knob Styles">
        <View style={{ gap: tokens.spacing['4'] }}>
          <Text size="S">Outside (default)</Text>
          <Slider defaultValue={50} knobStyle="outside" />
          <Text size="S">Inside</Text>
          <Slider defaultValue={50} knobStyle="inside" />
        </View>
      </Section>

      <Section title="Steps & Ticks">
        <View style={{ gap: tokens.spacing['8'] }}>
          <Slider size="s" defaultValue={40} step={5} showSteps snapToSteps />
          <Slider size="m" defaultValue={40} step={10} showSteps snapToSteps />
          <Slider size="l" defaultValue={40} step={20} showSteps snapToSteps />
        </View>
      </Section>

      <Section title="Orientation">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            height: 300,
            gap: tokens.spacing['10'],
          }}
        >
          <Slider defaultValue={30} orientation="vertical" />
          <Slider size='l' knobStyle="inside" defaultValue={50} orientation="vertical" />
          <Slider
            size="m"
            knobStyle="inside"
            defaultValue={40}
            step={20}
            showSteps
            snapToSteps
            orientation="vertical"
          />
          <Slider
            size="s"
            defaultValue={40}
            step={20}
            showSteps
            snapToSteps
            orientation="vertical"
          />
        </View>
      </Section>

      <Section title="Appearances">
        <View style={{ gap: tokens.spacing['4'] }}>
          <Slider defaultValue={20} appearance="primary" />
          <Slider defaultValue={30} appearance="secondary" />
          <Slider defaultValue={40} appearance="sparkle" />
          <Slider defaultValue={50} appearance="positive" />
          <Slider defaultValue={60} appearance="negative" />
        </View>
      </Section>

      <Section title="Slots (Start/End)">
        <Slider
          defaultValue={50}
          start={<Icon icon="volumeOff" size="5" />}
          end={<Icon icon="volumeOn" size="5" />}
        />
      </Section>

      <Section title="States">
        <View style={{ gap: tokens.spacing['4'] }}>
          <Text size="S">Disabled</Text>
          <Slider defaultValue={50} disabled />
          <Text size="S">Read Only</Text>
          <Slider defaultValue={50} readOnly />
        </View>
      </Section>

      <Section title="On Surfaces">
        <View style={{ gap: tokens.spacing['4'] }}>
          <Surface
            mode="default"
            appearance="primary"
            style={{ borderRadius: tokens.spacing['2'] }}
          >
            <View
              style={{
                padding: tokens.spacing['4'],
                gap: tokens.spacing['4'],
              }}
            >
              <Slider defaultValue={50} />
              <Slider knobStyle="inside" defaultValue={30} />
            </View>
          </Surface>
          <Surface
            mode="minimal"
            appearance="primary"
            style={{ borderRadius: tokens.spacing['2'] }}
          >
            <View
              style={{
                padding: tokens.spacing['4'],
                gap: tokens.spacing['4'],
              }}
            >
              <Slider defaultValue={50} />
              <Slider knobStyle="inside" defaultValue={30} />
            </View>
          </Surface>
          <Surface mode="subtle" appearance="primary" style={{ borderRadius: tokens.spacing['2'] }}>
            <View
              style={{
                padding: tokens.spacing['4'],
                gap: tokens.spacing['4'],
              }}
            >
              <Slider defaultValue={50} />
              <Slider knobStyle="inside" defaultValue={30} />
            </View>
          </Surface>
          <Surface mode="bold" appearance="primary" style={{ borderRadius: tokens.spacing['2'] }}>
            <View
              style={{
                padding: tokens.spacing['4'],
                gap: tokens.spacing['4'],
              }}
            >
              <Slider defaultValue={50} />
              <Slider knobStyle="inside" defaultValue={30} />
            </View>
          </Surface>
        </View>
      </Section>

      <View style={{ height: tokens.spacing['10'] }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: tokens.spacing['8'] }}>
      <Text size="M" weight="medium" style={{ marginBottom: tokens.spacing['2'] }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
