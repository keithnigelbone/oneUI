/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Public (released) barrel for @oneui/ui. Generated from src/index.ts by
 * scripts/generate-public-barrel.ts; the published tarball's root export
 * points here so WIP components are not importable from the package root.
 *
 * To change what is exported: edit src/index.ts and/or
 * src/registry/releasedComponents.ts, then run `pnpm generate:public-barrel`.
 */

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

export type { InteractiveComponentProps } from '@oneui/shared';

// Core Components - Overlays

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

// Core Components - Popover & Menu

// Core Components - Disclosure

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

// Core Components - Feedback

// Core Components - Forms

// Core Components - Layout
export { Surface, type SurfaceProps } from './components/Surface';
export {
  BrandProvider,
  type BrandProviderProps,
  type BrandProviderDensity,
} from './components/BrandProvider';
export { Container } from './components/Container';
export type { ContainerProps, ContainerVariant } from './components/Container';

// Chat & Agent Components

// Platform Components

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
