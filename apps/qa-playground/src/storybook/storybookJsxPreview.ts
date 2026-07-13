import type { ComponentMeta } from '@oneui/shared';
import { stripQaInternalProps } from '@/lib/qa/formatProps';

function formatJsxPropValue(value: unknown): string | null {
  if (value === undefined) return null;
  if (value === false) return null;
  if (typeof value === 'string') return `${JSON.stringify(value)}`;
  if (typeof value === 'number' || typeof value === 'boolean') return `{${String(value)}}`;
  return `{${JSON.stringify(value)}}`;
}

function buildPropLines(props: Record<string, unknown>): string[] {
  return Object.keys(props)
    .sort()
    .map((key) => {
      const formatted = formatJsxPropValue(props[key]);
      if (formatted == null) return null;
      return `  ${key}=${formatted}`;
    })
    .filter((line): line is string => line != null);
}

export function buildStorybookJsxPreview(
  meta: ComponentMeta,
  props: Record<string, unknown>,
): string {
  const clean = stripQaInternalProps(props);
  const lines = buildPropLines(clean);

  if (meta.slug === 'segmented-control') {
    const inner = [
      ...lines,
      '  aria-label="Segmented control"',
      '>',
      '  <SegmentedControl.Item value="opt1">Option 1</SegmentedControl.Item>',
      '  <SegmentedControl.Item value="opt2">Option 2</SegmentedControl.Item>',
      '  <SegmentedControl.Item value="opt3">Option 3</SegmentedControl.Item>',
      '</SegmentedControl>',
    ];
    return `<SegmentedControl\n${inner.join('\n')}`;
  }

  if (meta.slug === 'tabs') {
    const inner = [
      ...lines,
      '  defaultValue="one"',
      '>',
      '  <TabItem value="one">Tab</TabItem>',
      '  <TabItem value="two">Tab</TabItem>',
      '</TabGroup>',
    ];
    return `<TabGroup\n${inner.join('\n')}`;
  }

  if (meta.slug === 'chip-group') {
    const inner = [
      ...lines,
      '  defaultValue="one"',
      '>',
      '  <Chip value="one">One</Chip>',
      '  <Chip value="two">Two</Chip>',
      '</ChipGroup>',
    ];
    return `<ChipGroup\n${inner.join('\n')}`;
  }

  if (meta.slug === 'radio') {
    const inner = [
      ...lines,
      '  value="preview"',
      '  label="Label"',
      '/>',
    ];
    return `<Radio\n${inner.join('\n')}`;
  }

  if (meta.slug === 'radio-field') {
    const inner = [
      ...lines,
      '  name="example"',
      '  label="Default Radio"',
      '/>',
    ];
    return `<RadioField\n${inner.join('\n')}`;
  }

  if (meta.slug === 'bottom-navigation') {
    const inner = [
      ...lines,
      '  defaultValue="home"',
      '  aria-label="Navigation"',
      '>',
      '  <BottomNavItem value="home" icon="home" label="Home" />',
      '  <BottomNavItem value="browse" icon="search" label="Browse" />',
      '</BottomNavigation>',
    ];
    return `<BottomNavigation\n${inner.join('\n')}`;
  }

  const selfClosing = !meta.props.some((p) => p.name === 'children');
  if (selfClosing) {
    return `<${meta.name}\n${[...lines, '/>'].join('\n')}`;
  }

  const label =
    typeof clean.children === 'string'
      ? clean.children
      : meta.displayName.slice(0, 24);
  return `<${meta.name}\n${[...lines, `>${label}</${meta.name}>`].join('\n')}`;
}

export function buildStorybookJsonPreview(props: Record<string, unknown>): string {
  return JSON.stringify(stripQaInternalProps(props), null, 2);
}
