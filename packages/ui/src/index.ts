/**
 * OneUI - Web Component Library
 * React components using Base UI + CSS Modules + Design Tokens
 *
 * @deprecated Prefer path-based imports for better build performance:
 *   import { Button } from '@oneui/ui/components/Button'
 *   import { useBrandCSS } from '@oneui/ui/hooks/useBrandCSS'
 *
 * This barrel export is kept for backward compatibility.
 * See package.json "exports" for all available subpath imports.
 */

// Core Components - Actions
export {
  Button,
  type ButtonProps,
  type ButtonAppearance,
  type ButtonVariant,
  type ButtonSize,
  type ButtonAttention,
} from './components/Button';
export {
  IconButton,
  type IconButtonProps,
  type IconButtonVariant,
  type IconButtonSize,
  type IconButtonAttention,
  type IconButtonAppearance,
  type IconButtonLayout,
  IconButtonPreview,
  type IconButtonPreviewProps,
  ICON_BUTTON_TOKEN_MANIFEST,
  ICON_BUTTON_TOKENS,
  getIconButtonTokensByCategory,
  getIconButtonTokenDefault,
  ICON_BUTTON_RECIPE_DEFINITION,
} from './components/IconButton';
export { Link, type LinkProps, type LinkVariant, type LinkSize } from './components/Link';
export {
  FAB,
  type FABProps,
  type FABVariant,
  type FABSize,
  type FABPosition,
} from './components/FAB';

// Core Components - Inputs
export {
  InputField,
  Input,
  InputFeedback,
  InputDynamicText,
  inputSizeToLabelSize,
  type InputFieldProps,
  type InputProps,
  type InputAppearance,
  type InputSize,
  type InputShape,
  type InputFeedbackProps,
  type InputFeedbackVariant,
  type InputFeedbackAttention,
  type InputDynamicTextProps,
  type InputLabelSize,
  INPUT_META,
  INPUT_TOKEN_MANIFEST,
  INPUT_TOKENS,
  getInputTokensByCategory,
  getInputTokenDefault,
  INPUT_RECIPE_DEFINITION,
} from './components/Input';
export {
  Checkbox,
  type CheckboxProps,
  type CheckboxSize,
  type CheckboxAppearance,
  type CheckboxAccent,
  CheckboxPreview,
  type CheckboxPreviewProps,
  CHECKBOX_TOKEN_MANIFEST,
  CHECKBOX_TOKENS,
  getCheckboxTokensByCategory,
  getCheckboxTokenDefault,
  CHECKBOX_RECIPE_DEFINITION,
} from './components/Checkbox';
export {
  CheckboxField,
  type CheckboxFieldProps,
  checkboxFieldSizeToInputNumeric,
  CheckboxFieldPreview,
  type CheckboxFieldPreviewProps,
  CHECKBOX_FIELD_TOKEN_MANIFEST,
  CHECKBOX_FIELD_TOKENS,
  getCheckboxFieldTokensByCategory,
  getCheckboxFieldTokenDefault,
  CHECKBOX_FIELD_RECIPE_DEFINITION,
  CHECKBOX_FIELD_META,
} from './components/CheckboxField';
export {
  Switch,
  type SwitchProps,
  type SwitchSize,
  type SwitchAppearance,
  type SwitchAccent,
  SWITCH_TOKEN_MANIFEST,
  SWITCH_TOKENS,
  getSwitchTokensByCategory,
  SWITCH_RECIPE_DEFINITION,
} from './components/Switch';
export { Select, type SelectProps, type SelectOption } from './components/Select';
export {
  SegmentedControl,
  SEGMENTED_CONTROL_META,
  type SegmentedControlProps,
  type SegmentedControlItemProps,
} from './components/SegmentedControl';
export type { InteractiveComponentProps } from '@oneui/shared';

// Core Components - Overlays
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogClose,
  type DialogProps,
  type DialogSize,
  type AlertDialogProps,
} from './components/Dialog';
export {
  Modal,
  ModalTrigger,
  ModalClose,
  type ModalProps,
  type ModalSize,
  type DividerVisibility,
  type FooterOrientation,
  type HeaderAlign,
  MODAL_TOKEN_MANIFEST,
  MODAL_TOKENS,
  getModalTokensByCategory,
  getModalTokenDefault,
  MODAL_RECIPE_DEFINITION,
  MODAL_META,
} from './components/Modal';
export {
  Tooltip,
  TooltipProvider,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipSide,
  type TooltipAlign,
  type TooltipPosition,
  type TooltipTrigger,
} from './components/Tooltip';

