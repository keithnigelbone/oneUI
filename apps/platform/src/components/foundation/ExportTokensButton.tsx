/**
 * ExportTokensButton.tsx
 *
 * One-click "Download JSON" for a brand's resolved foundation tokens.
 *
 * Usage:
 *   <ExportTokensButton />                           // brand-wide export
 *   <ExportTokensButton foundation="color" />        // single foundation slice
 *
 * The button reads the editing brand's foundation data via `useFoundationData`
 * (already populated by `FoundationStyleProvider`) and runs the same engine
 * pipeline that `useBrandCSS` uses, but emits JSON instead of CSS.
 */
'use client';

import { useCallback } from 'react';
import {
  extractResolvedTokens,
  sliceExportByFoundation,
  type FoundationBucket,
} from '@oneui/shared/engine';
import {
  Button,
  type ButtonAppearance,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/icons/Icon';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { downloadJSON } from '@/utils/downloadJSON';

interface ExportTokensButtonProps {
  /**
   * When set, the export is sliced to a single foundation. Omit for the
   * brand-wide "all foundations" download.
   */
  foundation?: FoundationBucket;
  /** Optional label override. Defaults reflect the export scope. */
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  condensed?: ButtonProps['condensed'];
  start?: ButtonProps['start'];
}

function defaultLabel(foundation?: FoundationBucket): string {
  if (!foundation) return 'Export all tokens';
  return 'Export resolved tokens';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
}

export function ExportTokensButton({
  foundation,
  label,
  size = 'small',
  variant = 'ghost',
  appearance = 'primary',
  condensed = true,
  start = <Icon name="download" size="sm" />,
}: ExportTokensButtonProps) {
  const foundationData = useFoundationData();
  const { currentBrand } = usePlatformContext();

  const handleClick = useCallback(() => {
    if (!foundationData || !currentBrand) return;
    const payload = extractResolvedTokens(foundationData, {
      brandId: currentBrand.id,
      brandName: currentBrand.name,
    });
    const sliced = foundation ? sliceExportByFoundation(payload, foundation) : payload;
    const slug = slugify(currentBrand.name);
    const suffix = foundation ?? 'all-foundations';
    downloadJSON(sliced, `${slug}-${suffix}.json`);
  }, [foundationData, currentBrand, foundation]);

  const isDisabled = !foundationData || !currentBrand;

  return (
    <Button
      attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[variant]}
      appearance={appearance}
      size={size}
      condensed={condensed}
      start={start}
      onPress={handleClick}
      disabled={isDisabled}
    >
      {label ?? defaultLabel(foundation)}
    </Button>
  );
}
