'use client';

import { QaShowcaseRoot } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';

/**
 * Link Button QA — **same outer mount as Button** (`QaShowcaseRoot`).
 * Section bands inside use {@link ../shared/QaShowcaseLayout#QaStoryBand} via {@link ../shared/ScenarioGridQaShowcase}.
 */
export function LinkButtonQaShowcase() {
  return (
    <QaShowcaseRoot>
      <ScenarioGridQaShowcase slug="link-button" />
    </QaShowcaseRoot>
  );
}
