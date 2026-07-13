import type { ComponentMeta } from '@oneui/shared';
import { applyMetaDefaultProps } from './scenarioProps';

/**
 * Curated default props for catalog card thumbnails.
 * Scenario matrix first rows often omit `children` or use low-contrast variants.
 */
export function getCatalogThumbDefaults(meta: ComponentMeta): Record<string, unknown> | null {
  switch (meta.slug) {
    case 'chip':
      return applyMetaDefaultProps(meta, {
        children: 'Chip',
        variant: 'subtle',
        attention: 'medium',
        size: 'm',
        appearance: 'secondary',
        defaultSelected: true,
        'aria-label': 'Chip',
      });
    case 'selectable-button':
      return applyMetaDefaultProps(meta, {
        children: 'Button',
        attention: 'high',
        size: 'm',
        appearance: 'primary',
        contained: true,
        selected: true,
        'aria-label': 'Selectable button',
      });
    case 'selectable-single-text-button':
      return applyMetaDefaultProps(meta, {
        children: 'Ag',
        attention: 'high',
        size: 'm',
        appearance: 'primary',
        selected: true,
        'aria-label': 'Ag',
      });
    case 'divider':
      return applyMetaDefaultProps(meta, {
        orientation: 'horizontal',
        size: 'm',
        attention: 'medium',
        appearance: 'neutral',
      });
    case 'slider':
      return applyMetaDefaultProps(meta, {
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        showTooltip: 'false',
        appearance: 'primary',
        knobStyle: 'outside',
        orientation: 'horizontal',
      });
    case 'touch-slider':
      return applyMetaDefaultProps(meta, {
        defaultValue: 40,
        min: 0,
        max: 100,
        step: 1,
        progressStyle: 'rounded',
        appearance: 'primary',
        orientation: 'horizontal',
      });
    case 'radio-field':
      return applyMetaDefaultProps(meta, {
        name: 'qa-catalog-radio-field',
        label: 'Default Radio',
        appearance: 'primary',
        size: 'm',
      });
    case 'segmented-control':
      return applyMetaDefaultProps(meta, {
        size: 'm',
        attention: 'high',
        appearance: 'primary',
        shape: 'pill',
        type: 'text',
        trackEmphasis: 'medium',
        equalWidth: false,
      });
    case 'select':
      return applyMetaDefaultProps(meta, {
        trigger: 'selectableInput',
        menu: 'singleSelect',
        size: 'm',
        appearance: 'primary',
        label: 'Label',
        placeholder: 'Select',
        defaultValue: 'opt-1',
        options: [
          { value: 'opt-1', label: 'Option 1' },
          { value: 'opt-2', label: 'Option 2' },
        ],
        'aria-label': 'Select',
      });
    case 'input-feedback':
      return applyMetaDefaultProps(meta, {
        variant: 'negative',
        attention: 'low',
        size: 'm',
        feedback_message: 'Invalid entry.',
      });
    default:
      return null;
  }
}
