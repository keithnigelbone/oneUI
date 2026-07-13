#!/usr/bin/env npx tsx
/**
 * import-figma-variables.ts
 *
 * Imports Figma variables from JSON export into Convex database.
 *
 * Usage:
 *   npx tsx scripts/import-figma-variables.ts <json-file-path> [brand-slug]
 *
 * Example:
 *   npx tsx scripts/import-figma-variables.ts ~/Desktop/variables.json jio-default
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../packages/convex/convex/_generated/api';
import * as fs from 'fs';
import * as path from 'path';

// Convex deployment URL — required, no silent fallback to prod
const CONVEX_URL = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error(
    'CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) env var is required. ' +
      'Set it to your Convex deployment URL before running this script.',
  );
}

// Types
interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

type FigmaVariableValue = FigmaColor | FigmaVariableAlias | number | string | boolean;

interface FigmaVariable {
  id: string;
  name: string;
  description: string;
  key: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, FigmaVariableValue>;
  scopes: string[];
  hiddenFromPublishing: boolean;
  codeSyntax: Record<string, string>;
  variableCollectionId: string;
}

interface FigmaMode {
  name: string;
  modeId: string;
}

interface FigmaCollection {
  id: string;
  name: string;
  key: string;
  hiddenFromPublishing: boolean;
  defaultModeId: string;
  modes: FigmaMode[];
  remote: boolean;
  variableIds: string[];
  variables: FigmaVariable[];
}

interface FigmaExport {
  schemaVersion: number;
  lastModified: string;
  collections: FigmaCollection[];
}

// Color conversion: sRGB (0-1) to OkLCH
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabToOklch(lab: { L: number; a: number; b: number }): { L: number; C: number; H: number } {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let H = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L: lab.L, C, H };
}

function rgbaToOklch(color: FigmaColor): string {
  const rLin = srgbToLinear(color.r);
  const gLin = srgbToLinear(color.g);
  const bLin = srgbToLinear(color.b);

  const lab = linearToOklab(rLin, gLin, bLin);
  const lch = oklabToOklch(lab);

  const L = Math.round(lch.L * 100);
  const C = lch.C.toFixed(4);
  const H = Math.round(lch.H);

  if (color.a < 1) {
    return `oklch(${L}% ${C} ${H} / ${color.a.toFixed(2)})`;
  }
  return `oklch(${L}% ${C} ${H})`;
}

// Build variable maps for resolution
function buildVariableMaps(data: FigmaExport) {
  const variableMap = new Map<string, FigmaVariable>();
  const collectionMap = new Map<string, FigmaCollection>();
  const keyMap = new Map<string, FigmaVariable>();

  for (const collection of data.collections) {
    collectionMap.set(collection.id, collection);
    for (const variable of collection.variables) {
      variableMap.set(variable.id, variable);
      keyMap.set(variable.key, variable);
    }
  }

  return { variableMap, collectionMap, keyMap };
}

// Resolve a variable value, following aliases (silent mode for cross-JSON refs)
function resolveVariableValue(
  variableId: string,
  modeId: string,
  variableMap: Map<string, FigmaVariable>,
  keyMap: Map<string, FigmaVariable>,
  visited: Set<string> = new Set(),
  silent: boolean = false
): FigmaColor | number | string | boolean | null {
  if (visited.has(`${variableId}:${modeId}`)) {
    return null; // Circular reference - silently skip
  }
  visited.add(`${variableId}:${modeId}`);

  const variable = variableMap.get(variableId);
  if (!variable) {
    return null; // Variable not found - silently skip
  }

  let value = variable.valuesByMode[modeId];

  // If no value for this mode, try to find from other modes with same mode name pattern
  if (value === undefined || value === null) {
    // Try first available mode as fallback
    const firstModeId = Object.keys(variable.valuesByMode)[0];
    if (firstModeId) {
      value = variable.valuesByMode[firstModeId];
    }
  }

  if (value === undefined || value === null) {
    return null;
  }

  // Handle alias
  if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    const aliasId = value.id;

    // Handle cross-JSON references (external library references)
    if (aliasId.includes('/') && aliasId.startsWith('VariableID:')) {
      const keyPart = aliasId.substring('VariableID:'.length, aliasId.indexOf('/'));
      const referencedVariable = keyMap.get(keyPart);
      if (referencedVariable) {
        // Find the appropriate mode in referenced variable
        const refModeId = Object.keys(referencedVariable.valuesByMode)[0];
        return resolveVariableValue(referencedVariable.id, refModeId, variableMap, keyMap, visited, true);
      }
      // External reference not found - return null silently
      return null;
    }

    // Regular alias within same file
    return resolveVariableValue(aliasId, modeId, variableMap, keyMap, visited, silent);
  }

  return value as FigmaColor | number | string | boolean;
}

// Infer category from variable name
function inferCategory(name: string, resolvedType: string): string {
  const lowerName = name.toLowerCase();

  // Color categories
  if (resolvedType === 'COLOR') {
    if (lowerName.includes('surface')) return 'surface';
    if (lowerName.includes('text') || lowerName.includes('foreground')) return 'text';
    if (lowerName.includes('border') || lowerName.includes('stroke')) return 'border';
    if (lowerName.includes('icon')) return 'icon';
    if (lowerName.includes('background') || lowerName.includes('bg')) return 'background';
    if (lowerName.includes('primary')) return 'primary';
    if (lowerName.includes('secondary')) return 'secondary';
    if (lowerName.includes('grey') || lowerName.includes('gray') || lowerName.includes('neutral')) return 'neutral';
    if (lowerName.includes('negative') || lowerName.includes('error') || lowerName.includes('danger')) return 'negative';
    if (lowerName.includes('positive') || lowerName.includes('success')) return 'positive';
    if (lowerName.includes('warning') || lowerName.includes('caution')) return 'warning';
    if (lowerName.includes('informative') || lowerName.includes('info')) return 'informative';
    return 'color';
  }

  // Spacing/dimension categories
  if (resolvedType === 'FLOAT') {
    if (lowerName.includes('spacing') || lowerName.includes('gap') || lowerName.includes('margin') || lowerName.includes('padding')) return 'spacing';
    if (lowerName.includes('size') || lowerName.includes('dimension')) return 'dimension';
    if (lowerName.includes('radius') || lowerName.includes('corner')) return 'shape';
    if (lowerName.includes('font') || lowerName.includes('line-height') || lowerName.includes('letter')) return 'typography';
    if (lowerName.includes('elevation') || lowerName.includes('shadow')) return 'elevation';
    if (lowerName.includes('duration') || lowerName.includes('delay')) return 'motion';
    return 'dimension';
  }

  if (resolvedType === 'STRING') {
    if (lowerName.includes('font')) return 'typography';
    return 'string';
  }

  return 'other';
}

// Map Figma mode name to platform mode
function inferMode(modeName: string): 'light' | 'dark' | 'dim' {
  const lower = modeName.toLowerCase();
  if (lower.includes('dark') || lower.includes('night')) return 'dark';
  if (lower.includes('dim') || lower.includes('branded')) return 'dim';
  return 'light';
}

// Format value for storage
function formatValue(value: FigmaColor | number | string | boolean | null, resolvedType: string): string {
  if (value === null) return '';

  if (resolvedType === 'COLOR' && typeof value === 'object' && 'r' in value) {
    return rgbaToOklch(value);
  }

  if (resolvedType === 'FLOAT' && typeof value === 'number') {
    // Add px unit for dimension-like values
    return `${value}px`;
  }

  return String(value);
}

// Convert Figma variable name to token name
function toTokenName(figmaName: string): string {
  // Replace / with - and clean up
  return figmaName
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[[\]()]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Main import function
async function importFigmaVariables(jsonPath: string, brandSlug: string = 'jio-default') {
  console.log(`\n📦 Importing Figma variables from: ${jsonPath}`);
  console.log(`🏷️  Target brand: ${brandSlug}\n`);

  // Read JSON file
  const absolutePath = path.resolve(jsonPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf8');
  const data: FigmaExport = JSON.parse(rawData);

  console.log(`📄 Schema version: ${data.schemaVersion}`);
  console.log(`📅 Last modified: ${data.lastModified}`);
  console.log(`📁 Collections: ${data.collections.length}\n`);

  // Build lookup maps
  const { variableMap, collectionMap, keyMap } = buildVariableMaps(data);

  // Connect to Convex
  const client = new ConvexHttpClient(CONVEX_URL);

  // Get brand ID
  const brands = await client.query(api.brands.list);
  const brand = brands.find((b: any) => b.slug === brandSlug);

  if (!brand) {
    console.error(`❌ Brand "${brandSlug}" not found in database`);
    console.log('Available brands:', brands.map((b: any) => b.slug).join(', '));
    process.exit(1);
  }

  console.log(`✅ Found brand: ${brand.name} (${brand._id})\n`);

  // Collections to process (skip placeholders)
  const relevantCollections = data.collections.filter(c =>
    !c.name.startsWith('X0') && // Skip placeholders
    !c.hiddenFromPublishing &&
    c.variables.length > 0
  );

  console.log('📋 Collections to process:');
  relevantCollections.forEach(c => {
    console.log(`   - ${c.name}: ${c.variables.length} variables, modes: ${c.modes.map(m => m.name).join(', ')}`);
  });
  console.log('');

  // Transform variables to tokens
  const tokensToAdd: Array<{
    name: string;
    category: string;
    value: string;
    mode: string;
    description?: string;
    figmaId?: string;
    figmaKey?: string;
  }> = [];

  const processedNames = new Set<string>();

  for (const collection of relevantCollections) {
    console.log(`\n🔄 Processing: ${collection.name}`);

    // Determine which modes to process based on collection
    let modesToProcess: FigmaMode[] = collection.modes;

    // Check collection type for mode mapping
    const isColourModeCollection = collection.name.includes('Colour Mode');
    const isDensityCollection = collection.name.includes('Density');
    const isPlatformCollection = collection.name.includes('Platform');

    let processedInCollection = 0;
    let skippedUnresolved = 0;

    for (const variable of collection.variables) {
      // Skip hidden variables
      if (variable.hiddenFromPublishing) continue;

      for (const figmaMode of modesToProcess) {
        const resolvedValue = resolveVariableValue(
          variable.id,
          figmaMode.modeId,
          variableMap,
          keyMap
        );

        if (resolvedValue === null) {
          skippedUnresolved++;
          continue;
        }

        const tokenName = toTokenName(variable.name);

        // Determine platform mode based on collection type
        let platformMode: 'light' | 'dark' | 'dim' = 'light';
        if (isColourModeCollection) {
          platformMode = inferMode(figmaMode.name);
        } else if (isDensityCollection || isPlatformCollection) {
          // For density/platform, we might want to include mode info in token name
          platformMode = 'light'; // These are mode-independent
        }

        const uniqueKey = `${tokenName}:${platformMode}`;

        // Skip duplicates
        if (processedNames.has(uniqueKey)) continue;
        processedNames.add(uniqueKey);

        const value = formatValue(resolvedValue, variable.resolvedType);
        if (!value) continue;

        const category = inferCategory(variable.name, variable.resolvedType);

        tokensToAdd.push({
          name: tokenName,
          category,
          value,
          mode: platformMode,
          description: variable.description || undefined,
          figmaId: variable.id,
          figmaKey: variable.key,
        });

        processedInCollection++;
      }
    }

    console.log(`   ✓ Processed: ${processedInCollection}, Skipped (unresolved): ${skippedUnresolved}`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total tokens to import: ${tokensToAdd.length}`);

  // Group by category for display
  const byCategory = new Map<string, number>();
  tokensToAdd.forEach(t => {
    byCategory.set(t.category, (byCategory.get(t.category) || 0) + 1);
  });
  console.log(`\n   By category:`);
  for (const [cat, count] of byCategory.entries()) {
    console.log(`   - ${cat}: ${count}`);
  }

  // Group by mode
  const byMode = new Map<string, number>();
  tokensToAdd.forEach(t => {
    byMode.set(t.mode, (byMode.get(t.mode) || 0) + 1);
  });
  console.log(`\n   By mode:`);
  for (const [mode, count] of byMode.entries()) {
    console.log(`   - ${mode}: ${count}`);
  }

  // Import in batches
  const BATCH_SIZE = 100;
  const batches = Math.ceil(tokensToAdd.length / BATCH_SIZE);

  console.log(`\n🚀 Importing in ${batches} batches of ${BATCH_SIZE}...\n`);

  let totalAdded = 0;
  for (let i = 0; i < batches; i++) {
    const batch = tokensToAdd.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    try {
      const result = await client.mutation(api.tokens.sync, {
        brandId: brand._id,
        tokensToAdd: batch,
        tokensToUpdate: [],
        tokensToRemove: [],
        sourceDetails: {
          fileKey: 'pW8anR4FZn1l6OWh6mgpUU',
          fileName: 'OneUI Foundations [POC]',
          collectionsProcessed: relevantCollections.map(c => c.name),
        },
        syncedBy: 'import-script',
      });

      totalAdded += result.added;
      console.log(`   Batch ${i + 1}/${batches}: Added ${result.added} tokens (${result.durationMs}ms)`);
    } catch (error) {
      console.error(`   Batch ${i + 1}/${batches}: ERROR`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Total tokens added: ${totalAdded}`);
  console.log(`\n🔗 View in platform: http://localhost:3000/brand/tokens\n`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: npx tsx scripts/import-figma-variables.ts <json-file-path> [brand-slug]');
  console.log('');
  console.log('Example:');
  console.log('  npx tsx scripts/import-figma-variables.ts ~/Desktop/variables.json jio-default');
  process.exit(1);
}

const jsonPath = args[0];
const brandSlug = args[1] || 'jio-default';

importFigmaVariables(jsonPath, brandSlug).catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
