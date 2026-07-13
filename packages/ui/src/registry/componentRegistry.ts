/**
 * componentRegistry.ts
 *
 * Central registry mapping component names to their recipe definitions,
 * token manifests, metadata, and preview components.
 *
 * Used by:
 * - Storybook: resolve per-brand component customizations from Convex
 * - Editor: preview rendering, variant/size labels, property inspector
 * - ASTRenderer: map component types to real React components
 *
 * Add new entries here as components gain recipe/manifest/meta support.
 */

import type { ComponentType } from 'react';
import type {
  ComponentRecipeDefinition,
  ComponentTokenManifest,
  ComponentMeta,
} from '@oneui/shared';
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
import { CHECKBOX_FIELD_RECIPE_DEFINITION } from '../components/CheckboxField/CheckboxField.recipe';
import { CHECKBOX_FIELD_TOKEN_MANIFEST } from '../components/CheckboxField/CheckboxField.tokens';
import { RADIO_FIELD_RECIPE_DEFINITION } from '../components/RadioField/RadioField.recipe';
import { RADIO_FIELD_TOKEN_MANIFEST } from '../components/RadioField/RadioField.tokens';
import { RADIO_RECIPE_DEFINITION } from '../components/Radio/Radio.recipe';
import { RADIO_TOKEN_MANIFEST } from '../components/Radio/Radio.tokens';
import { ICON_BUTTON_RECIPE_DEFINITION } from '../components/IconButton/IconButton.recipe';
import { ICON_BUTTON_TOKEN_MANIFEST } from '../components/IconButton/IconButton.tokens';
import { SWITCH_RECIPE_DEFINITION } from '../components/Switch/Switch.recipe';
import { SWITCH_TOKEN_MANIFEST } from '../components/Switch/Switch.tokens';
import { STEPPER_RECIPE_DEFINITION } from '../components/Stepper/Stepper.recipe';
import { STEPPER_TOKEN_MANIFEST } from '../components/Stepper/Stepper.tokens';
import { COUNTER_BADGE_RECIPE_DEFINITION } from '../components/CounterBadge/CounterBadge.recipe';
import { COUNTER_BADGE_TOKEN_MANIFEST } from '../components/CounterBadge/CounterBadge.tokens';
import { INDICATOR_BADGE_RECIPE_DEFINITION } from '../components/IndicatorBadge/IndicatorBadge.recipe';
import { INDICATOR_BADGE_TOKEN_MANIFEST } from '../components/IndicatorBadge/IndicatorBadge.tokens';
import { TEXT_RECIPE_DEFINITION } from '../components/Text/Text.recipe';
import { TEXT_TOKEN_MANIFEST } from '../components/Text/Text.tokens';
import { TEXT_META } from '../components/Text/Text.meta';
import { BUTTON_META } from '../components/Button/Button.meta';
import { ButtonPreview } from '../components/Button/ButtonPreview';
import { ICON_BUTTON_META } from '../components/IconButton/IconButton.meta';
import { IconButtonPreview } from '../components/IconButton/IconButtonPreview';
import { AVATAR_META } from '../components/Avatar/Avatar.meta';
import { AvatarPreview } from '../components/Avatar/AvatarPreview';
import { CHECKBOX_META } from '../components/Checkbox/Checkbox.meta';
import { CheckboxPreview } from '../components/Checkbox/CheckboxPreview';
import { CHECKBOX_FIELD_META } from '../components/CheckboxField/CheckboxField.meta';
import { CheckboxFieldPreview } from '../components/CheckboxField/CheckboxFieldPreview';
import { RADIO_FIELD_META } from '../components/RadioField/RadioField.meta';
import { RadioFieldPreview } from '../components/RadioField/RadioFieldPreview';
import { RADIO_META } from '../components/Radio/Radio.meta';
import { RadioPreview } from '../components/Radio/RadioPreview';
import { SWITCH_META } from '../components/Switch/Switch.meta';
import { STEPPER_META } from '../components/Stepper/Stepper.meta';
import { ICON_CONTAINED_META } from '../components/IconContained/IconContained.meta';
import { IconContainedPreview } from '../components/IconContained/IconContainedPreview';
import { ICON_META } from '../components/Icon/Icon.meta';
import { IMAGE_META } from '../components/Image/Image.meta';
import { ImagePreview } from '../components/Image/ImagePreview';
import { SwitchPreview } from '../components/Switch/SwitchPreview';
import { StepperPreview } from '../components/Stepper/StepperPreview';
import { COUNTER_BADGE_META } from '../components/CounterBadge/CounterBadge.meta';
import { CounterBadgePreview } from '../components/CounterBadge/CounterBadgePreview';
import { INDICATOR_BADGE_META } from '../components/IndicatorBadge/IndicatorBadge.meta';
import { IndicatorBadgePreview } from '../components/IndicatorBadge/IndicatorBadgePreview';

