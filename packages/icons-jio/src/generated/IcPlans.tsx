import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlans = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlans(
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
            d="M13.77 3H6.23A3.12 3.12 0 0 0 3 6v12a3.12 3.12 0 0 0 3.23 3h7.54A3.12 3.12 0 0 0 17 18V6a3.12 3.12 0 0 0-3.23-3M7 6h2.5a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2m6 12H7a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2m0-5H7a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2m5.66-9c.284.628.427 1.31.42 2v12a4.75 4.75 0 0 1-.42 2A2.71 2.71 0 0 0 21 17.28V6.72A2.71 2.71 0 0 0 18.66 4"
          />
    </svg>
  );
});

IcPlans.displayName = 'IcPlans';
