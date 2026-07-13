export { ExperienceCanvas } from './ExperienceCanvas';
export type { ExperienceCanvasProps, ArtboardPreset } from './ExperienceCanvas';
export type { ArtboardSubBrandOption } from './FrameThemeContext';
export {
  ContentBlockFoundationPlatformsContext,
  useContentBlockFoundationPlatforms,
} from './ContentBlockFoundationContext';
export type { Editor } from 'tldraw';
export {
  collectComponents,
  extractScreens,
  placeComponents,
  clearTopLevelShapes,
  createMarketingFrame,
  placeJioRibbonOnFrame,
  placeContentBlockOnFrame,
  computeRibbonPosition,
  computeContentBlockPosition,
  migrateFullBleedShapes,
  getPrimaryFrameId,
  removeChildComponentsOfType,
  sanitizeComponentPropsForTldraw,
  COMPONENT_PLACE_DEFAULTS,
} from './canvasHelpers';
export { ComponentShapeUtil, COMPONENT_SHAPE_TYPE } from './ComponentShape';
export type { ComponentShape, ComponentShapeProps } from './ComponentShape';
export {
  SKETCH_HTML_SHAPE_TYPE,
  SKETCH_VIEWPORTS,
  type SketchViewport,
} from './SketchHTMLShape';
export { PropPanel } from './PropPanel';
export type { PropPanelProps } from './PropPanel';
export {
  getSelectedComponentInfo,
  updateShapeProp,
  updateShapeChildText,
  canvasToAST,
  validateCanvas,
} from './useCanvasEditor';
export type { SelectedComponentInfo, ValidationError } from './useCanvasEditor';
export { TemplateLibrary } from './TemplateLibrary';
