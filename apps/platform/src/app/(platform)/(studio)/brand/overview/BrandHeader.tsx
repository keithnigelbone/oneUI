/**
 * brand/overview/BrandHeader.tsx
 *
 * Brand identity card at the top of the Brand Overview page: logo upload,
 * brand name + meta, and the kebab-menu of brand actions (rename, duplicate,
 * change logo, reset overrides, delete).
 *
 * Owns the dialog open/close state and the rename/delete/reset/duplicate/
 * upload handlers + mutations, so the parent page never re-renders just
 * because a dialog opened. Wrapped in React.memo so when the parent re-
 * renders for unrelated reasons (token data ticks, theme toggle), the
 * header bails out as long as its props are stable.
 */

'use client';

import React, { useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Clock, Copy, Download, Edit2, MoreVertical, RefreshCw, RotateCcw, Trash2, Upload } from 'lucide-react';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Menu } from '@oneui/ui/components/Menu';
import type { Brand, BrandStatus } from '@oneui/shared';
import { extractResolvedTokens } from '@oneui/shared/engine';
import { ConfirmDialog, RenameDialog } from './dialogs';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { downloadJSON } from '@/utils/downloadJSON';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import styles from './page.module.css';

// Subset of the Convex `api.brands.list` doc shape that the duplicate flow
// reads. Keep field types aligned with the schema (Hue/Chroma are required).
interface BrandSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
  status: BrandStatus;
  createdAt: number;
  updatedAt: number;
}

interface BrandHeaderProps {
  currentBrand: Brand;
  brandId: Id<'brands'>;
  logoSvgForRender: string | null;
  hasLogoColorOverride: boolean;
  logoColorHex: string | null;
  allBrands: BrandSummary[] | undefined;
  setBrand: (brand: Brand | null) => void;
}

