import type { ComponentMeta } from '@oneui/shared';
import type { InteractionStateKey } from './scenarioProps';
import {
  applicableInteractionStates,
  applyInteractionState,
  appearanceSampleProps,
  buttonSlotScenarios,
  mapMatrixToProps,
} from './scenarioProps';
import type { QAScenario } from './types';

const MAX_SCENARIOS = 180;

function slugifyPart(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function propsSignature(props: Record<string, unknown>): string {
  try {
    return JSON.stringify(props, Object.keys(props).sort());
  } catch {
    return String(Math.random());
  }
}

function makeScenario(
  meta: ComponentMeta,
  group: string,
  name: string,
  props: Record<string, unknown>,
  index: number,
  layout: QAScenario['layout'] = 'default'
): QAScenario {
  const id = `${slugifyPart(meta.slug)}-${index}-${slugifyPart(name)}`.slice(0, 96);
  const testId = `oneui-qa-${meta.slug}-${index}`;
  return {
    id,
    group,
    name,
    props,
    testId,
    playwrightSelector: `page.getByTestId('${testId}')`,
    layout,
  };
}

export function buildScenariosForMeta(meta: ComponentMeta): QAScenario[] {
  const matrix = meta.previewMatrix;
  const sizes: Array<string | number | undefined> =
    matrix.sizes && matrix.sizes.length > 0 ? [...matrix.sizes] : [undefined];
  const variants = [...matrix.variants];

  const states = applicableInteractionStates(meta);
  const out: QAScenario[] = [];
  let index = 0;
  const seen = new Set<string>();

  const pushUnique = (
    group: string,
    name: string,
    props: Record<string, unknown>,
    layout?: QAScenario['layout']
  ) => {
    const sig = `${layout ?? 'default'}|${propsSignature(props)}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    out.push(makeScenario(meta, group, name, props, index, layout));
    index += 1;
  };

  for (const variant of variants) {
    for (const size of sizes) {
      const base = mapMatrixToProps(meta, variant, size);
      const variantLabel = matrix.variantLabels[variant] ?? variant;
      const sizeLabel =
        size !== undefined && matrix.sizeLabels
          ? matrix.sizeLabels[String(size)] ?? String(size)
          : '';

      for (const state of states) {
        const applied = applyInteractionState(meta, base, state as InteractionStateKey);
        const stateSuffix = state === 'default' ? '' : ` — ${state}`;
        const group = 'Variant × size × state';
        const name = sizeLabel
          ? `${variantLabel} · ${sizeLabel}${stateSuffix}`
          : `${variantLabel}${stateSuffix}`;
        pushUnique(group, name, applied);
      }
    }
  }

  const v0 = variants[0] ?? '';
  const s0 = sizes[0];
  for (const sample of appearanceSampleProps(meta)) {
    const base = mapMatrixToProps(meta, v0, s0);
    if (meta.slug === 'button') {
      pushUnique('Appearance roles', sample.name, {
        ...applyInteractionState(meta, base, 'default'),
        attention: 'high',
        size: 10,
        appearance: sample.appearance,
      });
    } else {
      pushUnique('Appearance roles', sample.name, {
        ...applyInteractionState(meta, base, 'default'),
        appearance: sample.appearance,
      });
    }
  }

  if (meta.slug === 'button') {
    for (const row of buttonSlotScenarios()) {
      pushUnique(row.group, row.name, row.props);
    }
  }

  if (meta.slug === 'button') {
    const narrowBase = mapMatrixToProps(meta, 'medium', 10);
    pushUnique(
      'Responsive layout',
      'Narrow container',
      applyInteractionState(meta, narrowBase, 'default'),
      'narrow'
    );
  }

  if (out.length > MAX_SCENARIOS) {
    return out.slice(0, MAX_SCENARIOS);
  }
  return out;
}
