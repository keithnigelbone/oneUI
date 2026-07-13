/**
 * FoundationCard.tsx
 * Collapsible card wrapper for foundation sections
 *
 * Performance optimizations:
 * - React.memo to prevent unnecessary re-renders
 * - Lazy loading for collapsed content (only renders when expanded)
 */

import { useState, useCallback, memo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { IconButton } from '@oneui/ui/components/IconButton';
import styles from './FoundationCard.module.css';
import { FoundationCardProps } from './FoundationCard.shared';

const FoundationCardInner: React.FC<FoundationCardProps> = ({
  title,
  description,
  children,
  actions,
  className,
  headerClassName: headerClassNameProp,
  contentClassName: contentClassNameProp,
  collapsible = false,
  toggleTrigger = 'header',
  defaultCollapsed = false,
  icon,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  // Track if content has ever been expanded (for lazy loading optimization)
  const hasBeenExpandedRef = useRef(!defaultCollapsed);
  const isHeaderTrigger = collapsible && toggleTrigger === 'header';

  const handleToggle = useCallback(() => {
    if (collapsible) {
      setIsCollapsed((prev) => {
        const newIsCollapsed = !prev;
        if (prev) {
          // Mark as having been expanded for lazy loading
          hasBeenExpandedRef.current = true;
        }
        // Call onToggle with isExpanded (opposite of isCollapsed)
        onToggle?.(!newIsCollapsed);
        return newIsCollapsed;
      });
    }
  }, [collapsible, onToggle]);

  const headerClassName = [
    styles.header,
    isHeaderTrigger && styles.headerCollapsible,
    collapsible && isCollapsed && styles.headerCollapsed,
    headerClassNameProp,
  ]
    .filter(Boolean)
    .join(' ');

  const collapseIconClassName = [
    styles.collapseIcon,
    !isCollapsed && styles.collapseIconRotated,
  ]
    .filter(Boolean)
    .join(' ');

  const contentClassName = [
    styles.content,
    isCollapsed && styles.contentCollapsed,
    !isCollapsed && styles.contentAnimated,
    contentClassNameProp,
  ]
    .filter(Boolean)
    .join(' ');

  const cardClassName = [
    styles.card,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={cardClassName}>
      <div
        className={headerClassName}
        onClick={isHeaderTrigger ? handleToggle : undefined}
      >
        <div className={styles.headerLeft}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{title}</h3>
            {description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {actions}
          {collapsible && (
            <span
              className={styles.collapseControl}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                className={styles.collapseIconButton}
                icon={<ChevronDown className={collapseIconClassName} aria-hidden="true" />}
                attention="low"
                appearance="primary"
                size={8}
                onClick={handleToggle}
                aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                aria-expanded={!isCollapsed}
              />
            </span>
          )}
        </div>
      </div>

      <div className={contentClassName}>
        {/* Lazy loading: only render children if section has been expanded at least once */}
        {/* This prevents heavy components from being rendered until needed */}
        {(!collapsible || hasBeenExpandedRef.current) ? children : null}
      </div>
    </section>
  );
};

/**
 * Memoized FoundationCard to prevent unnecessary re-renders
 * Combined with lazy loading of collapsed content for better performance
 */
export const FoundationCard = memo(FoundationCardInner);
FoundationCard.displayName = 'FoundationCard';
