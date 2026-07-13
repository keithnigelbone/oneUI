/**
 * Duplicated from apps/storybook/src/stories/tools/componentRegistry.mantine.tsx
 * for the qa-playground Performance page. Keep in sync with the Storybook
 * original.
 *
 * Mantine perf entries — isolated chunk for dynamic import. Static CSS loads
 * only when this module is successfully imported.
 */

import '@mantine/core/styles.css';

import type { TestComponentEntry } from './componentRegistry.types';
import {
  Button as MantineButton,
  ActionIcon as MantineActionIcon,
  Badge as MantineBadge,
  Pill as MantinePill,
  TextInput as MantineTextInput,
  Checkbox as MantineCheckbox,
  Switch as MantineSwitch,
  Slider as MantineSlider,
  Loader as MantineLoader,
  Divider as MantineDivider,
  Avatar as MantineAvatar,
  Text as MantineText,
  RingProgress as MantineRingProgress,
  Indicator as MantineIndicator,
} from '@mantine/core';

export const MANTINE_COMPONENTS: TestComponentEntry[] = [
  {
    id: 'mantine:button',
    familyKey: 'button',
    label: 'Mantine Button',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineButton key={i} variant="filled">{`Btn ${i}·${tick}`}</MantineButton>
    ),
  },
  {
    id: 'mantine:icon-button',
    familyKey: 'icon-button',
    label: 'Mantine ActionIcon',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineActionIcon key={`${i}-${tick}`} variant="filled" aria-label={`ib-${i}`}>
        ♥
      </MantineActionIcon>
    ),
  },
  {
    id: 'mantine:badge',
    familyKey: 'badge',
    label: 'Mantine Badge',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineBadge key={i} color="blue">{`B ${i}·${tick}`}</MantineBadge>
    ),
  },
  {
    id: 'mantine:chip',
    familyKey: 'chip',
    label: 'Mantine Pill',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantinePill key={i}>{`Chip ${i}·${tick}`}</MantinePill>
    ),
  },
  {
    id: 'mantine:input',
    familyKey: 'input',
    label: 'Mantine TextInput',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineTextInput
        key={i}
        value={`v${i}-${tick}`}
        placeholder="placeholder"
        onChange={() => {}}
        aria-label={`input-${i}`}
      />
    ),
  },
  {
    id: 'mantine:checkbox',
    familyKey: 'checkbox',
    label: 'Mantine Checkbox',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineCheckbox
        key={i}
        checked={tick % 2 === 0}
        onChange={() => {}}
        label={`Opt ${i}·${tick}`}
      />
    ),
  },
  {
    id: 'mantine:switch',
    familyKey: 'switch',
    label: 'Mantine Switch',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineSwitch
        key={i}
        checked={tick % 2 === 0}
        onChange={() => {}}
        aria-label={`sw-${i}`}
      />
    ),
  },
  {
    id: 'mantine:slider',
    familyKey: 'slider',
    label: 'Mantine Slider',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineSlider
        key={i}
        value={(tick * 7 + i) % 100}
        onChange={() => {}}
        label={null}
        style={{ width: 120 }}
      />
    ),
  },
  {
    id: 'mantine:spinner',
    familyKey: 'spinner',
    label: 'Mantine Loader',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineLoader key={`${i}-${tick}`} size="sm" />
    ),
  },
  {
    id: 'mantine:divider',
    familyKey: 'divider',
    label: 'Mantine Divider',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineDivider key={`${i}-${tick}`} style={{ width: 80 }} />
    ),
  },
  {
    id: 'mantine:avatar',
    familyKey: 'avatar',
    label: 'Mantine Avatar',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineAvatar key={i} color="blue">{`U${(i + tick) % 10}`}</MantineAvatar>
    ),
  },
  {
    id: 'mantine:text',
    familyKey: 'text',
    label: 'Mantine Text',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineText key={i} size="md">{`Text ${i}·${tick}`}</MantineText>
    ),
  },
  {
    id: 'mantine:circular-progress-indicator',
    familyKey: 'circular-progress-indicator',
    label: 'Mantine RingProgress',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineRingProgress
        key={`${i}-${tick}`}
        size={48}
        thickness={4}
        sections={[{ value: (tick * 3 + i) % 100, color: 'blue' }]}
      />
    ),
  },
  {
    id: 'mantine:indicator-badge',
    familyKey: 'indicator-badge',
    label: 'Mantine Indicator',
    library: 'mantine',
    renderInstance: (i, tick) => (
      <MantineIndicator
        key={`${i}-${tick}`}
        color="red"
        size={8}
        aria-label={`ind-${i}`}
      >
        <span style={{ display: 'inline-block', width: 16, height: 16 }} />
      </MantineIndicator>
    ),
  },
];
