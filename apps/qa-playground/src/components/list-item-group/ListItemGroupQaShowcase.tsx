'use client';

import { QaShowcaseRoot } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';

/**
 * List Item Group QA — **same outer mount as Button** (`QaShowcaseRoot`).
 * Section bands inside use {@link ../shared/QaShowcaseLayout#QaStoryBand} via {@link ../shared/ScenarioGridQaShowcase}.
 */
export function ListItemGroupQaShowcase() {
  return (
    <QaShowcaseRoot>
      <ScenarioGridQaShowcase slug="list-item-group" />
    </QaShowcaseRoot>
  );
}
