/**
 * componentRegistry.tsx
 *
 * Catalog of components that the perf harness can mount across libraries:
 * OneUI (this repo) is always registered; MUI, Mantine, Base UI, and Radix load from
 * optional dynamic chunks so incomplete `node_modules` never breaks Storybook. Each entry has optional
 * `familyKey` so the Storybook harness can group equivalents and suggest
 * cross-library selections.
 *
 * Each entry renders `renderInstance(i, tick)` for mount/update sweeps; `tick`
 * must drive visible output so update commits are real.
 */

import type { ReactNode } from 'react';

// ---- OneUI ----
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Badge } from '@oneui/ui/components/Badge';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Chip } from '@oneui/ui/components/Chip';
import { InputField } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Switch } from '@oneui/ui/components/Switch';
import { Toggle } from '@oneui/ui/components/Toggle';
import { Slider } from '@oneui/ui/components/Slider';
import { Progress } from '@oneui/ui/components/Progress';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Divider } from '@oneui/ui/components/Divider';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Text } from '@oneui/ui/components/Text';
import { Icon } from '@oneui/ui/components/Icon';
import { Surface } from '@oneui/ui/components/Surface';
import { Link } from '@oneui/ui/components/Link';
import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { SelectableIconButton } from '@oneui/ui/components/SelectableIconButton';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { Separator } from '@oneui/ui/components/Separator';
import { NumberField } from '@oneui/ui/components/NumberField';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import { Meter } from '@oneui/ui/components/Meter';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { IconContained } from '@oneui/ui/components/IconContained';
import { FAB } from '@oneui/ui/components/FAB';

export {
  PERF_LIBRARY_ORDER,
  LIBRARY_LABELS,
  type LibraryId,
  type TestComponentEntry,
} from './componentRegistry.types';
import type { LibraryId, TestComponentEntry } from './componentRegistry.types';
import { PERF_LIBRARY_ORDER } from './componentRegistry.types';

// Components intentionally skipped (OneUI):
//   - Tooltip / Popover / Dialog: require portal + open state; perf signal would
//     reflect portal overhead, not the component itself.
//   - Select: option arrays + open state complicate steady-state remount cost.
//   - Accordion / Tabs: composite APIs with required nested children; not a fair
//     single-component cost.
//   - Radio: requires RadioGroup wrapper; two-element-per-instance shape skews
//     N semantics. Drop until we add a "RadioGroup" entry that owns the wrapper.

