/**
 * AccentConfig components — path-based import entry point.
 *
 * Usage:
 *   import { AccentConfigEditor } from '@/design-tools/Brand/AccentConfig';
 */

export { AccentConfigEditor } from './AccentConfigEditor';
export type {
  AccentConfigEditorProps,
  AccentConfigAccent,
  AccentConfigBackground,
  AccentConfigLogo,
  AccentConfigMaterialOption,
} from './AccentConfigEditor';

export {
  BRAND_ACCENT_ROLES,
  NEUTRAL_ROLE,
  SEMANTIC_ROLES,
  MAX_ROLE_COUNT,
  DEFAULT_BASE_STEP,
  EXTRA_ROLE_LABELS,
  splitAccents,
  mergeAccents,
} from './roleCategories';
export type {
  BrandAccentRoleId,
  SemanticRoleId,
  SplitAccentsResult,
} from './roleCategories';
