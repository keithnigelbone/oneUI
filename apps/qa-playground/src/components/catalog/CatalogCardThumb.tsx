'use client';

import { useMemo } from 'react';
import type { ComponentMeta } from '@oneui/shared';
import { getCatalogThumbnailPreviewProps } from '@/lib/qa/catalog';
import { ScenarioPreview } from '@/lib/qa/ScenarioPreview';

/** Live preview clipped inside the catalog card stage. */
export function CatalogCardThumb({ meta }: { meta: ComponentMeta }) {
  const previewProps = useMemo(() => getCatalogThumbnailPreviewProps(meta), [meta]);

  return <ScenarioPreview meta={meta} props={previewProps} thumbnailMode />;
}
