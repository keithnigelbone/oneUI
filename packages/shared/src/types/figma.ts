/**
 * Figma API Type Definitions
 * Types for Figma Variables API responses and sync operations
 */

import type { TokenCategory, TokenMode } from './tokens';

// ============================================================================
// Figma REST API Response Types
// ============================================================================

/**
 * Figma color value in RGBA format (0-1 range)
 */
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Possible values for a Figma variable
 */
export type FigmaVariableValue =
  | boolean
  | number
  | string
  | FigmaColor
  | FigmaVariableAlias;

/**
 * Alias to another variable
 */
export interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

/**
 * A single Figma variable
 */
export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, FigmaVariableValue>;
  description?: string;
  hiddenFromPublishing: boolean;
  scopes: FigmaVariableScope[];
  codeSyntax?: {
    WEB?: string;
    ANDROID?: string;
    iOS?: string;
  };
}

/**
 * Scopes where a variable can be used
 */
export type FigmaVariableScope =
  | 'ALL_SCOPES'
  | 'TEXT_CONTENT'
  | 'CORNER_RADIUS'
  | 'WIDTH_HEIGHT'
  | 'GAP'
  | 'ALL_FILLS'
  | 'FRAME_FILL'
  | 'SHAPE_FILL'
  | 'TEXT_FILL'
  | 'STROKE_COLOR'
  | 'STROKE_FLOAT'
  | 'EFFECT_FLOAT'
  | 'EFFECT_COLOR'
  | 'OPACITY'
  | 'FONT_FAMILY'
  | 'FONT_STYLE'
  | 'FONT_WEIGHT'
  | 'FONT_SIZE'
  | 'LINE_HEIGHT'
  | 'LETTER_SPACING'
  | 'PARAGRAPH_SPACING'
  | 'PARAGRAPH_INDENT';

/**
 * A collection of variables (e.g., "Colors", "Spacing")
 */
export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: FigmaMode[];
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

/**
 * A mode within a collection (e.g., "Light", "Dark")
 */
export interface FigmaMode {
  modeId: string;
  name: string;
}

/**
 * Response from GET /v1/files/:file_key/variables/local
 */
export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

/**
 * Response from GET /v1/files/:file_key
 */
export interface FigmaFileResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: 'owner' | 'editor' | 'viewer';
}

// ============================================================================
// OAuth Types
// ============================================================================

/**
 * Figma OAuth token response
 */
export interface FigmaOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Figma OAuth user info
 */
export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

// ============================================================================
// Sync Types
// ============================================================================

/**
 * Status of a Figma connection
 */
export type FigmaConnectionStatus = 'active' | 'expired' | 'revoked';

/**
 * A Figma connection for a brand
 */
export interface FigmaConnection {
  id: string;
  brandId: string;
  userId: string;
  fileKey: string;
  fileName?: string;
  status: FigmaConnectionStatus;
  lastSyncedAt?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Configuration for mode mapping
 */
export interface ModeMapping {
  figmaModeId: string;
  figmaModeName: string;
  platformMode: TokenMode;
}

/**
 * Sync configuration for a brand
 */
export interface SyncConfig {
  modeMapping: ModeMapping[];
  collectionFilter?: string[]; // Collection IDs to include (all if empty)
  categoryMapping?: Record<string, TokenCategory>; // Custom category overrides
}

// ============================================================================
// Transform Types
// ============================================================================

/**
 * A token transformed from Figma format
 */
export interface TransformedToken {
  name: string;
  category: string;
  value: string;
  mode: TokenMode;
  description?: string;
  figmaId: string;
  figmaKey: string;
  figmaCollectionId: string;
  figmaCollectionName: string;
}

/**
 * Result of transforming Figma variables
 */
export interface TransformResult {
  tokens: TransformedToken[];
  unmapped: Array<{
    variable: FigmaVariable;
    reason: string;
  }>;
  warnings: string[];
}

// ============================================================================
// Diff Types
// ============================================================================

/**
 * A token to be added during sync
 */
export interface TokenToAdd {
  name: string;
  category: string;
  value: string;
  mode: string;
  description?: string;
  figmaId: string;
  figmaKey: string;
}

/**
 * A token to be updated during sync
 */
export interface TokenToUpdate {
  id: string;
  name: string;
  category: string;
  oldValue: string;
  newValue: string;
  mode: string;
  description?: string;
  figmaId: string;
}

/**
 * A token to be removed during sync
 */
export interface TokenToRemove {
  id: string;
  name: string;
  category: string;
  value: string;
  mode: string;
}

/**
 * Result of comparing Figma tokens with existing tokens
 */
export interface TokenDiff {
  added: TokenToAdd[];
  modified: TokenToUpdate[];
  removed: TokenToRemove[];
  unchanged: number;
}

/**
 * Preview data for the sync UI
 */
export interface SyncPreviewData {
  diff: TokenDiff;
  collections: Array<{
    id: string;
    name: string;
    tokenCount: number;
  }>;
  modes: ModeMapping[];
  warnings: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Check if a value is a Figma color
 */
export function isFigmaColor(value: FigmaVariableValue): value is FigmaColor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'r' in value &&
    'g' in value &&
    'b' in value &&
    'a' in value
  );
}

/**
 * Check if a value is a variable alias
 */
export function isFigmaVariableAlias(
  value: FigmaVariableValue
): value is FigmaVariableAlias {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'VARIABLE_ALIAS'
  );
}
