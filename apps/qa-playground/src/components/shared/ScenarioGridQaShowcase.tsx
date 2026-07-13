'use client';

import { Fragment, useMemo } from 'react';
import type { ComponentMeta } from '@oneui/shared';
import { getMetaBySlug } from '../../catalog/registry';
import { buildScenariosForMeta } from '../../lib/qa/buildScenarios';
import { ScenarioPreview } from '../../lib/qa/ScenarioPreview';
import type { QAScenario } from '../../lib/qa/types';
import { QaStoryBand } from './QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Registry-driven Switch previews omit `children` (ReactNode in meta); give each chip a stable axe-safe name. */
function withSwitchScenarioA11y(
  meta: ComponentMeta,
  props: Record<string, unknown>,
  scenarioName: string,
): Record<string, unknown> {
  if (meta.slug !== 'switch') {
    return props;
  }
  const next = { ...props };
  if (next.children != null) {
    return next;
  }
  const existing = next['aria-label'];
  if (typeof existing === 'string' && existing.trim() !== '') {
    return next;
  }
  next['aria-label'] = `Switch: ${scenarioName}`;
  return next;
}

/**
 * Scenario-driven bands using the same {@link QaStoryBand} DOM as `button/ButtonQaShowcase.tsx`.
 * Wrap with {@link ./QaShowcaseLayout#QaShowcaseRoot} at the page entry (see each `*QaShowcase.tsx`).
 */
export function ScenarioGridQaShowcase({ slug }: { slug: string }) {
  const meta = useMemo(() => getMetaBySlug(slug), [slug]);
  const scenarios = useMemo(() => (meta ? buildScenariosForMeta(meta) : []), [meta]);

  const grouped = useMemo(() => {
    const m = new Map<string, QAScenario[]>();
    for (const s of scenarios) {
      const list = m.get(s.group) ?? [];
      list.push(s);
      m.set(s.group, list);
    }
    return m;
  }, [scenarios]);

  if (!meta) {
    return null;
  }

  const firstScenario = scenarios[0];
  const firstProps = withSwitchScenarioA11y(
    meta,
    firstScenario?.props ?? {},
    firstScenario?.name ?? 'Default',
  );

  return (
    <Fragment>
      <QaStoryBand title="Default" centerContent>
        <ScenarioPreview meta={meta} props={firstProps} />
      </QaStoryBand>

      {[...grouped.entries()].map(([groupName, items]) => (
        <QaStoryBand key={groupName} title={groupName} flexRow>
          {items.map((scenario) => (
            <div key={scenario.id} className={styles.storyPreviewChip}>
              <ScenarioPreview meta={meta} props={withSwitchScenarioA11y(meta, scenario.props, scenario.name)} />
            </div>
          ))}
        </QaStoryBand>
      ))}
    </Fragment>
  );
}
