/**
 * componentMeta.ts
 *
 * Unified component metadata descriptor. References existing
 * ComponentTokenManifest and ComponentRecipeDefinition — does NOT duplicate them.
 *
 * Used by:
 * - Editor (preview matrix, variant/size labels, property inspector)
 * - Registry (single source of truth for component capabilities)
 * - Code export (prop defaults, import paths)
 * - AI context (component description, slot semantics)
 */

import type { ComponentTokenManifest } from './componentTokens';
import type { ComponentRecipeDefinition } from './componentRecipes';
import type {
  ComponentDeprecationInfo,
  ComponentFigmaMapping,
  ComponentPlatformsMatrix,
  ComponentTokenConsumption,
  ForbiddenPatternsMap,
} from './componentMetaExtensions';

// ---------------------------------------------------------------------------
// Component categories
// ---------------------------------------------------------------------------

export type ComponentCategory =
  | 'actions'
  | 'inputs'
  | 'display'
  | 'layout'
  | 'overlays'
  | 'navigation'
  | 'feedback';

// ---------------------------------------------------------------------------
// Prop descriptors
// ---------------------------------------------------------------------------

/** Serializable prop type discriminator */
export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'ReactNode'
  | 'function'
  | 'object';

/** Prop grouping for property inspector panels */
export type PropGroup = 'appearance' | 'layout' | 'behavior' | 'accessibility' | 'content';

/**
 * When an enum prop's valid values depend on another prop (e.g. Text `size`
 * per `variant`), list options per discriminator value. Editors and canvas
 * validation should use `getEffectiveEnumOptions(prop, props)` instead of
 * reading `options` alone.
 */
export interface PropOptionsByDiscriminator {
  /** Prop name whose current value selects the branch (e.g. `'variant'`) */
  discriminator: string;
  /** Map discriminator value → allowed enum values for this prop */
  options: Record<string, readonly (string | number | boolean)[]>;
}

export interface PropDescriptor {
  /** Prop name as used in JSX (e.g., 'variant', 'size') */
  name: string;
  /** Type discriminator */
  type: PropType;
  /** Human-readable description */
  description?: string;
  /** Default value (must be JSON-serializable for AST/export) */
  defaultValue?: string | number | boolean | null;
  /** For enum types: canonical, currently-recommended set of accepted values */
  options?: readonly (string | number | boolean)[];
  /** For enum types: options depend on another prop (see `getEffectiveEnumOptions`) */
  optionsByDiscriminator?: PropOptionsByDiscriminator;
  /** For enum types: accepted values retained for backward compatibility but not surfaced to the AI / editor */
  deprecatedOptions?: readonly (string | number | boolean)[];
  /** Whether this prop can be overridden per-brand via tokens */
  brandOverridable?: boolean;
  /** Whether this prop is required */
  required?: boolean;
  /** Whether this prop is deprecated and should not be surfaced to new consumers */
  deprecated?: boolean;
  /** Property group for inspector panel organization */
  group?: PropGroup;
}

// ---------------------------------------------------------------------------
// Slot descriptors
// ---------------------------------------------------------------------------

export interface SlotDescriptor {
  /** Slot name matching the prop (e.g., 'start', 'end') */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Component types typically placed in this slot (e.g., ['Icon', 'Avatar']) */
  acceptedTypes?: string[];
  /** Whether the slot accepts one or many children */
  cardinality?: 'single' | 'multiple';
  /** Whether this slot is required for the component to render */
  required?: boolean;
  /** Whether this slot is deprecated. Editor / AI / docs should hide it from suggestions but still honor it at runtime. */
  deprecated?: boolean;
}

// ---------------------------------------------------------------------------
// Preview matrix
// ---------------------------------------------------------------------------

/**
 * Describes how to render the component's preview grid in the editor.
 * Rows = variants (or attention levels), columns = sizes.
 */
