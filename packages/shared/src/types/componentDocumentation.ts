/**
 * componentDocumentation.ts
 *
 * Machine-readable documentation contract for design-system components.
 * This is used by generators, docs renderers, and collaboration workflows.
 */

export type DocumentationSource = 'inferred' | 'authored' | 'overridden';

export interface DocumentationAttribution {
  source: DocumentationSource;
  updatedAt?: number;
  updatedBy?: string;
}

export interface DocumentationValue<T> {
  value: T;
  attribution: DocumentationAttribution;
}

export interface IntentAndPurpose {
  intent: DocumentationValue<string>;
  taskContexts: DocumentationValue<string[]>;
  sentiments: DocumentationValue<string[]>;
}

export interface CompositionRules {
  requires: DocumentationValue<string[]>;
  allows: DocumentationValue<string[]>;
  forbids: DocumentationValue<string[]>;
}

export interface VariantRule {
  name: string;
  useWhen: DocumentationValue<string[]>;
  avoidWhen?: DocumentationValue<string[]>;
  pairWith?: DocumentationValue<string[]>;
}

export interface VariantLogic {
  rules: VariantRule[];
}

export interface RelationshipsAndDependencies {
  related: DocumentationValue<string[]>;
  escalatesTo?: DocumentationValue<string[]>;
  degradesTo?: DocumentationValue<string[]>;
  groupsWith?: DocumentationValue<string[]>;
}

export interface ContextSignals {
  density: DocumentationValue<string[]>;
  modality: DocumentationValue<string[]>;
  brand: DocumentationValue<string[]>;
  mode: DocumentationValue<string[]>;
}

export interface ObservabilityHooks {
  track: DocumentationValue<string[]>;
  health: DocumentationValue<string[]>;
}

export interface AccessibilityGuidelines {
  wcagLevel: DocumentationValue<string[]>;
  keyboardBehavior: DocumentationValue<string[]>;
  screenReaderNotes: DocumentationValue<string[]>;
  contrastRequirements: DocumentationValue<string[]>;
}

export interface MigrationNotes {
  breakingChanges: DocumentationValue<string[]>;
  deprecations: DocumentationValue<string[]>;
  upgradeSteps: DocumentationValue<string[]>;
}

export interface ComponentPropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

export interface ComponentCodeSnippet {
  id: string;
  title: string;
  language: 'tsx' | 'ts' | 'css' | 'json' | 'bash';
  code: string;
}

export interface ComponentSlotDoc {
  name: string;
  types: string[];
  tokens: string[];
}

/**
 * Minimal JSON Schema 2020-12 fragment describing a component's prop contract.
 * Authors don't write this directly — `scripts/generate-machine-docs.ts`
 * derives it from the meta's `props[]` array + the optional
 * `forbiddenPatterns` map (added in B3).
 *
 * Custom annotations downstream consumers read (all `x-`-prefixed so JSON
 * Schema spec collisions are impossible):
 *   x-jds-suggestion : string                     LLM-rewrite suggestion
 *   x-jds-severity   : 'error' | 'warn' | 'info'  default 'warn'
 */
export interface JsonSchemaFragment {
  readonly $id?: string;
  readonly type: 'object';
  readonly properties: Readonly<Record<string, unknown>>;
  readonly required?: readonly string[];
  readonly oneOf?: readonly unknown[];
  readonly anyOf?: readonly unknown[];
  readonly not?: unknown;
  readonly definitions?: Readonly<Record<string, unknown>>;
}

/**
 * Union of all editable documentation section keys.
 * Used for granular field updates in the editor context.
 */
export type DocumentationSectionKey =
  | 'intentAndPurpose'
  | 'compositionRules'
  | 'variantLogic'
  | 'relationshipsAndDependencies'
  | 'contextSignals'
  | 'observabilityHooks'
  | 'accessibilityGuidelines'
  | 'migrationNotes';

/**
 * Schema version literal. Widened from `'1.0.0' | '1.1.0'` (round-2 audit
 * blocker B7) to the template literal so additive minor bumps don't need a
 * type-system rev. Pair every new emitter version with an entry in
 * `KNOWN_SCHEMA_VERSIONS` below — that's the runtime allowlist consumers use
 * to detect drift past a major boundary.
 */
export type SchemaVersionLiteral = `${number}.${number}.${number}`;

/**
 * Allowlist of schema versions known to be on-disk somewhere. Consumers
 * compare against this to decide between "operate normally", "warn and
 * degrade", and "refuse to load". Authors add to this tuple every time
 * the doc generator emits a new version.
 */
export const KNOWN_SCHEMA_VERSIONS = ['1.0.0', '1.1.0', '5.0.0'] as const;
export type KnownSchemaVersion = (typeof KNOWN_SCHEMA_VERSIONS)[number];

export interface ComponentDocumentationSpec {
  schemaVersion: SchemaVersionLiteral;
  componentName: string;
  generatedAt: string;
  machineReadable: true;
  intentAndPurpose: IntentAndPurpose;
  compositionRules: CompositionRules;
  variantLogic: VariantLogic;
  relationshipsAndDependencies: RelationshipsAndDependencies;
  contextSignals: ContextSignals;
  observabilityHooks: ObservabilityHooks;
  accessibilityGuidelines?: AccessibilityGuidelines;
  migrationNotes?: MigrationNotes;
  props: ComponentPropDoc[];
  slots: ComponentSlotDoc[];
  /**
   * Optional machine-validated JSON Schema for the component's prop contract.
   * Derived from `meta.props[]` + the new `meta.forbiddenPatterns` map (B3)
   * by `scripts/generate-machine-docs.ts`. Consumers compile this with AJV
   * to reject invalid prop combinations + raw-literal violations.
   */
  propsSchema?: JsonSchemaFragment;
  codeSnippets: ComponentCodeSnippet[];
  generatedMarkdown?: string;
  tags?: string[];
  sourceHash?: string;
}
