/**
 * metaRegistry.ts
 *
 * Server-safe component metadata catalog. Imports only `.meta.ts` files and
 * their dependencies (token manifests, recipe definitions, generated prop
 * descriptors) — NO React components.
 *
 * Safe to import from:
 * - Next.js route handlers / edge runtime
 * - Build-time scripts
 * - Convex actions
 *
 * For the full registry (with React components + preview components), use
 * `./componentRegistry.ts`.
 */

import type { ComponentMeta } from '@oneui/shared';
import {
  deriveSchemaFromMeta,
  registerComponentPropsSchema,
} from '@oneui/shared/meta';

import { AGENT_PULSE_META } from '../components/AgentPulse/AgentPulse.meta';
import { AVATAR_META } from '../components/Avatar/Avatar.meta';
import { BADGE_META } from '../components/Badge/Badge.meta';
import { BOTTOM_NAVIGATION_META } from '../components/BottomNavigation/BottomNavigation.meta';
import { BUTTON_META } from '../components/Button/Button.meta';
import { CAROUSEL_META } from '../components/Carousel/Carousel.meta';
import { CHAT_COMPOSER_META } from '../components/ChatComposer/ChatComposer.meta';
import { CHECKBOX_META } from '../components/Checkbox/Checkbox.meta';
import { CHECKBOX_FIELD_META } from '../components/CheckboxField/CheckboxField.meta';
import { CHIP_META } from '../components/Chip/Chip.meta';
import { CHIP_GROUP_META } from '../components/ChipGroup/ChipGroup.meta';
import { SEGMENTED_CONTROL_META } from '../components/SegmentedControl/SegmentedControl.meta';
import { CIRCULAR_PROGRESS_INDICATOR_META } from '../components/CircularProgressIndicator/CircularProgressIndicator.meta';
import { LINEAR_PROGRESS_INDICATOR_META } from '../components/LinearProgressIndicator/LinearProgressIndicator.meta';
import { SELECT_META } from '../components/Select/Select.meta';
import { CONTAINER_META } from '../components/Container/Container.meta';
import { COUNTER_BADGE_META } from '../components/CounterBadge/CounterBadge.meta';
import { DIVIDER_META } from '../components/Divider/Divider.meta';
import { FAB_META } from '../components/FAB/FAB.meta';
import { GRID_META } from '../components/Grid/Grid.meta';
import { ICON_META } from '../components/Icon/Icon.meta';
import { ICON_BUTTON_META } from '../components/IconButton/IconButton.meta';
import { ICON_CONTAINED_META } from '../components/IconContained/IconContained.meta';
import { IMAGE_META } from '../components/Image/Image.meta';
import { INDICATOR_BADGE_META } from '../components/IndicatorBadge/IndicatorBadge.meta';
import { INPUT_META } from '../components/InputField/InputField.meta';
import { LIST_ITEM_META } from '../components/ListItem/ListItem.meta';
import { LIST_ITEM_GROUP_META } from '../components/ListItemGroup/ListItemGroup.meta';
import { LOGO_META } from '../components/Logo/Logo.meta';
import { MODAL_META } from '../components/Modal/Modal.meta';
import { PAGINATION_META } from '../components/Pagination/Pagination.meta';
import { PAGINATION_DOTS_META } from '../components/PaginationDots/PaginationDots.meta';
import { RADIO_META } from '../components/Radio/Radio.meta';
import { RADIO_FIELD_META } from '../components/RadioField/RadioField.meta';
import { SELECTABLE_BUTTON_META } from '../components/SelectableButton/SelectableButton.meta';
import { SELECTABLE_ICON_BUTTON_META } from '../components/SelectableIconButton/SelectableIconButton.meta';
import { SELECTABLE_SINGLE_TEXT_BUTTON_META } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.meta';
import { SINGLE_TEXT_BUTTON_META } from '../components/SingleTextButton/SingleTextButton.meta';
import { SLIDER_META } from '../components/Slider/Slider.meta';
import { SPINNER_META } from '../components/Spinner/Spinner.meta';
import { SKELETON_META } from '../components/Skeleton/Skeleton.meta';
import { STEPPER_META } from '../components/Stepper/Stepper.meta';
import { SURFACE_META } from '../components/Surface/Surface.meta';
import { SWITCH_META } from '../components/Switch/Switch.meta';
import { TABS_META } from '../components/Tabs/Tabs.meta';
import { TEXT_META } from '../components/Text/Text.meta';
import { TOOLTIP_META } from '../components/Tooltip/Tooltip.meta';
import { TOUCH_SLIDER_META } from '../components/TouchSlider/TouchSlider.meta';
import { WEBHEADER_META } from '../components/WebHeader/WebHeader.meta';

