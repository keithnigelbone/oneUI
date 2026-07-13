/**
 * buildPropsSchema — derives a JSON Schema 2020-12 fragment from a
 * `ComponentMeta`'s `props[]` + the optional B3 `forbiddenPatterns` map.
 *
 * Used by `scripts/generate-machine-docs.ts` to emit the `propsSchema`
 * field on every `ComponentDocumentationSpec`. Lives in @oneui/shared
 * (not in scripts/) so consumers downstream can call it directly without
 * pulling the ts-morph generator's dependency footprint.
 *
 * Pure: no I/O, no ts-morph, deterministic. Unit-tested standalone.
 */

import type { ComponentMeta } from '../types/componentMeta';
import type {
  ComponentPropDoc,
  JsonSchemaFragment,
} from '../types/componentDocumentation';

const TYPE_TO_JSON_SCHEMA: Readonly<Record<string, { type?: string }>> = {
  string: { type: 'string' },
  number: { type: 'number' },
  boolean: { type: 'boolean' },
  object: { type: 'object' },
  // ReactNode / function / enum carry no JSON-Schema-typeable surface;
  // emitted entries lack a `type` and rely on `enum` or descriptive props only.
  ReactNode: {},
  function: {},
  enum: {},
};

/**
 * Build a minimal JSON Schema fragment for a component's prop contract.
 *
 * - Each `props[i]` becomes `properties[propName]` with type / enum /
 *   default / description / required-list derived from the PropDescriptor
 *   + the matching ComponentPropDoc (passed in from the generator after
 *   ts-morph extraction).
 * - `meta.forbiddenPatterns` overlays via `not: { anyOf: [{ pattern }] }` +
 *   custom `x-jds-suggestion` + `x-jds-severity` annotations.
 */
export function buildPropsSchema(
  meta: ComponentMeta,
  props: readonly ComponentPropDoc[],
): JsonSchemaFragment {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  for (const prop of props) {
    const entry: Record<string, unknown> = {};
    const typed = TYPE_TO_JSON_SCHEMA[prop.type];
    if (typed?.type) entry.type = typed.type;

    // Enum options live on the meta's PropDescriptor (canonical source);
    // the ComponentPropDoc only carries a stringified TS type. Cross-look.
    const metaProp = meta.props.find((p) => p.name === prop.name);
    if (metaProp?.options && metaProp.options.length > 0) {
      entry.enum = [...metaProp.options] as unknown[];
    }

    if (prop.description) entry.description = prop.description;
    if (prop.defaultValue !== undefined) entry.default = prop.defaultValue;
    if (prop.required) required.push(prop.name);

    properties[prop.name] = entry;
  }

  // B3 forbidden patterns — overlay onto matching props. When the meta
  // forbids a prop name not in `props[]` (e.g. backgroundColor on a Surface
  // that doesn't expose it in TS), the entry is added defensively so the
  // schema still rejects the literal at validation time.
  const forbidden = meta.forbiddenPatterns;
  if (forbidden) {
    for (const [propName, rule] of Object.entries(forbidden)) {
      const existing = properties[propName] ?? {};
      properties[propName] = {
        ...existing,
        type: existing.type ?? 'string',
        not: {
          anyOf: rule.regexps.map((source) => ({ pattern: source })),
        },
        'x-jds-suggestion': rule.suggestion,
        'x-jds-severity': rule.severity,
      };
    }
  }

  const schema: JsonSchemaFragment = {
    $id: `jds.docs.${meta.slug}`,
    type: 'object',
    properties,
  };
  return required.length > 0
    ? { ...schema, required }
    : schema;
}
