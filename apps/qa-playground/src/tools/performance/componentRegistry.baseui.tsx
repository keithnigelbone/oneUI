/**
 * Duplicated from apps/storybook/src/stories/tools/componentRegistry.baseui.tsx
 * for the qa-playground Performance page. Keep in sync with the Storybook
 * original.
 *
 * Base UI perf floor entries — dynamic chunk so missing `@base-ui/react`
 * never breaks the playground when devs have incomplete installs.
 */

import type { TestComponentEntry } from './componentRegistry.types';
import { Button as BaseButton } from '@base-ui/react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { Input as BaseInput } from '@base-ui/react/input';

export const BASEUI_COMPONENTS: TestComponentEntry[] = [
  {
    id: 'baseui:button',
    familyKey: 'button',
    label: 'Base UI Button',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseButton key={i}>{`Btn ${i}·${tick}`}</BaseButton>
    ),
  },
  {
    id: 'baseui:checkbox',
    familyKey: 'checkbox',
    label: 'Base UI Checkbox',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseCheckbox.Root key={i} checked={tick % 2 === 0} onCheckedChange={() => {}}>
        <BaseCheckbox.Indicator />
      </BaseCheckbox.Root>
    ),
  },
  {
    id: 'baseui:switch',
    familyKey: 'switch',
    label: 'Base UI Switch',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseSwitch.Root key={i} checked={tick % 2 === 0} onCheckedChange={() => {}}>
        <BaseSwitch.Thumb />
      </BaseSwitch.Root>
    ),
  },
  {
    id: 'baseui:slider',
    familyKey: 'slider',
    label: 'Base UI Slider',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseSlider.Root
        key={i}
        value={(tick * 7 + i) % 100}
        onValueChange={() => {}}
      >
        <BaseSlider.Control>
          <BaseSlider.Track>
            <BaseSlider.Indicator />
            <BaseSlider.Thumb />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    ),
  },
  {
    id: 'baseui:toggle',
    familyKey: 'toggle',
    label: 'Base UI Toggle',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseToggle
        key={i}
        pressed={tick % 2 === 0}
        onPressedChange={() => {}}
        aria-label={`tg-${i}`}
      >
        {`T${i}`}
      </BaseToggle>
    ),
  },
  {
    id: 'baseui:separator',
    familyKey: 'divider',
    label: 'Base UI Separator',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseSeparator key={`${i}-${tick}`} orientation="horizontal" />
    ),
  },
  {
    id: 'baseui:avatar',
    familyKey: 'avatar',
    label: 'Base UI Avatar',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseAvatar.Root key={i}>
        <BaseAvatar.Fallback>{`U${(i + tick) % 10}`}</BaseAvatar.Fallback>
      </BaseAvatar.Root>
    ),
  },
  {
    id: 'baseui:input',
    familyKey: 'input',
    label: 'Base UI Input',
    library: 'baseui',
    renderInstance: (i, tick) => (
      <BaseInput
        key={i}
        value={`v${i}-${tick}`}
        onChange={() => {}}
        aria-label={`input-${i}`}
        placeholder="placeholder"
      />
    ),
  },
];