/**
 * All registered component metas, keyed by PascalCase component name.
 *
 * Keys use the public component name — the same name that appears as the
 * Storybook story's primary component and the exported React component.
 *
 * InputField metadata lives in `InputField/InputField.meta.ts` (aggregator).
 * The bordered container is `Input` in `Input/`.
 */
export const COMPONENT_META_REGISTRY: Record<string, ComponentMeta> = {
  AgentPulse: AGENT_PULSE_META,
  Avatar: AVATAR_META,
  Badge: BADGE_META,
  BottomNavigation: BOTTOM_NAVIGATION_META,
  Button: BUTTON_META,
  Carousel: CAROUSEL_META,
  ChatComposer: CHAT_COMPOSER_META,
  Checkbox: CHECKBOX_META,
  CheckboxField: CHECKBOX_FIELD_META,
  Chip: CHIP_META,
  ChipGroup: CHIP_GROUP_META,
  CircularProgressIndicator: CIRCULAR_PROGRESS_INDICATOR_META,
  LinearProgressIndicator: LINEAR_PROGRESS_INDICATOR_META,
  Select: SELECT_META,
  Container: CONTAINER_META,
  CounterBadge: COUNTER_BADGE_META,
  Divider: DIVIDER_META,
  FAB: FAB_META,
  Grid: GRID_META,
  Icon: ICON_META,
  IconButton: ICON_BUTTON_META,
  IconContained: ICON_CONTAINED_META,
  Image: IMAGE_META,
  IndicatorBadge: INDICATOR_BADGE_META,
  InputField: INPUT_META,
  ListItem: LIST_ITEM_META,
  ListItemGroup: LIST_ITEM_GROUP_META,
  Logo: LOGO_META,
  Modal: MODAL_META,
  Pagination: PAGINATION_META,
  PaginationDots: PAGINATION_DOTS_META,
  Radio: RADIO_META,
  RadioField: RADIO_FIELD_META,
  SelectableButton: SELECTABLE_BUTTON_META,
  SelectableIconButton: SELECTABLE_ICON_BUTTON_META,
  SelectableSingleTextButton: SELECTABLE_SINGLE_TEXT_BUTTON_META,
  SegmentedControl: SEGMENTED_CONTROL_META,
  SingleTextButton: SINGLE_TEXT_BUTTON_META,
  Slider: SLIDER_META,
  Skeleton: SKELETON_META,
  Spinner: SPINNER_META,
  Stepper: STEPPER_META,
  Surface: SURFACE_META,
  Switch: SWITCH_META,
  Tabs: TABS_META,
  Text: TEXT_META,
  Tooltip: TOOLTIP_META,
  TouchSlider: TOUCH_SLIDER_META,
  WebHeader: WEBHEADER_META,
};

/** Flat array of all registered component metas. */
export const ALL_COMPONENT_METAS: ComponentMeta[] = Object.values(COMPONENT_META_REGISTRY);

export function getComponentMetaByName(name: string): ComponentMeta | undefined {
  return COMPONENT_META_REGISTRY[name];
}

// ---------------------------------------------------------------------------
// Side-effect: populate the shared component-schema registry
// ---------------------------------------------------------------------------
//
// Generator-backed schemas (e.g. Button) are already seeded in
// `@oneui/shared/meta/componentSchemas` and win over derived ones.
// Derived schemas fill in the remaining components so every entry in this
// meta registry has a runtime validator.

for (const [name, meta] of Object.entries(COMPONENT_META_REGISTRY)) {
  registerComponentPropsSchema(name, deriveSchemaFromMeta(meta));
}