// Core Components - Navigation
export {
  Carousel,
  CarouselDesktop,
  CarouselTablet,
  CarouselMobile,
  CarouselSelectionRail,
  useCarousel,
  CAROUSEL_TOKENS,
  CAROUSEL_TOKEN_MANIFEST,
  getCarouselTokensByCategory,
  CAROUSEL_META,
  CAROUSEL_DESKTOP_PRESET,
  CAROUSEL_TABLET_PRESET,
  CAROUSEL_MOBILE_PRESET,
  CAROUSEL_PLATFORM_PRESETS,
  CAROUSEL_IMAGE_ASPECT_RATIOS,
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT,
  CAROUSEL_FLEXIBLE_HEIGHT_MIN,
  type CarouselRootProps,
  type CarouselViewportProps,
  type CarouselTrackProps,
  type CarouselSlideProps,
  type CarouselSlideImageProps,
  type CarouselSlideContentProps,
  type CarouselSlideCornerProps,
  type CarouselSlideButtonGroupProps,
  type CarouselControlsProps,
  type CarouselIndicatorListProps,
  type CarouselPaginationProps,
  type CarouselPaginationOnMediaProps,
  type CarouselSelectionRailProps,
  type CarouselSelectionRailListProps,
  type CarouselSelectionRailItemData,
  type CarouselSelectionRailOnMediaProps,
  type CarouselPrevButtonProps,
  type CarouselNextButtonProps,
  type CarouselPlayButtonProps,
  type CarouselDesktopProps,
  type CarouselTabletProps,
  type CarouselMobileProps,
  type CarouselOpts,
  type CarouselAlign,
  type CarouselAlignment,
  type CarouselAspectRatio,
  type CarouselImageAspectRatio,
  type CarouselHeightMode,
  type CarouselFollowsAspectRatio,
  type CarouselContentWidth,
  type CarouselButtonOrientation,
  type CarouselButtonWidth,
  type CarouselCornerPlacement,
  type CarouselControlsPlacement,
  type CarouselControlsLayout,
  type CarouselControlsType,
  type CarouselPaginationAlign,
  type CarouselPlatform,
  type CarouselPlatformPreset,
  type CarouselSurface,
  type CarouselAppearance,
  type CarouselContextValue,
} from './components/Carousel';
export {
  Tabs,
  TabGroup,
  TabItem,
  TabPanel,
  useTabsContext,
  type TabsProps,
  type TabProps,
  type TabPanelProps,
  type TabListProps,
  type TabGroupProps,
  type TabItemProps,
  type TabsOrientation,
  type TabsSize,
  type TabsValue,
  type TabsContextValue,
} from './components/Tabs';
export {
  NavigationMenu,
  type NavigationMenuProps,
  type NavigationMenuItemProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuContentProps,
  type NavigationMenuOrientation,
} from './components/NavigationMenu';
export {
  WebHeader,
  type WebHeaderProps,
  type WebHeaderVariant,
  type WebHeaderBreakpoint,
  type PrimaryNavProps as WebHeaderPrimaryNavProps,
  type SecondaryNavProps as WebHeaderSecondaryNavProps,
  type HeaderItemProps,
  type MobileDrawerProps,
} from './components/WebHeader';

// Core Components - Data Display
export {
  Text,
  resolveTextState,
  resolveTextSize,
  TEXT_VARIANTS,
  TEXT_SIZE_OPTIONS,
  TEXT_SIZE_ORDER,
  TEXT_WEIGHTS,
  TEXT_ATTENTIONS,
  TEXT_APPEARANCES,
  BODY_VALID_ORDER,
  TEXT_TOKEN_MANIFEST,
  TEXT_TOKENS,
  TEXT_META,
  TEXT_RECIPE_DEFINITION,
  type TextProps,
  type TextVariant,
  type TextSize,
  type TextSizeStep,
  type TextSizeBody,
  type TextSizeLabel,
  type TextSizeCode,
  type TextSizeDisplay,
  type TextWeight,
  type TextAttention,
  type TextAppearance,
  type TextAlign,
  type TextLanguage,
} from './components/Text';
export {
  Avatar,
  type AvatarProps,
  type AvatarSize,
  type AvatarContent,
  type AvatarAttention,
  type AvatarAppearance,
  getInitials,
  resolveAvatarSize,
  AVATAR_TOKEN_MANIFEST,
  AVATAR_TOKENS,
  getAvatarTokensByCategory,
  getAvatarTokenDefault,
  AVATAR_RECIPE_DEFINITION,
} from './components/Avatar';

