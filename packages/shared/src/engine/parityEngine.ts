/**
 * parityEngine.ts
 *
 * Figma <-> OneUI Token Parity Engine.
 *
 * Maps Figma variable names to OneUI CSS token names and compares values.
 * Pure functions — no React/Convex dependency. Usable from:
 * - Browser (parity dashboard UI)
 * - CLI tools (automated parity reports)
 * - Server-side (Convex actions)
 *
 * Framework-agnostic.
 */

import type { FigmaVariable, FigmaVariableCollection } from '../types/figma';
import type { ComponentTokenManifest, TokenDefinition } from '../types/componentTokens';

// ============================================================================
// Types & data tables — see ./parityEngine/types.ts for the canonical defs.
// Re-exported here so existing `import { ParityEntry } from './parityEngine'`
// statements keep working unchanged.
// ============================================================================

import {
  COLLECTION_CATEGORY_MAP,
  CSS_PROPERTY_PATTERNS,
  TSHIRT_TO_NUMERIC,
  UPPERCASE_ABBREVIATIONS,
} from './parityEngine/types';

export type {
  FigmaComponentBinding,
  ParityMapping,
  ParityEntry,
  ParitySummary,
  SpacingParityRow,
  SpacingParityMatrix,
} from './parityEngine/types';

// Local-only re-imports for use inside the function bodies below.
import type {
  FigmaComponentBinding,
  ParityEntry,
  ParityMapping,
  ParitySummary,
  SpacingParityMatrix,
  SpacingParityRow,
} from './parityEngine/types';

// ============================================================================
// Category inference from collection name or variable scopes
// ============================================================================

function inferCategoryFromCollection(collectionName: string): string {
  const lower = collectionName.toLowerCase();
  for (const [key, category] of Object.entries(COLLECTION_CATEGORY_MAP)) {
    if (lower.includes(key)) {
      return category;
    }
  }
  return 'unknown';
}

function inferCategoryFromScopes(scopes: string[]): string {
  if (scopes.includes('ALL_FILLS') || scopes.includes('FRAME_FILL') || scopes.includes('SHAPE_FILL') || scopes.includes('TEXT_FILL') || scopes.includes('STROKE_COLOR') || scopes.includes('EFFECT_COLOR')) {
    return 'color';
  }
  if (scopes.includes('GAP') || scopes.includes('WIDTH_HEIGHT')) {
    return 'spacing';
  }
  if (scopes.includes('CORNER_RADIUS')) {
    return 'shape';
  }
  if (scopes.includes('FONT_SIZE') || scopes.includes('FONT_WEIGHT') || scopes.includes('LINE_HEIGHT') || scopes.includes('FONT_FAMILY')) {
    return 'typography';
  }
  if (scopes.includes('STROKE_FLOAT')) {
    return 'stroke';
  }
  if (scopes.includes('EFFECT_FLOAT')) {
    return 'elevation';
  }
  return 'unknown';
}

// ============================================================================
// 1. inferCSSTokenName
// ============================================================================

/**
 * Infer a OneUI CSS token name from a Figma variable.
 *
 * Three-tier resolution:
 * 1. codeSyntax.WEB (e.g. "--Spacing-5" -> "Spacing-5")
 * 2. Convention-based path transformation
 * 3. null if nothing matches
 */
