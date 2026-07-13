'use client';

/**
 * Platform-shell wrapper around `<CreateBrandDialog>`. Owns the local
 * "creating / error" state + form-submission flow + post-create brand
 * selection. Used by `(platform)/layout.tsx`.
 *
 * NOTE: The `OverviewContent` page has its own `handleCreateBrand` with a
 * slightly different success path (it looks the new brand up in
 * `allBrands` and constructs the Brand shape from raw Convex documents),
 * so it does not reuse this component directly. It DOES reuse
 * `submitCreateBrand` from `./lib/submitCreateBrand` for the mutation
 * call shape — that is the dedupe target the audit flagged.
 */

import React, { useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { CreateBrandDialog, type BrandFormData } from '@/design-tools/Brand/CreateBrand';
import type { Brand } from '@oneui/shared';
import { submitCreateBrand } from './lib/submitCreateBrand';

interface PlatformBrandCreateDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Brands available for the dialog's "base brand" picker, AND consulted
   * after a successful create to look up + select the new brand. The
   * shell re-runs this query on every render via Convex live data, so
   * the post-create lookup typically resolves on the next tick.
   */
  availableBrands: Brand[];
  setBrand: (brand: Brand) => void;
}

interface PlatformBrandCreateDialogControls {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

/**
 * Hook + component split: the parent shell owns when the dialog is
 * mounted (so it can mount unmount cleanly), the component owns the
 * in-flight submit + error state.
 */
export function usePlatformBrandCreateDialog(): PlatformBrandCreateDialogControls {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  return { open, openDialog, closeDialog };
}

export function PlatformBrandCreateDialog({
  open,
  onClose,
  availableBrands,
  setBrand,
}: PlatformBrandCreateDialogProps): React.ReactElement | null {
  const createBrand = useMutation(api.brands.create);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (formData: BrandFormData) => {
      setIsCreating(true);
      setCreateError(null);
      try {
        const newBrandId = await submitCreateBrand(createBrand, formData);
        // Wait a tick for the brands query to update, then look up + select
        // the new brand. Matches the original layout.tsx behaviour.
        setTimeout(() => {
          const newBrand = availableBrands.find((b) => b.id === newBrandId);
          if (newBrand) {
            setBrand(newBrand);
          }
          onClose();
          setIsCreating(false);
        }, 100);
      } catch (error) {
        console.error('Failed to create brand:', error);
        setCreateError(error instanceof Error ? error.message : 'Failed to create brand');
        setIsCreating(false);
      }
    },
    [createBrand, availableBrands, setBrand, onClose],
  );

  if (!open) return null;

  return (
    <CreateBrandDialog
      onCancel={onClose}
      onSubmit={handleSubmit}
      availableBrands={availableBrands}
      loading={isCreating}
      error={createError}
    />
  );
}