// Media
export {
  Image,
  type ImageProps,
  type ImageAspectRatio,
  type ImageObjectFit,
  type ImageLoadingStrategy,
  IMAGE_TOKEN_MANIFEST,
  IMAGE_TOKENS,
  getImageTokensByCategory,
  getImageTokenDefault,
  IMAGE_RECIPE_DEFINITION,
} from './components/Image';

export {
  IconContained,
  type IconContainedProps,
  type IconContainedSize,
  type IconContainedAttention,
  type IconContainedAppearance,
  IconContainedPreview,
  type IconContainedPreviewProps,
  ICON_CONTAINED_TOKEN_MANIFEST,
  ICON_CONTAINED_TOKENS,
  getIconContainedTokensByCategory,
  getIconContainedTokenDefault,
  ICON_CONTAINED_RECIPE_DEFINITION,
} from './components/IconContained';
export {
  CounterBadge,
  type CounterBadgeProps,
  type CounterBadgeVariant,
  type CounterBadgeSize,
  type CounterBadgeAttention,
  type CounterBadgeAppearance,
  CounterBadgePreview,
  type CounterBadgePreviewProps,
  COUNTER_BADGE_TOKEN_MANIFEST,
  COUNTER_BADGE_TOKENS,
  getCounterBadgeTokensByCategory,
  getCounterBadgeTokenDefault,
  COUNTER_BADGE_RECIPE_DEFINITION,
} from './components/CounterBadge';
export {
  IndicatorBadge,
  type IndicatorBadgeProps,
  type IndicatorBadgeSize,
  type IndicatorBadgeAppearance,
  IndicatorBadgePreview,
  type IndicatorBadgePreviewProps,
  INDICATOR_BADGE_TOKEN_MANIFEST,
  INDICATOR_BADGE_TOKENS,
  getIndicatorBadgeTokensByCategory,
  getIndicatorBadgeTokenDefault,
  INDICATOR_BADGE_RECIPE_DEFINITION,
} from './components/IndicatorBadge';
export {
  Badge,
  type BadgeProps,
  type BadgeVariant,
  type BadgeSize,
  type BadgeAttention,
  type BadgeAppearance,
  BadgePreview,
  type BadgePreviewProps,
  BADGE_TOKEN_MANIFEST,
  BADGE_TOKENS,
  getBadgeTokensByCategory,
  getBadgeTokenDefault,
  BADGE_RECIPE_DEFINITION,
} from './components/Badge';

export {
  Chip,
  useChipState,
  type ChipProps,
  type ChipVariant,
  type ChipSize,
  type ChipAttention,
  type ChipAppearance,
  ChipPreview,
  type ChipPreviewProps,
  CHIP_TOKEN_MANIFEST,
  CHIP_TOKENS,
  getChipTokensByCategory,
  getChipTokenDefault,
  CHIP_RECIPE_DEFINITION,
  CHIP_META,
} from './components/Chip';

export { ChipGroup, type ChipGroupProps, CHIP_GROUP_META } from './components/ChipGroup';

export {
  PaginationDots,
  usePaginationDotsState,
  scaleForDistance,
  type PaginationDotsProps,
  type PaginationDotsAppearance,
  type PaginationDotsSize,
  type PaginationDotState,
  type PaginationDotScale,
  type PaginationDotDescriptor,
  PaginationDotsPreview,
  type PaginationDotsPreviewProps,
  PAGINATION_DOTS_TOKEN_MANIFEST,
  PAGINATION_DOTS_TOKENS,
  getPaginationDotsTokensByCategory,
  getPaginationDotsTokenDefault,
  PAGINATION_DOTS_RECIPE_DEFINITION,
  PAGINATION_DOTS_META,
} from './components/PaginationDots';

