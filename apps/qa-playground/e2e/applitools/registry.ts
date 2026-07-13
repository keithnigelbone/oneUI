/**
 * Applitools visual scope for every QA playground component with a Playwright manifest.
 *
 * **Sync:** Each entry's `sections` must match `*_DATA_SECTIONS` (or badge section ids)
 * in `e2e/<slug>-playground/manifest.ts` — one Eyes checkpoint per `QaStoryBand` / `data-section`.
 */

import {
  AVATAR_DATA_SECTIONS,
  AVATAR_PLAYGROUND_ROUTE,
} from '../avatar-playground/manifest';
import { BADGE_DATA_SECTIONS, BADGE_PLAYGROUND_ROUTE } from '../badge-playground/manifest';
import {
  BOTTOM_NAV_DATA_SECTIONS,
  BOTTOM_NAV_PLAYGROUND_ROUTE,
} from '../bottom-navigation-playground/manifest';
import { BUTTON_DATA_SECTIONS, BUTTON_PLAYGROUND_ROUTE } from '../button-playground/manifest';
import {
  CHECKBOX_DATA_SECTIONS,
  CHECKBOX_PLAYGROUND_ROUTE,
} from '../checkbox-playground/manifest';
import {
  CHECKBOX_FIELD_DATA_SECTIONS,
  CHECKBOX_FIELD_PLAYGROUND_ROUTE,
} from '../checkbox-field-playground/manifest';
import { CHIP_DATA_SECTIONS, CHIP_PLAYGROUND_ROUTE } from '../chip-playground/manifest';
import {
  CHIP_GROUP_DATA_SECTIONS,
  CHIP_GROUP_PLAYGROUND_ROUTE,
} from '../chip-group-playground/manifest';
import {
  CPI_DATA_SECTIONS,
  CPI_PLAYGROUND_ROUTE,
} from '../circular-progress-indicator-playground/manifest';
import {
  COUNTER_BADGE_DATA_SECTIONS,
  COUNTER_BADGE_PLAYGROUND_ROUTE,
} from '../counter-badge-playground/manifest';
import { DIVIDER_DATA_SECTIONS, DIVIDER_PLAYGROUND_ROUTE } from '../divider-playground/manifest';
import { ICON_DATA_SECTIONS, ICON_PLAYGROUND_ROUTE } from '../icon-playground/manifest';
import {
  ICON_BUTTON_DATA_SECTIONS,
  ICON_BUTTON_PLAYGROUND_ROUTE,
} from '../icon-button-playground/manifest';
import {
  ICON_CONTAINED_DATA_SECTIONS,
  ICON_CONTAINED_PLAYGROUND_ROUTE,
} from '../icon-contained-playground/manifest';
import { IMAGE_DATA_SECTIONS, IMAGE_PLAYGROUND_ROUTE } from '../image-playground/manifest';
import {
  INDICATOR_BADGE_DATA_SECTIONS,
  INDICATOR_BADGE_PLAYGROUND_ROUTE,
} from '../indicator-badge-playground/manifest';
import { INPUT_DATA_SECTIONS, INPUT_PLAYGROUND_ROUTE } from '../input-playground/manifest';
import {
  IDT_DATA_SECTIONS,
  INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE,
} from '../input-dynamic-text-playground/manifest';
import {
  IFB_DATA_SECTIONS,
  INPUT_FEEDBACK_PLAYGROUND_ROUTE,
} from '../input-feedback-playground/manifest';
import {
  IFF_DATA_SECTIONS,
  INPUT_FIELD_PLAYGROUND_ROUTE,
} from '../input-field-playground/manifest';
import { MODAL_DATA_SECTIONS, MODAL_PLAYGROUND_ROUTE } from '../modal-playground/manifest';
import {
  PAGINATION_DATA_SECTIONS,
  PAGINATION_PLAYGROUND_ROUTE,
} from '../pagination-playground/manifest';
import {
  PAGINATION_DOTS_DATA_SECTIONS,
  PAGINATION_DOTS_PLAYGROUND_ROUTE,
} from '../pagination-dots-playground/manifest';
import { RADIO_DATA_SECTIONS, RADIO_PLAYGROUND_ROUTE } from '../radio-playground/manifest';
import {
  RADIO_FIELD_DATA_SECTIONS,
  RADIO_FIELD_PLAYGROUND_ROUTE,
} from '../radio-field-playground/manifest';
import {
  SELECTABLE_BUTTON_DATA_SECTIONS,
  SELECTABLE_BUTTON_PLAYGROUND_ROUTE,
} from '../selectable-button-playground/manifest';
import {
  SIB_DATA_SECTIONS,
  SIB_PLAYGROUND_ROUTE,
} from '../selectable-icon-button-playground/manifest';
import {
  SSTB_DATA_SECTIONS,
  SSTB_PLAYGROUND_ROUTE,
} from '../selectable-single-text-button-playground/manifest';
import {
  SEGMENTED_CONTROL_DATA_SECTIONS,
  SEGMENTED_CONTROL_PLAYGROUND_ROUTE,
} from '../segmented-control-playground/manifest';
import {
  STB_DATA_SECTIONS,
  STB_PLAYGROUND_ROUTE,
} from '../single-text-button-playground/manifest';
import { SLIDER_DATA_SECTIONS, SLIDER_PLAYGROUND_ROUTE } from '../slider-playground/manifest';
import { STEPPER_DATA_SECTIONS, STEPPER_PLAYGROUND_ROUTE } from '../stepper-playground/manifest';
import { SWITCH_DATA_SECTIONS, SWITCH_PLAYGROUND_ROUTE } from '../switch-playground/manifest';
import { TABS_DATA_SECTIONS, TABS_PLAYGROUND_ROUTE } from '../tabs-playground/manifest';
import { TEXT_DATA_SECTIONS, TEXT_PLAYGROUND_ROUTE } from '../text-playground/manifest';
import { TOOLTIP_DATA_SECTIONS, TOOLTIP_PLAYGROUND_ROUTE } from '../tooltip-playground/manifest';
import {
  TOUCH_SLIDER_DATA_SECTIONS,
  TOUCH_SLIDER_PLAYGROUND_ROUTE,
} from '../touch-slider-playground/manifest';

