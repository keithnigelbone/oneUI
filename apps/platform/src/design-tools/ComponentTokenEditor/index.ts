/**
 * ComponentTokenEditor
 *
 * Property panel system for customizing component tokens per brand.
 * Enables live preview and CSS export for Storybook sync.
 */

// Context
export {
  ComponentTokenEditorProvider,
  useComponentTokenEditor,
} from './ComponentTokenEditorContext';
export type { SavedTokenOverride } from './ComponentTokenEditorContext';

// Main Components
export { PropertyPanel } from './PropertyPanel/PropertyPanel';
export { PropertyPanelSkeleton } from './PropertyPanel/PropertyPanelSkeleton';

// Advanced Editor (Full-page experience)
export {
  AdvancedEditor,
  EditorToolbar,
  EditorCanvas,
  EditorPropertyPanel,
  ComponentAnnotation,
  ButtonSurfacePreview,
  VariationsPreview,
  SurfaceSelectionControls,
  EditorPanelRouter,
  PreviewPanel,
  EditorPanel,
  InspectPanel,
  InspectCanvasControls,
  VariationsPanel,
  ComponentThemePanel,
  ScopeToggle,
  GranularTargetSelector,
  TokenRow,
  ActionsMenu,
  RecipePanel,
  RecipeDecisionGroup,
} from './AdvancedEditor';
export type {
  AdvancedEditorProps,
  EditorToolbarProps,
  EditorCanvasProps,
  EditorPropertyPanelProps,
  ComponentAnnotationProps,
  TokenAnnotation,
  ButtonSurfacePreviewProps,
  VariationsPreviewProps,
  SurfaceSelectionControlsProps,
  SurfaceStackingUnavailableReason,
  SurfaceDisplayMode,
  EditorPanelRouterProps,
  PreviewPanelProps,
  EditorPanelProps,
  InspectPanelProps,
  InspectCanvasControlsProps,
  VariationsPanelProps,
  ComponentThemePanelProps,
  ScopeToggleProps,
  GranularTargetSelectorProps,
  TokenRowProps,
  ActionsMenuProps,
  RecipePanelProps,
  RecipeDecisionGroupProps,
} from './AdvancedEditor';

// Sub-components
export { TokenEditorList } from './TokenEditorList/TokenEditorList';
export { TokenEditorRow } from './TokenEditorList/TokenEditorRow';
export { TokenSelector } from './TokenEditorList/TokenSelector';
export { LivePreview } from './LivePreview/LivePreview';
export { ContextSwitcher } from './LivePreview/ContextSwitcher';

// Utilities
export { generateBrandCSS, generateComponentOverrideCSS } from './utils/cssExporter';
export { useDebouncedSave } from './utils/debounce';
export { buildComponentPreviewStyles, expandManifestDefaults } from './utils/buildPreviewStyles';
export type { DraftOverrideEntry } from './utils/buildPreviewStyles';

// Types
export type {
  PropertyPanelProps,
  TokenEditorListProps,
  TokenEditorRowProps,
  LivePreviewProps,
} from './types';