export interface PreviewMatrix {
  /** Variant values to iterate (e.g., ['bold', 'subtle', 'ghost']) */
  variants: readonly string[];
  /** Human-readable labels for each variant (editor grid row headers) */
  variantLabels: Record<string, string>;
  /**
   * Size values to iterate (e.g., ['s', 'm', 'l'] or [8, 10, 12]).
   * Optional — omit for components that have a single size (e.g., PaginationDots).
   */
  sizes?: readonly (string | number)[];
  /**
   * When valid size columns differ per row variant (e.g. Text typography roles),
   * map each `variants` entry to its allowed sizes. Omit `sizes` or keep it empty
   * when using this; tooling should prefer the per-variant list for each row.
   */
  sizesByVariant?: Record<string, readonly (string | number)[]>;
  /**
   * Human-readable labels for each size (editor grid column headers).
   * Required when `sizes` is provided.
   */
  sizeLabels?: Record<string, string>;
  /** State values for components that use state-based variants (e.g., Checkbox) */
  states?: readonly string[];
  /** Human-readable labels for states */
  stateLabels?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// ComponentMeta — the unified descriptor
// ---------------------------------------------------------------------------

export interface ComponentMeta {
  /** PascalCase component name (e.g., 'Button', 'IconButton') */
  name: string;
  /** URL-safe slug (e.g., 'button', 'icon-button') */
  slug: string;
  /** Display name for UI (e.g., 'Button', 'Icon Button') */
  displayName: string;
  /** Short description for tooltips / AI context */
  description: string;
  /** Functional category */
  category: ComponentCategory;

  /** Prop descriptors — documents the component's public API */
  props: PropDescriptor[];
  /** Named content slots (e.g., start/end icon areas) */
  slots: SlotDescriptor[];

  /** Preview matrix for the editor grid */
  previewMatrix: PreviewMatrix;

  /** Whether this component adapts on colored surfaces via [data-surface] */
  surfaceAware: boolean;
  /** Whether this component supports multi-accent appearance roles */
  multiAccent: boolean;

  /** Search/AI tags for discoverability (e.g., ['action', 'cta', 'interactive']) */
  tags?: string[];
  /** Props whose defaults can be overridden per-brand (derived from props[].brandOverridable) */
  brandOverridableProps?: string[];

  /**
   * Reference to the component's token manifest.
   * Set at registration time — NOT duplicated.
   */
  tokenManifest?: ComponentTokenManifest;
  /**
   * Reference to the component's recipe definition.
   * Set at registration time — NOT duplicated.
   */
  recipeDefinition?: ComponentRecipeDefinition;

  // ---------------------------------------------------------------------------
  // B3 additions (round-2 audit) — all optional, all additive.
  // ---------------------------------------------------------------------------

  /**
   * Per-component schema version. Authors bump independently of the global
   * KB shape so additive field-level changes don't force every component
   * to advance in lockstep. Template-literal type so 5.0.0, 6.1.0, … all
   * type-check without changing this declaration.
   */
  schemaVersion?: `${number}.${number}.${number}`;

  /**
   * Per-platform availability matrix. Today the registry is web-only by
   * convention; downstream tooling needs an explicit map to plan against.
   * Example: `{ web: { status: 'stable' }, rn: { status: 'beta' } }`.
   */
  platforms?: ComponentPlatformsMatrix;

  /**
   * Stable Figma componentKey + variantProperties + keyHistory. See
   * componentMetaExtensions.ts for why nodeIds are NOT used.
   */
  figma?: ComponentFigmaMapping;

  /**
   * Tokens this component declares it consumes. Drives the build-time
   * integrity check (a regression here means meta and impl have drifted).
   */
  tokens?: ComponentTokenConsumption;

  /**
   * Prop-name → forbidden-pattern map. Used by downstream consumers to
   * reject e.g. raw hex on a colour prop, plus surface an LLM-rewrite hint.
   */
  forbiddenPatterns?: ForbiddenPatternsMap;

  /**
   * When set, marks the component as deprecated and points consumers at the
   * replacement (+ optional codemod). Renderer / editor surfaces should
   * down-rank the component and surface the migration note.
   */
  deprecation?: ComponentDeprecationInfo;
}

/**
 * Resolved allowed enum values for a prop given current component props.
 * Use when `optionsByDiscriminator` is set (e.g. Text `size` per `variant`).
 */
export function getEffectiveEnumOptions(
  prop: PropDescriptor,
  allProps: Record<string, unknown>,
): readonly (string | number | boolean)[] {
  const obd = prop.optionsByDiscriminator;
  if (!obd) return prop.options ?? [];

  const raw = allProps[obd.discriminator];
  const key =
    raw !== undefined && raw !== null && String(raw) !== ''
      ? String(raw)
      : '';

  const direct = key ? obd.options[key] : undefined;
  if (direct && direct.length > 0) return direct;

  const fallbackBody = obd.options['body'];
  if (fallbackBody && fallbackBody.length > 0) return fallbackBody;

  const first = Object.values(obd.options).find((arr) => arr.length > 0);
  if (first && first.length > 0) return first;

  return prop.options ?? [];
}