const ONEUI_COMPONENTS: TestComponentEntry[] = [
  {
    id: 'button',
    familyKey: 'button',
    label: 'Button',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Button key={i} appearance="primary" variant="bold" size={10}>
        {`Btn ${i}·${tick}`}
      </Button>
    ),
  },
  {
    id: 'icon-button',
    familyKey: 'icon-button',
    label: 'IconButton',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <IconButton
        key={`${i}-${tick}`}
        appearance="primary"
        attention="high"
        icon="heart"
        aria-label={`ib-${i}`}
      />
    ),
  },
  {
    id: 'badge',
    familyKey: 'badge',
    label: 'Badge',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Badge key={i} appearance="primary">{`B ${i}·${tick}`}</Badge>
    ),
  },
  {
    id: 'counter-badge',
    familyKey: 'counter-badge',
    label: 'CounterBadge',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <CounterBadge key={i} appearance="primary" value={(i + tick) % 100} />
    ),
  },
  {
    id: 'chip',
    familyKey: 'chip',
    label: 'Chip',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Chip key={i} appearance="primary">{`Chip ${i}·${tick}`}</Chip>
    ),
  },
  {
    id: 'input',
    familyKey: 'input',
    label: 'Input',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <InputField
        key={i}
        value={`v${i}-${tick}`}
        placeholder="placeholder"
        aria-label={`input-${i}`}
        onChange={() => {}}
      />
    ),
  },
  {
    id: 'checkbox',
    familyKey: 'checkbox',
    label: 'Checkbox',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Checkbox key={i} checked={tick % 2 === 0} onCheckedChange={() => {}}>
        {`Opt ${i}·${tick}`}
      </Checkbox>
    ),
  },
  {
    id: 'switch',
    familyKey: 'switch',
    label: 'Switch',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Switch
        key={i}
        checked={tick % 2 === 0}
        onCheckedChange={() => {}}
        aria-label={`sw-${i}`}
      />
    ),
  },
  {
    id: 'toggle',
    familyKey: 'toggle',
    label: 'Toggle',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Toggle
        key={i}
        pressed={tick % 2 === 0}
        onPressedChange={() => {}}
        aria-label={`tg-${i}`}
      >
        {`T${i}`}
      </Toggle>
    ),
  },
  {
    id: 'slider',
    familyKey: 'slider',
    label: 'Slider',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Slider
        key={i}
        value={(tick * 7 + i) % 100}
        onValueChange={() => {}}
        aria-label={`s-${i}`}
      />
    ),
  },
  {
    id: 'progress',
    familyKey: 'progress',
    label: 'Progress',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Progress key={i} value={(tick * 3 + i) % 100} aria-label={`p-${i}`} />
    ),
  },
  {
    id: 'spinner',
    familyKey: 'spinner',
    label: 'Spinner',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Spinner key={`${i}-${tick}`} size="M" />
    ),
  },
  {
    id: 'divider',
    familyKey: 'divider',
    label: 'Divider',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Divider key={`${i}-${tick}`} />
    ),
  },
  {
    id: 'avatar',
    familyKey: 'avatar',
    label: 'Avatar',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Avatar
        key={i}
        content="text"
        alt={`U${i}-${tick}`}
        appearance="primary"
      />
    ),
  },
  {
    id: 'text',
    familyKey: 'text',
    label: 'Text',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Text key={i} variant="body" size="M">{`Text ${i}·${tick}`}</Text>
    ),
  },
  {
    id: 'icon',
    familyKey: 'icon',
    label: 'Icon',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Icon key={`${i}-${tick}`} icon="heart" aria-hidden />
    ),
  },
  {
    id: 'link',
    familyKey: 'anchor',
    label: 'Link',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Link key={i} href="#">{`Link ${i}·${tick}`}</Link>
    ),
  },
  {
    id: 'single-text-button',
    familyKey: 'single-text-button',
    label: 'SingleTextButton',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <SingleTextButton key={i} attention="high">{String((i + tick) % 99).slice(0, 2)}</SingleTextButton>
    ),
  },
  {
    id: 'selectable-button',
    familyKey: 'selectable-button',
    label: 'SelectableButton',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <SelectableButton key={i} selected={tick % 2 === 0} onSelectedChange={() => {}}>
        {`Sel ${i}·${tick}`}
      </SelectableButton>
    ),
  },
  {
    id: 'selectable-icon-button',
    familyKey: 'selectable-icon-button',
    label: 'SelectableIconButton',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <SelectableIconButton
        key={`${i}-${tick}`}
        icon="heart"
        selected={tick % 2 === 0}
        onSelectedChange={() => {}}
        aria-label={`sib-${i}`}
      />
    ),
  },
  {
    id: 'segmented-control',
    familyKey: 'segmented-control',
    label: 'SegmentedControl',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <SegmentedControl
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
        aria-label={`seg-${i}`}
      >
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>
    ),
  },
  {
    id: 'separator',
    familyKey: 'separator',
    label: 'Separator',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Separator key={`${i}-${tick}`} orientation="horizontal" />
    ),
  },
  {
    id: 'number-field',
    familyKey: 'number-field',
    label: 'NumberField',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <NumberField
        key={i}
        label="N"
        value={((i + tick) % 900) + 1}
        onValueChange={() => {}}
        size="small"
      />
    ),
  },
  {
    id: 'circular-progress-indicator',
    familyKey: 'circular-progress-indicator',
    label: 'CircularProgressIndicator',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <CircularProgressIndicator
        key={`${i}-${tick}`}
        value={(tick * 3 + i) % 100}
        variant="determinate"
        size="M"
        aria-label={`cpi-${i}`}
      />
    ),
  },
  {
    id: 'meter',
    familyKey: 'meter',
    label: 'Meter',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Meter key={i} value={(tick * 3 + i) % 100} aria-label={`m-${i}`} size="small" />
    ),
  },
  {
    id: 'indicator-badge',
    familyKey: 'indicator-badge',
    label: 'IndicatorBadge',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <IndicatorBadge key={`${i}-${tick}`} appearance="negative" aria-label={`ind-${i}`} />
    ),
  },
  {
    id: 'icon-contained',
    familyKey: 'icon-contained',
    label: 'IconContained',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <IconContained key={`${i}-${tick}`} icon="check" attention="high" aria-label={`ic-${i}`} />
    ),
  },
  {
    id: 'fab',
    familyKey: 'fab',
    label: 'FAB',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <FAB key={`${i}-${tick}`} icon="add" aria-label={`fab-${i}`} label={tick % 2 === 0 ? 'A' : 'B'} />
    ),
  },
  {
    id: 'surface-empty',
    familyKey: 'surface',
    label: 'Surface (empty)',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Surface
        key={i}
        mode="subtle"
        style={{ padding: 'var(--Spacing-2)', minWidth: 32 }}
      >
        {`S ${i}·${tick}`}
      </Surface>
    ),
  },
];

