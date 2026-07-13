/**
 * Figma mapping — component KEY (stable per definition) + variant property tuple,
 * with a `keyHistory` hedge for Jio Design's occasional re-authoring (decision #8).
 *
 * NEVER use Figma node IDs (`12:345`) — they mutate when designers add/remove
 * variant properties. Component keys (`a1b2c3...`) are stable.
 */

export interface FigmaMapping {
  /** Current Figma component key. Stable per component definition. */
  readonly componentKey: string;
  /**
   * Variant properties that narrow the resolved component within this key's
   * variant set. Omit a property to match any value of that property.
   */
  readonly variantProperties?: Readonly<Record<string, string>>;
  /**
   * Prior component keys this JDS component used to map to. Empty in the
   * common case. Populated when Jio Design re-authors a component (new key,
   * same semantic component). Reverse-lookup walks this list as a fallback.
   */
  readonly keyHistory: readonly string[];
}

/**
 * One entry in the per-package figmaReverseIndex array (see version.ts).
 * Consumers do O(1) lookups against this collection at parse time.
 */
export interface FigmaReverseIndexEntry {
  readonly componentKey: string;
  readonly keyHistory: readonly string[];
  readonly variantProperties: Readonly<Record<string, string>>;
  readonly jdsName: string;
}