export {
  Pagination,
  PaginationItem,
  usePaginationState,
  buildPaginationPages,
  resolvePaginationSize,
  resolvePaginationVariant,
  resolvePaginationAppearance,
  _internal,
  type PaginationProps,
  type PaginationItemProps,
  type PaginationAppearance,
  type PaginationItemAppearance,
  type PaginationSize,
  type PaginationItemSize,
  type PaginationAttention,
  type PaginationItemAttention,
  type PaginationVariant,
  type PaginationItemVariant,
  type PaginationSlot,
  type UsePaginationStateOptions,
  type UsePaginationStateResult,
  PaginationPreview,
  type PaginationPreviewProps,
  PAGINATION_TOKEN_MANIFEST,
  PAGINATION_TOKENS,
  getPaginationTokensByCategory,
  getPaginationTokenDefault,
  PAGINATION_RECIPE_DEFINITION,
  PAGINATION_META,
  PAGINATION_ITEM_META,
} from './components/Pagination';

export {
  SelectableButton,
  useSelectableButtonState,
  type SelectableButtonProps,
  type SelectableButtonAppearance,
  type SelectableButtonAttention,
  type SelectableButtonSize,
  SelectableButtonPreview,
  type SelectableButtonPreviewProps,
  SELECTABLE_BUTTON_TOKEN_MANIFEST,
  SELECTABLE_BUTTON_TOKENS,
  getSelectableButtonTokensByCategory,
  getSelectableButtonTokenDefault,
  SELECTABLE_BUTTON_RECIPE_DEFINITION,
  SELECTABLE_BUTTON_META,
} from './components/SelectableButton';

export {
  SelectableIconButton,
  useSelectableIconButtonState,
  resolveSelectableIconButtonSize,
  type SelectableIconButtonProps,
  type SelectableIconButtonAppearance,
  type SelectableIconButtonAttention,
  type SelectableIconButtonSize,
  type SelectableIconButtonShape,
  SelectableIconButtonPreview,
  type SelectableIconButtonPreviewProps,
  SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST,
  SELECTABLE_ICON_BUTTON_TOKENS,
  getSelectableIconButtonTokensByCategory,
  getSelectableIconButtonTokenDefault,
  SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION,
  SELECTABLE_ICON_BUTTON_META,
} from './components/SelectableIconButton';

export {
  BottomNavigation,
  BottomNavItem,
  BottomNavigationContext,
  useBottomNavigationContext,
  resolveBottomNavigationAppearance,
  type BottomNavigationProps,
  type BottomNavItemProps,
  type BottomNavigationLabelType,
  type BottomNavigationAppearance,
} from './components/BottomNavigation';

export {
  ListItem,
  resolveListItemAppearance,
  type ListItemProps,
  type ListItemContainer,
  type ListItemSelected,
  type ListItemSlotAlign,
  type ListItemSlotSize,
  type ListItemEndSize,
  type ListItemAppearance,
  type ListItemDivider,
} from './components/ListItem';

export {
  ListItemGroup,
  type ListItemGroupProps,
  type ListItemGroupContainer,
  type ListItemGroupRole,
} from './components/ListItemGroup';

export {
  SelectableSingleTextButton,
  useSelectableSingleTextButtonState,
  type SelectableSingleTextButtonProps,
  type SelectableSingleTextButtonAppearance,
  type SelectableSingleTextButtonAttention,
  type SelectableSingleTextButtonSize,
  SelectableSingleTextButtonPreview,
  type SelectableSingleTextButtonPreviewProps,
  SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  SELECTABLE_SINGLE_TEXT_BUTTON_TOKENS,
  getSelectableSingleTextButtonTokensByCategory,
  getSelectableSingleTextButtonTokenDefault,
  SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
  SELECTABLE_SINGLE_TEXT_BUTTON_META,
} from './components/SelectableSingleTextButton';

export {
  SingleTextButton,
  useSingleTextButtonState,
  type SingleTextButtonProps,
  type SingleTextButtonAppearance,
  type SingleTextButtonAttention,
  type SingleTextButtonSize,
  type SingleTextButtonVariant,
  SingleTextButtonPreview,
  type SingleTextButtonPreviewProps,
  SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  SINGLE_TEXT_BUTTON_TOKENS,
  getSingleTextButtonTokensByCategory,
  getSingleTextButtonTokenDefault,
  SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
  SINGLE_TEXT_BUTTON_META,
} from './components/SingleTextButton';

