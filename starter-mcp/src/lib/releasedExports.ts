/**
 * Released public-barrel exports of @jds4/oneui-react — the set of names that
 * are actually importable from the published package.
 *
 * SOURCE OF TRUTH: packages/ui/src/index.public.ts (the generated public barrel,
 * gated by src/registry/releasedComponents.ts). Re-vendor when that barrel
 * changes. WIP components (WebHeader, SegmentedControl, Carousel, FAB, ListItem,
 * Accordion, Select, Menu, Dialog, …) are intentionally ABSENT — importing them
 * is flagged by `validate_oneui_code` (rule: non-released-component).
 *
 * Includes compound parts (TabGroup/TabItem/TabPanel) and infra (BrandProvider,
 * Surface, providers/contexts) so legitimate imports are never false-flagged.
 *
 * FUTURE: once the package ships this list at a stable path, the MCP can read it
 * from the installed @jds4/oneui-react at runtime and drop this vendored copy.
 */
export const RELEASED_EXPORTS: ReadonlySet<string> = new Set([
  'ASTRenderer', 'Avatar', 'Badge', 'BadgePreview', 'BottomNavItem', 'BottomNavigation',
  'BottomNavigationContext', 'BrandLogoContext', 'BrandProvider', 'Button', 'ButtonPreview',
  'CanvasContext', 'Checkbox', 'CheckboxField', 'CheckboxFieldPreview', 'CheckboxPreview', 'Chip',
  'ChipGroup', 'ChipPreview', 'CircularProgressIndicator', 'Container', 'CounterBadge',
  'CounterBadgePreview', 'DecorationProvider', 'Divider', 'Icon', 'IconButton', 'IconButtonPreview',
  'IconCategories', 'IconContained', 'IconContainedPreview', 'IconContext', 'IconProvider',
  'IconSetRegistry', 'IconSizeValues', 'Image', 'IndicatorBadge', 'IndicatorBadgePreview', 'Input',
  'InputDynamicText', 'InputFeedback', 'InputField', 'Logo', 'LogoPreview',
  'MaterialFoundationProvider', 'Modal', 'ModalClose', 'ModalTrigger', 'Pagination', 'PaginationDots',
  'PaginationDotsPreview', 'PaginationItem', 'PaginationPreview', 'Radio', 'RadioField',
  'RadioFieldPreview', 'RadioGroup', 'RadioPreview', 'SelectableButton', 'SelectableButtonPreview',
  'SelectableIconButton', 'SelectableIconButtonPreview', 'SelectableSingleTextButton',
  'SelectableSingleTextButtonPreview', 'SemanticMappings', 'SingleTextButton',
  'SingleTextButtonPreview', 'Slider', 'SliderPreview', 'Stepper', 'StepperPreview', 'Surface',
  'Switch', 'TabGroup', 'TabItem', 'TabPanel', 'Tabs', 'Text', 'Tooltip', 'TooltipProvider',
  'TouchSlider', 'TouchSliderPreview',
]);
