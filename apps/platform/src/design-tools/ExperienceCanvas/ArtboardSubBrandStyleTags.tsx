'use client';

import { useMemo } from 'react';
import { applySubBrandAccentsToFoundation } from '@oneui/shared';
import { useBrandCSS } from '@oneui/ui-internal/hooks/useBrandCSS';
import { useStyleInjection } from '@oneui/ui-internal/hooks/useStyleInjection';
import { RIBBON_ALIAS_SOURCES } from '@/design-tools/JioRibbon';
import type { ArtboardSubBrandOption } from './FrameThemeContext';

function scopeBrandCssToSubBrand(css: string, subBrandId: string): string {
  const escaped =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(subBrandId)
      : subBrandId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return css.replace(/\[data-brand-scope\]/g, `[data-oneui-subbrand="${escaped}"]`);
}

/**
 * Global `@layer brand { :root { --Primary-*: … } }` still participates in the
 * custom-property cascade for descendants. Without `!important`, inherited
 * :root values can win over the same token set on `[data-oneui-subbrand]`,
 * which showed up as typography updating but surfaces/buttons staying on the
 * base brand. Boost only allowlisted brand token families.
 */
const SUB_BRAND_IMPORTANT_TOKEN =
  /^(\s*)(--(?:Primary|Secondary|Neutral|Sparkle|Brand-Bg|Positive|Negative|Warning|Informative|Text|Surface|Border|Display|Headline|Title|Body|Label|Code|Typography)-[^:]+:\s*)(.+?)(\s*);(\s*)$/;

function boostScopedBrandTokensImportant(css: string): string {
  return css
    .split('\n')
    .map((line) => {
      if (!line.includes('--') || line.includes('!important')) return line;
      const m = line.match(SUB_BRAND_IMPORTANT_TOKEN);
      if (!m) return line;
      const [, indent, prop, val, spBeforeSemi, semiTrail] = m;
      const v = val.trim();
      if (!v || v.startsWith('/*')) return line;
      return `${indent}${prop}${v} !important${spBeforeSemi};${semiTrail ?? ''}`;
    })
    .join('\n');
}

function injectRibbonAliases(css: string): string {
  const aliases: string[] = [];
  for (const { alias, pattern } of RIBBON_ALIAS_SOURCES) {
    const m = css.match(pattern);
    if (m) {
      aliases.push(`    ${alias}: ${m[1].trim()} !important;`);
    }
  }
  if (aliases.length === 0) return css;

  const firstClose = css.indexOf('}');
  if (firstClose === -1) return css;

  return (
    css.slice(0, firstClose) +
    '\n' + aliases.join('\n') + '\n  ' +
    css.slice(firstClose)
  );
}

function SubBrandStyleChunk({
  subBrandId,
  subBrandConfig,
  baseFoundationData,
  theme,
}: {
  subBrandId: string;
  subBrandConfig: ArtboardSubBrandOption;
  baseFoundationData: Record<string, unknown>;
  theme: 'light' | 'dark';
}) {
  const merged = useMemo(
    () =>
      applySubBrandAccentsToFoundation(baseFoundationData, {
        primary: subBrandConfig.primary,
        secondary: subBrandConfig.secondary,
        sparkle: subBrandConfig.sparkle,
        brandBg: subBrandConfig.brandBg,
      }),
    [baseFoundationData, subBrandConfig],
  );

  const { cssContent } = useBrandCSS({
    foundationData: merged,
    theme,
    injectionMode: 'scoped',
  });

  const styleIdSafe = subBrandId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const scopedCss = useMemo(() => {
    if (cssContent === null || !cssContent) return '';
    const scoped = scopeBrandCssToSubBrand(cssContent, subBrandId);
    const boosted = boostScopedBrandTokensImportant(scoped);
    return injectRibbonAliases(boosted);
  }, [cssContent, subBrandId]);

  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (cssContent === null) {
      console.debug(`[SubBrandStyleChunk] ${subBrandId}: CSS loading…`);
    } else if (!cssContent) {
      console.warn(`[SubBrandStyleChunk] ${subBrandId}: useBrandCSS returned empty — check scale names exist in parent brand`);
    } else if (!scopedCss) {
      console.warn(`[SubBrandStyleChunk] ${subBrandId}: scoped CSS is empty after transforms`);
    }
  }

  useStyleInjection(`oneui-artboard-subbrand-${styleIdSafe}`, scopedCss);
  return null;
}

/**
 * Injects one scoped brand CSS block per distinct sub-brand id used on frames.
 */
export function ArtboardSubBrandStyleTags({
  activeSubBrandIds,
  availableSubBrands,
  baseFoundationData,
  theme,
}: {
  activeSubBrandIds: readonly string[];
  availableSubBrands: readonly ArtboardSubBrandOption[];
  baseFoundationData: Record<string, unknown> | undefined | null;
  theme: 'light' | 'dark';
}) {
  const chunks = useMemo(() => {
    const unique = [...new Set(activeSubBrandIds.filter((id) => id.length > 0))];
    const list: { id: string; config: ArtboardSubBrandOption }[] = [];
    for (const id of unique) {
      const config = availableSubBrands.find((s) => s.id === id);
      if (config) list.push({ id, config });
    }
    return list;
  }, [activeSubBrandIds, availableSubBrands]);

  if (!baseFoundationData || chunks.length === 0) return null;

  return (
    <>
      {chunks.map(({ id, config }) => (
        <SubBrandStyleChunk
          key={id}
          subBrandId={id}
          subBrandConfig={config}
          baseFoundationData={baseFoundationData}
          theme={theme}
        />
      ))}
    </>
  );
}
