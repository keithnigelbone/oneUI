'use client';

import { QaShowcaseRoot } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';

/**
 * FAB QA — **same outer mount as Button** (`QaShowcaseRoot`).
 * Section bands inside use {@link ../shared/QaShowcaseLayout#QaStoryBand} via {@link ../shared/ScenarioGridQaShowcase}.
 */
export function FABQaShowcase() {
  return (
    <QaShowcaseRoot>
      <ScenarioGridQaShowcase slug="fab" />
    </QaShowcaseRoot>
  );
}
