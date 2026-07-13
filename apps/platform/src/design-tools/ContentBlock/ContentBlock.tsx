/**
 * ContentBlock.tsx
 *
 * Jio-style marketing content block for the experience canvas: context, headline,
 * body, and OneUI Button CTAs. Layout and type scale use design tokens; responsive
 * behaviour follows canvas (frame) dimensions.
 */

'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { computeDimensionOverrides } from '@oneui/shared';
import type { DensityId } from '@oneui/shared';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { useContentBlockFoundationPlatforms } from '../ExperienceCanvas/ContentBlockFoundationContext';
import { contentBlockBrandBgTextTokens } from '../ExperienceCanvas/artboardSurfaces';
import styles from './ContentBlock.module.css';
import {
  CONTENT_BLOCK_F_STEP_OPTIONS,
  DEFAULT_CONTENT_BLOCK_PROPS,
  type ContentBlockSerializableProps,
  type DimensionFStep,
  defaultButtonGapFStep,
  defaultButtonRowGapFStep,
  defaultPaddingFSteps,
  defaultTextGapFStep,
  dimensionFStepInlineVars,
  dimensionVar,
  getBannerSizeCategory,
  headlineTypographyVars,
  mergeContentBlockProps,
  resolveBodyTypographyVars,
  resolveContentBlockPlatform,
  resolveContextTypographyVars,
  resolveHeadlineToken,
} from './ContentBlock.shared';
import type { ButtonAppearance } from '@oneui/ui-internal/components/Button/Button.shared';

const F_STEPS = CONTENT_BLOCK_F_STEP_OPTIONS as readonly string[];

function isDimensionFStep(value: string | undefined): value is DimensionFStep {
  return value !== undefined && F_STEPS.includes(value);
}

function resolveFStep(value: string | undefined, fallback: DimensionFStep): DimensionFStep {
  if (!value || value === 'auto') return fallback;
  return isDimensionFStep(value) ? value : fallback;
}

export type ContentBlockProps = Partial<ContentBlockSerializableProps> & {
  /** Canvas-internal: field currently being edited inline — hides that element so the overlay shows cleanly */
  _cbEditField?: string;
  /** Canvas-only: frame artboard surface appearance (e.g. brand-bg) from parent frame or overlapping Surface */
  _canvasSurfaceAppearance?: string;
  /** Canvas-only: normalized surface mode from container (default, bold, …) */
  _canvasSurfaceMode?: string;
};

