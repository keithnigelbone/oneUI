/**
 * CreateBrandDialog.tsx
 *
 * Dialog for creating a new brand
 * Features:
 * - Name, slug, and description fields
 * - Base brand/preset selection for token inheritance
 * - Simple flow - color configuration happens in Foundations after creation
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Plus, Palette, Copy } from 'lucide-react';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';
import styles from './CreateBrandDialog.module.css';
import {
  CreateBrandDialogProps,
  BrandFormData,
  DEFAULT_FORM_DATA,
  generateSlug,
  useCreateBrandDialogState,
} from './CreateBrandDialog.shared';

export const CreateBrandDialog: React.FC<CreateBrandDialogProps> = ({
  availableBrands = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const { ariaProps } = useCreateBrandDialogState();
  const [formData, setFormData] = useState<BrandFormData>(DEFAULT_FORM_DATA);
  const [autoSlug, setAutoSlug] = useState(true);
  const [creationMode, setCreationMode] = useState<'preset' | 'scratch'>('preset');

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, autoSlug]);

  // When base brand changes in preset mode, copy its color settings
  useEffect(() => {
    if (creationMode === 'preset' && formData.baseBrand) {
      const baseBrand = availableBrands.find(b => b.id === formData.baseBrand);
      if (baseBrand && 'primaryHue' in baseBrand) {
        setFormData(prev => ({
          ...prev,
          primaryHue: (baseBrand as any).primaryHue ?? prev.primaryHue,
          primaryChroma: (baseBrand as any).primaryChroma ?? prev.primaryChroma,
          secondaryHue: (baseBrand as any).secondaryHue ?? prev.secondaryHue,
          secondaryChroma: (baseBrand as any).secondaryChroma ?? prev.secondaryChroma,
        }));
      }
    }
  }, [formData.baseBrand, creationMode, availableBrands]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit?.(formData);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const isValid = formData.name.trim().length > 0 && formData.slug.trim().length > 0;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        {...ariaProps}
      >
        <form onSubmit={handleSubmit} className={styles.container}>
          <div className={styles.header}>
            <h2 id="create-brand-title" className={styles.title}>
              Create New Brand
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {/* Basic Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>

            <div className={styles.field}>
              <label htmlFor="brand-name" className={styles.label}>
                Brand Name <span className={styles.required}>*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., JioFinance"
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="brand-slug" className={styles.label}>
                Slug <span className={styles.required}>*</span>
              </label>
              <input
                id="brand-slug"
                type="text"
                className={styles.input}
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="jiofinance"
                required
              />
              <span className={styles.hint}>URL-friendly identifier (cannot be changed later)</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="brand-description" className={styles.label}>
                Description
              </label>
              <textarea
                id="brand-description"
                className={styles.textarea}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of the brand..."
              />
            </div>
          </div>

          {/* Token Configuration */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Token Configuration</h3>
            <p className={styles.sectionDescription}>
              Choose how to set up the design tokens for this brand
            </p>

            <div className={styles.modeOptions}>
              <button
                type="button"
                className={styles.modeOption}
                data-selected={creationMode === 'preset'}
                onClick={() => setCreationMode('preset')}
              >
                <div className={styles.modeIcon}>
                  <Copy size={20} />
                </div>
                <div className={styles.modeContent}>
                  <span className={styles.modeLabel}>Start from existing brand</span>
                  <span className={styles.modeDescription}>
                    Inherit all tokens from an existing brand and customize later
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={styles.modeOption}
                data-selected={creationMode === 'scratch'}
                onClick={() => {
                  setCreationMode('scratch');
                  setFormData(prev => ({ ...prev, baseBrand: undefined }));
                }}
              >
                <div className={styles.modeIcon}>
                  <Palette size={20} />
                </div>
                <div className={styles.modeContent}>
                  <span className={styles.modeLabel}>Start from scratch</span>
                  <span className={styles.modeDescription}>
                    Create with default tokens, configure foundations after creation
                  </span>
                </div>
              </button>
            </div>

            {creationMode === 'preset' && (
              <div className={styles.field}>
                <label htmlFor="base-brand" className={styles.label}>
                  Base Brand <span className={styles.required}>*</span>
                </label>
                <Select
                  value={formData.baseBrand || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      baseBrand: value || undefined,
                    }))
                  }
                  options={[
                    { value: '', label: 'Select a brand to inherit from...' },
                    ...availableBrands.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })),
                  ]}
                  aria-label="Base brand"
                />
                <span className={styles.hint}>
                  All tokens from the selected brand will be copied to the new brand
                </span>
              </div>
            )}

            {creationMode === 'scratch' && (
              <div className={styles.infoBox}>
                <p>
                  The brand will be created with default Jio tokens. After creation,
                  go to <strong>Foundations</strong> to configure colors, typography,
                  spacing, and other design tokens.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              data-variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.button}
              data-variant="primary"
              disabled={loading || !isValid || (creationMode === 'preset' && !formData.baseBrand)}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spinIcon} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create Brand
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export * from './CreateBrandDialog.shared';
