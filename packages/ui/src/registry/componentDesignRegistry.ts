/**
 * React-free component design registry (recipe + manifest only).
 *
 * Used by native/Convex token resolution so `@oneui/ui` dependency graphs
 * never pull preview components or `react` into Convex bundles via the full
 * `componentRegistry.ts`.
 */

import type { ComponentRecipeDefinition, ComponentTokenManifest } from '@oneui/shared';

import { BUTTON_RECIPE_DEFINITION } from '../components/Button/Button.recipe';
import { BUTTON_TOKEN_MANIFEST } from '../components/Button/Button.tokens';
import { AVATAR_RECIPE_DEFINITION } from '../components/Avatar/Avatar.recipe';
import { AVATAR_TOKEN_MANIFEST } from '../components/Avatar/Avatar.tokens';
import { ICON_TOKEN_MANIFEST } from '../components/Icon/Icon.tokens';
import { ICON_CONTAINED_RECIPE_DEFINITION } from '../components/IconContained/IconContained.recipe';
import { ICON_CONTAINED_TOKEN_MANIFEST } from '../components/IconContained/IconContained.tokens';
import { IMAGE_RECIPE_DEFINITION } from '../components/Image/Image.recipe';
import { IMAGE_TOKEN_MANIFEST } from '../components/Image/Image.tokens';
import { CHECKBOX_RECIPE_DEFINITION } from '../components/Checkbox/Checkbox.recipe';
import { CHECKBOX_TOKEN_MANIFEST } from '../components/Checkbox/Checkbox.tokens';
import { RADIO_RECIPE_DEFINITION } from '../components/Radio/Radio.recipe';
import { RADIO_TOKEN_MANIFEST } from '../components/Radio/Radio.tokens';
import { ICON_BUTTON_RECIPE_DEFINITION } from '../components/IconButton/IconButton.recipe';
import { ICON_BUTTON_TOKEN_MANIFEST } from '../components/IconButton/IconButton.tokens';
import { LINKBUTTON_RECIPE_DEFINITION } from '../components/LinkButton/LinkButton.recipe';
import { LINKBUTTON_TOKEN_MANIFEST } from '../components/LinkButton/LinkButton.tokens';
import { SWITCH_RECIPE_DEFINITION } from '../components/Switch/Switch.recipe';
import { SWITCH_TOKEN_MANIFEST } from '../components/Switch/Switch.tokens';
import { STEPPER_RECIPE_DEFINITION } from '../components/Stepper/Stepper.recipe';
import { STEPPER_TOKEN_MANIFEST } from '../components/Stepper/Stepper.tokens';
import { COUNTER_BADGE_RECIPE_DEFINITION } from '../components/CounterBadge/CounterBadge.recipe';
import { COUNTER_BADGE_TOKEN_MANIFEST } from '../components/CounterBadge/CounterBadge.tokens';
import { INDICATOR_BADGE_RECIPE_DEFINITION } from '../components/IndicatorBadge/IndicatorBadge.recipe';
import { INDICATOR_BADGE_TOKEN_MANIFEST } from '../components/IndicatorBadge/IndicatorBadge.tokens';
import { DIVIDER_TOKEN_MANIFEST } from '../components/Divider/Divider.tokens';
import { CHIP_RECIPE_DEFINITION } from '../components/Chip/Chip.recipe';
import { CHIP_TOKEN_MANIFEST } from '../components/Chip/Chip.tokens';
import { TABS_RECIPE_DEFINITION } from '../components/Tabs/Tabs.recipe';
import { TABS_TOKEN_MANIFEST } from '../components/Tabs/Tabs.tokens';
import { SELECTABLE_BUTTON_RECIPE_DEFINITION } from '../components/SelectableButton/SelectableButton.recipe';
import { SELECTABLE_BUTTON_TOKEN_MANIFEST } from '../components/SelectableButton/SelectableButton.tokens';
import { SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION } from '../components/SelectableIconButton/SelectableIconButton.recipe';
import { SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST } from '../components/SelectableIconButton/SelectableIconButton.tokens';
import { SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.recipe';
import { SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.tokens';
import { SELECT_RECIPE_DEFINITION } from '../components/Select/Select.recipe';
import { SELECT_TOKEN_MANIFEST } from '../components/Select/Select.tokens';
import { WEBHEADER_RECIPE_DEFINITION } from '../components/WebHeader/WebHeader.recipe';
import { WEBHEADER_TOKEN_MANIFEST } from '../components/WebHeader/WebHeader.tokens';
import { INPUT_RECIPE_DEFINITION } from '../components/Input/Input.recipe';
import { INPUT_TOKEN_MANIFEST } from '../components/Input/Input.tokens';
import { SPINNER_TOKEN_MANIFEST } from '../components/Spinner/Spinner.tokens';
import { SKELETON_TOKEN_MANIFEST } from '../components/Skeleton/Skeleton.tokens';
import { SLIDER_RECIPE_DEFINITION } from '../components/Slider/Slider.recipe';
import { SLIDER_TOKEN_MANIFEST } from '../components/Slider/Slider.tokens';
import { TOUCH_SLIDER_RECIPE_DEFINITION } from '../components/TouchSlider/TouchSlider.recipe';
import { TOUCH_SLIDER_TOKEN_MANIFEST } from '../components/TouchSlider/TouchSlider.tokens';
import { BADGE_RECIPE_DEFINITION } from '../components/Badge/Badge.recipe';
import { BADGE_TOKEN_MANIFEST } from '../components/Badge/Badge.tokens';
import { LOGO_RECIPE_DEFINITION } from '../components/Logo/Logo.recipe';
import { LOGO_TOKEN_MANIFEST } from '../components/Logo/Logo.tokens';
import { PAGINATION_DOTS_RECIPE_DEFINITION } from '../components/PaginationDots/PaginationDots.recipe';
import { PAGINATION_DOTS_TOKEN_MANIFEST } from '../components/PaginationDots/PaginationDots.tokens';
import { CAROUSEL_RECIPE_DEFINITION } from '../components/Carousel/Carousel.recipe';
import { CAROUSEL_TOKEN_MANIFEST } from '../components/Carousel/Carousel.tokens';
import { BOTTOM_NAVIGATION_RECIPE_DEFINITION } from '../components/BottomNavigation/BottomNavigation.recipe';
import { BOTTOM_NAVIGATION_TOKEN_MANIFEST } from '../components/BottomNavigation/BottomNavigation.tokens';
import { CONTAINER_RECIPE_DEFINITION } from '../components/Container/Container.recipe';
import { CONTAINER_TOKEN_MANIFEST } from '../components/Container/Container.tokens';
import { FAB_RECIPE_DEFINITION } from '../components/FAB/FAB.recipe';
import { FAB_TOKEN_MANIFEST } from '../components/FAB/FAB.tokens';
import { CHIP_GROUP_RECIPE_DEFINITION } from '../components/ChipGroup/ChipGroup.recipe';
import { CHIP_GROUP_TOKEN_MANIFEST } from '../components/ChipGroup/ChipGroup.tokens';
import { SEGMENTED_CONTROL_RECIPE_DEFINITION } from '../components/SegmentedControl/SegmentedControl.recipe';
import { SEGMENTED_CONTROL_TOKEN_MANIFEST } from '../components/SegmentedControl/SegmentedControl.tokens';
import { LIST_ITEM_RECIPE_DEFINITION } from '../components/ListItem/ListItem.recipe';
import { LIST_ITEM_TOKEN_MANIFEST } from '../components/ListItem/ListItem.tokens';
import { LIST_ITEM_GROUP_RECIPE_DEFINITION } from '../components/ListItemGroup/ListItemGroup.recipe';
import { LIST_ITEM_GROUP_TOKEN_MANIFEST } from '../components/ListItemGroup/ListItemGroup.tokens';
import { SURFACE_RECIPE_DEFINITION } from '../components/Surface/Surface.recipe';
import { SURFACE_TOKEN_MANIFEST } from '../components/Surface/Surface.tokens';
import { TOOLTIP_RECIPE_DEFINITION } from '../components/Tooltip/Tooltip.recipe';
import { TOOLTIP_TOKEN_MANIFEST } from '../components/Tooltip/Tooltip.tokens';
import { GRID_RECIPE_DEFINITION } from '../components/Grid/Grid.recipe';
import { GRID_TOKEN_MANIFEST } from '../components/Grid/Grid.tokens';
import { LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION } from '../components/LinearProgressIndicator/LinearProgressIndicator.recipe';
import { LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST } from '../components/LinearProgressIndicator/LinearProgressIndicator.tokens';

export interface ComponentDesignRegistryEntry {
  recipe?: ComponentRecipeDefinition;
  manifest: ComponentTokenManifest;
}

function stubManifest(componentName: string): ComponentTokenManifest {
  return {
    componentName,
    version: '0.0.0-stub',
    tokens: {},
    totalTokens: 0,
    categories: {},
  };
}

/**
 * Same keys and recipe/manifest coverage as `COMPONENT_REGISTRY`, without React.
 */
export const COMPONENT_DESIGN_REGISTRY: Record<string, ComponentDesignRegistryEntry> = {
  Button: { recipe: BUTTON_RECIPE_DEFINITION, manifest: BUTTON_TOKEN_MANIFEST },
  Avatar: { recipe: AVATAR_RECIPE_DEFINITION, manifest: AVATAR_TOKEN_MANIFEST },
  Icon: { manifest: ICON_TOKEN_MANIFEST },
  IconContained: { recipe: ICON_CONTAINED_RECIPE_DEFINITION, manifest: ICON_CONTAINED_TOKEN_MANIFEST },
  Image: { recipe: IMAGE_RECIPE_DEFINITION, manifest: IMAGE_TOKEN_MANIFEST },
  Checkbox: { recipe: CHECKBOX_RECIPE_DEFINITION, manifest: CHECKBOX_TOKEN_MANIFEST },
  Radio: { recipe: RADIO_RECIPE_DEFINITION, manifest: RADIO_TOKEN_MANIFEST },
  IconButton: { recipe: ICON_BUTTON_RECIPE_DEFINITION, manifest: ICON_BUTTON_TOKEN_MANIFEST },
  LinkButton: { recipe: LINKBUTTON_RECIPE_DEFINITION, manifest: LINKBUTTON_TOKEN_MANIFEST },
  Switch: { recipe: SWITCH_RECIPE_DEFINITION, manifest: SWITCH_TOKEN_MANIFEST },
  Stepper: { recipe: STEPPER_RECIPE_DEFINITION, manifest: STEPPER_TOKEN_MANIFEST },
  CounterBadge: { recipe: COUNTER_BADGE_RECIPE_DEFINITION, manifest: COUNTER_BADGE_TOKEN_MANIFEST },
  IndicatorBadge: { recipe: INDICATOR_BADGE_RECIPE_DEFINITION, manifest: INDICATOR_BADGE_TOKEN_MANIFEST },
  Divider: { manifest: DIVIDER_TOKEN_MANIFEST },
  Chip: { recipe: CHIP_RECIPE_DEFINITION, manifest: CHIP_TOKEN_MANIFEST },
  Tabs: { recipe: TABS_RECIPE_DEFINITION, manifest: TABS_TOKEN_MANIFEST },
  SelectableButton: { recipe: SELECTABLE_BUTTON_RECIPE_DEFINITION, manifest: SELECTABLE_BUTTON_TOKEN_MANIFEST },
  SelectableIconButton: {
    recipe: SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION,
    manifest: SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST,
  },
  SelectableSingleTextButton: {
    recipe: SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
    manifest: SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  },
  WebHeader: { recipe: WEBHEADER_RECIPE_DEFINITION, manifest: WEBHEADER_TOKEN_MANIFEST },
  InputField: { recipe: INPUT_RECIPE_DEFINITION, manifest: INPUT_TOKEN_MANIFEST },
  Input: { manifest: INPUT_TOKEN_MANIFEST },
  Spinner: { manifest: SPINNER_TOKEN_MANIFEST },
  Skeleton: { manifest: SKELETON_TOKEN_MANIFEST },
  Slider: { recipe: SLIDER_RECIPE_DEFINITION, manifest: SLIDER_TOKEN_MANIFEST },
  TouchSlider: { recipe: TOUCH_SLIDER_RECIPE_DEFINITION, manifest: TOUCH_SLIDER_TOKEN_MANIFEST },
  Badge: { recipe: BADGE_RECIPE_DEFINITION, manifest: BADGE_TOKEN_MANIFEST },
  Logo: { recipe: LOGO_RECIPE_DEFINITION, manifest: LOGO_TOKEN_MANIFEST },
  PaginationDots: { recipe: PAGINATION_DOTS_RECIPE_DEFINITION, manifest: PAGINATION_DOTS_TOKEN_MANIFEST },
  Carousel: { recipe: CAROUSEL_RECIPE_DEFINITION, manifest: CAROUSEL_TOKEN_MANIFEST },
  BottomNavigation: { recipe: BOTTOM_NAVIGATION_RECIPE_DEFINITION, manifest: BOTTOM_NAVIGATION_TOKEN_MANIFEST },
  Container: { recipe: CONTAINER_RECIPE_DEFINITION, manifest: CONTAINER_TOKEN_MANIFEST },
  FAB: { recipe: FAB_RECIPE_DEFINITION, manifest: FAB_TOKEN_MANIFEST },
  ChipGroup: { recipe: CHIP_GROUP_RECIPE_DEFINITION, manifest: CHIP_GROUP_TOKEN_MANIFEST },
  ListItem: { recipe: LIST_ITEM_RECIPE_DEFINITION, manifest: LIST_ITEM_TOKEN_MANIFEST },
  ListItemGroup: { recipe: LIST_ITEM_GROUP_RECIPE_DEFINITION, manifest: LIST_ITEM_GROUP_TOKEN_MANIFEST },
  Surface: { recipe: SURFACE_RECIPE_DEFINITION, manifest: SURFACE_TOKEN_MANIFEST },
  Tooltip: { recipe: TOOLTIP_RECIPE_DEFINITION, manifest: TOOLTIP_TOKEN_MANIFEST },
  Grid: { recipe: GRID_RECIPE_DEFINITION, manifest: GRID_TOKEN_MANIFEST },
  HeaderItem: { manifest: stubManifest('HeaderItem') },
  PrimaryNav: { manifest: stubManifest('PrimaryNav') },
  SecondaryNav: { manifest: stubManifest('SecondaryNav') },
  MobileDrawer: { manifest: stubManifest('MobileDrawer') },
  BottomNavItem: { manifest: stubManifest('BottomNavItem') },
  Select: { recipe: SELECT_RECIPE_DEFINITION, manifest: SELECT_TOKEN_MANIFEST },
  SegmentedControl: {
    recipe: SEGMENTED_CONTROL_RECIPE_DEFINITION,
    manifest: SEGMENTED_CONTROL_TOKEN_MANIFEST,
  },
  Dialog: { manifest: stubManifest('Dialog') },
  Toast: { manifest: stubManifest('Toast') },
  Progress: { manifest: stubManifest('Progress') },
  Accordion: { manifest: stubManifest('Accordion') },
  Separator: { manifest: stubManifest('Separator') },
  Menu: { manifest: stubManifest('Menu') },
  Link: { manifest: stubManifest('Link') },
  CircularProgressIndicator: { manifest: stubManifest('CircularProgressIndicator') },
  LinearProgressIndicator: {
    recipe: LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION,
    manifest: LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST,
  },
  Collapsible: { manifest: stubManifest('Collapsible') },
  NumberField: { manifest: stubManifest('NumberField') },
  NavigationMenu: { manifest: stubManifest('NavigationMenu') },
  Popover: { manifest: stubManifest('Popover') },
  Column: { manifest: stubManifest('Column') },
  Meter: { manifest: stubManifest('Meter') },
};