import { slugToLabel } from './helpers';

export type QaApplitoolsComponent = {
  slug: string;
  label: string;
  route: string;
  sections: readonly string[];
};

export const QA_APPLITOOLS_COMPONENTS: QaApplitoolsComponent[] = [
  { slug: 'avatar', label: slugToLabel('avatar'), route: AVATAR_PLAYGROUND_ROUTE, sections: AVATAR_DATA_SECTIONS },
  { slug: 'badge', label: slugToLabel('badge'), route: BADGE_PLAYGROUND_ROUTE, sections: BADGE_DATA_SECTIONS },
  {
    slug: 'bottom-navigation',
    label: slugToLabel('bottom-navigation'),
    route: BOTTOM_NAV_PLAYGROUND_ROUTE,
    sections: BOTTOM_NAV_DATA_SECTIONS,
  },
  { slug: 'button', label: slugToLabel('button'), route: BUTTON_PLAYGROUND_ROUTE, sections: BUTTON_DATA_SECTIONS },
  {
    slug: 'checkbox',
    label: slugToLabel('checkbox'),
    route: CHECKBOX_PLAYGROUND_ROUTE,
    sections: CHECKBOX_DATA_SECTIONS,
  },
  {
    slug: 'checkbox-field',
    label: slugToLabel('checkbox-field'),
    route: CHECKBOX_FIELD_PLAYGROUND_ROUTE,
    sections: CHECKBOX_FIELD_DATA_SECTIONS,
  },
  { slug: 'chip', label: slugToLabel('chip'), route: CHIP_PLAYGROUND_ROUTE, sections: CHIP_DATA_SECTIONS },
  {
    slug: 'chip-group',
    label: slugToLabel('chip-group'),
    route: CHIP_GROUP_PLAYGROUND_ROUTE,
    sections: CHIP_GROUP_DATA_SECTIONS,
  },
  {
    slug: 'circular-progress-indicator',
    label: slugToLabel('circular-progress-indicator'),
    route: CPI_PLAYGROUND_ROUTE,
    sections: CPI_DATA_SECTIONS,
  },
  {
    slug: 'counter-badge',
    label: slugToLabel('counter-badge'),
    route: COUNTER_BADGE_PLAYGROUND_ROUTE,
    sections: COUNTER_BADGE_DATA_SECTIONS,
  },
  { slug: 'divider', label: slugToLabel('divider'), route: DIVIDER_PLAYGROUND_ROUTE, sections: DIVIDER_DATA_SECTIONS },
  { slug: 'icon', label: slugToLabel('icon'), route: ICON_PLAYGROUND_ROUTE, sections: ICON_DATA_SECTIONS },
  {
    slug: 'icon-button',
    label: slugToLabel('icon-button'),
    route: ICON_BUTTON_PLAYGROUND_ROUTE,
    sections: ICON_BUTTON_DATA_SECTIONS,
  },
  {
    slug: 'icon-contained',
    label: slugToLabel('icon-contained'),
    route: ICON_CONTAINED_PLAYGROUND_ROUTE,
    sections: ICON_CONTAINED_DATA_SECTIONS,
  },
  { slug: 'image', label: slugToLabel('image'), route: IMAGE_PLAYGROUND_ROUTE, sections: IMAGE_DATA_SECTIONS },
  {
    slug: 'indicator-badge',
    label: slugToLabel('indicator-badge'),
    route: INDICATOR_BADGE_PLAYGROUND_ROUTE,
    sections: INDICATOR_BADGE_DATA_SECTIONS,
  },
  { slug: 'input', label: slugToLabel('input'), route: INPUT_PLAYGROUND_ROUTE, sections: INPUT_DATA_SECTIONS },
  {
    slug: 'input-dynamic-text',
    label: slugToLabel('input-dynamic-text'),
    route: INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE,
    sections: IDT_DATA_SECTIONS,
  },
  {
    slug: 'input-feedback',
    label: slugToLabel('input-feedback'),
    route: INPUT_FEEDBACK_PLAYGROUND_ROUTE,
    sections: IFB_DATA_SECTIONS,
  },
  {
    slug: 'input-field',
    label: slugToLabel('input-field'),
    route: INPUT_FIELD_PLAYGROUND_ROUTE,
    sections: IFF_DATA_SECTIONS,
  },
  { slug: 'modal', label: slugToLabel('modal'), route: MODAL_PLAYGROUND_ROUTE, sections: MODAL_DATA_SECTIONS },
  {
    slug: 'pagination',
    label: slugToLabel('pagination'),
    route: PAGINATION_PLAYGROUND_ROUTE,
    sections: PAGINATION_DATA_SECTIONS,
  },
  {
    slug: 'pagination-dots',
    label: slugToLabel('pagination-dots'),
    route: PAGINATION_DOTS_PLAYGROUND_ROUTE,
    sections: PAGINATION_DOTS_DATA_SECTIONS,
  },
  { slug: 'radio', label: slugToLabel('radio'), route: RADIO_PLAYGROUND_ROUTE, sections: RADIO_DATA_SECTIONS },
  {
    slug: 'radio-field',
    label: slugToLabel('radio-field'),
    route: RADIO_FIELD_PLAYGROUND_ROUTE,
    sections: RADIO_FIELD_DATA_SECTIONS,
  },
  {
    slug: 'selectable-button',
    label: slugToLabel('selectable-button'),
    route: SELECTABLE_BUTTON_PLAYGROUND_ROUTE,
    sections: SELECTABLE_BUTTON_DATA_SECTIONS,
  },
  {
    slug: 'selectable-icon-button',
    label: slugToLabel('selectable-icon-button'),
    route: SIB_PLAYGROUND_ROUTE,
    sections: SIB_DATA_SECTIONS,
  },
  {
    slug: 'selectable-single-text-button',
    label: slugToLabel('selectable-single-text-button'),
    route: SSTB_PLAYGROUND_ROUTE,
    sections: SSTB_DATA_SECTIONS,
  },
  {
    slug: 'segmented-control',
    label: slugToLabel('segmented-control'),
    route: SEGMENTED_CONTROL_PLAYGROUND_ROUTE,
    sections: SEGMENTED_CONTROL_DATA_SECTIONS,
  },
  {
    slug: 'single-text-button',
    label: slugToLabel('single-text-button'),
    route: STB_PLAYGROUND_ROUTE,
    sections: STB_DATA_SECTIONS,
  },
  { slug: 'slider', label: slugToLabel('slider'), route: SLIDER_PLAYGROUND_ROUTE, sections: SLIDER_DATA_SECTIONS },
  { slug: 'stepper', label: slugToLabel('stepper'), route: STEPPER_PLAYGROUND_ROUTE, sections: STEPPER_DATA_SECTIONS },
  { slug: 'switch', label: slugToLabel('switch'), route: SWITCH_PLAYGROUND_ROUTE, sections: SWITCH_DATA_SECTIONS },
  { slug: 'tabs', label: slugToLabel('tabs'), route: TABS_PLAYGROUND_ROUTE, sections: TABS_DATA_SECTIONS },
  { slug: 'text', label: slugToLabel('text'), route: TEXT_PLAYGROUND_ROUTE, sections: TEXT_DATA_SECTIONS },
  { slug: 'tooltip', label: slugToLabel('tooltip'), route: TOOLTIP_PLAYGROUND_ROUTE, sections: TOOLTIP_DATA_SECTIONS },
  {
    slug: 'touch-slider',
    label: slugToLabel('touch-slider'),
    route: TOUCH_SLIDER_PLAYGROUND_ROUTE,
    sections: TOUCH_SLIDER_DATA_SECTIONS,
  },
];

export function resolveApplitoolsComponents(): QaApplitoolsComponent[] {
  const raw = process.env.APPLITOOLS_COMPONENT_SLUG?.trim();
  if (!raw) return QA_APPLITOOLS_COMPONENTS;

  const slugs = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const selected = QA_APPLITOOLS_COMPONENTS.filter((c) => slugs.has(c.slug));
  const unknown = [...slugs].filter((slug) => !QA_APPLITOOLS_COMPONENTS.some((c) => c.slug === slug));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown APPLITOOLS_COMPONENT_SLUG value(s): ${unknown.join(', ')}. Known: ${QA_APPLITOOLS_COMPONENTS.map((c) => c.slug).join(', ')}`,
    );
  }
  if (selected.length === 0) {
    throw new Error('APPLITOOLS_COMPONENT_SLUG did not match any QA playground component.');
  }
  return selected;
}
