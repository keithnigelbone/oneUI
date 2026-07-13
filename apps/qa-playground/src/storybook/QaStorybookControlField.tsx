'use client';

import type { PropDescriptor } from '@oneui/shared';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Input } from '@oneui/ui/components/Input';
import styles from './qa-storybook.module.css';

const APPEARANCE_CHIP_PROPS = new Set(['appearance', 'variant']);

function isAppearanceLike(prop: PropDescriptor): boolean {
  return (
    APPEARANCE_CHIP_PROPS.has(prop.name) ||
    (prop.type === 'enum' && (prop.options?.length ?? 0) > 4 && prop.name.includes('appearance'))
  );
}

function resolveControlValue(prop: PropDescriptor, value: unknown): unknown {
  if (value !== undefined && value !== null) return value;
  if (prop.defaultValue !== undefined) return prop.defaultValue;
  return value;
}

export function QaStorybookControlField({
  prop,
  value,
  onChange,
}: {
  prop: PropDescriptor;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const controlValue = resolveControlValue(prop, value);

  if (prop.type === 'boolean') {
    return (
      <Checkbox
        checked={Boolean(controlValue)}
        onCheckedChange={(checked) => onChange(checked)}
        label={prop.name}
        data-testid={`qa-storybook-prop-${prop.name}`}
      />
    );
  }

  if (prop.type === 'number') {
    return (
      <Input
        size="m"
        value={controlValue == null ? '' : String(controlValue)}
        onChange={(next) => {
          const parsed = Number(next);
          onChange(Number.isFinite(parsed) ? parsed : next);
        }}
        aria-label={prop.name}
        data-testid={`qa-storybook-prop-${prop.name}`}
      />
    );
  }

  if (prop.type === 'string') {
    return (
      <Input
        size="m"
        value={typeof controlValue === 'string' ? controlValue : ''}
        onChange={(next) => onChange(next)}
        aria-label={prop.name}
        data-testid={`qa-storybook-prop-${prop.name}`}
      />
    );
  }

  if (prop.type === 'enum' && prop.options?.length) {
    const options = prop.options.map(String);

    if (isAppearanceLike(prop) || options.length > 4) {
      return (
        <div className={styles.chipRow} role="group" aria-label={prop.name}>
          {options.map((option) => (
            <SelectableButton
              key={option}
              size="s"
              appearance={prop.name === 'appearance' ? 'primary' : undefined}
              selected={String(controlValue) === option}
              onSelectedChange={(selected) => {
                if (selected) onChange(option);
              }}
              data-testid={`qa-storybook-prop-${prop.name}-${option}`}
            >
              {option}
            </SelectableButton>
          ))}
        </div>
      );
    }

    return (
      <RadioGroup
        value={controlValue == null ? undefined : String(controlValue)}
        onValueChange={(next) => onChange(next)}
        orientation="horizontal"
        size="s"
        aria-label={prop.name}
      >
        {options.map((option) => (
          <Radio key={option} value={option} label={option} />
        ))}
      </RadioGroup>
    );
  }

  return null;
}