export { Separator, type SeparatorProps, type SeparatorOrientation } from './components/Separator';
export {
  Divider,
  dividerHasRenderableContent,
  type DividerProps,
  type DividerOrientation,
  type DividerSize,
  type DividerContentAlign,
  type DividerAppearance,
  type DividerAttention,
  DIVIDER_META,
  DIVIDER_TOKEN_MANIFEST,
  DIVIDER_RECIPE_DEFINITION,
} from './components/Divider';
export {
  Scrim,
  useScrimState,
  type ScrimProps,
  type ScrimPosition,
  type ScrimSize,
  type ScrimAttention,
  type ScrimVariant,
  SCRIM_META,
  SCRIM_TOKEN_MANIFEST,
  SCRIM_RECIPE_DEFINITION,
} from './components/Scrim';
export { Progress, type ProgressProps, type ProgressSize } from './components/Progress';
export {
  CircularProgressIndicator,
  type CircularProgressIndicatorProps,
  type CircularProgressIndicatorSize,
  type CircularProgressIndicatorAppearance,
  type CircularProgressIndicatorVariant,
  type CircularProgressIndicatorContent,
} from './components/CircularProgressIndicator';
export {
  LinearProgressIndicator,
  useLinearProgressState,
  clampProgressValue,
  LinearProgressIndicatorPreview,
  type LinearProgressIndicatorProps,
  type LinearProgressIndicatorSize,
  type LinearProgressIndicatorType,
  type LinearProgressIndicatorAppearance,
  type LinearProgressState,
  type LinearProgressIndicatorPreviewProps,
} from './components/LinearProgressIndicator';
export { LINEAR_PROGRESS_INDICATOR_META } from './components/LinearProgressIndicator/LinearProgressIndicator.meta';
export { LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST } from './components/LinearProgressIndicator/LinearProgressIndicator.tokens';
export { LINEAR_PROGRESS_INDICATOR_RECIPE_DEFINITION } from './components/LinearProgressIndicator/LinearProgressIndicator.recipe';
export {
  Spinner,
  type SpinnerProps,
  type SpinnerSize,
  SPINNER_META,
  SPINNER_RECIPE_DEFINITION,
} from './components/Spinner';
export {
  SkeletonItem,
  SkeletonGroup,
  type SkeletonItemProps,
  type SkeletonGroupProps,
  type SkeletonLength,
  SKELETON_META,
  SKELETON_TOKEN_MANIFEST,
} from './components/Skeleton';
export {
  AgentPulse,
  type AgentPulseProps,
  type AgentPulseHandle,
  type AgentPulseState,
  type AgentPulseSize,
  type AgentPulseReducedMotionFallback,
  AGENT_PULSE_DEFAULT_LABEL,
  AGENT_PULSE_STATES,
  AGENT_PULSE_SIZES,
  AGENT_PULSE_META,
  AGENT_PULSE_TOKEN_MANIFEST,
  AGENT_PULSE_RECIPE_DEFINITION,
} from './components/AgentPulse';
export { Meter, type MeterProps, type MeterSize } from './components/Meter';
export { ScrollArea, type ScrollAreaProps, type ScrollAreaType } from './components/ScrollArea';

// Core Components - Popover & Menu
export {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverClose,
  type PopoverProps,
  type PopoverPortalProps,
  type PopoverSide,
  type PopoverAlign,
} from './components/Popover';
export {
  Menu,
  type MenuProps,
  type MenuPortalProps,
  type MenuItemProps,
  type MenuGroupProps,
  type MenuSide,
  type MenuAlign,
} from './components/Menu';
export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPortal,
  type PreviewCardProps,
  type PreviewCardPortalProps,
  type PreviewCardSide,
  type PreviewCardAlign,
} from './components/PreviewCard';

// Core Components - Disclosure
export {
  Accordion,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionPanelProps,
} from './components/Accordion';
export {
  Collapsible,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsiblePanelProps,
} from './components/Collapsible';

