/**
 * PlatformSelector.tsx
 *
 * Dropdown component for selecting platforms (mobile, tablet, desktop, tv)
 * Shows current platform with a dropdown to switch between available platforms
 * Displays platform properties from typography/dimension configs
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Monitor, Tablet, Smartphone, Tv } from '../icons';
import styles from './PlatformSelector.module.css';

export interface PlatformOption {
  id: string;
  label: string;
  description: string;
  viewingDistance?: number;
  ppi?: number;
  pixelDensity?: number;
  baseSize?: number;
  scaleFactor?: number;
  hasTypography?: boolean;
  hasDimensions?: boolean;
}

export interface PlatformSelectorProps {
  currentPlatform: string;
  availablePlatforms: PlatformOption[];
  onPlatformChange: (platformId: string) => void;
}

const platformIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
  tv: Tv,
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  currentPlatform,
  availablePlatforms,
  onPlatformChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current platform data
  const currentPlatformData = availablePlatforms.find((p) => p.id === currentPlatform);
  const PlatformIcon = platformIcons[currentPlatform] || Monitor;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (platformId: string) => {
    onPlatformChange(platformId);
    setIsOpen(false);
  };

  // Format viewing distance for display
  const formatViewingDistance = (distance?: number) => {
    if (!distance) return null;
    return `${distance}cm`;
  };

  // Format pixel density for display
  const formatPixelDensity = (density?: number) => {
    if (!density) return null;
    return `@${density}x`;
  };

  return (
    <div className={styles.container} ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        className={styles.trigger}
        onClick={handleToggle}
        aria-label="Select platform"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <PlatformIcon size={14} className={styles.platformIcon} />
        <span className={styles.platformName}>
          {currentPlatformData?.label || currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)}
        </span>
        <ChevronDown className={styles.chevron} size={14} data-open={isOpen} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label="Available platforms">
          <div className={styles.platformList}>
            {availablePlatforms.map((platform) => {
              const Icon = platformIcons[platform.id] || Monitor;
              const isSelected = platform.id === currentPlatform;

              return (
                <button
                  key={platform.id}
                  className={styles.platformOption}
                  data-selected={isSelected}
                  onClick={() => handleSelect(platform.id)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon size={16} className={styles.optionIcon} />
                  <div className={styles.optionContent}>
                    <span className={styles.optionName}>{platform.label}</span>
                    <span className={styles.optionDescription}>{platform.description}</span>
                    {(platform.viewingDistance || platform.ppi || platform.pixelDensity) && (
                      <div className={styles.optionMeta}>
                        {platform.viewingDistance && (
                          <span className={styles.metaItem}>
                            {formatViewingDistance(platform.viewingDistance)}
                          </span>
                        )}
                        {platform.ppi && (
                          <span className={styles.metaItem}>
                            {platform.ppi} PPI
                          </span>
                        )}
                        {platform.pixelDensity && (
                          <span className={styles.metaItem}>
                            {formatPixelDensity(platform.pixelDensity)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check size={14} className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
