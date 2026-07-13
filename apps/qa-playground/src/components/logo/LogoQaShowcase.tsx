'use client';

import { QaShowcaseRoot } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';

/**
 * Logo QA — **same outer mount as Button** (`QaShowcaseRoot`).
 * Section bands inside use {@link ../shared/QaShowcaseLayout#QaStoryBand} via {@link ../shared/ScenarioGridQaShowcase}.
 */
export function LogoQaShowcase() {
  return (
    <QaShowcaseRoot>
      <ScenarioGridQaShowcase slug="logo" />
    </QaShowcaseRoot>
  );
}
