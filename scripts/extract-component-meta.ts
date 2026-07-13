#!/usr/bin/env node
/**
 * extract-component-meta.ts
 *
 * Walks a component's shared types file with ts-morph and emits a generated
 * artifact containing (a) a PropDescriptor[] for editor/AI use and (b) a Zod
 * schema for LLM structured-output generation and runtime validation.
 *
 * Source of truth: the component's TypeScript Props interface + JSDoc.
 *
 * JSDoc conventions honored:
 *   - Free-text description (first paragraph)
 *   - @deprecated — excluded from generated enum options and Zod schema
 *   - @brandOverridable — marks prop as customizable per-brand
 *   - @default <value> — populates defaultValue (optional; falls back to undefined)
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Project, Type, Symbol as MorphSymbol, Node } from 'ts-morph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Types (mirror @oneui/shared PropDescriptor without importing — script runs outside bundle)
// ---------------------------------------------------------------------------

type PropType = 'string' | 'number' | 'boolean' | 'enum' | 'ReactNode' | 'function' | 'object';

interface ExtractedProp {
  name: string;
  type: PropType;
  options?: (string | number | boolean)[];
  deprecatedOptions?: (string | number)[];
  description?: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  deprecated: boolean;
  brandOverridable: boolean;
  /** When derived from a discriminated union, which branch(es) this prop belongs to */
  branchTag?: string;
}

interface ExtractedUnionBranch {
  discriminator?: { prop: string; value: string | boolean };
  props: ExtractedProp[];
}

