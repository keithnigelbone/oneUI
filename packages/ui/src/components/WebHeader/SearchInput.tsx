/**
 * SearchInput.tsx
 * Pill-shaped search input for PrimaryNav.
 *
 * Thin wrapper around the design system Input component — uses the
 * shared Input with shape="pill" and attention="high" (filled) so it
 * stays visually and behaviourally consistent with every other input
 * in the system (including the default accent focus treatment).
 *
 * Layout: [search Icon] + [input]
 *
 * The trailing actions (HelloJio, notifications, avatar, …) live in
 * `PrimaryNav`'s `end` slot so they stay together as a cohesive action
 * cluster rather than being split across the input's visual boundary.
 *
 * The outer wrapper carries role="search" (landmark) and the
 * `.searchInput` class that controls responsive visibility/width
 * via the WebHeader's breakpoint selectors.
 */

'use client';

import React, { useCallback } from 'react';
import styles from './WebHeader.module.css';
import type { SearchInputProps } from './WebHeader.shared';
import { Icon } from '../Icon/Icon';
import { Input } from '../Input/Input';

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChange,
  onSubmit,
  showSearchIcon = true,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit(e.currentTarget.value);
      }
    },
    [onSubmit]
  );

  const wrapperClassName = [styles.searchInput, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="search"
      className={wrapperClassName}
      aria-label={ariaLabelledBy ? undefined : ariaLabel ?? 'Site search'}
      aria-labelledby={ariaLabelledBy}
    >
      <Input
        className={styles.searchControl}
        shape="pill"
        attention="high"
        size="s"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        start={showSearchIcon ? <Icon icon="search" size="4" /> : undefined}
      />
    </div>
  );
};
