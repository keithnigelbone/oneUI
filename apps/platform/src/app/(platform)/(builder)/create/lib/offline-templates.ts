/**
 * Token-only HTML/CSS for offline wizard asset generation (Create pipeline).
 *
 * V2: Uses the ContentBlock + JioRibbon canvas components directly, matching
 * the Banner Builder's universal banner layout pattern (z-layered:
 * background → JioRibbon → ContentBlock overlay).
 */

import type { AssetDimension } from './types';
import { DEFAULT_CONTENT_BLOCK_PROPS } from '@/design-tools/ContentBlock';

export interface OfflineContentFields {
  context?: string;
  headline?: string;
  body?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

export interface GenerateOfflineAssetParams {
  formatId: string;
  dimension: Pick<AssetDimension, 'name' | 'width' | 'height' | 'platform' | 'category'>;
  content: OfflineContentFields;
  brandName: string;
}

/**
 * Resolve ContentBlock props from wizard content + dimensions.
 * Matches the Banner Builder's content block layout:
 * - position: bottom (text/CTA anchored to bottom of frame, image above)
 * - alignment: left (standard marketing left-aligned copy)
 * - Headline, body, context, and CTAs populated from wizard answers
 */
export function buildContentBlockProps(
  params: GenerateOfflineAssetParams
): Record<string, unknown> {
  const { dimension, content, brandName } = params;
  const ctx = content.context?.trim() || brandName;
  const headline = content.headline?.trim() || 'Your headline here';
  const body = content.body?.trim() || 'Supporting copy goes here.';
  const cta1 = content.ctaPrimary?.trim() || 'Learn more';
  const cta2 = content.ctaSecondary?.trim() || '';
  const hasCta2 = Boolean(cta2);

  const isPortrait = dimension.height > dimension.width;
  const isSmall = dimension.width * dimension.height < 150_000;

  return {
    canvasWidth: dimension.width,
    canvasHeight: dimension.height,
    position: 'bottom',
    alignment: 'left',
    maxWidth: isPortrait ? 80 : 50,
    contextText: ctx,
    headlineText: headline,
    bodyText: body,
    primaryCtaText: cta1,
    secondaryCtaText: cta2 || DEFAULT_CONTENT_BLOCK_PROPS.secondaryCtaText,
    showContext: true,
    showBody: !isSmall,
    showButtons: !isSmall,
    showSecondaryButton: hasCta2,
    headlineToken: 'auto',
    platform: 'auto',
    density: 'default',
    contextRole: 'Label',
    contextSize: 'M',
    bodySize: 'M',
    buttonSize: isSmall ? 's' : 'm',
    buttonAppearance: 'primary',
  };
}

/**
 * Component AST for the offline wizard: ContentBlock fills the frame,
 * JioRibbon added separately by the capture pipeline.
 *
 * The AST uses the `ContentBlock` component type so the tldraw canvas renders
 * it with proper token-driven typography and spacing.
 */
export function generateOfflineAssetAST(params: GenerateOfflineAssetParams): {
  version: 1;
  name: string;
  root: Record<string, unknown>;
} {
  const { dimension } = params;
  const contentBlockProps = buildContentBlockProps(params);

  return {
    version: 1,
    name: dimension.name,
    root: {
      id: 'root',
      kind: 'element',
      tag: 'div',
      props: {
        style: {
          width: `${dimension.width}px`,
          height: `${dimension.height}px`,
          position: 'relative',
          overflow: 'hidden',
        },
      },
      children: [
        {
          id: 'content-block',
          kind: 'component',
          type: 'ContentBlock',
          props: contentBlockProps,
          children: [],
        },
      ],
    },
  };
}