interface ComponentExtraction {
  componentName: string;      // e.g., "Button"
  constantPrefix: string;     // e.g., "BUTTON"
  /** If the Props type is a union, each branch is captured separately so we can emit z.union */
  branches: ExtractedUnionBranch[];
  /** Merged, deduped prop list — suitable for flat PropDescriptor[] output */
  flatProps: ExtractedProp[];
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function createProject(): Project {
  return new Project({
    tsConfigFilePath: resolve(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });
}

function extractComponent(
  project: Project,
  sharedFilePath: string,
  propsTypeName: string,
  componentName: string,
): ComponentExtraction {
  const source = project.getSourceFileOrThrow(sharedFilePath);
  const typeAlias = source.getTypeAlias(propsTypeName);
  const iface = source.getInterface(propsTypeName);

  const type = typeAlias?.getType() ?? iface?.getType();
  if (!type) {
    throw new Error(`Could not resolve type ${propsTypeName} in ${sharedFilePath}`);
  }

  const branches: ExtractedUnionBranch[] = [];
  if (type.isUnion()) {
    for (const member of type.getUnionTypes()) {
      branches.push(extractBranch(member, componentName));
    }
  } else {
    branches.push(extractBranch(type, componentName));
  }

  // Flatten: one entry per unique prop name; merge deprecation/description from any branch.
  const flatMap = new Map<string, ExtractedProp>();
  for (const branch of branches) {
    for (const prop of branch.props) {
      const existing = flatMap.get(prop.name);
      if (!existing) {
        flatMap.set(prop.name, { ...prop });
      } else {
        // Required on the flat view only if required in all branches
        existing.required = existing.required && prop.required;
      }
    }
  }

  return {
    componentName,
    constantPrefix: componentName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
    branches,
    flatProps: Array.from(flatMap.values()),
  };
}

function extractBranch(type: Type, componentName: string): ExtractedUnionBranch {
  const props: ExtractedProp[] = [];
  let discriminator: { prop: string; value: string | boolean } | undefined;

  for (const sym of type.getProperties()) {
    const extracted = extractProperty(type, sym, componentName);
    if (!extracted) continue;

    // Detect discriminator: required literal-valued prop with a single option
    if (
      extracted.required &&
      extracted.type === 'enum' &&
      extracted.options?.length === 1
    ) {
      const v = extracted.options[0];
      if (typeof v === 'boolean' || typeof v === 'string') {
        discriminator = { prop: extracted.name, value: v };
      }
    }

    props.push(extracted);
  }

  return { discriminator, props };
}

function extractProperty(parentType: Type, sym: MorphSymbol, componentName: string): ExtractedProp | null {
  const name = sym.getName();

  // Skip inherited "standard" props we don't want to expose to the LLM
  if (name === 'className' || name === 'style' || name === 'ref' || name === 'key') {
    return null;
  }

  const decl = sym.getDeclarations()[0];
  const propType = decl ? sym.getTypeAtLocation(decl) : (sym.getDeclaredType?.() ?? parentType);

  // Optional vs required — use symbol flag
  const optional = sym.isOptional();
  const required = !optional;

  // JSDoc
  const { description, deprecated, brandOverridable, defaultValue } = extractJSDoc(sym);

  // Normalize type
  const typeDesc = normalizeType(propType, name, componentName);
  if (!typeDesc) {
    // Unknown/unsupported — skip but log
    return null;
  }

  return {
    name,
    type: typeDesc.type,
    options: typeDesc.options,
    deprecatedOptions: typeDesc.deprecatedOptions as (string | number)[] | undefined,
    description,
    defaultValue,
    required,
    deprecated,
    brandOverridable,
  };
}

interface NormalizedType {
  type: PropType;
  options?: (string | number | boolean)[];
  deprecatedOptions?: (string | number | boolean)[];
}

/**
 * Canonical design-system option subset. Union members outside this list are
 * treated as deprecated aliases and emitted into `deprecatedOptions` (not
 * `options`). Keeps generated schema clean for LLM use.
 *
 * Per-component overrides apply when the same prop name (e.g. `size`) uses a
 * different canonical vocabulary (Avatar t-shirt scale vs Button f-steps).
 */
const CANONICAL_OPTION_ALLOWLIST: Record<string, ReadonlyArray<string | number>> = {
  size: ['xs', 's', 'm', 'l', 6, 8, 10, 12],
};

/** When set, wins over {@link CANONICAL_OPTION_ALLOWLIST} for that prop name. */
const COMPONENT_CANONICAL_OPTION_ALLOWLIST: Record<
  string,
  Record<string, ReadonlyArray<string | number>>
> = {
  Avatar: {
    size: ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', 'custom'],
  },
};

function stripNullish(types: Type[]): Type[] {
  return types.filter(t => !t.isUndefined() && !t.isNull());
}

function normalizeType(type: Type, propName?: string, componentName?: string): NormalizedType | null {
  // Unwrap `T | undefined` (optional props)
  let effective = type;
  if (type.isUnion()) {
    const kept = stripNullish(type.getUnionTypes());
    if (kept.length === 1) effective = kept[0];
  }

  if (effective.isBooleanLiteral()) {
    const text = effective.getText();
    return { type: 'enum', options: [text === 'true'] };
  }
  if (effective.isBoolean()) return { type: 'boolean' };
  if (effective.isString()) return { type: 'string' };
  if (effective.isNumber()) return { type: 'number' };
  if (effective.isStringLiteral()) {
    return { type: 'enum', options: [effective.getLiteralValue() as string] };
  }
  if (effective.isNumberLiteral()) {
    return { type: 'enum', options: [effective.getLiteralValue() as number] };
  }

  if (effective.isUnion()) {
    const members = stripNullish(effective.getUnionTypes());

    // boolean = true | false in TS — detect
    const allBoolLiterals = members.length === 2 && members.every(m => m.isBooleanLiteral());
    if (allBoolLiterals) return { type: 'boolean' };

    // Collect literal members
    const literals: (string | number)[] = [];
    let hasReactNode = false;
    let hasFunction = false;
    let hasOtherObject = false;

    for (const m of members) {
      if (m.isStringLiteral()) literals.push(m.getLiteralValue() as string);
      else if (m.isNumberLiteral()) literals.push(m.getLiteralValue() as number);
      else if (m.getCallSignatures().length > 0) hasFunction = true;
      else {
        const symName = m.getSymbol()?.getName();
        const text = m.getText();
        if (symName === 'ReactElement' || symName === 'ReactNode' ||
            text.includes('ReactNode') || text.includes('ReactElement')) {
          hasReactNode = true;
        } else {
          hasOtherObject = true;
        }
      }
    }

    if (literals.length > 0 && !hasReactNode && !hasFunction && !hasOtherObject) {
      // Pure literal union — split canonical vs deprecated
      const perComponent =
        componentName && propName
          ? COMPONENT_CANONICAL_OPTION_ALLOWLIST[componentName]?.[propName]
          : undefined;
      const allow =
        perComponent
        ?? (propName ? CANONICAL_OPTION_ALLOWLIST[propName] : undefined);
      if (allow) {
        const canonical = literals.filter(l => allow.includes(l));
        const deprecated = literals.filter(l => !allow.includes(l));
        return {
          type: 'enum',
          options: canonical.length > 0 ? canonical : literals,
          deprecatedOptions: deprecated.length > 0 ? deprecated : undefined,
        };
      }
      return { type: 'enum', options: literals };
    }

    // Mixed literal + ReactElement (e.g., SemanticIconName | ReactElement)
    if (literals.length > 0 && hasReactNode) {
      return { type: 'string' };
    }
    if (hasReactNode) return { type: 'ReactNode' };
    if (hasFunction && !hasOtherObject && literals.length === 0) return { type: 'function' };
    return { type: 'object' };
  }

  if (effective.getCallSignatures().length > 0) {
    return { type: 'function' };
  }

  const symbolName = effective.getSymbol()?.getName();
  if (symbolName === 'ReactElement' || symbolName === 'ReactNode') {
    return { type: 'ReactNode' };
  }

  const text = effective.getText();
  if (text.includes('ReactNode') || text.includes('ReactElement')) {
    return { type: 'ReactNode' };
  }
  if (text === 'CSSProperties' || text.endsWith('CSSProperties')) {
    return null;
  }

  return { type: 'object' };
}

function extractJSDoc(sym: MorphSymbol): {
  description?: string;
  deprecated: boolean;
  brandOverridable: boolean;
  defaultValue?: string | number | boolean;
} {
  const decl = sym.getDeclarations()[0];
  if (!decl || !Node.isJSDocable(decl)) {
    return { deprecated: false, brandOverridable: false };
  }
  const docs = decl.getJsDocs();
  let description: string | undefined;
  let deprecated = false;
  let brandOverridable = false;
  let defaultValue: string | number | boolean | undefined;

  for (const doc of docs) {
    const text = doc.getDescription().trim();
    if (text && !description) description = text;
    for (const tag of doc.getTags()) {
      const tagName = tag.getTagName();
      if (tagName === 'deprecated') deprecated = true;
      if (tagName === 'brandOverridable') brandOverridable = true;
      if (tagName === 'default') {
        const raw = tag.getCommentText()?.trim();
        if (raw != null) defaultValue = coerceDefault(raw);
      }
    }
  }

  return { description, deprecated, brandOverridable, defaultValue };
}

function coerceDefault(raw: string): string | number | boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const n = Number(raw);
  if (!Number.isNaN(n) && raw.trim() !== '') return n;
  return raw.replace(/^['"]|['"]$/g, '');
}

// ---------------------------------------------------------------------------
// Emission
// ---------------------------------------------------------------------------

function emitGeneratedFile(extraction: ComponentExtraction): string {
  const { componentName, constantPrefix, flatProps, branches } = extraction;

  const banner = [
    '// @generated — do not edit by hand.',
    `// Source: packages/ui/src/components/${componentName}/${componentName}.shared.ts`,
    '// Regenerate with: pnpm docs:machine',
    '',
  ].join('\n');

  const imports = [
    `import { z } from 'zod';`,
    `import type { PropDescriptor } from '../../types/componentMeta';`,
    '',
  ].join('\n');

  const propsBody = emitPropsArray(constantPrefix, flatProps);
  const schemaBody = emitZodSchema(constantPrefix, branches, flatProps);

  return [banner, imports, propsBody, '', schemaBody, ''].join('\n');
}

function emitPropsArray(prefix: string, props: ExtractedProp[]): string {
  const entries = props.map(p => {
    const parts: string[] = [];
    parts.push(`name: ${JSON.stringify(p.name)}`);
    parts.push(`type: ${JSON.stringify(p.type)}`);
    if (p.options && p.options.length > 0) {
      parts.push(`options: ${serializeLiteralArray(p.options)} as const`);
    }
    if (p.deprecatedOptions && p.deprecatedOptions.length > 0) {
      parts.push(`deprecatedOptions: ${serializeLiteralArray(p.deprecatedOptions)} as const`);
    }
    if (p.description) {
      parts.push(`description: ${JSON.stringify(p.description)}`);
    }
    if (p.defaultValue !== undefined) {
      parts.push(`defaultValue: ${JSON.stringify(p.defaultValue)}`);
    }
    if (p.required) {
      parts.push(`required: true`);
    }
    if (p.brandOverridable) {
      parts.push(`brandOverridable: true`);
    }
    return `  { ${parts.join(', ')} }`;
  });

  const nonDeprecated = props.filter(p => !p.deprecated);
  const deprecatedNames = props.filter(p => p.deprecated).map(p => p.name);

  const deprecatedComment = deprecatedNames.length > 0
    ? `// Deprecated props (excluded): ${deprecatedNames.join(', ')}\n`
    : '';

  return [
    deprecatedComment,
    `export const ${prefix}_GENERATED_PROPS: PropDescriptor[] = [`,
    entries.filter((_, i) => !props[i].deprecated).join(',\n'),
    `];`,
  ].join('\n');
}

function emitZodSchema(
  prefix: string,
  branches: ExtractedUnionBranch[],
  flatProps: ExtractedProp[],
): string {
  // Simple case: single branch → one z.object
  if (branches.length === 1) {
    return `export const ${prefix}_PROPS_SCHEMA = ${zodObjectFor(branches[0].props)};`;
  }

  // Union: emit z.union of each branch
  const branchSchemas = branches.map(b => zodObjectFor(b.props));
  return [
    `export const ${prefix}_PROPS_SCHEMA = z.union([`,
    ...branchSchemas.map(s => `  ${s},`),
    `]);`,
  ].join('\n');
}

function serializeLiteralArray(values: readonly (string | number | boolean)[]): string {
  const parts = values.map(v => {
    if (typeof v === 'boolean' || typeof v === 'number') return String(v);
    return JSON.stringify(v);
  });
  return `[${parts.join(',')}]`;
}

function zodObjectFor(props: ExtractedProp[]): string {
  const entries: string[] = [];
  for (const p of props) {
    if (p.deprecated) continue;
    let zod = zodForProp(p);
    if (!p.required) zod = `${zod}.optional()`;
    // Handle bracket-notation names (e.g., 'aria-label')
    const key = /^[a-zA-Z_$][\w$]*$/.test(p.name) ? p.name : JSON.stringify(p.name);
    entries.push(`    ${key}: ${zod}`);
  }
  return `z.object({\n${entries.join(',\n')}\n  }).strict()`;
}

function zodForProp(p: ExtractedProp): string {
  switch (p.type) {
    case 'boolean':
      return 'z.boolean()';
    case 'string':
      return 'z.string()';
    case 'number':
      return 'z.number()';
    case 'enum': {
      const options = p.options ?? [];
      // Single literal (discriminator or single-value prop)
      if (options.length === 1) {
        const v = options[0];
        if (typeof v === 'boolean') return `z.literal(${v})`;
        if (typeof v === 'number') return `z.literal(${v})`;
        return `z.literal(${JSON.stringify(v)})`;
      }
      const allStrings = options.every(o => typeof o === 'string');
      const allNumbers = options.every(o => typeof o === 'number');
      if (allStrings) {
        return `z.enum([${options.map(o => JSON.stringify(o)).join(', ')}])`;
      }
      if (allNumbers) {
        return `z.union([${options.map(o => `z.literal(${o})`).join(', ')}])`;
      }
      // Mixed string/number/boolean
      return `z.union([${options.map(o => {
        if (typeof o === 'boolean' || typeof o === 'number') return `z.literal(${o})`;
        return `z.literal(${JSON.stringify(o)})`;
      }).join(', ')}])`;
    }
    case 'ReactNode':
      return 'z.string()';
    case 'function':
      // LLM won't emit function values; allow anything permissively
      return 'z.any()';
    case 'object':
      return 'z.unknown()';
  }
}

// ---------------------------------------------------------------------------
// Registered components
// ---------------------------------------------------------------------------

interface ComponentSpec {
  componentName: string;
  sharedFilePath: string;
  propsTypeName: string;
}

function componentSpec(
  folderName: string,
  propsTypeName: string,
  componentName = folderName,
): ComponentSpec {
  return {
    componentName,
    sharedFilePath: resolve(
      REPO_ROOT,
      `packages/ui/src/components/${folderName}/${folderName}.shared.ts`,
    ),
    propsTypeName,
  };
}

const COMPONENTS: ComponentSpec[] = [
  componentSpec('Avatar', 'AvatarProps'),
  componentSpec('Badge', 'BadgeProps'),
  componentSpec('BottomNavigation', 'BottomNavigationProps'),
  componentSpec('Button', 'ButtonProps'),
  componentSpec('Checkbox', 'CheckboxProps'),
  componentSpec('Chip', 'ChipProps'),
  componentSpec('ChipGroup', 'ChipGroupProps'),
  componentSpec('CounterBadge', 'CounterBadgeProps'),
  componentSpec('Divider', 'DividerProps'),
  componentSpec('FAB', 'FABProps'),
  componentSpec('Icon', 'IconProps'),
  componentSpec('IconButton', 'IconButtonProps'),
  componentSpec('Image', 'ImageProps'),
  componentSpec('IndicatorBadge', 'IndicatorBadgeProps'),
  componentSpec('InputField', 'InputFieldProps', 'InputField'),
  componentSpec('ListItem', 'ListItemProps'),
  componentSpec('ListItemGroup', 'ListItemGroupProps'),
  componentSpec('Logo', 'LogoProps'),
  componentSpec('PaginationDots', 'PaginationDotsProps'),
  componentSpec('Radio', 'RadioProps'),
  componentSpec('Slider', 'SliderProps'),
  componentSpec('Spinner', 'SpinnerProps'),
  componentSpec('Stepper', 'StepperProps'),
  componentSpec('Switch', 'SwitchProps'),
  componentSpec('Tabs', 'TabsProps'),
  componentSpec('Tooltip', 'TooltipProps'),
  componentSpec('WebHeader', 'WebHeaderProps'),
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const project = createProject();
  const outDir = resolve(REPO_ROOT, 'packages/shared/src/meta/generated');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const spec of COMPONENTS) {
    console.log(`[extract] ${spec.componentName}…`);
    const extraction = extractComponent(
      project,
      spec.sharedFilePath,
      spec.propsTypeName,
      spec.componentName,
    );
    const out = emitGeneratedFile(extraction);
    const outPath = resolve(outDir, `${spec.componentName}.generated.ts`);
    writeFileSync(outPath, out, 'utf8');
    console.log(`  → ${outPath}`);
    console.log(`  ${extraction.flatProps.length} props, ${extraction.branches.length} branch(es)`);
  }
}

// ESM-safe entrypoint: run main() only when executed as CLI (not when imported).
const ranAsCli = Boolean(
  process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href,
);
if (ranAsCli) {
  main();
}

export { extractComponent, emitGeneratedFile, COMPONENTS };