// Core Components - Range & Number
export {
  Slider,
  SliderPreview,
  useSliderState,
  SLIDER_TOKENS,
  SLIDER_TOKEN_MANIFEST,
  getSliderTokensByCategory,
  SLIDER_RECIPE_DEFINITION,
  SLIDER_META,
  type SliderProps,
  type SliderAppearance,
  type SliderOrientation,
  type SliderKnobStyle,
  type SliderTooltipMode,
  type SliderPreviewProps,
  type ResolvedSliderState,
} from './components/Slider';
export {
  TouchSlider,
  TouchSliderPreview,
  useTouchSliderState,
  TOUCH_SLIDER_TOKENS,
  TOUCH_SLIDER_TOKEN_MANIFEST,
  getTouchSliderTokensByCategory,
  TOUCH_SLIDER_RECIPE_DEFINITION,
  TOUCH_SLIDER_META,
  type TouchSliderProps,
  type TouchSliderAppearance,
  type TouchSliderOrientation,
  type TouchSliderProgressStyle,
  type TouchSliderPreviewProps,
  type ResolvedTouchSliderState,
} from './components/TouchSlider';
export { NumberField, type NumberFieldProps, type NumberFieldSize } from './components/NumberField';
export {
  Stepper,
  type StepperProps,
  type StepperSize,
  type StepperAttention,
  type StepperAppearance,
  type StepperAccent,
  type StepperDirection,
  type StepperControlSlot,
  StepperPreview,
  type StepperPreviewProps,
  STEPPER_TOKEN_MANIFEST,
  STEPPER_TOKENS,
  getStepperTokensByCategory,
  getStepperTokenDefault,
  STEPPER_RECIPE_DEFINITION,
} from './components/Stepper';

// Core Components - Selection
export {
  RadioGroup,
  Radio,
  type RadioGroupProps,
  type RadioProps,
  type RadioSize,
  type RadioAppearance,
  type RadioAccent,
  type RadioGroupContextValue,
  RadioPreview,
  type RadioPreviewProps,
  RADIO_TOKEN_MANIFEST,
  RADIO_TOKENS,
  getRadioTokensByCategory,
  getRadioTokenDefault,
  RADIO_RECIPE_DEFINITION,
} from './components/Radio';
export {
  RadioField,
  type RadioFieldProps,
  radioFieldSizeToInputNumeric,
  RadioFieldPreview,
  type RadioFieldPreviewProps,
  RADIO_FIELD_TOKEN_MANIFEST,
  RADIO_FIELD_TOKENS,
  getRadioFieldTokensByCategory,
  getRadioFieldTokenDefault,
  RADIO_FIELD_RECIPE_DEFINITION,
  RADIO_FIELD_META,
} from './components/RadioField';
export { Toggle, type ToggleProps, type ToggleSize } from './components/Toggle';
export {
  ToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
  type ToggleGroupSize,
} from './components/ToggleGroup';
export { CheckboxGroup, type CheckboxGroupProps } from './components/CheckboxGroup';

// Core Components - Feedback
export {
  Toast,
  ToastViewport,
  ToastProvider,
  type ToastProps,
  type ToastViewportProps,
  type ToastVariant,
  type ToastPosition,
} from './components/Toast';

// Core Components - Forms
export { Form, type FormProps } from './components/Form';
export { Fieldset, type FieldsetProps } from './components/Fieldset';

// Core Components - Layout
export { Surface, type SurfaceProps } from './components/Surface';
export {
  BrandProvider,
  type BrandProviderProps,
  type BrandProviderDensity,
} from './components/BrandProvider';
export { Container } from './components/Container';
export type { ContainerProps, ContainerVariant } from './components/Container';
export { Card, CARD_TOKEN_MANIFEST, CARD_META } from './components/Card';
export type { CardProps } from './components/Card';
export { Grid, Column } from './components/Grid';
export type { GridProps, ColumnProps, Breakpoint, ResponsiveValue } from './components/Grid';
export { GridOverlay } from './components/GridOverlay';
export type { GridOverlayProps } from './components/GridOverlay';
export { Toolbar, type ToolbarProps, type ToolbarOrientation } from './components/Toolbar';

