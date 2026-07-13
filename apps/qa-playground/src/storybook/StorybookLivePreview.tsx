'use client';

import type { ComponentMeta } from '@oneui/shared';
import { ScenarioPreview } from '@/lib/qa/ScenarioPreview';
import { renderCatalogCompositePreview } from '@/lib/qa/catalogThumbnailPreview';
import { mergeStorybookPreviewProps } from './storybookPlaygroundState';
import styles from './qa-storybook.module.css';

export function StorybookLivePreview({
  meta,
  props,
}: {
  meta: ComponentMeta;
  props: Record<string, unknown>;
}) {
  const clean = mergeStorybookPreviewProps(meta, props);
  const composite = renderCatalogCompositePreview(meta, clean);

  return (
    <div className={styles.previewInner} data-testid="qa-storybook-preview-inner">
      {composite ?? <ScenarioPreview meta={meta} props={clean} />}
    </div>
  );
}
