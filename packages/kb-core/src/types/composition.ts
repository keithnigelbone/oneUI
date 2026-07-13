/**
 * Composition + slot rules — the structured form (decision: pushback #9 accepted).
 *
 * Authors write this object. A separate compiler in @jds/kb-core/composition-to-jsonschema
 * (future) emits an equivalent JSON Schema fragment that consumer AJV validators
 * understand. Authors NEVER write raw JSON Schema $ref nesting — too brittle for
 * heterogeneous JSX children.
 */

export type ChildKind = 'leaf' | 'fixed-slots' | 'variadic';

export type SlotCardinality = 'single' | 'optional' | 'multiple';

export interface SlotSpec {
  /**
   * Allowed child component names. Use `#string`, `#number`, `#node` for
   * primitives. Use `*` to allow any registered component.
   */
  readonly accepts: readonly string[];
  readonly cardinality: SlotCardinality;
  readonly description?: string;
}

export interface CompositionRule {
  readonly childKind: ChildKind;

  /** Required when childKind === 'fixed-slots'. */
  readonly slots?: Readonly<Record<string, SlotSpec>>;

  /** Required when childKind === 'variadic'. */
  readonly variadic?: {
    readonly accepts: readonly string[];
    readonly min: number;
    readonly max: number;
  };
}
