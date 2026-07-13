'use client';

/**
 * IconSetCard Component
 *
 * A selectable card that displays an icon set with preview icons,
 * metadata, and selection state.
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import styles from './IconSetCard.module.css';
import type { IconSetCardProps } from './IconSetCard.shared';
import type { IconComponent } from '@oneui/shared';
import { Icon } from '@oneui/ui/icons/Icon';
import { getJioIconLoader, getIconSetLoader } from '@oneui/ui/icons/IconContext';
import { Badge } from '@oneui/ui/components/Badge';
import { Surface } from '@oneui/ui/components/Surface';
import initJioIcons from '@/lib/initJioIcons';

/**
 * Load preview icons for a specific icon set
 */
async function loadPreviewIcons(
  setId: string,
  iconNames: string[]
): Promise<Record<string, IconComponent>> {
  const icons: Record<string, IconComponent> = {};

  try {
    let module: Record<string, IconComponent>;

    switch (setId) {
      case 'lucide':
        module = (await import('lucide-react')) as unknown as Record<string, IconComponent>;
        break;
      case 'tabler':
        module = (await import('@tabler/icons-react')) as unknown as Record<string, IconComponent>;
        break;
      case 'hugeicons':
        module = (await import('hugeicons-react')) as unknown as Record<string, IconComponent>;
        break;
      case 'phosphor':
        module = (await import('@phosphor-icons/react')) as unknown as Record<
          string,
          IconComponent
        >;
        break;
      case 'remix':
        module = (await import('@remixicon/react')) as unknown as Record<string, IconComponent>;
        break;
      case 'material':
        module = (await import('@nine-thirty-five/material-symbols-react/outlined')) as unknown as Record<
          string,
          IconComponent
        >;
        break;
      default:
        return icons;
    }

    for (const name of iconNames) {
      if (module[name]) {
        icons[name] = module[name];
      }
    }
  } catch (err) {
    console.error(`Failed to load preview icons for ${setId}:`, err);
  }

  return icons;
}

export const IconSetCard = memo(function IconSetCard({
  iconSet,
  isSelected,
  onSelect,
  disabled = false,
}: IconSetCardProps) {
  const [previewIcons, setPreviewIcons] = useState<Record<string, IconComponent>>({});

  // Load preview icons on mount
  useEffect(() => {
    let mounted = true;

    async function loadIcons() {
      if (iconSet.id === 'jio' || iconSet.id === 'tira') {
        if (iconSet.id === 'jio') {
          initJioIcons();
        }
        const loader = iconSet.id === 'jio' ? getJioIconLoader() : getIconSetLoader('tira');
        if (loader) {
          const loadedIcons: Record<string, IconComponent> = {};
          for (const iconName of iconSet.previewIcons) {
            const component = await loader(iconName);
            if (component && mounted) {
              loadedIcons[iconName] = component;
            }
          }
          if (mounted) {
            setPreviewIcons(loadedIcons);
          }
        }
      } else {
        const icons = await loadPreviewIcons(iconSet.id, iconSet.previewIcons);
        if (mounted) {
          setPreviewIcons(icons);
        }
      }
    }

    loadIcons();

    return () => {
      mounted = false;
    };
  }, [iconSet.id, iconSet.previewIcons]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(iconSet.id);
    }
  }, [disabled, onSelect, iconSet.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        onSelect(iconSet.id);
      }
    },
    [disabled, onSelect, iconSet.id]
  );

  const cardClassName = [
    styles.card,
    isSelected && styles.cardSelected,
    disabled && styles.cardDisabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      as="div"
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h4 className={styles.name}>{iconSet.name}</h4>
          <p className={styles.count}>{iconSet.totalIcons.toLocaleString()} icons</p>
        </div>
        <div className={styles.statusSlot}>
          {isSelected ? (
            <Badge
              size="s"
              attention="high"
              appearance="primary"
              start={<Icon name="check" size="sm" aria-hidden />}
            >
              Selected
            </Badge>
          ) : (
            <Badge size="s" attention="low" appearance="neutral">
              {iconSet.style}
            </Badge>
          )}
        </div>
      </div>

      <p className={styles.description}>{iconSet.description}</p>

      <div className={styles.previewGrid}>
        {iconSet.previewIcons.slice(0, 6).map((iconName) => {
          const IconComponent = previewIcons[iconName];
          return (
            <div key={iconName} className={styles.previewIcon}>
              {IconComponent ? (
                <IconComponent
                  className={styles.previewSvg}
                  strokeWidth={iconSet.defaultStrokeWidth}
                  aria-hidden
                />
              ) : (
                <span className={styles.previewPlaceholder} />
              )}
            </div>
          );
        })}
      </div>
    </Surface>
  );
});

IconSetCard.displayName = 'IconSetCard';

export default IconSetCard;
