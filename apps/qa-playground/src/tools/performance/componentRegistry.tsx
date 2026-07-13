/**
 * componentRegistry.tsx
 *
 * Duplicated from apps/storybook/src/stories/tools/componentRegistry.tsx for
 * the qa-playground Performance page. Keep in sync with the Storybook
 * original.
 *
 * Catalog of components that the perf harness can mount across libraries:
 * OneUI (this repo) is always registered; MUI, Mantine, Base UI, and Radix
 * load from optional dynamic chunks so incomplete `node_modules` never break
 * the playground.
 *
 * Each entry renders `renderInstance(i, tick)` for mount/update sweeps; `tick`
 * must drive visible output so update commits are real.
 */

// ---- OneUI ----
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Badge } from '@oneui/ui/components/Badge';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Chip } from '@oneui/ui/components/Chip';
import { Input, InputField } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Switch } from '@oneui/ui/components/Switch';
import { Toggle } from '@oneui/ui/components/Toggle';
import { Slider } from '@oneui/ui/components/Slider';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Divider } from '@oneui/ui/components/Divider';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Text } from '@oneui/ui/components/Text';
import { Icon } from '@oneui/ui/components/Icon';
import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { SelectableIconButton } from '@oneui/ui/components/SelectableIconButton';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { IconContained } from '@oneui/ui/components/IconContained';
import { FAB } from '@oneui/ui/components/FAB';
import { AgentPulse } from '@oneui/ui/components/AgentPulse';
import { Container } from '@oneui/ui/components/Container';
import { CheckboxField } from '@oneui/ui/components/CheckboxField';
import { Image as OneUIImage } from '@oneui/ui/components/Image';
import { Logo } from '@oneui/ui/components/Logo';
import { Pagination } from '@oneui/ui/components/Pagination';
import { PaginationDots } from '@oneui/ui/components/PaginationDots';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { RadioField } from '@oneui/ui/components/RadioField';
import { Select } from '@oneui/ui/components/Select';
import { SelectableSingleTextButton } from '@oneui/ui/components/SelectableSingleTextButton';
import { Stepper } from '@oneui/ui/components/Stepper';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Toolbar } from '@oneui/ui/components/Toolbar';
import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import { Accordion } from '@oneui/ui/components/Accordion';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';

