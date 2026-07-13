import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShoppingBags = forwardRef<SVGSVGElement, IconComponentProps>(function IcShoppingBags(
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
            d="M17 6h-1a4 4 0 1 0-8 0H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h1.56A3.9 3.9 0 0 1 8 20v-5a4 4 0 0 1 2.28-3.6 5 5 0 0 1 9.44 0c.09.05.19.09.28.15V9a3 3 0 0 0-3-3m-7 0a2 2 0 1 1 4 0zm8 7a3 3 0 0 0-6 0 2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m-4 0a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcShoppingBags.displayName = 'IcShoppingBags';
