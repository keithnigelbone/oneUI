/**
 * Select.showcase.native.tsx
 *
 * Native gallery sections covering every Figma Select variant (3 triggers,
 * single / multi / actions menus, search, sections, directions, attention,
 * sizes, states, surface context). One exported function per story so the
 * sample app `ComponentDetailScreen` can dispatch them under `<Section>`.
 */

import React, { useState } from 'react';
import { Text as RNText, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens, typography } from '@oneui/tokens';
import { Select } from './Select.native';
import type { SelectOption, SelectSection, SelectSize } from './interface';
import { Surface, useSurfaceTokens } from '../../theme';

// ── layout helpers ───────────────────────────────────────────────────────────
const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};
const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['2-5'],
  width: '100%',
};
const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <RNText style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</RNText>
  );
}

function HeartGlyph(): React.ReactElement {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12 19 16.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── sample data ───────────────────────────────────────────────────────────────
const FRUITS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
];

const PEOPLE: SelectOption[] = [
  { value: 'ada', label: 'Ada Lovelace', secondaryText: 'Mathematician' },
  { value: 'alan', label: 'Alan Turing', secondaryText: 'Computer scientist' },
  { value: 'grace', label: 'Grace Hopper', secondaryText: 'Rear Admiral' },
];

const ACTIONS: SelectOption[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
];

const SECTIONS: SelectSection[] = [
  { id: 'citrus', label: 'Citrus' },
  { id: 'berry', label: 'Berries' },
];
const SECTIONED: SelectOption[] = [
  { value: 'orange', label: 'Orange', group: 'citrus' },
  { value: 'lemon', label: 'Lemon', group: 'citrus' },
  { value: 'straw', label: 'Strawberry', group: 'berry' },
  { value: 'blue', label: 'Blueberry', group: 'berry' },
];

// ── stories ───────────────────────────────────────────────────────────────────
export function SelectDefault(): React.ReactElement {
  const [value, setValue] = useState('apple');
  return (
    <View style={column}>
      <Select label="Fruit" options={FRUITS} value={value} onChange={setValue} />
    </View>
  );
}

export function SelectTriggers(): React.ReactElement {
  const [a, setA] = useState('apple');
  const [b, setB] = useState('banana');
  const [c, setC] = useState('cherry');
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>trigger = input</CaptionLabel>
        <Select label="Fruit" options={FRUITS} value={a} onChange={setA} />
      </View>
      <View style={column}>
        <CaptionLabel>trigger = button</CaptionLabel>
        <Select trigger="button" options={FRUITS} value={b} onChange={setB} aria-label="Fruit" />
      </View>
      <View style={column}>
        <CaptionLabel>trigger = iconButton (actions menu)</CaptionLabel>
        <Select
          trigger="iconButton"
          menu="actions"
          options={ACTIONS}
          triggerIcon={<HeartGlyph />}
          onAction={setC}
          aria-label="More actions"
        />
        <CaptionLabel>last action: {c}</CaptionLabel>
      </View>
    </View>
  );
}

export function SelectSingleVsMulti(): React.ReactElement {
  const [single, setSingle] = useState('apple');
  const [multi, setMulti] = useState<string[]>(['apple', 'cherry']);
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>single select</CaptionLabel>
        <Select label="Fruit" options={FRUITS} value={single} onChange={setSingle} />
      </View>
      <View style={column}>
        <CaptionLabel>multi select</CaptionLabel>
        <Select
          label="Fruits"
          menu="multi"
          options={FRUITS}
          values={multi}
          onValuesChange={setMulti}
        />
      </View>
    </View>
  );
}

export function SelectWithSecondaryText(): React.ReactElement {
  const [values, setValues] = useState<string[]>(['ada']);
  return (
    <View style={column}>
      <Select
        label="Assignees"
        menu="multi"
        options={PEOPLE}
        values={values}
        onValuesChange={setValues}
      />
    </View>
  );
}

export function SelectWithSections(): React.ReactElement {
  const [value, setValue] = useState('orange');
  return (
    <View style={column}>
      <Select
        label="Fruit"
        options={SECTIONED}
        sections={SECTIONS}
        value={value}
        onChange={setValue}
      />
    </View>
  );
}

export function SelectSearchable(): React.ReactElement {
  const [value, setValue] = useState('apple');
  return (
    <View style={column}>
      <Select label="Fruit" searchable options={FRUITS} value={value} onChange={setValue} />
    </View>
  );
}

export function SelectMenuDirections(): React.ReactElement {
  const [a, setA] = useState('apple');
  const [b, setB] = useState('apple');
  const [c, setC] = useState('apple');
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>below</CaptionLabel>
        <Select options={FRUITS} value={a} onChange={setA} aria-label="below" />
      </View>
      <View style={column}>
        <CaptionLabel>alignWithTrigger</CaptionLabel>
        <Select
          menuDirection="alignWithTrigger"
          options={FRUITS}
          value={b}
          onChange={setB}
          aria-label="align"
        />
      </View>
      <View style={column}>
        <CaptionLabel>above</CaptionLabel>
        <Select menuDirection="above" options={FRUITS} value={c} onChange={setC} aria-label="above" />
      </View>
    </View>
  );
}

export function SelectAttentionLevels(): React.ReactElement {
  const [v, setV] = useState('apple');
  return (
    <View style={row}>
      {(['low', 'medium', 'high'] as const).map((att) => (
        <Select
          key={att}
          trigger="button"
          attention={att}
          options={FRUITS}
          value={v}
          onChange={setV}
          aria-label={att}
        />
      ))}
    </View>
  );
}

export function SelectSizes(): React.ReactElement {
  const [v, setV] = useState('apple');
  return (
    <View style={stack}>
      {(['s', 'm', 'l'] as SelectSize[]).map((size) => (
        <View key={size} style={column}>
          <CaptionLabel>size = {size}</CaptionLabel>
          <Select label="Fruit" size={size} options={FRUITS} value={v} onChange={setV} />
        </View>
      ))}
    </View>
  );
}

export function SelectStates(): React.ReactElement {
  const [v, setV] = useState('apple');
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>disabled</CaptionLabel>
        <Select label="Fruit" disabled options={FRUITS} value={v} onChange={setV} />
      </View>
      <View style={column}>
        <CaptionLabel>required + helper</CaptionLabel>
        <Select
          label="Fruit"
          required
          helperText="Pick your favourite."
          options={FRUITS}
          value={v}
          onChange={setV}
        />
      </View>
      <View style={column}>
        <CaptionLabel>error + feedback</CaptionLabel>
        <Select
          label="Fruit"
          errorHighlight
          feedback="Selection is required."
          options={FRUITS}
          value={v}
          onChange={setV}
        />
      </View>
    </View>
  );
}

export function SelectSurfaceContext(): React.ReactElement {
  const [v, setV] = useState('apple');
  const modes = ['default', 'subtle', 'bold'] as const;
  return (
    <View style={stack}>
      {modes.map((mode) => (
        <View key={mode} style={column}>
          <CaptionLabel>surface = {mode}</CaptionLabel>
          <Surface mode={mode} appearance="primary" style={{ padding: tokens.spacing['4'], borderRadius: tokens.shape.l }}>
            <Select label="Fruit" options={FRUITS} value={v} onChange={setV} />
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function SelectControlled(): React.ReactElement {
  const [value, setValue] = useState('apple');
  return (
    <View style={column}>
      <Select label="Fruit" options={FRUITS} value={value} onChange={setValue} />
      <CaptionLabel>value: {value}</CaptionLabel>
    </View>
  );
}
