/**
 * enumerateVariants — SDK-agnostic variant tuple enumeration.
 *
 * Promoted out of @jds/kb-web (round 4, F.4.b) so kb-rn / kb-ios / kb-android
 * share one implementation. The function reads a meta's propsSchema and
 * Cartesian-expands the canonical axes (appearance × variant × mode × size
 * × tone × attention), capped at 16 tuples per component to keep the
 * visual-signature library bounded.
 *
 * Pure — no I/O, deterministic on identical inputs.
 */

export interface VariantTuple {
  readonly component: string;
  readonly variantId: string;
  readonly properties: Readonly<Record<string, string | number | boolean>>;
}

/** Preferred axes order — stable across runs so variantIds don't shuffle. */
const PREFERRED_AXES = [
  'appearance',
  'variant',
  'mode',
  'size',
  'tone',
  'attention',
] as const;

const MAX_TUPLES_PER_COMPONENT = 16;

interface EnumerableMeta {
  readonly name: string;
  readonly propsSchema: { readonly properties: Readonly<Record<string, unknown>> };
}

export function enumerateVariants(meta: EnumerableMeta): readonly VariantTuple[] {
  const props = meta.propsSchema.properties as Record<string, { enum?: readonly unknown[] }>;
  const axes: Array<[string, readonly (string | number | boolean)[]]> = [];

  for (const axisName of PREFERRED_AXES) {
    const values = props[axisName]?.enum;
    if (values && values.length > 0) {
      axes.push([axisName, values as readonly (string | number | boolean)[]]);
    }
  }

  if (axes.length === 0) {
    return [{ component: meta.name, variantId: `${meta.name}.default`, properties: {} }];
  }

  const expanded: VariantTuple[] = [];
  const recurse = (idx: number, acc: Record<string, string | number | boolean>): void => {
    if (expanded.length >= MAX_TUPLES_PER_COMPONENT) return;
    if (idx === axes.length) {
      const id = `${meta.name}.${Object.entries(acc).map(([k, v]) => `${k}=${v}`).join('.')}`;
      expanded.push({ component: meta.name, variantId: id, properties: { ...acc } });
      return;
    }
    const [axisName, values] = axes[idx]!;
    for (const v of values) {
      recurse(idx + 1, { ...acc, [axisName]: v });
    }
  };
  recurse(0, {});
  return expanded;
}