export const BrandHeader = React.memo(function BrandHeader({
  currentBrand,
  brandId,
  logoSvgForRender,
  hasLogoColorOverride,
  logoColorHex,
  allBrands,
  setBrand,
}: BrandHeaderProps) {
  const { handleNavigate } = usePlatformNavigation();

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const foundationData = useFoundationData();

  const handleDownloadAllTokens = () => {
    if (!foundationData) return;
    const payload = extractResolvedTokens(foundationData, {
      brandId: currentBrand.id,
      brandName: currentBrand.name,
    });
    const slug = currentBrand.slug || currentBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadJSON(payload, `${slug}-all-foundations.json`);
  };

  const createBrand = useMutation(api.brands.create);
  const updateBrand = useMutation(api.brands.update);
  const deleteBrand = useMutation(api.brands.remove);
  const resetBrand = useMutation(api.brands.resetBrandOverrides);

  const handleRenameBrand = async () => {
    if (!brandId || !newBrandName.trim()) return;
    setIsRenaming(true);
    try {
      await updateBrand({ id: brandId, name: newBrandName.trim() });
      setBrand({ ...currentBrand, id: brandId, name: newBrandName.trim() } as Brand);
      setShowRenameDialog(false);
      setNewBrandName('');
    } catch (err) {
      console.error('Failed to rename brand:', err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandId) return;
    setIsDeleting(true);
    try {
      await deleteBrand({ id: brandId });
      setBrand(null);
      handleNavigate('/brand/overview');
    } catch (err) {
      console.error('Failed to delete brand:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResetBrand = async () => {
    if (!brandId) return;
    setIsResetting(true);
    try {
      await resetBrand({ id: brandId });
    } catch (err) {
      console.error('Failed to reset brand:', err);
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleDuplicateBrand = async () => {
    if (!currentBrand) return;
    setIsDuplicating(true);
    try {
      const newBrandId = await createBrand({
        name: `${currentBrand.name} (Copy)`,
        slug: `${currentBrand.slug}-copy-${Date.now()}`,
        description: currentBrand.description || undefined,
        primaryHue: currentBrand.primaryHue,
        primaryChroma: currentBrand.primaryChroma,
        secondaryHue: currentBrand.secondaryHue,
        secondaryChroma: currentBrand.secondaryChroma,
        baseBrand: brandId,
        status: 'draft',
      });
      if (allBrands) {
        const newBrand = allBrands.find((b) => b._id === newBrandId);
        if (newBrand) {
          setBrand({
            id: newBrand._id,
            name: newBrand.name,
            slug: newBrand.slug,
            description: newBrand.description,
            primaryHue: newBrand.primaryHue,
            primaryChroma: newBrand.primaryChroma,
            secondaryHue: newBrand.secondaryHue,
            secondaryChroma: newBrand.secondaryChroma,
            status: newBrand.status,
            createdAt: new Date(newBrand.createdAt),
            updatedAt: new Date(newBrand.updatedAt),
          });
        }
      }
    } catch (err) {
      console.error('Failed to duplicate brand:', err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file || !brandId || !currentBrand) {
      input.value = '';
      return;
    }

    // Some OSes report empty/generic MIME for .svg, so accept by extension too.
    const isSvg =
      file.type === 'image/svg+xml' ||
      file.type === 'text/xml' ||
      file.name.toLowerCase().endsWith('.svg');
    if (!isSvg) {
      alert('Please upload an SVG file');
      input.value = '';
      return;
    }

    setIsUploadingLogo(true);
    try {
      const svgContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      await updateBrand({ id: brandId, logoSvg: svgContent });
      setBrand({ ...currentBrand, logoSvg: svgContent });
    } catch (err) {
      console.error('Failed to upload logo:', err);
    } finally {
      setIsUploadingLogo(false);
      input.value = '';
    }
  };

  return (
    <>
      <div className={styles.brandHeaderWrapper}>
        <div className={styles.brandLogo}>
          {logoSvgForRender ? (
            <div
              className={styles.logoImage}
              dangerouslySetInnerHTML={{ __html: logoSvgForRender }}
              data-logo-override={hasLogoColorOverride || undefined}
              style={{
                pointerEvents: 'none',
                ...(logoColorHex
                  ? ({ '--Logo-color': logoColorHex } as React.CSSProperties)
                  : {}),
              }}
            />
          ) : (
            <div className={styles.logoAddPrompt}>
              <Upload size={24} aria-hidden />
              <span className={styles.logoAddLabel}>
                {isUploadingLogo ? 'Uploading…' : 'Add Logo'}
              </span>
            </div>
          )}
          <input
            ref={logoInputRef}
            id="brand-logo-upload"
            type="file"
            accept=".svg,image/svg+xml,image/*"
            onChange={handleLogoUpload}
            disabled={isUploadingLogo}
            aria-label="Upload brand logo (SVG)"
            title="Upload brand logo (SVG)"
            className={styles.logoFileInput}
          />
        </div>

        <div className={styles.brandInfo}>
          <div className={styles.brandNameRow}>
            <h1 className={styles.brandName}>{currentBrand.name}</h1>
          </div>
          <p className={styles.brandDescription}>
            {currentBrand.description || `Design tokens and components for ${currentBrand.name}`}
          </p>
          <div className={styles.brandMeta}>
            <span className={styles.brandMetaItem}>
              <Clock size={14} />
              Created: {currentBrand.createdAt
                ? new Date(currentBrand.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </span>
            <span className={styles.brandMetaDivider} />
            <span className={styles.brandMetaItem}>
              <RefreshCw size={14} />
              Last Sync: {currentBrand.updatedAt
                ? new Date(currentBrand.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </span>
          </div>
        </div>

        <Menu>
          <Menu.Trigger
            render={
              <IconButton
                attention="low"
                appearance="neutral"
                icon={<MoreVertical size={16} />}
                aria-label="Brand actions"
              />
            }
          />
          <Menu.Portal>
            <Menu.Item
              onClick={() => {
                setNewBrandName(currentBrand.name);
                setShowRenameDialog(true);
              }}
            >
              <Edit2 size={16} />
              <span>Rename</span>
            </Menu.Item>
            <Menu.Item onClick={handleDuplicateBrand} disabled={isDuplicating}>
              <Copy size={16} />
              <span>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
            </Menu.Item>
            {currentBrand.logoSvg && (
              <Menu.Item onClick={() => logoInputRef.current?.click()}>
                <Upload size={16} />
                <span>Change Logo</span>
              </Menu.Item>
            )}
            <Menu.Separator />
            <Menu.Item onClick={handleDownloadAllTokens} disabled={!foundationData}>
              <Download size={16} />
              <span>Download tokens (JSON)</span>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item onClick={() => setShowResetConfirm(true)}>
              <RotateCcw size={16} />
              <span>Reset overrides</span>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item
              className={styles.dangerItem}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={currentBrand.isSystem}
            >
              <Trash2 size={16} />
              <span
                title={
                  currentBrand.isSystem
                    ? 'System brand — cannot be deleted'
                    : undefined
                }
              >
                Delete
              </span>
            </Menu.Item>
          </Menu.Portal>
        </Menu>
      </div>

      <RenameDialog
        open={showRenameDialog}
        value={newBrandName}
        loading={isRenaming}
        onChange={setNewBrandName}
        onCancel={() => {
          setShowRenameDialog(false);
          setNewBrandName('');
        }}
        onSubmit={handleRenameBrand}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset overrides"
        message={
          <>
            This will remove all component token overrides for <strong>{currentBrand.name}</strong>,
            reverting to the inherited defaults. Foundation settings (color, typography, surfaces) are not affected.
          </>
        }
        confirmLabel="Reset overrides"
        loading={isResetting}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetBrand}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Brand"
        message={
          <>
            Are you sure you want to delete <strong>{currentBrand.name}</strong>?
            This action cannot be undone and will remove all associated tokens.
          </>
        }
        confirmLabel="Delete"
        loading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteBrand}
      />
    </>
  );
});