// Chat & Agent Components
export {
  ChatComposer,
  type ChatComposerProps,
  type SuggestionChip,
} from './components/ChatComposer';
export {
  ChatSurface,
  ASTPreviewCard,
  AssetCard,
  ToneGuardCard,
  defaultRenderMessagePart,
  PART_COMPOSITION_AST,
  PART_COMPOSITION_ERROR,
  PART_TONE_GUARD,
  PART_ASSET,
  isCompositionASTPart,
  isCompositionErrorPart,
  isToneGuardPart,
  isAssetPart,
  type ChatMessage,
  type ChatSurfaceProps,
  type ChatSurfaceComposerProps,
  type ChatStatus,
  type RenderMessagePart,
  type ASTPreviewCardProps,
  type AssetCardProps,
  type AssetData,
  type AssetKind,
  type AssetPart,
  type ChatSurfaceDataPart,
  type CompositionASTData,
  type CompositionASTPart,
  type CompositionErrorData,
  type CompositionErrorPart,
  type ToneGuardCardProps,
  type ToneGuardData,
  type ToneGuardPart,
  type ToneGuardPhase,
} from './components/ChatSurface';

// Platform Components
export { Shell, type ShellProps } from './components/Platform/Shell/Shell';
export {
  TopBar,
  PlatformSelector,
  type TopBarProps,
  type PlatformConfig,
} from './components/Platform/TopBar/TopBar';
export type {
  PlatformOption,
  PlatformSelectorProps,
} from './components/Platform/TopBar/PlatformSelector';
export {
  LeftNav,
  type LeftNavProps,
  type NavigationItem,
  type UserInfo,
} from './components/Platform/LeftNav/LeftNav';
export {
  ModeNav,
  type ModeNavProps,
  type ModeNavItem,
  type PlatformModeId,
} from './components/Platform/ModeNav';
export {
  SecondaryNav,
  type SecondaryNavProps,
} from './components/Platform/SecondaryNav/SecondaryNav';
export {
  SettingsModal,
  type SettingsModalProps,
  type ThemeScope,
  type SubThemeConfig,
  type SubThemeOption,
  type DensityMode,
  type DensityOption,
} from './components/Platform/SettingsModal';
export {
  DensitySelector,
  type DensitySelectorProps,
} from './components/Platform/TopBar/DensitySelector';
export {
  ComponentPlatformSelector,
  type ComponentPlatformSelectorProps,
} from './components/Platform/TopBar/ComponentPlatformSelector';

// Brand, Foundations, ComponentTokenEditor, ExperienceCanvas, ContentBlock,
// JioRibbon, FigmaParity, and ComponentHarness are studio/builder tooling and
// have been relocated to apps/platform/src/design-tools/. They are no longer
// part of the public @oneui/ui API surface.

// Icon System
export {
  IconProvider,
  useIconSet,
  usePreloadIcons,
  IconContext,
  setIconSetLoader,
  setIconSetCatalog,
  getIconSetLoader,
  getIconSetCatalog,
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
} from './icons/IconContext';
// Public Icon = the design-system Icon component (token-based sizing, CSS
// Module, appearance + emphasis). The low-level resolver previously exported
// from './icons/Icon' is now an internal helper consumed via relative imports
// by the other DS components — exposing it publicly under the same name as
// the DS Icon was an API fragmentation bug (OUI-A2-01) because the two
// components have incompatible prop shapes.
export { Icon } from './components/Icon';
export type {
  IconProps,
  IconSize,
  IconAppearance,
  IconEmphasis,
} from './components/Icon';
export {
  ICON_TOKEN_MANIFEST,
  ICON_TOKENS,
  ICON_RECIPE_DEFINITION,
  getIconTokensByCategory,
} from './components/Icon';
// Deprecated aliases — kept for one alpha so existing imports keep compiling.
// Remove once consumers have migrated to the canonical names above.
/** @deprecated use `IconProps` */
export type { IconProps as DesignIconProps } from './components/Icon';
/** @deprecated use `IconSize` */
export type { IconSize as DesignIconSize } from './components/Icon';
/** @deprecated use `IconAppearance` */
export type { IconAppearance as DesignIconAppearance } from './components/Icon';
/** @deprecated use `IconEmphasis` */
export type { IconEmphasis as DesignIconEmphasis } from './components/Icon';
export {
  IconSetRegistry,
  SemanticMappings,
  IconCategories,
  getIconSetMetadata,
  getIconName,
  getIconSetIds,
  getSemanticIconNames,
  getImportSnippet,
} from './icons/IconRegistry';
// NOTE: `IconProps` and `IconSize` are NOT re-exported from `@oneui/shared`
// here — those names describe the low-level resolver's API (legacy `name` +
// `xs/sm/md/...` size presets) and conflict with the design-system Icon
// component's API exported above. The shared types remain available via
// `@oneui/shared` for any consumer who explicitly needs the resolver shape.
export type {
  IconSetId,
  IconStyle,
  IconSetMetadata,
  IconComponent,
  IconComponentProps,
  SemanticIconName,
  SemanticIconMapping,
  IconConfig,
  IconFoundationConfig,
  IconCategory,
  IconEntry,
  IconContextValue,
} from '@oneui/shared';
export { IconSizeValues } from '@oneui/shared';