const CORE_TEST_COMPONENTS: TestComponentEntry[] = [...ONEUI_COMPONENTS];

let OPTIONAL_PERF_COMPONENTS: TestComponentEntry[] = [];

export function registerOptionalPerfComponents(entries: TestComponentEntry[]): void {
  OPTIONAL_PERF_COMPONENTS = entries;
}

export function getAllTestComponents(): TestComponentEntry[] {
  return [...CORE_TEST_COMPONENTS, ...OPTIONAL_PERF_COMPONENTS];
}

export function groupPerfPickerRows(
  entries: TestComponentEntry[],
): Array<{ rowKey: string; title: string; items: TestComponentEntry[] }> {
  const map = new Map<string, TestComponentEntry[]>();
  for (const e of entries) {
    const rowKey = e.familyKey ?? `__ungrouped:${e.id}`;
    const bucket = map.get(rowKey) ?? [];
    bucket.push(e);
    map.set(rowKey, bucket);
  }
  const rows = [...map.entries()].map(([rowKey, items]) => ({
    rowKey,
    title: rowKey.startsWith('__ungrouped:')
      ? items[0]?.label ?? rowKey
      : rowKey
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
    items: [...items].sort(
      (a, b) => PERF_LIBRARY_ORDER.indexOf(a.library) - PERF_LIBRARY_ORDER.indexOf(b.library),
    ),
  }));
  rows.sort((a, b) => a.title.localeCompare(b.title));
  return rows;
}

export function collectEquivalentCandidateIds(
  selectedIds: readonly string[],
  enabledLibraries: ReadonlySet<LibraryId>,
): string[] {
  const selected = new Set(selectedIds);
  const out = new Set<string>();
  for (const id of selectedIds) {
    const self = getAllTestComponents().find((c) => c.id === id);
    if (!self?.familyKey) continue;
    for (const c of getAllTestComponents()) {
      if (
        c.familyKey === self.familyKey &&
        !selected.has(c.id) &&
        enabledLibraries.has(c.library)
      ) {
        out.add(c.id);
      }
    }
  }
  return [...out];
}

export function getComponentById(id: string): TestComponentEntry {
  const all = getAllTestComponents();
  return all.find((c) => c.id === id) ?? CORE_TEST_COMPONENTS[0];
}
