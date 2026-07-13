/**
 * composition-to-jsonschema compiler.
 *
 * Authors write the structured `CompositionRule` (declarative — easy to read,
 * easy to type-check). Consumers need JSON Schema for AJV validation; this
 * compiler emits the Schema mechanically.
 *
 * Mapping:
 *   childKind: 'leaf'         → properties.children = { not: { type: 'array' } }    // string allowed; array forbidden
 *   childKind: 'variadic'     → properties.children = { type: 'array', minItems, maxItems, items: <oneOf accepted> }
 *   childKind: 'fixed-slots'  → properties.<slot> per spec, with cardinality:
 *                                 single   → required + items single
 *                                 optional → not-required + items single
 *                                 multiple → array
 *
 * `accepts: ['*']` collapses to `true` (any element). `accepts: ['#string']`
 * → { type: 'string' }; ['#number'] → { type: 'number' }; ['#node'] → true.
 *
 * Custom annotations:
 *   x-jds-composition-source : "@jds/kb-core/composition/compile" — for round-trip diffs
 */

import type { CompositionRule, SlotSpec } from '../types/composition';

interface JsonSchemaFragment {
  readonly [k: string]: unknown;
}

const PRIMITIVE_TYPES: Record<string, JsonSchemaFragment | true> = {
  '#string': { type: 'string' },
  '#number': { type: 'number' },
  '#node': true,
  '*': true,
};

function acceptedItemsSchema(accepts: readonly string[]): JsonSchemaFragment | true {
  if (accepts.length === 0) return false as unknown as JsonSchemaFragment;
  // If any '*' or '#node' wildcard, schema is `true` (any).
  if (accepts.some((a) => a === '*' || a === '#node')) return true;
  // Mixed primitive + component names — emit oneOf with mutually-exclusive
  // type constraints. Component-name branches carry `type: 'object'` so they
  // can't accidentally match a string ('#string') branch in the same oneOf.
  const branches: Array<JsonSchemaFragment | true> = accepts.map((a) => {
    const primitive = PRIMITIVE_TYPES[a];
    if (primitive !== undefined) return primitive;
    return { type: 'object', 'x-jds-component-name': a };
  });
  if (branches.length === 1) {
    const only = branches[0]!;
    return typeof only === 'boolean' ? only : only;
  }
  return { oneOf: branches };
}

function compileSlot(name: string, spec: SlotSpec): { schema: JsonSchemaFragment; required: boolean } {
  const items = acceptedItemsSchema(spec.accepts);
  let schema: JsonSchemaFragment;
  if (spec.cardinality === 'multiple') {
    schema = { type: 'array', items, minItems: 1 };
  } else {
    schema = typeof items === 'boolean'
      ? { 'x-jds-any': items }
      : items;
  }
  const required = spec.cardinality === 'single';
  return { schema, required };
}

export interface CompiledComposition {
  readonly properties: Readonly<Record<string, JsonSchemaFragment>>;
  readonly required: readonly string[];
  readonly 'x-jds-composition-source': '@jds/kb-core/composition/compile';
}

/**
 * Compile a structured composition rule into a JSON Schema fragment that AJV
 * can verify. The result merges into the component's full propsSchema (under
 * `properties` + `required`).
 */
export function compileComposition(rule: CompositionRule): CompiledComposition {
  const properties: Record<string, JsonSchemaFragment> = {};
  const required: string[] = [];

  if (rule.childKind === 'leaf') {
    // Leaf components accept a string label, number, or a single ReactNode —
    // array children are rejected. The forbidden-array constraint is what
    // makes "leaf" enforceable.
    properties.children = {
      not: { type: 'array' },
    } satisfies JsonSchemaFragment;
  } else if (rule.childKind === 'variadic') {
    if (!rule.variadic) {
      throw new Error('[kb-core/composition] variadic rule missing `variadic` spec');
    }
    const items = acceptedItemsSchema(rule.variadic.accepts);
    properties.children = {
      type: 'array',
      minItems: rule.variadic.min,
      maxItems: rule.variadic.max,
      items,
    } satisfies JsonSchemaFragment;
    if (rule.variadic.min > 0) required.push('children');
  } else if (rule.childKind === 'fixed-slots') {
    if (!rule.slots) {
      throw new Error('[kb-core/composition] fixed-slots rule missing `slots` map');
    }
    for (const [slotName, spec] of Object.entries(rule.slots)) {
      const compiled = compileSlot(slotName, spec);
      properties[slotName] = compiled.schema;
      if (compiled.required) required.push(slotName);
    }
  }

  return {
    properties,
    required,
    'x-jds-composition-source': '@jds/kb-core/composition/compile',
  } as CompiledComposition;
}
