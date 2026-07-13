import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShoppingBag = forwardRef<SVGSVGElement, IconComponentProps>(function IcShoppingBag(
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
            d="M18 6h-2a4 4 0 1 0-8 0H6a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2m-8 0a2 2 0 1 1 4 0z"
          />
    </svg>
  );
});

IcShoppingBag.displayName = 'IcShoppingBag';
