import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShoppingBagFavorite = forwardRef<SVGSVGElement, IconComponentProps>(function IcShoppingBagFavorite(
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
            d="M18 6h-2a4 4 0 1 0-8 0H6a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2m-6-2a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2m.76 13.1-.2.18a.82.82 0 0 1-1.12 0l-.2-.18c-1.86-1.71-3-3-3-4.36a2.21 2.21 0 0 1 2.23-2.24 2.3 2.3 0 0 1 1.48.6 2.3 2.3 0 0 1 1.48-.6 2.21 2.21 0 0 1 2.23 2.24c.05 1.38-1.04 2.65-2.9 4.36"
          />
    </svg>
  );
});

IcShoppingBagFavorite.displayName = 'IcShoppingBagFavorite';
