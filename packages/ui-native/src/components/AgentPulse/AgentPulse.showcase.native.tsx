/**
 * AgentPulse showcase (native)
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../Text';
import { Surface } from '../../theme';
import { AgentPulse } from './AgentPulse.native';
import { tokens } from '@oneui/tokens';
import type { AgentPulseState } from './interface';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';

export function AgentPulseStates(): React.ReactElement {
  return (
    <View style={{ padding: tokens.spacing['4'], gap: tokens.spacing['4'] }}>
      {(['idle', 'listening', 'thinking', 'speaking'] as AgentPulseState[]).map((state) => (
        <View
          key={state}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <AgentPulse state={state} size="md" />
          <Text variant="body" size="S">
            {state}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AgentPulseSizes(): React.ReactElement {
  return (
    <View
      style={{
        padding: tokens.spacing['4'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing['4'],
      }}
    >
      <AgentPulse size="sm" />
      <AgentPulse size="md" />
      <AgentPulse size="lg" />
      <AgentPulse size="xl" />
    </View>
  );
}

export function AgentPulseAppearances(): React.ReactElement {
  return (
    <View style={{ padding: tokens.spacing['4'], gap: tokens.spacing['4'] }}>
      {COMPONENT_APPEARANCE_ROLES.map((appearance) => (
        <View
          key={appearance}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <AgentPulse appearance={appearance} />
          <Text variant="body" size="S">
            {appearance}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AgentPulseSurfaceContext(): React.ReactElement {
  return (
    <ScrollView style={{ padding: tokens.spacing['4'] }}>
      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        On default surface
      </Text>
      <View style={{ padding: tokens.spacing['4'], marginBottom: tokens.spacing['4'] }}>
        <AgentPulse state="thinking" />
      </View>

      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        On bold surface
      </Text>
      <Surface
        mode="bold"
        style={{ padding: tokens.spacing['4'], marginBottom: tokens.spacing['4'] }}
      >
        <AgentPulse state="thinking" />
      </Surface>

      <Text variant="label" size="S" style={{ marginBottom: tokens.spacing['2'] }}>
        On subtle surface
      </Text>
      <Surface mode="subtle" style={{ padding: tokens.spacing['4'] }}>
        <AgentPulse state="thinking" />
      </Surface>
    </ScrollView>
  );
}

export function AgentPulseTransitions(): React.ReactElement {
  const states: AgentPulseState[] = ['idle', 'listening', 'thinking', 'speaking'];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % states.length), 5000);
    return () => clearInterval(id);
  }, [states.length]);

  return (
    <View style={{ padding: tokens.spacing['4'], alignItems: 'center' }}>
      <AgentPulse state={states[index]} size="xl" />
      <Text variant="title" size="S" style={{ marginTop: tokens.spacing['4'] }}>
        Current state: {states[index]}
      </Text>
    </View>
  );
}

export function AgentPulseShowcase(): React.ReactElement {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Text variant="display" size="S" style={{ padding: tokens.spacing['4'] }}>
        AgentPulse
      </Text>

      <View style={{ padding: tokens.spacing['4'] }}>
        <Text variant="title" size="S">
          States
        </Text>
        <AgentPulseStates />
      </View>

      <View style={{ padding: tokens.spacing['4'] }}>
        <Text variant="title" size="S">
          Sizes
        </Text>
        <AgentPulseSizes />
      </View>

      <View style={{ padding: tokens.spacing['4'] }}>
        <Text variant="title" size="S">
          Appearances
        </Text>
        <AgentPulseAppearances />
      </View>

      <View style={{ padding: tokens.spacing['4'] }}>
        <Text variant="title" size="S">
          Surface Context
        </Text>
        <AgentPulseSurfaceContext />
      </View>

      <View style={{ padding: tokens.spacing['4'] }}>
        <Text variant="title" size="S">
          Transitions Loop
        </Text>
        <AgentPulseTransitions />
      </View>
    </ScrollView>
  );
}
