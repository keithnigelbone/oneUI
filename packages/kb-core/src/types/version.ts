/**
 * Three independent semver fields, each at a distinct layer.
 *
 * - schemaVersion  — the SHAPE of the KB (componentMeta interface, propsSchema
 *                    discriminators). Stamped on every component file so a single
 *                    component can be at 5.1.0 while others remain at 5.0.0.
 * - kbVersion      — the CONTENT (which components / which tokens are in this
 *                    release). Stamped on the per-SDK package's manifest.json.
 * - brandSetVersion — the per-release brand snapshot bundle (produced by
 *                    OneUI CI via `scripts/snapshot-brands.ts`). Stamped on
 *                    the manifest.json and on every `dist/brands/<slug>.json`.
 *
 * Consumers compare these three independently:
 *   schemaVersion major mismatch  → consumer enters federation/compat mode
 *   kbVersion     minor mismatch  → consumer warns on capability divergence
 *   brandSetVersion any change    → consumer invalidates its brand cache
 */

export const KB_SCHEMA_VERSION = '5.0.0' as const;
export const KB_VERSION = '12.0.0' as const;
export const BRAND_SET_VERSION = '3.0.0' as const;

export type SchemaVersion = `${number}.${number}.${number}`;
export type KbVersion = `${number}.${number}.${number}` | `${number}.${number}.${number}-${string}`;
export type BrandSetVersion = KbVersion;

/** SDK identifiers shared across kb-core + kb-<sdk> packages. */
export const SDK_IDS = ['web', 'rn', 'ios', 'android', 'flutter'] as const;
export type SdkId = (typeof SDK_IDS)[number];

/**
 * Top-level manifest emitted into every kb-<sdk> package's `dist/manifest.json`.
 * Consumers read this at session start to:
 *   1. Discover which components are available
 *   2. Compare commonKbVersion across all installed kb-* packages (drift check)
 *   3. Pick the right component file by name without enumerating the filesystem.
 */
export interface KBManifest {
  readonly schemaVersion: SchemaVersion;
  readonly kbVersion: KbVersion;
  readonly brandSetVersion: BrandSetVersion;
  /** Identical to kbVersion when emitted in lock-step; consumers assert equality across SDKs. */
  readonly commonKbVersion: KbVersion;
  readonly sdk: SdkId;
  readonly generatedAt: string;
  readonly componentCount: number;
  readonly componentIndex: ReadonlyArray<{
    readonly name: string;
    readonly status: 'planned' | 'alpha' | 'beta' | 'stable' | 'deprecated';
    readonly file: string;
  }>;
  /** Reverse lookup: figma componentKey + variantProperties → JDS component name. */
  readonly figmaReverseIndex: ReadonlyArray<{
    readonly componentKey: string;
    readonly keyHistory: readonly string[];
    readonly variantProperties: Readonly<Record<string, string>>;
    readonly jdsName: string;
  }>;
}
