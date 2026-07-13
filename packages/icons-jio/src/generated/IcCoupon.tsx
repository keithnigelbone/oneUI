import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCoupon = forwardRef<SVGSVGElement, IconComponentProps>(function IcCoupon(
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
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M9.25 8a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m5.5 8a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m1-6.29-6 6a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l6-6a1.004 1.004 0 0 1 1.42 1.42"
          />
    </svg>
  );
});

IcCoupon.displayName = 'IcCoupon';
