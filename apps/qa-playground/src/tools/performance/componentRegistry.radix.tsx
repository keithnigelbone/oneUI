/**
 * Duplicated from apps/storybook/src/stories/tools/componentRegistry.radix.tsx
 * for the qa-playground Performance page. Keep in sync with the Storybook
 * original.
 *
 * Radix perf entries — dynamic chunk so missing `@radix-ui/*` packages never
 * break the playground for devs with incomplete installs.
 */

import type { TestComponentEntry } from './componentRegistry.types';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixSlider from '@radix-ui/react-slider';
import * as RadixSeparator from '@radix-ui/react-separator';

const rx = {
  track: {
    position: 'relative' as const,
    height: 'var(--Spacing-XS)',
    borderRadius: 'var(--Shape-Pill)',
    background: 'var(--Primary-Subtle)',
    minWidth: 'var(--Spacing-5XL)',
  },
  thumb: {
    display: 'block' as const,
    width: 'var(--Spacing-M)',
    height: 'var(--Spacing-M)',
    borderRadius: 'var(--Shape-Pill)',
    background: 'var(--Primary-Bold)',
    boxShadow: 'var(--Elevation-1, none)',
  },
  box: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 'var(--Spacing-L)',
    height: 'var(--Spacing-L)',
    borderRadius: 'var(--Shape-3XS)',
    border: 'var(--Stroke-M) solid var(--Border-Subtle)',
    background: 'var(--Surface-Fill-Subtle)',
  },
};

export const RADIX_COMPONENTS: TestComponentEntry[] = [
  {
    id: 'radix:native-button',
    familyKey: 'button',
    label: 'HTML Button (token shell)',
    library: 'radix',
    renderInstance: (i, tick) => (
      <button
        key={i}
        type="button"
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          padding: 'var(--Spacing-4XS) var(--Spacing-3XS)',
          borderRadius: 'var(--Shape-Pill)',
          border: 'var(--Stroke-M) solid var(--Border-Subtle)',
          background: 'var(--Primary-Bold)',
          color: 'var(--Primary-Bold-High)',
        }}
      >
        {`Btn ${i}·${tick}`}
      </button>
    ),
  },
  {
    id: 'radix:checkbox',
    familyKey: 'checkbox',
    label: 'Radix Checkbox',
    library: 'radix',
    renderInstance: (i, tick) => (
      <RadixCheckbox.Root key={i} checked={tick % 2 === 0} style={rx.box}>
        <RadixCheckbox.Indicator style={{ color: 'var(--Primary-Bold)' }}>✓</RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    ),
  },
  {
    id: 'radix:switch',
    familyKey: 'switch',
    label: 'Radix Switch',
    library: 'radix',
    renderInstance: (i, tick) => (
      <RadixSwitch.Root key={i} checked={tick % 2 === 0} style={{ width: 'var(--Spacing-4XL)', height: 'var(--Spacing-M)' }}>
        <RadixSwitch.Thumb style={rx.thumb} />
      </RadixSwitch.Root>
    ),
  },
  {
    id: 'radix:slider',
    familyKey: 'slider',
    label: 'Radix Slider',
    library: 'radix',
    renderInstance: (i, tick) => {
      const v = (tick * 7 + i) % 100;
      return (
        <RadixSlider.Root
          key={i}
          value={[v]}
          max={100}
          onValueChange={() => {}}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: 'var(--Spacing-5XL)',
            height: 'var(--Spacing-L)',
            touchAction: 'none',
          }}
        >
          <RadixSlider.Track style={rx.track}>
            <RadixSlider.Range
              style={{
                position: 'absolute',
                height: '100%',
                borderRadius: 'var(--Shape-Pill)',
                background: 'var(--Primary-Moderate)',
              }}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb style={rx.thumb} aria-label={`rs-${i}`} />
        </RadixSlider.Root>
      );
    },
  },
  {
    id: 'radix:separator',
    familyKey: 'divider',
    label: 'Radix Separator',
    library: 'radix',
    renderInstance: (i, tick) => (
      <RadixSeparator.Root
        key={`${i}-${tick}`}
        orientation="horizontal"
        decorative
        style={{
          width: 'var(--Spacing-5XL)',
          height: 'var(--Stroke-M)',
          background: 'var(--Border-Subtle)',
        }}
      />
    ),
  },
];