export function ContentBlock({
  _cbEditField,
  _canvasSurfaceAppearance,
  _canvasSurfaceMode,
  ...rawProps
}: ContentBlockProps) {
  const p = mergeContentBlockProps(rawProps as Parameters<typeof mergeContentBlockProps>[0]);

  const canvasW = Number(p.canvasWidth) || DEFAULT_CONTENT_BLOCK_PROPS.canvasWidth;
  const canvasH = Number(p.canvasHeight) || DEFAULT_CONTENT_BLOCK_PROPS.canvasHeight;
  const category = getBannerSizeCategory(canvasW, canvasH);
  const defaultPad = defaultPaddingFSteps(category);

  const paddingTop = resolveFStep(p.paddingTop, defaultPad.top);
  const paddingRight = resolveFStep(p.paddingRight, defaultPad.right);
  const paddingBottom = resolveFStep(p.paddingBottom, defaultPad.bottom);
  const paddingLeft = resolveFStep(p.paddingLeft, defaultPad.left);

  const textGap = resolveFStep(p.textGap, defaultTextGapFStep(category));
  const buttonGap = resolveFStep(p.buttonGap, defaultButtonGapFStep(category));
  const buttonRowGap = resolveFStep(p.buttonRowGap, defaultButtonRowGapFStep(category));

  const resolvedPlatform = resolveContentBlockPlatform(p.platform, canvasW);
  const resolvedDensity = p.density;
  const foundationPlatforms = useContentBlockFoundationPlatforms();

  const dimensionVars = useMemo(() => {
    const stored = p.foundationDimensionOverrides;
    if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
      return stored as Record<string, string>;
    }
    const fpId = p.foundationPlatformId?.trim();
    if (fpId && foundationPlatforms?.length) {
      const entry = foundationPlatforms.find((e) => e.id === fpId && e.isEnabled);
      if (entry) {
        const density = (['compact', 'default', 'open'].includes(resolvedDensity)
          ? resolvedDensity
          : 'default') as DensityId;
        const fromFoundation = computeDimensionOverrides(entry, canvasW, density);
        if (Object.keys(fromFoundation).length > 0) return fromFoundation;
      }
    }
    return dimensionFStepInlineVars(resolvedPlatform, resolvedDensity);
  }, [
    p.foundationDimensionOverrides,
    p.foundationPlatformId,
    foundationPlatforms,
    canvasW,
    resolvedDensity,
    resolvedPlatform,
  ]);

  const headlinePick = useMemo(
    () => resolveHeadlineToken(category, p.headlineToken),
    [category, p.headlineToken],
  );

  const headlineTypo = headlineTypographyVars(headlinePick.role, headlinePick.size);

  const contextTypo = useMemo(
    () => resolveContextTypographyVars(p.contextToken),
    [p.contextToken],
  );

  const bodyTypo = useMemo(
    () => resolveBodyTypographyVars(p.bodyToken),
    [p.bodyToken],
  );

  const textColor = p.textColor?.trim();
  const brandBgText =
    !textColor && _canvasSurfaceAppearance === 'brand-bg'
      ? contentBlockBrandBgTextTokens((_canvasSurfaceMode && _canvasSurfaceMode.trim()) || 'default')
      : null;
  const contextColor = textColor || undefined;
  const headlineColor = textColor || undefined;
  const bodyColor = textColor || undefined;

  const alignClass = p.alignment === 'center' ? styles.alignCenter : styles.alignStart;
  const textAlignClass = p.alignment === 'center' ? styles.textAlignCenter : styles.textAlignStart;

  const hideButtonsForSmallCanvas = category === 'small';
  const showPrimaryCta =
    !hideButtonsForSmallCanvas && p.showButtons && Boolean(p.primaryCtaText?.trim());
  const showSecondaryCta =
    showPrimaryCta && p.showSecondaryButton && Boolean(p.secondaryCtaText?.trim());

  const innerStyle = {
    '--ContentBlock-maxWidthPercent': '100%',
    paddingTop: dimensionVar(paddingTop),
    paddingRight: dimensionVar(paddingRight),
    paddingBottom: dimensionVar(paddingBottom),
    paddingLeft: dimensionVar(paddingLeft),
    ...(contextColor ? { ['--ContentBlock-contextColor' as string]: contextColor } : {}),
    ...(headlineColor ? { ['--ContentBlock-headlineColor' as string]: headlineColor } : {}),
    ...(bodyColor ? { ['--ContentBlock-bodyColor' as string]: bodyColor } : {}),
    ...(brandBgText
      ? {
          ['--ContentBlock-contextColor' as string]: brandBgText.context,
          ['--ContentBlock-headlineColor' as string]: brandBgText.headline,
          ['--ContentBlock-bodyColor' as string]: brandBgText.body,
        }
      : {}),
  } as React.CSSProperties;

  const textStackStyle = { gap: dimensionVar(textGap) } as React.CSSProperties;

  const ctaRowStyle = {
    marginTop: dimensionVar(buttonGap),
    gap: dimensionVar(buttonRowGap),
  } as React.CSSProperties;

  /** Same accent for both CTAs — emphasis differs only (high vs medium / subtle). */
  const appearance = (p.buttonAppearance === 'auto' ? 'primary' : p.buttonAppearance) as ButtonAppearance;

  // React lowercases data-* JSX attributes (data-Breakpoint → data-breakpoint).
  // scale.css selectors are case-sensitive ([data-Breakpoint="..."]), so we must
  // use setAttribute to preserve the mixed-case name that scale.css expects.
  // No dependency array — runs on every render to stay in sync with prop changes.
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.setAttribute('data-Breakpoint', resolvedPlatform);
    el.setAttribute('data-6-Density', resolvedDensity);
  });

  return (
    <div
      ref={rootRef}
      className={clsx(styles.root, alignClass)}
      style={dimensionVars as React.CSSProperties}
    >
      <div className={clsx(styles.inner, textAlignClass)} style={innerStyle}>
        <div className={clsx(styles.textStack, textAlignClass)} style={textStackStyle}>
          {p.showContext && p.contextText?.trim() ? (
            <p
              className={clsx(styles.context, textAlignClass)}
              data-cb-field="contextText"
              style={{
                fontSize: contextTypo.fontSize,
                lineHeight: contextTypo.lineHeight,
                fontWeight: contextTypo.fontWeight,
                visibility: _cbEditField === 'contextText' ? 'hidden' : undefined,
              }}
            >
              {p.contextText}
            </p>
          ) : null}

          {p.headlineText?.trim() ? (
            <p
              className={clsx(styles.headline, textAlignClass)}
              data-cb-field="headlineText"
              style={{
                fontSize: headlineTypo.fontSize,
                lineHeight: headlineTypo.lineHeight,
                fontWeight: headlineTypo.fontWeight,
                visibility: _cbEditField === 'headlineText' ? 'hidden' : undefined,
              }}
            >
              {p.headlineText}
            </p>
          ) : null}

          {p.showBody && p.bodyText?.trim() ? (
            <p
              className={clsx(styles.body, textAlignClass)}
              data-cb-field="bodyText"
              style={{
                fontSize: bodyTypo.fontSize,
                lineHeight: bodyTypo.lineHeight,
                fontWeight: bodyTypo.fontWeight,
                visibility: _cbEditField === 'bodyText' ? 'hidden' : undefined,
              }}
            >
              {p.bodyText}
            </p>
          ) : null}
        </div>

        {showPrimaryCta ? (
          <div className={clsx(styles.ctaRow, textAlignClass)} style={ctaRowStyle}>
            <Button attention="high" size={p.buttonSize} appearance={appearance}>
              {p.primaryCtaText}
            </Button>
            {showSecondaryCta ? (
              <Button attention="medium" size={p.buttonSize} appearance={appearance}>
                {p.secondaryCtaText}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
