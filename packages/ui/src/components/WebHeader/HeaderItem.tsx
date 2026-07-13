/**
 * HeaderItem.tsx
 * Individual navigation item — matches Figma .Header.Item
 *
 * Attention levels control active visual:
 *   high:   pill bg (24px) + accent text
 *   medium: accent text (indicator is rendered by PrimaryNav as sliding bar)
 *   low:    accent text, dim idle text that darkens on hover
 *
 * The underline indicator is NOT inside the item — it's a single sliding
 * element at the PrimaryNav level that animates between items.
 */

import React from 'react';
import styles from './WebHeader.module.css';
import { HeaderItemProps, useHeaderItemState } from './WebHeader.shared';

export const HeaderItem: React.FC<HeaderItemProps> = (props) => {
  const {
    value,
    active,
    attention = 'low',
    href,
    onClick,
    children,
    start,
    end,
    className,
    itemRef,
  } = props;

  const { dataAttrs, ariaProps } = useHeaderItemState(props);

  const rootClassName = [styles.item, className].filter(Boolean).join(' ');

  const showPill = attention === 'high' && active;

  const content = (
    <span className={`${styles.itemStateLayer} ${showPill ? styles.itemStateLayerPill : ''}`}>
      <span className={styles.itemContentWrapper}>
        {start && (
          <span className={`${styles.itemSlot} ${styles.itemSlotStart}`}>
            {start}
          </span>
        )}
        <span className={styles.itemLabel}>{children}</span>
        {end && (
          <span className={`${styles.itemSlot} ${styles.itemSlotEnd}`}>
            {end}
          </span>
        )}
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        ref={itemRef}
        href={href}
        className={rootClassName}
        onClick={onClick}
        data-value={value}
        {...dataAttrs}
        {...ariaProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={itemRef}
      type="button"
      className={rootClassName}
      onClick={onClick}
      data-value={value}
      {...dataAttrs}
      {...ariaProps}
    >
      {content}
    </button>
  );
};
