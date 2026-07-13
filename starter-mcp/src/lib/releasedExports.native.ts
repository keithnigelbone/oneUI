/**
 * Released public-barrel exports of @oneui/ui-native — the names actually
 * importable from the published RN package.
 *
 * SOURCE OF TRUTH: packages/ui-native/src/index.ts. Re-vendor when that barrel
 * changes (the native package ships `src/`, not a built `dist/index.public.d.ts`,
 * so the runtime auto-sync in installedReleased.ts returns null for RN and the
 * validator falls back to THIS list).
 *
 * NOTE: this is the full ~39-component RN library surface, NOT kb-rn's 10-component
 * documented roster. An agent may legitimately import a released ui-native component
 * (e.g. Avatar) that lacks rich kb-rn docs — it must not be flagged non-released.
 * Type-only exports are included too (harmless; `import type` is skipped anyway).
 */
export const RELEASED_EXPORTS_NATIVE: ReadonlySet<string> = new Set([
  // Theme runtime
  'OneUINativeThemeProvider', 'Surface', 'useOneUITheme', 'useOptionalOneUITheme', 'useElevation',
  'useSurfaceTokens', 'useSurfaceContext', 'useSurfaceAppearance', 'RecipeProvider',
  'ReduceMotionProvider', 'useReduceMotion', 'useTypographyTokens', 'DecorationProvider',
  'useComponentDecoration', 'MotionProvider', 'useMotion', 'DEFAULT_MOTION', 'defaultNativeTheme',
  'buildNativeMotion', 'buildNativeElevation', 'buildNativeTheme', 'OneUIBrandProvider',
  'DEFAULT_JIO_BRAND_DATA', 'foundationToNativeTheme', 'getCdnBrandData', 'getCdnThemeData',
  'registerBrandCache', 'MaterialContextProvider', 'useBrandMaterial', 'useRoleMaterial',
  // Components
  'Button', 'Badge', 'Card', 'Container', 'CounterBadge', 'Divider', 'Image', 'IndicatorBadge',
  'Logo', 'Modal', 'PaginationDots', 'Pagination', 'PaginationItem', 'usePaginationState',
  'buildPaginationPages', 'getPaginationAccessibilityProps', 'getPaginationItemAccessibilityProps',
  'getPaginationLiveRegionProps', 'getPaginationEllipsisAccessibilityProps', 'Progress',
  'CircularProgressIndicator', 'AgentPulse', 'Avatar', 'Icon', 'IconButton', 'SingleTextButton',
  'IconContained', 'TouchSlider', 'Slider',
  'IconProvider', 'useIconSet', 'setJioIconLoader', 'setJioIconCatalog', 'getJioIconLoader',
  'getJioIconCatalog', 'initJdsJioIcons', 'createJdsJioIconLoader', 'buildJdsJioIconCatalog',
  'isJdsJioIconsInitialized', 'SemanticMappings', 'IconSetRegistry', 'getIconSetIds', 'getIconName',
  'BottomNavigation', 'HeaderNative', 'HeaderItem', 'PrimaryNav', 'SecondaryNav',
  'BottomNavigationItem', 'BottomNavItem',
  'Text', 'Chip', 'ChipGroup',
  'Tabs', 'TabGroup', 'TabItem', 'TabPanel', 'useTabsState', 'useTabGroupState',
  'useTabItemState', 'useTabsContext', 'getTabsAccessibilityProps', 'getTabItemAccessibilityProps',
  'SegmentedControl', 'useSegmentedControlGroupState', 'useSegmentedControlItemState',
  'useSegmentedControlContext', 'getSegmentedControlAccessibilityProps',
  'getSegmentItemAccessibilityProps',
  'Checkbox', 'CheckboxField', 'Radio', 'RadioField',
  'InputDynamicText', 'InputFeedback', 'Input', 'InputField',
  'Switch', 'useSwitchState', 'getSwitchAccessibilityProps',
  'Scrim',
  'Carousel', 'CarouselRoot', 'CarouselRail', 'CarouselItem', 'CarouselSlideImage',
  'CarouselSlideContent', 'CarouselItemBadgeRow', 'CarouselSlideButtonGroup', 'CarouselControls',
  'CarouselIndicatorList', 'CarouselSelectionRail', 'CarouselSelectionRailList',
  'CarouselPrevButton', 'CarouselNextButton', 'CarouselPlayButton', 'useCarousel',
  'useCarouselState', 'useCarouselEngine', 'getCarouselAccessibilityProps',
  'getCarouselRootAccessibilityProps', 'getCarouselSlideAccessibilityProps',
  'getCarouselTrackLiveRegionProps', 'formatCarouselSlidePosition', 'resolveCarouselAspectRatio',
  'resolveCarouselContentMaxWidth', 'resolveCarouselContentWidthStyle', 'resolveCarouselSlideRadius',
  'resolveCarouselContentSpacing', 'resolveCarouselSlideScrimProps',
  'resolveCarouselSelectionRailSize', 'resolveCarouselSelectionRailSurface',
  'CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO', 'CAROUSEL_SLIDE_SCRIM_PROPS',
  'Select',
  'Tooltip', 'TooltipProvider', 'parsePosition',
]);
