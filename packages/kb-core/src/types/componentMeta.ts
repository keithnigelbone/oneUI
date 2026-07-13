/**
 * Uniform component-meta shape — the contract every @jds/kb-<sdk> component
 * file conforms to. Generic over render hints + a11y so each SDK can attach
 * its own (typed) idiomatic block without widening the union.
 */

import type { SchemaVersion } from './version';
import type { ComponentTokenConsumption } from './tokens';
import type { CompositionRule } from './composition';
import type { FigmaMapping } from './figma';

export type ComponentStatus = 'planned' | 'alpha' | 'beta' | 'stable' | 'deprecated';

export interface DeprecationInfo {
  readonly since: string;             // semver — when deprecation was announced
  readonly useInstead: string;        // name of the replacement component
  readonly migrationNote: string;     // 1-2 sentence guidance
  /**
   * Optional path (relative to package root) to a jscodeshift or ts-morph
   * codemod a consumer can run. Drift-resistant when paired with
   * `codemodTestFixture`.
   */
  readonly autoMigrationCodemod?: string;
  readonly codemodTestFixture?: string;
}

/**
 * JSON Schema 2020-12 fragment that describes the component's props. Authors
 * write the schema inline; TS types are generated from it via
 * json-schema-to-typescript. AJV compiles it at install time.
 *
 * Custom annotations consumers read:
 *   - x-jds-suggestion : string — actionable rewrite suggestion for the LLM
 *   - x-jds-severity   : 'error' | 'warn' | 'info' — default 'warn'
 *   - x-jds-token      : <token-vocabulary path>  — bind a prop to a token enum
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
  // arbitrary x-jds-* annotations live at any depth — leave as `unknown`.
}

export interface ComponentMetaUniform<RenderHints, A11yShape> {
  readonly schemaVersion: SchemaVersion;
  readonly name: string;
  /** Where the component is imported from in source. */
  readonly importPath: string;
  readonly status: ComponentStatus;

  readonly propsSchema: JsonSchemaFragment;
  readonly tokens: ComponentTokenConsumption;
  readonly composition?: CompositionRule;
  readonly a11y: A11yShape;
  readonly figma?: FigmaMapping;
  readonly renderHints: RenderHints;
  readonly deprecation?: DeprecationInfo;

  /**
   * Per-variant perceptual hashes + canonical renders. Populated by the
   * kb-<sdk> visual-signature generator. Enables a screenshot-only consumer
   * (e.g. an agent given a PNG with no source code or AX tree) to identify
   * which JDS components are visible via pHash + SSIM lookup against the
   * deterministic library.
   */
  readonly visualSignatures?: readonly VisualSignature[];

  /** Short, human-readable description for picker UIs + agent prompts. */
  readonly description: string;
  /** Free-form tags for discovery (e.g., 'cta', 'navigation'). */
  readonly tags?: readonly string[];
}

/**
 * One canonical render of a single variant tuple.
 *
 * `variantId` is the stable identifier consumers use to cross-reference back
 * into the meta + reverse-index. Convention: dot-separated key=value tuples,
 * e.g. `Button.appearance=primary.surface=bold.size=10`.
 */
export interface VisualSignature {
  readonly variantId: string;
  /** PNG path RELATIVE to the package's dist root (e.g. `visual-signatures/Button/<id>.png`). */
  readonly pngPath: string;
  /** pHash, 16-char hex (DCT-based perceptual hash). */
  readonly perceptualHash: string;
  /** w/h at @2x. Used by region segmentation to pre-filter candidates. */
  readonly aspectRatio: number;
  /** Canonical size at @1x. */
  readonly canonicalSize: { readonly width: number; readonly height: number };
  /** The full variant tuple this signature captures (mirrors propsSchema values). */
  readonly variantProperties: Readonly<Record<string, string | number | boolean>>;
  readonly capturedAt: string;
  readonly capturedFrom: 'storybook' | 'rn-storybook' | 'figma-export' | 'manual';
}

/**
 * Per-package reverse index emitted alongside the per-component metas. Lives
 * at `dist/visual-signature-index.json`. Stamped with the kb-<sdk>'s own
 * `kbVersion` so a consumer can detect drift against the manifest at session
 * start.
 */
export interface VisualSignatureIndex {
  readonly schemaVersion: SchemaVersion;
  readonly kbVersion: string;
  readonly sdk: string;
  readonly generatedAt: string;
  /** Total signatures across the package. */
  readonly totalSignatures: number;
  /**
   * pHash → { component, variantId, sdk }. Used by consumers to look up a
   * screenshot region's most likely JDS component in O(1).
   */
  readonly byHash: Readonly<Record<string, {
    readonly component: string;
    readonly variantId: string;
    readonly sdk: string;
  }>>;
}
