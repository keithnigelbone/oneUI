import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPayBill = forwardRef<SVGSVGElement, IconComponentProps>(function IcPayBill(
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
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M9.5 6h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1-.93 3.33l1.56.78A1 1 0 0 1 14.5 14a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 10h1a1 1 0 1 0 0-2h-2a1 1 0 0 1 0-2M15 19H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcPayBill.displayName = 'IcPayBill';
