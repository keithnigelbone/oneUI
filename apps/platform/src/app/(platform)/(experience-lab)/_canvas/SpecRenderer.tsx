'use client';

import { useMemo, type CSSProperties } from 'react';
import {
  compositionSpecToAst,
  normalizeRenderDensity,
  normalizeRenderPlatform,
  type CompositionSpecT,
} from '@oneui/experience-builder-core';
import { ASTRenderer } from '@oneui/ui/runtime';
import styles from './SpecRenderer.module.css';

const DESIGN_VIEWPORT_WIDTH = 1440;

export interface SpecRendererProps {
  spec: CompositionSpecT;
  platform?: string;
  density?: string;
}

export function SpecRenderer({ spec, platform, density }: SpecRendererProps) {
  const tree = useMemo(() => compositionSpecToAst(spec), [spec]);
  const resolvedPlatform = normalizeRenderPlatform(platform ?? spec.platform ?? spec.targetProfile);
  const resolvedDensity = normalizeRenderDensity(density ?? spec.density);

  return (
    <div
      className={styles.specPreviewRoot}
      data-oneui-composition-id={spec.root.id}
      data-oneui-brand-id={spec.brandId}
      data-testid="composition-spec-renderer"
    >
      <div className={styles.specPreviewInner}>
        <div
          className={styles.specPreviewViewport}
          style={{ '--_spec-design-width': `${DESIGN_VIEWPORT_WIDTH}px` } as CSSProperties}
        >
          <ASTRenderer
            tree={tree}
            mode="render"
            surfaceMode={spec.root.surface}
            platform={resolvedPlatform}
            density={resolvedDensity}
          />
        </div>
      </div>
    </div>
  );
}