export {
  PERF_LIBRARY_ORDER,
  LIBRARY_LABELS,
  type LibraryId,
  type TestComponentEntry,
} from './componentRegistry.types';
import type { LibraryId, TestComponentEntry } from './componentRegistry.types';
import { PERF_LIBRARY_ORDER } from './componentRegistry.types';

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
      <Input
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
      <Checkbox
        key={i}
        checked={tick % 2 === 0}
        onCheckedChange={() => {}}
        label={`Opt ${i}·${tick}`}
      />
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
    id: 'agent-pulse',
    familyKey: 'agent-pulse',
    label: 'AgentPulse',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <AgentPulse
        key={`${i}-${tick}`}
        state={tick % 2 === 0 ? 'idle' : 'thinking'}
        size="md"
      />
    ),
  },
  {
    id: 'container',
    familyKey: 'container',
    label: 'Container',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Container key={i} surface="default">{`C ${i}·${tick}`}</Container>
    ),
  },
  {
    id: 'checkbox-field',
    familyKey: 'checkbox-field',
    label: 'CheckboxField',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <CheckboxField
        key={i}
        label={`Opt ${i}·${tick}`}
        checked={tick % 2 === 0}
        onCheckedChange={() => {}}
      />
    ),
  },
  {
    id: 'image',
    familyKey: 'image',
    label: 'Image',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <OneUIImage
        key={i}
        src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        alt={`img-${i}-${tick}`}
        aspectRatio="1:1"
      />
    ),
  },
  {
    id: 'logo',
    familyKey: 'logo',
    label: 'Logo',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Logo key={`${i}-${tick}`} variant="mark" size="m" alt="Logo" />
    ),
  },
  {
    id: 'pagination',
    familyKey: 'pagination',
    label: 'Pagination',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Pagination
        key={i}
        totalPages={10}
        page={((tick + i) % 10) + 1}
        onPageChange={() => {}}
        aria-label={`pg-${i}`}
      />
    ),
  },
  {
    id: 'pagination-dots',
    familyKey: 'pagination-dots',
    label: 'PaginationDots',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <PaginationDots
        key={i}
        count={5}
        activeIndex={(tick + i) % 5}
        onActiveIndexChange={() => {}}
        aria-label={`pd-${i}`}
      />
    ),
  },
  {
    id: 'radio',
    familyKey: 'radio',
    label: 'Radio',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <RadioGroup
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
        aria-label={`rg-${i}`}
      >
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>
    ),
  },
  {
    id: 'radio-field',
    familyKey: 'radio-field',
    label: 'RadioField',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <RadioField
        key={i}
        label={`Choice ${i}·${tick}`}
        name={`rf-${i}`}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
      >
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioField>
    ),
  },
  {
    id: 'select',
    familyKey: 'select',
    label: 'Select',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Select
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onChange={() => {}}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        size="sm"
        aria-label={`sel-${i}`}
      />
    ),
  },
  {
    id: 'selectable-single-text-button',
    familyKey: 'selectable-single-text-button',
    label: 'SelectableSingleTextButton',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <SelectableSingleTextButton
        key={i}
        selected={tick % 2 === 0}
        onSelectedChange={() => {}}
      >
        {String((i + tick) % 99).slice(0, 2)}
      </SelectableSingleTextButton>
    ),
  },
  {
    id: 'stepper',
    familyKey: 'stepper',
    label: 'Stepper',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Stepper
        key={i}
        value={(i + tick) % 10}
        onChange={() => {}}
        min={0}
        max={100}
        aria-label={`step-${i}`}
      />
    ),
  },
  {
    id: 'tabs',
    familyKey: 'tabs',
    label: 'Tabs',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <TabGroup
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
      >
        <TabItem value="a">A</TabItem>
        <TabItem value="b">B</TabItem>
      </TabGroup>
    ),
  },
  {
    id: 'toggle-group',
    familyKey: 'toggle-group',
    label: 'ToggleGroup',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <ToggleGroup
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
      >
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup>
    ),
  },
  {
    id: 'toolbar',
    familyKey: 'toolbar',
    label: 'Toolbar',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Toolbar key={i} aria-label={`tb-${i}`}>
        <Toolbar.Button>{`B${i}·${tick}`}</Toolbar.Button>
      </Toolbar>
    ),
  },
  {
    id: 'touch-slider',
    familyKey: 'touch-slider',
    label: 'TouchSlider',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <TouchSlider
        key={i}
        value={(tick * 7 + i) % 100}
        onValueChange={() => {}}
        aria-label={`ts-${i}`}
      />
    ),
  },
  {
    id: 'accordion',
    familyKey: 'accordion',
    label: 'Accordion',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <Accordion key={i} value={tick % 2 === 0 ? ['a'] : []} onValueChange={() => {}}>
        <Accordion.Item value="a">
          <Accordion.Trigger>{`Section ${i}·${tick}`}</Accordion.Trigger>
          <Accordion.Panel>Content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ),
  },
  {
    id: 'bottom-navigation',
    familyKey: 'bottom-navigation',
    label: 'BottomNavigation',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <BottomNavigation
        key={i}
        value={tick % 2 === 0 ? 'a' : 'b'}
        onValueChange={() => {}}
        aria-label={`bn-${i}`}
      >
        <BottomNavItem
          value="a"
          icon={<Icon icon="home" aria-hidden />}
          label="Home"
        />
        <BottomNavItem
          value="b"
          icon={<Icon icon="search" aria-hidden />}
          label="Search"
        />
      </BottomNavigation>
    ),
  },
  {
    id: 'chip-group',
    familyKey: 'chip-group',
    label: 'ChipGroup',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <ChipGroup
        key={i}
        value={tick % 2 === 0 ? ['a'] : ['b']}
        onValueChange={() => {}}
        aria-label={`cg-${i}`}
      >
        <Chip value="a" aria-label="A">A</Chip>
        <Chip value="b" aria-label="B">B</Chip>
      </ChipGroup>
    ),
  },
  {
    id: 'input-field',
    familyKey: 'input-field',
    label: 'InputField',
    library: 'oneui',
    renderInstance: (i, tick) => (
      <InputField
        key={i}
        label={`Field ${i}`}
        value={`v${i}-${tick}`}
        placeholder="placeholder"
        aria-label={`if-${i}`}
        onChange={() => {}}
      />
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