// Actual components (for experience canvas — renders single pure instance)
import { Button } from '../components/Button/Button';
import {
  ButtonAttentionLevels,
  ButtonSizes,
  ButtonSurfaceShowcase,
} from '../components/Button/Button.showcase';
import { Avatar } from '../components/Avatar/Avatar';
import { IconButton } from '../components/IconButton/IconButton';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { CheckboxField } from '../components/CheckboxField/CheckboxField';
import { RadioField } from '../components/RadioField/RadioField';
import { RadioGroup, Radio } from '../components/Radio/Radio';
import { Switch } from '../components/Switch/Switch';
import { Stepper } from '../components/Stepper/Stepper';
import { IconContained } from '../components/IconContained/IconContained';
import { Icon } from '../components/Icon/Icon';
import { Image } from '../components/Image/Image';
import { CounterBadge } from '../components/CounterBadge/CounterBadge';
import { IndicatorBadge } from '../components/IndicatorBadge/IndicatorBadge';
import { Text } from '../components/Text/Text';
import { DIVIDER_META } from '../components/Divider/Divider.meta';
import { DIVIDER_TOKEN_MANIFEST } from '../components/Divider/Divider.tokens';
import { Divider } from '../components/Divider/Divider';
// import { LOGO_RECIPE_DEFINITION } from '../components/Logo/Logo.recipe';
// import { LOGO_TOKEN_MANIFEST } from '../components/Logo/Logo.tokens';
// import { LOGO_META } from '../components/Logo/Logo.meta';
// import { LogoPreview } from '../components/Logo/LogoPreview';
// import { Logo } from '../components/Logo/Logo';
import { CHIP_RECIPE_DEFINITION } from '../components/Chip/Chip.recipe';
import { CHIP_TOKEN_MANIFEST } from '../components/Chip/Chip.tokens';
import { CHIP_META } from '../components/Chip/Chip.meta';
import { ChipPreview } from '../components/Chip/ChipPreview';
import { Chip } from '../components/Chip/Chip';
import { TABS_RECIPE_DEFINITION } from '../components/Tabs/Tabs.recipe';
import { TABS_TOKEN_MANIFEST } from '../components/Tabs/Tabs.tokens';
import { TABS_META } from '../components/Tabs/Tabs.meta';
import { TabsPreview } from '../components/Tabs/TabsPreview';
import { Tabs } from '../components/Tabs/Tabs';
import { SELECTABLE_BUTTON_RECIPE_DEFINITION } from '../components/SelectableButton/SelectableButton.recipe';
import { SELECTABLE_BUTTON_TOKEN_MANIFEST } from '../components/SelectableButton/SelectableButton.tokens';
import { SELECTABLE_BUTTON_META } from '../components/SelectableButton/SelectableButton.meta';
import { SelectableButtonPreview } from '../components/SelectableButton/SelectableButtonPreview';
import { SelectableButton } from '../components/SelectableButton/SelectableButton';
import { SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION } from '../components/SelectableIconButton/SelectableIconButton.recipe';
import { SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST } from '../components/SelectableIconButton/SelectableIconButton.tokens';
import { SELECTABLE_ICON_BUTTON_META } from '../components/SelectableIconButton/SelectableIconButton.meta';
import { SelectableIconButtonPreview } from '../components/SelectableIconButton/SelectableIconButtonPreview';
import { SelectableIconButton } from '../components/SelectableIconButton/SelectableIconButton';
import { SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.recipe';
import { SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.tokens';
import { SELECTABLE_SINGLE_TEXT_BUTTON_META } from '../components/SelectableSingleTextButton/SelectableSingleTextButton.meta';
import { SelectableSingleTextButtonPreview } from '../components/SelectableSingleTextButton/SelectableSingleTextButtonPreview';
import { SelectableSingleTextButton } from '../components/SelectableSingleTextButton/SelectableSingleTextButton';
import { SINGLE_TEXT_BUTTON_RECIPE_DEFINITION } from '../components/SingleTextButton/SingleTextButton.recipe';
import { SINGLE_TEXT_BUTTON_TOKEN_MANIFEST } from '../components/SingleTextButton/SingleTextButton.tokens';
import { SINGLE_TEXT_BUTTON_META } from '../components/SingleTextButton/SingleTextButton.meta';
import { SingleTextButtonPreview } from '../components/SingleTextButton/SingleTextButtonPreview';
import { SingleTextButton } from '../components/SingleTextButton/SingleTextButton';
import { WEBHEADER_RECIPE_DEFINITION } from '../components/WebHeader/WebHeader.recipe';
import { WEBHEADER_TOKEN_MANIFEST } from '../components/WebHeader/WebHeader.tokens';
import { WEBHEADER_META } from '../components/WebHeader/WebHeader.meta';
import { WebHeader } from '../components/WebHeader/WebHeader';
import { INPUT_RECIPE_DEFINITION } from '../components/Input/Input.recipe';
import { INPUT_TOKEN_MANIFEST } from '../components/Input/Input.tokens';
import { INPUT_META } from '../components/InputField/InputField.meta';
import { InputPreview } from '../components/Input/InputPreview';
import { InputField } from '../components/InputField/InputField';
import { Input } from '../components/Input/Input';
import { SPINNER_META } from '../components/Spinner/Spinner.meta';
import { SPINNER_TOKEN_MANIFEST } from '../components/Spinner/Spinner.tokens';
import { SKELETON_META } from '../components/Skeleton/Skeleton.meta';
import { SKELETON_TOKEN_MANIFEST } from '../components/Skeleton/Skeleton.tokens';
import { SkeletonItem } from '../components/Skeleton/SkeletonItem';
import { Spinner } from '../components/Spinner/Spinner';
import { SLIDER_META } from '../components/Slider/Slider.meta';
import { SLIDER_TOKEN_MANIFEST } from '../components/Slider/Slider.tokens';
import { SLIDER_RECIPE_DEFINITION } from '../components/Slider/Slider.recipe';
import { SliderPreview } from '../components/Slider/SliderPreview';
import { Slider } from '../components/Slider/Slider';
import { TOUCH_SLIDER_META } from '../components/TouchSlider/TouchSlider.meta';
import { TOUCH_SLIDER_TOKEN_MANIFEST } from '../components/TouchSlider/TouchSlider.tokens';
import { TOUCH_SLIDER_RECIPE_DEFINITION } from '../components/TouchSlider/TouchSlider.recipe';
import { TouchSliderPreview } from '../components/TouchSlider/TouchSliderPreview';
import { TouchSlider } from '../components/TouchSlider/TouchSlider';
import { HeaderItem } from '../components/WebHeader/HeaderItem';
import { PrimaryNav } from '../components/WebHeader/PrimaryNav';
import { SecondaryNav } from '../components/WebHeader/SecondaryNav';
import { MobileDrawer } from '../components/WebHeader/MobileDrawer';
import { Badge } from '../components/Badge/Badge';
import { BADGE_META } from '../components/Badge/Badge.meta';
import { BADGE_TOKEN_MANIFEST } from '../components/Badge/Badge.tokens';
import { BADGE_RECIPE_DEFINITION } from '../components/Badge/Badge.recipe';
import { BadgePreview } from '../components/Badge/BadgePreview';
import { Logo } from '../components/Logo/Logo';
import { LOGO_META } from '../components/Logo/Logo.meta';
import { LOGO_TOKEN_MANIFEST } from '../components/Logo/Logo.tokens';
import { LOGO_RECIPE_DEFINITION } from '../components/Logo/Logo.recipe';
import { LogoPreview } from '../components/Logo/LogoPreview';
import { PaginationDots } from '../components/PaginationDots/PaginationDots';
import { PAGINATION_DOTS_META } from '../components/PaginationDots/PaginationDots.meta';
import { PAGINATION_DOTS_TOKEN_MANIFEST } from '../components/PaginationDots/PaginationDots.tokens';
import { PAGINATION_DOTS_RECIPE_DEFINITION } from '../components/PaginationDots/PaginationDots.recipe';
import { PaginationDotsPreview } from '../components/PaginationDots/PaginationDotsPreview';
import { Pagination } from '../components/Pagination/Pagination';
import { PaginationItem } from '../components/Pagination/PaginationItem';
import { PAGINATION_META, PAGINATION_ITEM_META } from '../components/Pagination/Pagination.meta';
import { PAGINATION_TOKEN_MANIFEST } from '../components/Pagination/Pagination.tokens';
import { PAGINATION_RECIPE_DEFINITION } from '../components/Pagination/Pagination.recipe';
import { PaginationPreview } from '../components/Pagination/PaginationPreview';
import { BOTTOM_NAVIGATION_META } from '../components/BottomNavigation/BottomNavigation.meta';
import { BOTTOM_NAVIGATION_TOKEN_MANIFEST } from '../components/BottomNavigation/BottomNavigation.tokens';
import { BOTTOM_NAVIGATION_RECIPE_DEFINITION } from '../components/BottomNavigation/BottomNavigation.recipe';
import { CONTAINER_META } from '../components/Container/Container.meta';
import { CONTAINER_TOKEN_MANIFEST } from '../components/Container/Container.tokens';
import { CONTAINER_RECIPE_DEFINITION } from '../components/Container/Container.recipe';
import { CARD_TOKEN_MANIFEST } from '../components/Card/Card.tokens';
import { CARD_META } from '../components/Card/Card.meta';
import { Card } from '../components/Card/Card';
import { FAB_META } from '../components/FAB/FAB.meta';
import { FAB_TOKEN_MANIFEST } from '../components/FAB/FAB.tokens';
import { FAB_RECIPE_DEFINITION } from '../components/FAB/FAB.recipe';
import { LIST_ITEM_META } from '../components/ListItem/ListItem.meta';
import { LIST_ITEM_TOKEN_MANIFEST } from '../components/ListItem/ListItem.tokens';
import { LIST_ITEM_RECIPE_DEFINITION } from '../components/ListItem/ListItem.recipe';
import { LIST_ITEM_GROUP_META } from '../components/ListItemGroup/ListItemGroup.meta';
import { LIST_ITEM_GROUP_TOKEN_MANIFEST } from '../components/ListItemGroup/ListItemGroup.tokens';
import { LIST_ITEM_GROUP_RECIPE_DEFINITION } from '../components/ListItemGroup/ListItemGroup.recipe';
import { SURFACE_META } from '../components/Surface/Surface.meta';
import { SURFACE_TOKEN_MANIFEST } from '../components/Surface/Surface.tokens';
import { SURFACE_RECIPE_DEFINITION } from '../components/Surface/Surface.recipe';
import { TOOLTIP_META } from '../components/Tooltip/Tooltip.meta';
import { TOOLTIP_TOKEN_MANIFEST } from '../components/Tooltip/Tooltip.tokens';
import { TOOLTIP_RECIPE_DEFINITION } from '../components/Tooltip/Tooltip.recipe';
import { CHIP_GROUP_META } from '../components/ChipGroup/ChipGroup.meta';
import { CHIP_GROUP_TOKEN_MANIFEST } from '../components/ChipGroup/ChipGroup.tokens';
import { CHIP_GROUP_RECIPE_DEFINITION } from '../components/ChipGroup/ChipGroup.recipe';
import { GRID_META } from '../components/Grid/Grid.meta';
import { GRID_TOKEN_MANIFEST } from '../components/Grid/Grid.tokens';
import { GRID_RECIPE_DEFINITION } from '../components/Grid/Grid.recipe';
import { CAROUSEL_META } from '../components/Carousel/Carousel.meta';
import { CAROUSEL_TOKEN_MANIFEST } from '../components/Carousel/Carousel.tokens';
import { CAROUSEL_RECIPE_DEFINITION } from '../components/Carousel/Carousel.recipe';
import { Carousel } from '../components/Carousel/Carousel';
import { MODAL_META } from '../components/Modal/Modal.meta';
import { MODAL_TOKEN_MANIFEST } from '../components/Modal/Modal.tokens';
import { MODAL_RECIPE_DEFINITION } from '../components/Modal/Modal.recipe';
import { Modal } from '../components/Modal/Modal';
import { BottomNavigation, BottomNavItem } from '../components/BottomNavigation';
import { Container } from '../components/Container';
import { FAB } from '../components/FAB';
import { ListItem } from '../components/ListItem';
import { ListItemGroup } from '../components/ListItemGroup';
import { ChipGroup } from '../components/ChipGroup';
import { Select } from '../components/Select';
import { SELECT_META } from '../components/Select/Select.meta';
import { SELECT_TOKEN_MANIFEST } from '../components/Select/Select.tokens';
import { SELECT_RECIPE_DEFINITION } from '../components/Select/Select.recipe';
import { SelectPreview } from '../components/Select/SelectPreview';
import { SegmentedControl } from '../components/SegmentedControl';
import { SEGMENTED_CONTROL_META } from '../components/SegmentedControl/SegmentedControl.meta';
import { SEGMENTED_CONTROL_TOKEN_MANIFEST } from '../components/SegmentedControl/SegmentedControl.tokens';
import { SEGMENTED_CONTROL_RECIPE_DEFINITION } from '../components/SegmentedControl/SegmentedControl.recipe';
import { Dialog } from '../components/Dialog';
import { Toast } from '../components/Toast';
import { Progress } from '../components/Progress';
import { Accordion } from '../components/Accordion';
import { Separator } from '../components/Separator';
import { Menu } from '../components/Menu';
import { Link } from '../components/Link';
import { Surface } from '../components/Surface';
import { Tooltip } from '../components/Tooltip';
import { CircularProgressIndicator } from '../components/CircularProgressIndicator';
import { LinearProgressIndicator } from '../components/LinearProgressIndicator';
import { Collapsible } from '../components/Collapsible';
import { NumberField } from '../components/NumberField';
import { NavigationMenu } from '../components/NavigationMenu';
import { Popover } from '../components/Popover';
import { Grid, Column } from '../components/Grid';
import { Meter } from '../components/Meter';
import { resolveRegistrySlug } from './componentRegistrySlugMap';

/**
 * Standardized documentation showcase sections for the generic component doc
 * page. Each is a shared `*.showcase.tsx` export (no Storybook/app imports) so
 * the platform docs and Storybook render identically. All fields optional and
 * backward-compatible; the generic page falls back to `previewComponent` /
 * `component` when a section is absent.
 */
export interface ComponentDocShowcase {
  /** Primary "at a glance" render (attention levels / hero variants). */
  variants?: ComponentType<any>;
  /** Size ramp (xs → l), when the component is size-aware. */
  sizes?: ComponentType<any>;
  /**
   * "Variants on Surfaces" — the component rendered across the surface ladder.
   * Should be built on the shared `SurfaceLadder` primitive.
   */
  surfaces?: ComponentType<any>;
}

export interface ComponentRegistryEntry {
  recipe?: ComponentRecipeDefinition;
  manifest: ComponentTokenManifest;
  /** Unified component metadata (Phase 1 — optional, backward-compatible) */
  meta?: ComponentMeta;
  /** Preview component for the editor canvas (shows variation grids) */
  previewComponent?: ComponentType<any>;
  /** The actual component for rendering on the experience canvas (single instance) */
  component?: ComponentType<any>;
  /** Standardized doc-page showcase sections (variants / sizes / surfaces). */
  docShowcase?: ComponentDocShowcase;
}

/**
 * Minimal token manifest stub. Used to register a component in the runtime
 * registry (so ASTRenderer can resolve `type: 'Foo'` to a real component)
 * before a full token-authoring pass has been done. Editor token panels
 * will show empty until the component's `.tokens.ts` is added and wired.
 */
function stubManifest(componentName: string): ComponentTokenManifest {
  return {
    componentName,
    version: '0.0.0-stub',
    tokens: {},
    totalTokens: 0,
    categories: {},
  };
}

export const COMPONENT_REGISTRY: Record<string, ComponentRegistryEntry> = {
  Button: {
    recipe: BUTTON_RECIPE_DEFINITION,
    manifest: BUTTON_TOKEN_MANIFEST,
    meta: BUTTON_META,
    previewComponent: ButtonPreview,
    component: Button,
    docShowcase: {
      variants: ButtonAttentionLevels,
      sizes: ButtonSizes,
      surfaces: ButtonSurfaceShowcase,
    },
  },
  Avatar: {
    recipe: AVATAR_RECIPE_DEFINITION,
    manifest: AVATAR_TOKEN_MANIFEST,
    meta: AVATAR_META,
    previewComponent: AvatarPreview,
    component: Avatar,
  },
  Icon: {
    manifest: ICON_TOKEN_MANIFEST,
    meta: ICON_META,
    component: Icon,
  },
  Text: {
    recipe: TEXT_RECIPE_DEFINITION,
    manifest: TEXT_TOKEN_MANIFEST,
    meta: TEXT_META,
    component: Text,
  },
  IconContained: {
    recipe: ICON_CONTAINED_RECIPE_DEFINITION,
    manifest: ICON_CONTAINED_TOKEN_MANIFEST,
    meta: ICON_CONTAINED_META,
    previewComponent: IconContainedPreview,
    component: IconContained,
  },
  Image: {
    recipe: IMAGE_RECIPE_DEFINITION,
    manifest: IMAGE_TOKEN_MANIFEST,
    meta: IMAGE_META,
    previewComponent: ImagePreview,
    component: Image,
  },
  Checkbox: {
    recipe: CHECKBOX_RECIPE_DEFINITION,
    manifest: CHECKBOX_TOKEN_MANIFEST,
    meta: CHECKBOX_META,
    previewComponent: CheckboxPreview,
    component: Checkbox,
  },
  CheckboxField: {
    recipe: CHECKBOX_FIELD_RECIPE_DEFINITION,
    manifest: CHECKBOX_FIELD_TOKEN_MANIFEST,
    meta: CHECKBOX_FIELD_META,
    previewComponent: CheckboxFieldPreview,
    component: CheckboxField,
  },
  RadioField: {
    recipe: RADIO_FIELD_RECIPE_DEFINITION,
    manifest: RADIO_FIELD_TOKEN_MANIFEST,
    meta: RADIO_FIELD_META,
    previewComponent: RadioFieldPreview,
    component: RadioField,
  },
  Radio: {
    recipe: RADIO_RECIPE_DEFINITION,
    manifest: RADIO_TOKEN_MANIFEST,
    meta: RADIO_META,
    previewComponent: RadioPreview,
    component: Radio,
  },
  IconButton: {
    recipe: ICON_BUTTON_RECIPE_DEFINITION,
    manifest: ICON_BUTTON_TOKEN_MANIFEST,
    meta: ICON_BUTTON_META,
    previewComponent: IconButtonPreview,
    component: IconButton,
  },
  Switch: {
    recipe: SWITCH_RECIPE_DEFINITION,
    manifest: SWITCH_TOKEN_MANIFEST,
    meta: SWITCH_META,
    previewComponent: SwitchPreview,
    component: Switch,
  },
  Stepper: {
    recipe: STEPPER_RECIPE_DEFINITION,
    manifest: STEPPER_TOKEN_MANIFEST,
    meta: STEPPER_META,
    previewComponent: StepperPreview,
    component: Stepper,
  },
  CounterBadge: {
    recipe: COUNTER_BADGE_RECIPE_DEFINITION,
    manifest: COUNTER_BADGE_TOKEN_MANIFEST,
    meta: COUNTER_BADGE_META,
    previewComponent: CounterBadgePreview,
    component: CounterBadge,
  },
  IndicatorBadge: {
    recipe: INDICATOR_BADGE_RECIPE_DEFINITION,
    manifest: INDICATOR_BADGE_TOKEN_MANIFEST,
    meta: INDICATOR_BADGE_META,
    previewComponent: IndicatorBadgePreview,
    component: IndicatorBadge,
  },
  Divider: {
    manifest: DIVIDER_TOKEN_MANIFEST,
    meta: DIVIDER_META,
    component: Divider,
  },
  // Logo: {
  //   recipe: LOGO_RECIPE_DEFINITION,
  //   manifest: LOGO_TOKEN_MANIFEST,
  //   meta: LOGO_META,
  //   previewComponent: LogoPreview,
  //   component: Logo,
  // },
  Chip: {
    recipe: CHIP_RECIPE_DEFINITION,
    manifest: CHIP_TOKEN_MANIFEST,
    meta: CHIP_META,
    previewComponent: ChipPreview,
    component: Chip,
  },
  Tabs: {
    recipe: TABS_RECIPE_DEFINITION,
    manifest: TABS_TOKEN_MANIFEST,
    meta: TABS_META,
    previewComponent: TabsPreview,
    component: Tabs,
  },
  SelectableButton: {
    recipe: SELECTABLE_BUTTON_RECIPE_DEFINITION,
    manifest: SELECTABLE_BUTTON_TOKEN_MANIFEST,
    meta: SELECTABLE_BUTTON_META,
    previewComponent: SelectableButtonPreview,
    component: SelectableButton,
  },
  SelectableIconButton: {
    recipe: SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION,
    manifest: SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST,
    meta: SELECTABLE_ICON_BUTTON_META,
    previewComponent: SelectableIconButtonPreview,
    component: SelectableIconButton,
  },
  SelectableSingleTextButton: {
    recipe: SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
    manifest: SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
    meta: SELECTABLE_SINGLE_TEXT_BUTTON_META,
    previewComponent: SelectableSingleTextButtonPreview,
    component: SelectableSingleTextButton,
  },
  SingleTextButton: {
    recipe: SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
    manifest: SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
    meta: SINGLE_TEXT_BUTTON_META,
    previewComponent: SingleTextButtonPreview,
    component: SingleTextButton,
  },
  WebHeader: {
    recipe: WEBHEADER_RECIPE_DEFINITION,
    manifest: WEBHEADER_TOKEN_MANIFEST,
    meta: WEBHEADER_META,
    component: WebHeader,
  },
  InputField: {
    recipe: INPUT_RECIPE_DEFINITION,
    manifest: INPUT_TOKEN_MANIFEST,
    meta: INPUT_META,
    previewComponent: InputPreview,
    component: InputField,
  },
  Input: {
    manifest: INPUT_TOKEN_MANIFEST,
    component: Input,
  },
  Spinner: {
    manifest: SPINNER_TOKEN_MANIFEST,
    meta: SPINNER_META,
    component: Spinner,
  },
  Skeleton: {
    manifest: SKELETON_TOKEN_MANIFEST,
    meta: SKELETON_META,
    component: SkeletonItem,
  },
  Slider: {
    recipe: SLIDER_RECIPE_DEFINITION,
    manifest: SLIDER_TOKEN_MANIFEST,
    meta: SLIDER_META,
    previewComponent: SliderPreview,
    component: Slider,
  },
  TouchSlider: {
    recipe: TOUCH_SLIDER_RECIPE_DEFINITION,
    manifest: TOUCH_SLIDER_TOKEN_MANIFEST,
    meta: TOUCH_SLIDER_META,
    previewComponent: TouchSliderPreview,
    component: TouchSlider,
  },
  // ─── Fully-authored additions (have meta + recipe + manifest) ─────────
  Badge: {
    recipe: BADGE_RECIPE_DEFINITION,
    manifest: BADGE_TOKEN_MANIFEST,
    meta: BADGE_META,
    previewComponent: BadgePreview,
    component: Badge,
  },
  Logo: {
    recipe: LOGO_RECIPE_DEFINITION,
    manifest: LOGO_TOKEN_MANIFEST,
    meta: LOGO_META,
    previewComponent: LogoPreview,
    component: Logo,
  },
  PaginationDots: {
    recipe: PAGINATION_DOTS_RECIPE_DEFINITION,
    manifest: PAGINATION_DOTS_TOKEN_MANIFEST,
    meta: PAGINATION_DOTS_META,
    previewComponent: PaginationDotsPreview,
    component: PaginationDots,
  },
  Pagination: {
    recipe: PAGINATION_RECIPE_DEFINITION,
    manifest: PAGINATION_TOKEN_MANIFEST,
    meta: PAGINATION_META,
    previewComponent: PaginationPreview,
    component: Pagination,
  },
  PaginationItem: {
    recipe: PAGINATION_RECIPE_DEFINITION,
    manifest: PAGINATION_TOKEN_MANIFEST,
    meta: PAGINATION_ITEM_META,
    component: PaginationItem,
  },
  Carousel: {
    recipe: CAROUSEL_RECIPE_DEFINITION,
    manifest: CAROUSEL_TOKEN_MANIFEST,
    meta: CAROUSEL_META,
    component: Carousel.Root,
  },
  BottomNavigation: {
    recipe: BOTTOM_NAVIGATION_RECIPE_DEFINITION,
    manifest: BOTTOM_NAVIGATION_TOKEN_MANIFEST,
    meta: BOTTOM_NAVIGATION_META,
    component: BottomNavigation,
  },
  Container: {
    recipe: CONTAINER_RECIPE_DEFINITION,
    manifest: CONTAINER_TOKEN_MANIFEST,
    meta: CONTAINER_META,
    component: Container,
  },
  Card: {
    manifest: CARD_TOKEN_MANIFEST,
    meta: CARD_META,
    component: Card,
  },
  FAB: {
    recipe: FAB_RECIPE_DEFINITION,
    manifest: FAB_TOKEN_MANIFEST,
    meta: FAB_META,
    component: FAB,
  },
  ChipGroup: {
    recipe: CHIP_GROUP_RECIPE_DEFINITION,
    manifest: CHIP_GROUP_TOKEN_MANIFEST,
    meta: CHIP_GROUP_META,
    component: ChipGroup,
  },
  ListItem: {
    recipe: LIST_ITEM_RECIPE_DEFINITION,
    manifest: LIST_ITEM_TOKEN_MANIFEST,
    meta: LIST_ITEM_META,
    component: ListItem,
  },
  ListItemGroup: {
    recipe: LIST_ITEM_GROUP_RECIPE_DEFINITION,
    manifest: LIST_ITEM_GROUP_TOKEN_MANIFEST,
    meta: LIST_ITEM_GROUP_META,
    component: ListItemGroup,
  },
  Surface: {
    recipe: SURFACE_RECIPE_DEFINITION,
    manifest: SURFACE_TOKEN_MANIFEST,
    meta: SURFACE_META,
    component: Surface,
  },
  Tooltip: {
    recipe: TOOLTIP_RECIPE_DEFINITION,
    manifest: TOOLTIP_TOKEN_MANIFEST,
    meta: TOOLTIP_META,
    component: Tooltip,
  },
  Grid: {
    recipe: GRID_RECIPE_DEFINITION,
    manifest: GRID_TOKEN_MANIFEST,
    meta: GRID_META,
    component: Grid,
  },
  // ─── WebHeader compound sub-components ────────────────────────────────
  // Must be registered so the LLM can emit <WebHeader><HeaderItem /></WebHeader>.
  // Without these the children render as unknown-component fallbacks.
  HeaderItem: { manifest: stubManifest('HeaderItem'), component: HeaderItem },
  PrimaryNav: { manifest: stubManifest('PrimaryNav'), component: PrimaryNav },
  SecondaryNav: { manifest: stubManifest('SecondaryNav'), component: SecondaryNav },
  MobileDrawer: { manifest: stubManifest('MobileDrawer'), component: MobileDrawer },
  // ─── Composition-critical primitives (stub manifests for now) ─────────
  // Each component file exists with a full public API; only the token
  // manifest / recipe / meta are pending. Authoring those per-component is
  // tracked separately — registration unblocks the DCA playground today.
  BottomNavItem: { manifest: stubManifest('BottomNavItem'), component: BottomNavItem },
  Select: {
    recipe: SELECT_RECIPE_DEFINITION,
    manifest: SELECT_TOKEN_MANIFEST,
    meta: SELECT_META,
    previewComponent: SelectPreview,
    component: Select,
  },
  SegmentedControl: {
    recipe: SEGMENTED_CONTROL_RECIPE_DEFINITION,
    manifest: SEGMENTED_CONTROL_TOKEN_MANIFEST,
    meta: SEGMENTED_CONTROL_META,
    component: SegmentedControl,
  },
  Dialog: { manifest: stubManifest('Dialog'), component: Dialog },
  Modal: {
    recipe: MODAL_RECIPE_DEFINITION,
    manifest: MODAL_TOKEN_MANIFEST,
    meta: MODAL_META,
    component: Modal,
  },
  Toast: { manifest: stubManifest('Toast'), component: Toast },
  Progress: { manifest: stubManifest('Progress'), component: Progress },
  Accordion: { manifest: stubManifest('Accordion'), component: Accordion },
  Separator: { manifest: stubManifest('Separator'), component: Separator },
  Menu: { manifest: stubManifest('Menu'), component: Menu },
  Link: { manifest: stubManifest('Link'), component: Link },
  CircularProgressIndicator: {
    manifest: stubManifest('CircularProgressIndicator'),
    component: CircularProgressIndicator,
  },
  LinearProgressIndicator: {
    manifest: stubManifest('LinearProgressIndicator'),
    component: LinearProgressIndicator,
  },
  Collapsible: { manifest: stubManifest('Collapsible'), component: Collapsible },
  NumberField: { manifest: stubManifest('NumberField'), component: NumberField },
  NavigationMenu: { manifest: stubManifest('NavigationMenu'), component: NavigationMenu },
  Popover: { manifest: stubManifest('Popover'), component: Popover },
  Column: { manifest: stubManifest('Column'), component: Column },
  Meter: { manifest: stubManifest('Meter'), component: Meter },
};

// ---------------------------------------------------------------------------
// Slug ↔ PascalCase mapping (canonical list in `componentRegistrySlugMap.ts`)
// ---------------------------------------------------------------------------

/** Map URL-safe slugs to PascalCase registry keys */
const SLUG_TO_NAME: Record<string, string> = {
  button: 'Button',
  avatar: 'Avatar',
  badge: 'Badge',
  'bottom-navigation': 'BottomNavigation',
  card: 'Card',
  carousel: 'Carousel',
  'chip-group': 'ChipGroup',
  container: 'Container',
  icon: 'Icon',
  'icon-button': 'IconButton',
  'icon-contained': 'IconContained',
  image: 'Image',
  checkbox: 'Checkbox',
  'checkbox-field': 'CheckboxField',
  'radio-field': 'RadioField',
  radio: 'Radio',
  switch: 'Switch',
  stepper: 'Stepper',
  text: 'Text',
  'counter-badge': 'CounterBadge',
  'indicator-badge': 'IndicatorBadge',
  divider: 'Divider',
  fab: 'FAB',
  grid: 'Grid',
  'list-item': 'ListItem',
  'list-item-group': 'ListItemGroup',
  logo: 'Logo',
  chip: 'Chip',
  'pagination-dots': 'PaginationDots',
  pagination: 'Pagination',
  'pagination-item': 'PaginationItem',
  select: 'Select',
  'selectable-button': 'SelectableButton',
  'selectable-icon-button': 'SelectableIconButton',
  'selectable-single-text-button': 'SelectableSingleTextButton',
  'single-text-button': 'SingleTextButton',
  surface: 'Surface',
  tabs: 'Tabs',
  tooltip: 'Tooltip',
  'input-field': 'InputField',
  input: 'InputField',
  spinner: 'Spinner',
  slider: 'Slider',
  'touch-slider': 'TouchSlider',
  'web-header': 'WebHeader',
  modal: 'Modal',
};

/** Resolve a URL slug to a PascalCase registry key */
export function resolveComponentSlug(slug: string): string | null {
  return resolveRegistrySlug(slug);
}

/** Look up a registry entry by URL slug */
export function getComponentBySlug(slug: string): ComponentRegistryEntry | null {
  const name = resolveComponentSlug(slug);
  if (!name) return null;
  return COMPONENT_REGISTRY[name] ?? null;
}

/** Get all ComponentMeta descriptors from the registry */
export function getAllComponentMetas(): ComponentMeta[] {
  return Object.values(COMPONENT_REGISTRY)
    .map((entry) => entry.meta)
    .filter((meta): meta is ComponentMeta => meta != null);
}

/** Look up a component's meta by its PascalCase name */
export function getComponentMeta(name: string): ComponentMeta | undefined {
  return COMPONENT_REGISTRY[name]?.meta ?? undefined;
}

/** Get all registered component PascalCase names */
export function getRegisteredTypes(): string[] {
  return Object.keys(COMPONENT_REGISTRY);
}

/** Get all component metas in a given category */
export function getComponentMetasByCategory(category: ComponentMeta['category']): ComponentMeta[] {
  return getAllComponentMetas().filter((m) => m.category === category);
}
