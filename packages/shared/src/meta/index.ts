/**
 * Meta Module — AI context generation and component metadata utilities.
 *
 * Operates on serializable ComponentMeta descriptors (no React component references).
 * Suitable for use in AI prompts, documentation generation, and tooling.
 */

export { generateAIContext } from './generateAIContext';
export { generateDesignManifest } from './designManifest';
export type { DesignManifestInput } from './designManifest';
export { getComponentsByCategory, getBrandOverridableProps } from './helpers';
export { deriveSizeLabels } from './sizeLabels';
export {
  COMPONENT_PROPS_SCHEMAS,
  COMPONENT_NODE_SCHEMA,
  CANVAS_RESPONSE_SCHEMA,
  deriveSchemaFromMeta,
  registerComponentPropsSchema,
  getComponentPropsSchema,
  getComponentSchemaJSON,
  getAllComponentSchemasJSON,
  validateCanvasResponse,
  validateASTComponentProps,
} from './componentSchemas';
export type {
  ComponentNode,
  CanvasResponse,
  NodeValidationError,
  RegisteredComponentName,
} from './componentSchemas';
export {
  STORY_EXEMPLARS,
  getExemplarsForComponent,
  getExemplarsForComponents,
} from './storyExemplars.generated';
export type { StoryExemplar } from './storyExemplars.generated';