export function inferCSSTokenName(
  figmaVar: FigmaVariable,
  _collection?: FigmaVariableCollection
): string | null {
  // Tier 1: codeSyntax.WEB
  if (figmaVar.codeSyntax?.WEB) {
    const webSyntax = figmaVar.codeSyntax.WEB;
    // Strip leading -- and any var() wrapper
    const stripped = webSyntax
      .replace(/^var\(/, '')
      .replace(/\)$/, '')
      .replace(/^--/, '');
    if (stripped.length > 0) {
      return stripped;
    }
  }

  // Tier 2: Convention-based path transformation
  const name = figmaVar.name;
  if (!name || name.trim().length === 0) {
    return null;
  }

  const segments: string[] = name.split('/').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  if (segments.length === 0) {
    return null;
  }

  const isSpacingOrShape = segments[0]?.toLowerCase() === 'spacing' || segments[0]?.toLowerCase() === 'shape';

  const transformed = segments.map((segment: string, index: number) => {
    // Check if the segment matches a known CSS property pattern (kebab-case)
    const camelCase = CSS_PROPERTY_PATTERNS[segment.toLowerCase()];
    if (camelCase) {
      return camelCase;
    }

    // For spacing/* and shape/* paths, translate legacy t-shirt sizes to the numeric scale.
    if (isSpacingOrShape && index > 0) {
      const numeric = TSHIRT_TO_NUMERIC[segment.toLowerCase()];
      if (numeric) {
        return numeric;
      }
    }

    // Capitalize each hyphen-separated part and join with hyphen
    // Known abbreviations stay fully uppercased
    return segment
      .split('-')
      .map((part: string) => {
        const lower = part.toLowerCase();
        if (UPPERCASE_ABBREVIATIONS.has(lower)) {
          return part.toUpperCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join('-');
  });

  return transformed.join('-');
}

// ============================================================================
// 2. buildMappingTable
// ============================================================================

/**
 * Build a mapping table from Figma variables to OneUI CSS tokens.
 *
 * For each Figma variable:
 * - Look up its collection
 * - Call inferCSSTokenName
 * - Apply manual mapping overrides
 * - Determine category
 * - Return array of all mappings with source annotation
 */
export function buildMappingTable(
  figmaVars: FigmaVariable[],
  collections: FigmaVariableCollection[],
  manualMappings?: Record<string, string>
): ParityMapping[] {
  const collectionMap = new Map<string, FigmaVariableCollection>();
  for (const col of collections) {
    collectionMap.set(col.id, col);
  }

  const result: ParityMapping[] = [];

  for (const figmaVar of figmaVars) {
    const collection = collectionMap.get(figmaVar.variableCollectionId);

    // Check manual mapping first
    if (manualMappings && manualMappings[figmaVar.name]) {
      const category = collection
        ? inferCategoryFromCollection(collection.name)
        : inferCategoryFromScopes(figmaVar.scopes);

      result.push({
        figmaVariableName: figmaVar.name,
        cssTokenName: manualMappings[figmaVar.name],
        category,
        mappingSource: 'manual',
      });
      continue;
    }

    // Auto-infer
    const cssTokenName = inferCSSTokenName(figmaVar, collection ?? undefined);
    if (cssTokenName === null) {
      continue; // Skip unmappable variables
    }

    const mappingSource: ParityMapping['mappingSource'] =
      figmaVar.codeSyntax?.WEB ? 'codeSyntax' : 'auto';

    // Determine category
    let category = 'unknown';
    if (collection) {
      category = inferCategoryFromCollection(collection.name);
    }
    if (category === 'unknown') {
      category = inferCategoryFromScopes(figmaVar.scopes);
    }

    // Infer component name from first path segment if it looks like a component
    let componentName: string | undefined;
    const segments = figmaVar.name.split('/');
    if (segments.length >= 2) {
      const first = segments[0].trim();
      // Component names are typically capitalized single words like "button", "input"
      if (first.length > 0 && /^[a-z]/i.test(first) && category === 'unknown') {
        componentName = first.charAt(0).toUpperCase() + first.slice(1);
      }
    }

    result.push({
      figmaVariableName: figmaVar.name,
      cssTokenName,
      componentName,
      category,
      mappingSource,
    });
  }

  return result;
}

// ============================================================================
// 3. compareTokenValues
// ============================================================================

/**
 * Normalize a hex color for comparison (lowercase, expand shorthand).
 */
function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase();
  if (h.startsWith('#')) {
    h = h.slice(1);
  }
  // Expand 3-char shorthand to 6-char
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  // Expand 4-char shorthand (with alpha) to 8-char
  if (h.length === 4) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return '#' + h;
}

/**
 * Parse a numeric value from a string, stripping units.
 */
function parseNumericValue(value: string): number | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*(px|rem|em|pt|%)?$/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

/**
 * Compare a Figma value against a resolved tool token value.
 *
 * - Spacing: allows +/-1px tolerance
 * - Colors: exact match after normalization (case-insensitive hex)
 */
export function compareTokenValues(
  figmaValue: string,
  toolTokenName: string,
  resolvedValues: Record<string, string>,
  category: string
): 'matched' | 'mismatched' {
  const toolValue = resolvedValues[toolTokenName];
  if (toolValue === undefined) {
    return 'mismatched';
  }

  if (category === 'color') {
    // Normalize both values for comparison
    const figmaNorm = normalizeColorValue(figmaValue);
    const toolNorm = normalizeColorValue(toolValue);
    return figmaNorm === toolNorm ? 'matched' : 'mismatched';
  }

  if (category === 'spacing' || category === 'shape' || category === 'stroke') {
    // Numeric comparison with tolerance
    const figmaNum = parseNumericValue(figmaValue);
    const toolNum = parseNumericValue(toolValue);
    if (figmaNum !== null && toolNum !== null) {
      return Math.abs(figmaNum - toolNum) <= 1 ? 'matched' : 'mismatched';
    }
  }

  // Default: string comparison (trimmed, case-insensitive)
  return figmaValue.trim().toLowerCase() === toolValue.trim().toLowerCase()
    ? 'matched'
    : 'mismatched';
}

/**
 * Normalize a color value for comparison.
 * Handles hex, oklch with rounding.
 */
function normalizeColorValue(value: string): string {
  const trimmed = value.trim().toLowerCase();

  // Hex color
  if (trimmed.startsWith('#')) {
    return normalizeHex(trimmed);
  }

  // oklch() — round numeric components to 4 decimal places
  const oklchMatch = trimmed.match(/^oklch\(\s*(.+)\s*\)$/);
  if (oklchMatch) {
    const inner = oklchMatch[1];
    const rounded = inner.replace(/(\d+\.\d{5,})/g, (match) => {
      return parseFloat(match).toFixed(4);
    });
    return `oklch(${rounded})`;
  }

  // rgb/rgba — normalize
  const rgbMatch = trimmed.match(/^rgba?\(\s*(.+)\s*\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,/\s]+/).map((p) => p.trim()).filter(Boolean);
    return `rgb(${parts.join(', ')})`;
  }

  return trimmed;
}

// ============================================================================
// 4. checkComponentParity
// ============================================================================

/**
 * Check parity between a component token manifest and Figma mappings.
 *
 * For each token in the manifest:
 * - Find matching mapping by CSS token name pattern
 * - If manifest token has sizes, check each size
 * - Generate entries with matched/mismatched/missing status
 */
export function checkComponentParity(
  manifest: ComponentTokenManifest,
  mappingTable: ParityMapping[],
  resolvedValues: Record<string, string>
): ParityEntry[] {
  const entries: ParityEntry[] = [];
  const componentName = manifest.componentName;

  // Index mappings by CSS token name for quick lookup
  const mappingByToken = new Map<string, ParityMapping>();
  for (const mapping of mappingTable) {
    mappingByToken.set(mapping.cssTokenName, mapping);
    // Also index without component prefix for flexible matching
    const withoutPrefix = mapping.cssTokenName.replace(
      new RegExp(`^${componentName}-`, 'i'),
      ''
    );
    if (withoutPrefix !== mapping.cssTokenName) {
      mappingByToken.set(withoutPrefix, mapping);
    }
  }

  const tokenEntries = Object.entries(manifest.tokens) as Array<[string, TokenDefinition]>;
  for (const [tokenProperty, tokenDef] of tokenEntries) {
    if (tokenDef.sizes && Object.keys(tokenDef.sizes).length > 0) {
      // Size-specific tokens
      for (const [size, toolTokenValue] of Object.entries(tokenDef.sizes)) {
        const cssName = `${componentName}-${tokenProperty}-${size}`;
        const mapping = mappingByToken.get(cssName)
          ?? mappingByToken.get(`${tokenProperty}-${size}`)
          ?? mappingByToken.get(`${componentName}-${tokenProperty}`);

        if (mapping) {
          const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;
          const figmaValue = resolvedValues[mapping.figmaVariableName] ?? undefined;

          if (figmaValue !== undefined) {
            const status = compareTokenValues(
              figmaValue,
              toolTokenValue,
              resolvedValues,
              tokenDef.category
            );
            entries.push({
              figmaVariableName: mapping.figmaVariableName,
              cssTokenName: `${componentName}-${tokenProperty}`,
              category: tokenDef.category,
              status,
              figmaValue,
              toolValue: resolvedToolValue,
              tokenProperty,
              size,
            });
          } else {
            entries.push({
              figmaVariableName: mapping.figmaVariableName,
              cssTokenName: `${componentName}-${tokenProperty}`,
              category: tokenDef.category,
              status: 'missing-in-figma',
              toolValue: resolvedToolValue,
              tokenProperty,
              size,
            });
          }
        } else {
          // No Figma mapping found for this size
          const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;
          entries.push({
            cssTokenName: `${componentName}-${tokenProperty}`,
            category: tokenDef.category,
            status: 'missing-in-figma',
            toolValue: resolvedToolValue,
            tokenProperty,
            size,
          });
        }
      }
    } else {
      // Non-size token
      const cssName = `${componentName}-${tokenProperty}`;
      const mapping = mappingByToken.get(cssName)
        ?? mappingByToken.get(tokenProperty);

      const toolTokenValue = tokenDef.defaultToken;
      const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;

      if (mapping) {
        const figmaValue = resolvedValues[mapping.figmaVariableName] ?? undefined;

        if (figmaValue !== undefined) {
          const status = compareTokenValues(
            figmaValue,
            toolTokenValue,
            resolvedValues,
            tokenDef.category
          );
          entries.push({
            figmaVariableName: mapping.figmaVariableName,
            cssTokenName: cssName,
            category: tokenDef.category,
            status,
            figmaValue,
            toolValue: resolvedToolValue,
            tokenProperty,
          });
        } else {
          entries.push({
            figmaVariableName: mapping.figmaVariableName,
            cssTokenName: cssName,
            category: tokenDef.category,
            status: 'missing-in-figma',
            toolValue: resolvedToolValue,
            tokenProperty,
          });
        }
      } else {
        entries.push({
          cssTokenName: cssName,
          category: tokenDef.category,
          status: 'missing-in-figma',
          toolValue: resolvedToolValue,
          tokenProperty,
        });
      }
    }
  }

  // Check for Figma variables that map to this component but are not in the manifest
  for (const mapping of mappingTable) {
    if (
      mapping.componentName?.toLowerCase() === componentName.toLowerCase() ||
      mapping.cssTokenName.toLowerCase().startsWith(componentName.toLowerCase() + '-')
    ) {
      // Extract property name from cssTokenName
      const propPart = mapping.cssTokenName
        .replace(new RegExp(`^${componentName}-`, 'i'), '');

      // Check if already covered by manifest tokens
      const alreadyCovered = entries.some(
        (e) => e.figmaVariableName === mapping.figmaVariableName
      );

      if (!alreadyCovered && !manifest.tokens[propPart]) {
        entries.push({
          figmaVariableName: mapping.figmaVariableName,
          cssTokenName: mapping.cssTokenName,
          category: mapping.category,
          status: 'missing-in-tool',
          tokenProperty: propPart,
        });
      }
    }
  }

  return entries;
}

// ============================================================================
// 5. summarizeParity
// ============================================================================

/**
 * Count parity entries by status.
 */
export function summarizeParity(entries: ParityEntry[]): ParitySummary {
  const summary: ParitySummary = {
    matched: 0,
    mismatched: 0,
    missingInFigma: 0,
    missingInTool: 0,
    unmapped: 0,
    total: entries.length,
  };

  for (const entry of entries) {
    switch (entry.status) {
      case 'matched':
        summary.matched++;
        break;
      case 'mismatched':
        summary.mismatched++;
        break;
      case 'missing-in-figma':
        summary.missingInFigma++;
        break;
      case 'missing-in-tool':
        summary.missingInTool++;
        break;
      case 'unmapped':
        summary.unmapped++;
        break;
    }
  }

  return summary;
}

// ============================================================================
// 6. Component-scoped parity (binding-based)
// ============================================================================

/**
 * Maps Figma node properties to manifest token property names.
 *
 * A Figma property can map to multiple manifest properties (e.g., paddingLeft
 * could be paddingHorizontalStart or paddingHorizontal). The engine tries each
 * candidate in order and picks the first match found in the manifest.
 */
const FIGMA_PROPERTY_TO_MANIFEST: Record<string, string | string[]> = {
  // Frame padding
  'paddingLeft': ['paddingHorizontalStart', 'paddingHorizontal'],
  'paddingRight': ['paddingHorizontalEnd', 'paddingHorizontal'],
  'paddingTop': 'paddingVertical',
  'paddingBottom': 'paddingVertical',
  // Auto-layout
  'itemSpacing': ['iconGap', 'iconGapStart', 'iconGapEnd'],
  // Shape
  'cornerRadius': 'borderRadius',
  'topLeftRadius': 'borderRadius',
  'topRightRadius': 'borderRadius',
  'bottomLeftRadius': 'borderRadius',
  'bottomRightRadius': 'borderRadius',
  // Fills & strokes
  'fills': 'backgroundColor',
  'strokes': 'borderColor',
  'strokeWeight': 'borderWidth',
  // Text properties (on text layers)
  'fontSize': 'fontSize',
  'fontWeight': 'fontWeight',
  'lineHeight': 'lineHeight',
  'letterSpacing': 'letterSpacing',
  'textFills': 'textColor',
  // Size constraints
  'minHeight': 'minHeight',
  'minWidth': 'minWidth',
  'width': ['iconSize', 'iconSizeStart', 'iconSizeEnd'],
  'height': ['iconSize', 'iconSizeStart', 'iconSizeEnd'],
};

/**
 * Known t-shirt size suffixes used in Figma variable names.
 * Used to infer which size a binding corresponds to when the
 * manifest token has per-size values.
 */
const SIZE_SUFFIX_PATTERNS: Array<{ pattern: RegExp; size: string }> = [
  { pattern: /[-/]6xs$/i, size: '6' },
  { pattern: /[-/]5xs$/i, size: '7' },
  { pattern: /[-/]4xs$/i, size: '8' },
  { pattern: /[-/]3xs$/i, size: '8' },
  { pattern: /[-/]2xs$/i, size: '6' },
  { pattern: /[-/]xs$/i, size: '7' },
  { pattern: /[-/]s$/i, size: '8' },
  { pattern: /[-/]m$/i, size: '10' },
  { pattern: /[-/]l$/i, size: '12' },
  { pattern: /[-/]xl$/i, size: '14' },
  { pattern: /[-/]2xl$/i, size: '16' },
  { pattern: /[-/]3xl$/i, size: '16' },
];

/**
 * Try to infer a size key from a Figma variable name by checking for
 * t-shirt size suffixes. Returns null if no known suffix is found.
 */
function inferSizeFromVariableName(variableName: string): string | null {
  for (const { pattern, size } of SIZE_SUFFIX_PATTERNS) {
    if (pattern.test(variableName)) {
      return size;
    }
  }
  return null;
}

/**
 * Resolve manifest token candidates for a Figma property.
 * Returns an array of property names to try against the manifest.
 */
function resolveManifestCandidates(figmaProperty: string): string[] {
  const mapped = FIGMA_PROPERTY_TO_MANIFEST[figmaProperty];
  if (!mapped) {
    return [];
  }
  return Array.isArray(mapped) ? mapped : [mapped];
}

/**
 * Find the first manifest token that matches one of the candidate property names.
 */
function findManifestToken(
  candidates: string[],
  manifestTokens: Record<string, TokenDefinition>
): { propertyName: string; definition: TokenDefinition } | null {
  for (const candidate of candidates) {
    if (manifestTokens[candidate]) {
      return { propertyName: candidate, definition: manifestTokens[candidate] };
    }
  }
  return null;
}

/**
 * Match a binding's resolved value against a size-specific token value.
 * Returns the size key if a match is found, null otherwise.
 */
function matchBindingToSize(
  binding: FigmaComponentBinding,
  tokenDef: TokenDefinition,
  resolvedValues: Record<string, string>
): string | null {
  if (!tokenDef.sizes || !binding.figmaResolvedValue) {
    return null;
  }

  for (const [size, tokenValue] of Object.entries(tokenDef.sizes)) {
    const resolvedToolValue = resolvedValues[tokenValue] ?? tokenValue;

    // Check if the Figma variable name references this token
    if (binding.figmaVariableName.includes(tokenValue)) {
      return size;
    }

    // Check numeric value match (with tolerance)
    const figmaNum = parseNumericValue(binding.figmaResolvedValue);
    const toolNum = parseNumericValue(resolvedToolValue);
    if (figmaNum !== null && toolNum !== null && Math.abs(figmaNum - toolNum) <= 1) {
      return size;
    }
  }

  return null;
}

/**
 * Check component parity using Figma node bindings (component-scoped).
 *
 * Unlike `checkComponentParity` which scans all Figma variables by name,
 * this function works with the actual variable bindings found on a specific
 * Figma component node. It maps each bound Figma property to the manifest
 * token it corresponds to, then compares values.
 *
 * @param manifest   The tool's component token manifest
 * @param bindings   Variable bindings extracted from a Figma component node
 * @param resolvedValues  Optional map of token names to resolved values for comparison
 * @returns ParityEntry[] with status for each binding and manifest token
 */
export function checkComponentParityFromBindings(
  manifest: ComponentTokenManifest,
  bindings: FigmaComponentBinding[],
  resolvedValues: Record<string, string> = {}
): ParityEntry[] {
  const entries: ParityEntry[] = [];
  const componentName = manifest.componentName;
  const manifestTokens = manifest.tokens;

  // Track which manifest tokens have been matched by at least one binding
  const matchedManifestTokens = new Set<string>();

  // Track processed bindings to avoid duplicates from the same figma property
  // mapping to multiple manifest candidates
  const processedBindings = new Set<string>();

  for (const binding of bindings) {
    const bindingKey = `${binding.figmaProperty}|${binding.figmaVariableId}|${binding.layerPath ?? ''}`;
    if (processedBindings.has(bindingKey)) {
      continue;
    }
    processedBindings.add(bindingKey);

    const candidates = resolveManifestCandidates(binding.figmaProperty);

    if (candidates.length === 0) {
      // Figma property doesn't map to any known manifest token property
      entries.push({
        figmaVariableName: binding.figmaVariableName,
        cssTokenName: `${componentName}-${binding.figmaProperty}`,
        category: 'unknown',
        status: 'missing-in-tool',
        figmaValue: binding.figmaResolvedValue,
        tokenProperty: binding.figmaProperty,
      });
      continue;
    }

    const match = findManifestToken(candidates, manifestTokens);

    if (!match) {
      // Figma property maps to a known CSS concept but the manifest
      // doesn't define a token for any of the candidates
      entries.push({
        figmaVariableName: binding.figmaVariableName,
        cssTokenName: `${componentName}-${candidates[0]}`,
        category: 'unknown',
        status: 'missing-in-tool',
        figmaValue: binding.figmaResolvedValue,
        tokenProperty: candidates[0],
      });
      continue;
    }

    const { propertyName, definition: tokenDef } = match;
    matchedManifestTokens.add(propertyName);

    // Determine if this is a size-specific match
    if (tokenDef.sizes && Object.keys(tokenDef.sizes).length > 0) {
      // Try to infer the size from the variable name first
      let inferredSize = inferSizeFromVariableName(binding.figmaVariableName);

      // If name-based inference failed, try value matching
      if (!inferredSize && binding.figmaResolvedValue) {
        inferredSize = matchBindingToSize(binding, tokenDef, resolvedValues);
      }

      if (inferredSize && tokenDef.sizes[inferredSize]) {
        const toolTokenValue = tokenDef.sizes[inferredSize];
        const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;

        let status: ParityEntry['status'];
        if (binding.figmaResolvedValue) {
          status = compareTokenValues(
            binding.figmaResolvedValue,
            toolTokenValue,
            resolvedValues,
            tokenDef.category
          );
        } else {
          // No resolved Figma value — check if the variable name references the token
          status = binding.figmaVariableName.includes(toolTokenValue) ? 'matched' : 'mismatched';
        }

        entries.push({
          figmaVariableName: binding.figmaVariableName,
          cssTokenName: `${componentName}-${propertyName}`,
          category: tokenDef.category,
          status,
          figmaValue: binding.figmaResolvedValue,
          toolValue: resolvedToolValue,
          tokenProperty: propertyName,
          size: inferredSize,
        });
      } else {
        // Could not infer which size this binding belongs to — report as matched
        // at the property level but without a specific size
        const resolvedToolValue = resolvedValues[tokenDef.defaultToken] ?? tokenDef.defaultToken;

        entries.push({
          figmaVariableName: binding.figmaVariableName,
          cssTokenName: `${componentName}-${propertyName}`,
          category: tokenDef.category,
          status: 'matched',
          figmaValue: binding.figmaResolvedValue,
          toolValue: resolvedToolValue,
          tokenProperty: propertyName,
        });
      }
    } else {
      // Non-size token — direct comparison
      const toolTokenValue = tokenDef.defaultToken;
      const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;

      let status: ParityEntry['status'];
      if (binding.figmaResolvedValue) {
        status = compareTokenValues(
          binding.figmaResolvedValue,
          toolTokenValue,
          resolvedValues,
          tokenDef.category
        );
      } else {
        // No resolved value — check by variable name
        status = binding.figmaVariableName.includes(toolTokenValue) ? 'matched' : 'mismatched';
      }

      entries.push({
        figmaVariableName: binding.figmaVariableName,
        cssTokenName: `${componentName}-${propertyName}`,
        category: tokenDef.category,
        status,
        figmaValue: binding.figmaResolvedValue,
        toolValue: resolvedToolValue,
        tokenProperty: propertyName,
      });
    }
  }

  // Check manifest tokens that have NO matching binding → "missing-in-figma"
  for (const [tokenProperty, tokenDef] of Object.entries(manifestTokens)) {
    if (matchedManifestTokens.has(tokenProperty)) {
      continue;
    }

    if (tokenDef.sizes && Object.keys(tokenDef.sizes).length > 0) {
      // Report each size as missing
      for (const [size, toolTokenValue] of Object.entries(tokenDef.sizes)) {
        const resolvedToolValue = resolvedValues[toolTokenValue] ?? toolTokenValue;
        entries.push({
          cssTokenName: `${componentName}-${tokenProperty}`,
          category: tokenDef.category,
          status: 'missing-in-figma',
          toolValue: resolvedToolValue,
          tokenProperty,
          size,
        });
      }
    } else {
      const resolvedToolValue = resolvedValues[tokenDef.defaultToken] ?? tokenDef.defaultToken;
      entries.push({
        cssTokenName: `${componentName}-${tokenProperty}`,
        category: tokenDef.category,
        status: 'missing-in-figma',
        toolValue: resolvedToolValue,
        tokenProperty,
      });
    }
  }

  return entries;
}

// ============================================================================
// 7. buildSpacingParityMatrix
// ============================================================================

/**
 * Filter spacing entries and structure them into a matrix grid.
 *
 * Rows: grouped by tokenProperty + slot
 * Columns: sizes
 */
export function buildSpacingParityMatrix(entries: ParityEntry[]): SpacingParityMatrix {
  const spacingEntries = entries.filter(
    (e) => e.category === 'spacing' && e.tokenProperty !== undefined
  );

  // Group by (tokenProperty, slot)
  const rowMap = new Map<string, SpacingParityRow>();

  for (const entry of spacingEntries) {
    const key = `${entry.tokenProperty}|${entry.slot ?? ''}`;

    if (!rowMap.has(key)) {
      rowMap.set(key, {
        tokenProperty: entry.tokenProperty!,
        slot: entry.slot ?? null,
        sizes: {},
      });
    }

    const row = rowMap.get(key)!;
    const sizeKey = entry.size ?? 'default';

    row.sizes[sizeKey] = {
      figmaValue: entry.figmaValue ?? null,
      toolValue: entry.toolValue ?? '',
      status: entry.status,
    };
  }

  return {
    rows: Array.from(rowMap.values()),
  };
}
