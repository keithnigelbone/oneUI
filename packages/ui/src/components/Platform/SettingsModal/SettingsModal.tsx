/**
 * SettingsModal.tsx
 *
 * Platform settings modal for configuring active brand sub-theme and density.
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { X } from '../icons';
import { Button } from '../../Button/Button';
import { IconButton } from '../../IconButton/IconButton';
import { BrandPicker } from '../BrandPicker/BrandPicker';
import styles from './SettingsModal.module.css';
import {
  SettingsModalProps,
  DENSITY_OPTIONS,
  useSettingsModalState,
  DensityMode,
} from './SettingsModal.shared';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  subTheme,
  density,
  onDensityChange,
  defaults,
  platformAccess,
}) => {
  const { ariaProps } = useSettingsModalState();

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubThemeClick = useCallback(
    (subThemeId: string | null) => {
      subTheme?.onChange(subThemeId);
    },
    [subTheme]
  );

  const handleDensityClick = useCallback(
    (mode: DensityMode) => {
      onDensityChange(mode);
    },
    [onDensityChange]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        data-mode={theme}
        {...ariaProps}
      >
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h2 id="settings-modal-title" className={styles.title}>
              Settings
            </h2>
            <IconButton
              attention="low"
              size="small"
              icon={<X size={20} />}
              onPress={onClose}
              aria-label="Close settings"
            />
          </div>

          {/* Brand Defaults Section */}
          {defaults && (
            <>
              <hr className={styles.sectionDivider} />
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Brand Default</h3>
                  <p className={styles.sectionDescription}>
                    Select which brand loads when you start a new session
                  </p>
                </div>

                <div className={styles.defaultsRow}>
                  <BrandPicker
                    brands={defaults.brands}
                    subBrandConfigs={defaults.subBrandConfigs}
                    currentBrandId={defaults.defaultBrandId}
                    currentSubBrandId={defaults.defaultSubBrandId}
                    onChange={defaults.onChange}
                    side="bottom"
                    triggerId="oneui-settings-default-brand-picker-trigger"
                    trigger={
                      <span className={styles.defaultsTrigger}>
                        {defaults.defaultBrandName ?? 'Select default brand'}
                        {defaults.defaultSubBrandName ? ` · ${defaults.defaultSubBrandName}` : ''}
                      </span>
                    }
                  />
                  {defaults.defaultBrandName && (
                    <Button
                      attention="low"
                      size="small"
                      onPress={defaults.onClear}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Brand Theme Section */}
          {subTheme && (
            <>
              <hr className={styles.sectionDivider} />
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Brand Theme</h3>
                  <p className={styles.sectionDescription}>
                    {subTheme.brandName
                      ? `${subTheme.brandName} defines the platform theme`
                      : 'The active brand defines the platform theme'}
                  </p>
                </div>

                <div className={styles.options}>
                  {subTheme.options.map((option) => (
                    <button
                      key={option.id ?? 'base'}
                      type="button"
                      className={styles.option}
                      data-selected={subTheme.currentSubThemeId === option.id}
                      onClick={() => handleSubThemeClick(option.id)}
                      aria-pressed={subTheme.currentSubThemeId === option.id}
                    >
                      <div className={styles.optionRadio}>
                        <div className={styles.optionRadioInner} />
                      </div>
                      <div className={styles.optionContent}>
                        <span className={styles.optionLabel}>{option.label}</span>
                        {option.description && (
                          <span className={styles.optionDescription}>
                            {option.description}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Density Section */}
          <hr className={styles.sectionDivider} />
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Density</h3>
              <p className={styles.sectionDescription}>
                Adjust spacing, typography, and component sizing globally
              </p>
            </div>

            <div className={styles.densityOptions}>
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.densityOption}
                  data-selected={density === option.id}
                  onClick={() => handleDensityClick(option.id)}
                  aria-pressed={density === option.id}
                >
                  <div className={styles.densityIcon}>
                    {option.id === 'compact' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="3" y1="5.5" x2="17" y2="5.5" />
                        <line x1="3" y1="10" x2="17" y2="10" />
                        <line x1="3" y1="14.5" x2="17" y2="14.5" />
                      </svg>
                    )}
                    {option.id === 'default' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="3" y1="4" x2="17" y2="4" />
                        <line x1="3" y1="10" x2="17" y2="10" />
                        <line x1="3" y1="16" x2="17" y2="16" />
                      </svg>
                    )}
                    {option.id === 'open' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="3" y1="3" x2="17" y2="3" />
                        <line x1="3" y1="10" x2="17" y2="10" />
                        <line x1="3" y1="17" x2="17" y2="17" />
                      </svg>
                    )}
                  </div>
                  <span className={styles.densityLabel}>{option.label}</span>
                  <span className={styles.densityDescription}>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Access Section (owner-only) */}
          {platformAccess && (
            <>
              <hr className={styles.sectionDivider} />
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Platform access</h3>
                  <p className={styles.sectionDescription}>
                    {platformAccess.description ??
                      'Manage who can create brands and who is an owner across the whole platform.'}
                  </p>
                </div>

                <div className={styles.defaultsRow}>
                  <Button attention="medium" size="small" onPress={platformAccess.onManage}>
                    Manage platform users
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <Button attention="high" size="medium" onPress={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export * from './SettingsModal.shared';
