import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSimPostPaid = forwardRef<SVGSVGElement, IconComponentProps>(function IcSimPostPaid(
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
            d="M8 20a1 1 0 0 1-1-1v-2h3a7 7 0 0 1 9-6.71V5a3 3 0 0 0-3-3h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h4.11a7 7 0 0 1-1.43-2zm-1-8h3v3H7zm10 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 1 1 2 0z"
          />
    </svg>
  );
});

IcSimPostPaid.displayName = 'IcSimPostPaid';
