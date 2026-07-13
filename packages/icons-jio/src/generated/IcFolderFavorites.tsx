import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFolderFavorites = forwardRef<SVGSVGElement, IconComponentProps>(function IcFolderFavorites(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-6.24 10.1-.2.18a.82.82 0 0 1-1.12 0l-.2-.18c-1.86-1.71-3-3-3-4.36a2.21 2.21 0 0 1 2.28-2.24 2.3 2.3 0 0 1 1.48.6 2.3 2.3 0 0 1 1.48-.6 2.21 2.21 0 0 1 2.23 2.24c0 1.38-1.09 2.65-2.95 4.36"
          />
    </svg>
  );
});

IcFolderFavorites.displayName = 'IcFolderFavorites';