// Hooks
export { usePlatformTokens } from './hooks/usePlatformTokens';
export { useDensityDimensionOverrides } from './hooks/useDensityDimensionOverrides';
export { useBrandCSS } from './hooks/useBrandCSS';
export { useSurfaceTokenVarsNew as useSurfaceTokenVars } from './hooks/useSurfaceTokenVarsNew';
export type {
  UseSurfaceTokenVarsNewOptions as UseSurfaceTokenVarsOptions,
  UseSurfaceTokenVarsNewResult as UseSurfaceTokenVarsResult,
} from './hooks/useSurfaceTokenVarsNew';
export { DecorationProvider, useComponentDecoration } from './hooks/useDecorationContext';
export type { DecorationProviderProps } from './hooks/useDecorationContext';
export { BrandLogoContext, useBrandLogo } from './contexts/BrandLogoContext';
export type { BrandLogoContextValue } from './contexts/BrandLogoContext';
export {
  DEFAULT_MATERIAL_FOUNDATION,
  MaterialFoundationProvider,
  normalizeMaterialFoundationConfig,
  useMaterialFoundation,
} from './contexts/MaterialFoundationContext';
export type {
  MaterialFoundationDefaults,
  MaterialFoundationMediaContext,
  MaterialFoundationMode,
} from './contexts/MaterialFoundationContext';

// Brand CSS Engine
// Framework-agnostic functions (from @oneui/shared via re-export)
export {
  buildAvailableScales,
  validateBrandCSS,
  wrapCSSForInjection,
  filterBrandDeclarations,
  BRAND_ALLOWED_PREFIXES,
} from './engine';
export type { InjectionMode, BrandCSSValidation, EngineAvailableScale } from './engine';
// UI-specific functions (next-gen surface computation bridge)
export {
  buildNewPaletteData,
  generateNewRootCSS,
  generateNewContextCSS,
  resolveNewTokenSets,
} from './engine';

// Button Token Manifest (for Component Token Editor)
export {
  BUTTON_TOKEN_MANIFEST,
  BUTTON_TOKENS,
  getButtonTokensByCategory,
  getButtonTokenDefault,
  isButtonTokenLocked,
  getButtonTokenLockReason,
  BUTTON_RECIPE_DEFINITION,
} from './components/Button';

// Button Preview (single source of truth for button rendering)
export { ButtonPreview } from './components/Button';
export type { ButtonPreviewProps } from './components/Button';

// Component registry (shared between platform + storybook)
export {
  COMPONENT_REGISTRY,
  resolveComponentSlug,
  getComponentBySlug,
  getAllComponentMetas,
} from './registry/componentRegistry';
export type { ComponentRegistryEntry } from './registry/componentRegistry';

// Canvas Context (preview mode signals)
export { CanvasContext, useCanvasContext } from './contexts/CanvasContext';
export type { CanvasContextValue } from './contexts/CanvasContext';

// Component Harness (standardized preview wrapper — used by ASTRenderer)
export { ComponentHarness } from './components/ComponentHarness';
export type { ComponentHarnessProps } from './components/ComponentHarness';

// AST Renderer (serializable component tree → React)
export { ASTRenderer } from './runtime';
export type { ASTRendererProps } from './runtime';

// Logo — brand identity mark component
export { Logo, LogoPreview } from './components/Logo';
export type { LogoProps, LogoSize, LogoVariant, LogoPreviewProps } from './components/Logo';

// Figma Parity Hook (the Dashboard/TokenTable UI lives in apps/platform/src/design-tools)
export { useFigmaParityCheck } from './hooks/useFigmaParityCheck';
export type {
  ParityCheckResult,
  UseFigmaParityCheckOptions,
  UseFigmaParityCheckReturn,
} from './hooks/useFigmaParityCheck';

// Foundation CSS generation (shared between platform + storybook)
export { generateTypographyFontCSS, generateTypographyCSS } from './utils/foundationCSS';
