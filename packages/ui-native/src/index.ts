/**
 * @oneui/ui-native — React Native peer of the OneUI design system.
 *
 * Mount `<OneUINativeThemeProvider>` at the app root with a
 * `OneUINativeTheme` (from `buildNativeTheme` or `defaultNativeTheme`),
 * wrap colour boundaries in `<Surface>`, and components inside read
 * resolved tokens via `useSurfaceTokens(appearance)`.
 *
 * Build-time-leaning component pattern: every static value lives in
 * module-scope `StyleSheet.create({…})`. Renders pass numeric IDs across
 * the JS↔native bridge instead of style objects. Dynamic OneUI brand
 * paint (from `useSurfaceTokens`) merges as a tiny inline override.
 *
 * Component parity contract (`pnpm check:parity`):
 *   - Every `packages/ui/src/components/<X>/<X>.tsx` must have a matching
 *     `packages/ui-native/src/components/<X>/<X>.native.tsx`.
 *   - Native files must import prop types from
 *     `./components/<X>/interface.ts` (native prop contract per component).
 */

// Theme runtime
export {
  OneUINativeThemeProvider,
  Surface,
  useOneUITheme,
  useOptionalOneUITheme,
  useElevation,
  useSurfaceTokens,
  useSurfaceContext,
  useSurfaceAppearance,
  RecipeProvider,
  ReduceMotionProvider,
  useReduceMotion,
  useTypographyTokens,
  DecorationProvider,
  useComponentDecoration,
  type DecorationProviderProps,
  MotionProvider,
  useMotion,
  DEFAULT_MOTION,
  type MotionProviderProps,
  type MotionOverrides,
  type NativeMotion,
  type TapScaleTokens,
  type SpringTuning,
  type SpinnerMotion,
  defaultNativeTheme,
  buildNativeMotion,
  buildNativeElevation,
  buildNativeTheme,
  type OneUINativeThemeProviderProps,
  type SurfaceProps,
  type SurfaceContextValue,
  type RecipeProviderProps,
  type RecipeSelections,
  type DefaultNativeThemeOptions,
  type TypographyRole,
  type Emphasis,
  type SizeForRole,
  type TypographyTokenOptions,
  type StaticWeightFamilyPrefixConfig,
  type StaticWeightFamiliesBySlot,
  type OneUINativeTheme,
  type NativeRoleTokens,
  type ResolvedNativeMotion,
  type ResolvedNativeElevation,
  type NativeMotionConfigInput,
  type NativeElevationConfigInput,
  type BuildNativeThemeInput,
  type NativeThemeContext,
  type NativeAppearanceConfig,
  type NativeTypography,
  type NativeTypographyConfig,
  type NativeTypeStyle,
  type NativeCustomFontDescriptor,
  type NativeDimensions,
  type NativeSpacing,
  type NativeShape,
  type SurfaceToken,
  type ContentToken,
  type StateToken,
  OneUIBrandProvider,
  type OneUIBrandProviderProps,
  type BrandData,
  type ThemeData,
  type ThemeColorScale,
  DEFAULT_JIO_BRAND_DATA,
  foundationToNativeTheme,
  type FontFamilyOverrides,
  getCdnBrandData,
  getCdnThemeData,
  registerBrandCache,
  // Material system
  MaterialContextProvider,
  useBrandMaterial,
  useRoleMaterial,
  type ResolvedMaterials,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from './theme';

// Components
export { Button, type ButtonProps } from './components/Button';
// ⚠️ GATED — implementation is complete but intentionally NOT part of the public
// API yet. The publish pipeline (scripts/copy-to-root-dist.mjs GATED_COMPONENTS)
// strips its shipped types + usage docs and marks its KB entry `planned`, so the
// barrel and the published artifact agree. To promote: remove the name from
// GATED_COMPONENTS and add an export line here.
// export { LinkButton, type LinkButtonProps } from './components/LinkButton';
// export { Spinner, type SpinnerProps } from './components/Spinner';
export { Badge, type BadgeProps } from './components/Badge';
// [IN PROGRESS] export { Container, type ContainerProps } from './components/Container';
export { Card, type CardProps } from './components/Card';
export { Container, type ContainerProps, type ContainerVariant } from './components/Container';
export { CounterBadge, type CounterBadgeProps } from './components/CounterBadge';
export { Divider, type DividerProps } from './components/Divider';
export { Image, type ImageProps } from './components/Image';
export { IndicatorBadge, type IndicatorBadgeProps } from './components/IndicatorBadge';
export { Logo, type LogoProps } from './components/Logo';
export { Modal, type ModalProps } from './components/Modal';
export { PaginationDots, type PaginationDotsProps } from './components/PaginationDots';
export {
  Pagination,
  PaginationItem,
  usePaginationState,
  buildPaginationPages,
  getPaginationAccessibilityProps,
  getPaginationItemAccessibilityProps,
  getPaginationLiveRegionProps,
  getPaginationEllipsisAccessibilityProps,
  type PaginationProps,
  type PaginationItemProps,
  type PaginationAppearance,
  type PaginationSize,
  type PaginationAttention,
} from './components/Pagination';
export { Progress, type ProgressProps, type ProgressSize } from './components/Progress';
export {
  CircularProgressIndicator,
  type CircularProgressIndicatorProps,
  type CircularProgressIndicatorSize,
  type CircularProgressIndicatorAppearance,
  type CircularProgressIndicatorVariant,
  type CircularProgressIndicatorContent,
} from './components/CircularProgressIndicator';
// ⚠️ GATED — see GATED_COMPONENTS note above. Implementation complete; not public yet.
// export { Separator, type SeparatorProps } from './components/Separator';
export { AgentPulse, type AgentPulseProps } from './components/AgentPulse';
export { Avatar, type AvatarProps } from './components/Avatar';
export { Icon, type IconProps } from './components/Icon';
export { IconButton, type IconButtonProps } from './components/IconButton';
export {
  SingleTextButton,
  type SingleTextButtonProps,
  type SingleTextButtonAppearance,
  type SingleTextButtonAttention,
  type SingleTextButtonVariant,
  type SingleTextButtonSize,
} from './components/SingleTextButton';
export { IconContained, type IconContainedProps } from './components/IconContained';
export { TouchSlider, type TouchSliderProps } from './components/TouchSlider';
export { Slider, type SliderProps } from './components/Slider';

// Icon system — provider, JDS loader bridge, and registry utilities.
// Exporting from the main entry ensures these share the same module instance
// as Icon so the jioIconLoader singleton and React context object are the same
// reference used by both the provider and the resolver.
export {
  IconProvider,
  useIconSet,
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
  getJioIconCatalog,
} from './components/Icon/IconContext.native';
export {
  initJdsJioIcons,
  createJdsJioIconLoader,
  buildJdsJioIconCatalog,
  isJdsJioIconsInitialized,
  type JdsCoreIconsModule,
} from './components/Icon/jdsLoader';
export {
  SemanticMappings,
  IconSetRegistry,
  getIconSetIds,
  getIconName,
} from './components/Icon/IconRegistry';
export { BottomNavigation, type BottomNavigationProps } from './components/BottomNavigation';
export {
  HeaderNative,
  HeaderItem,
  PrimaryNav,
  SecondaryNav,
  type HeaderNativeProps,
  type HeaderItemProps,
  type PrimaryNavProps,
  type SecondaryNavProps,
  type HeaderItemAttention,
  type HeaderItemSlotSize,
  type HeaderItemSlotSizeInput,
  type PrimaryNavType,
  type PrimaryNavEndActionsType,
} from './components/HeaderNative';
export {
  BottomNavigationItem,
  BottomNavItem,
  type BottomNavigationItemProps,
  type BottomNavItemProps,
} from './components/BottomNavigationItem';
export { Text, type TextProps } from './components/Text';
export { Chip, type ChipProps } from './components/Chip';
export { ChipGroup, type ChipGroupProps } from './components/ChipGroup';
export {
  Tabs,
  TabGroup,
  TabItem,
  TabPanel,
  useTabsState,
  useTabGroupState,
  useTabItemState,
  useTabsContext,
  getTabsAccessibilityProps,
  getTabItemAccessibilityProps,
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
  SegmentedControl,
  useSegmentedControlGroupState,
  useSegmentedControlItemState,
  useSegmentedControlContext,
  getSegmentedControlAccessibilityProps,
  getSegmentItemAccessibilityProps,
  type SegmentedControlProps,
  type SegmentedControlItemProps,
  type SegmentedControlSize,
  type SegmentedControlAttention,
  type SegmentedControlTrackEmphasis,
  type SegmentedControlShape,
  type SegmentedControlType,
  type SegmentedControlAppearance,
  type SegmentedControlContextValue,
} from './components/SegmentedControl';
export { Checkbox, type CheckboxProps } from './components/Checkbox';
export { CheckboxField, type CheckboxFieldProps } from './components/CheckboxField';
export { Radio, type RadioProps } from './components/Radio';
export { RadioField, type RadioFieldProps } from './components/RadioField';
export {
  InputDynamicText,
  type InputDynamicTextProps,
  type InputDynamicTextSize,
  type InputDynamicTextAriaLive,
} from './components/InputDynamicText';
export { InputFeedback, type InputFeedbackProps } from './components/InputFeedback';
export {
  Input,
  type InputProps,
  type InputAppearance,
  type InputAttention,
  type InputShape,
  type InputSize,
  type InputNumericSize,
  type InputLabelSize,
} from './components/Input';
export { InputField, type InputFieldProps } from './components/InputField';
export {
  Switch,
  useSwitchState,
  getSwitchAccessibilityProps,
  type SwitchProps,
  type SwitchSize,
  type SwitchAppearance,
} from './components/Switch';
export { Scrim, type ScrimProps } from './components/Scrim';
export {
  Carousel,
  Carousel as CarouselRoot,
  CarouselRail,
  CarouselItem,
  CarouselSlideImage,
  CarouselSlideContent,
  CarouselItemBadgeRow,
  CarouselSlideButtonGroup,
  CarouselControls,
  CarouselIndicatorList,
  CarouselSelectionRail,
  CarouselSelectionRailList,
  CarouselPrevButton,
  CarouselNextButton,
  CarouselPlayButton,
  useCarousel,
  useCarouselState,
  useCarouselEngine,
  getCarouselAccessibilityProps,
  getCarouselRootAccessibilityProps,
  getCarouselSlideAccessibilityProps,
  getCarouselTrackLiveRegionProps,
  formatCarouselSlidePosition,
  resolveCarouselAspectRatio,
  resolveCarouselContentMaxWidth,
  resolveCarouselContentWidthStyle,
  resolveCarouselSlideRadius,
  resolveCarouselContentSpacing,
  resolveCarouselSlideScrimProps,
  resolveCarouselSelectionRailSize,
  resolveCarouselSelectionRailSurface,
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  CAROUSEL_SLIDE_SCRIM_PROPS,
  type CarouselSlideScrim,
  type CarouselRootProps,
  type CarouselTrackProps,
  type CarouselSlideProps,
  type CarouselSlideImageProps,
  type CarouselSlideContentProps,
  type CarouselItemBadgeRowProps,
  type CarouselSlideCornerProps,
  type CarouselSlideButtonGroupProps,
  type CarouselControlsProps,
  type CarouselIndicatorListProps,
  type CarouselSelectionRailItemData,
  type CarouselSelectionRailListProps,
  type CarouselSelectionRailProps,
  type CarouselSelectionRailSize,
  type CarouselPrevButtonProps,
  type CarouselNextButtonProps,
  type CarouselPlayButtonProps,
  type CarouselOpts,
  type CarouselAlign,
  type CarouselAlignment,
  type CarouselAspectRatio,
  type CarouselContentWidth,
  type CarouselAppearance,
  type CarouselSurface,
  type CarouselContextValue,
} from './components/Carousel';
export {
  Select,
  type SelectProps,
  type SelectOption,
  type SelectSection,
  type SelectAppearance,
  type SelectAttention,
  type SelectMenuKind,
  type SelectMenuDirection,
  type SelectSize,
  type SelectTrigger,
} from './components/Select';
export {
  Tooltip,
  TooltipProvider,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipSide,
  type TooltipAlign,
  type TooltipPosition,
  type TooltipTrigger,
  parsePosition,
} from './components/Tooltip';

// NOTE: Slot composition helpers (SlotParentAppearanceProvider,
// ComponentSlotIconContext, …) and the typography→TextStyle converters are
// component-authoring internals — they are NOT on the public barrel. Advanced
// consumers can reach them via `@oneui/ui-native/internal`. The component-recipe
// resolvers (useComponentRecipe, useComponentTheme, resolveNativeContextRoles,
// weight-family builders) are fully package-internal and not exported at all.

// release-pipeline test marker — safe to revert
