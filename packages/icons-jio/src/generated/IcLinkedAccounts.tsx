import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLinkedAccounts = forwardRef<SVGSVGElement, IconComponentProps>(function IcLinkedAccounts(
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
            d="M12 8H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-4.06 3.44a1.5 1.5 0 0 1 2.45.49c.111.273.139.572.08.86A1.49 1.49 0 0 1 9.29 14a1.5 1.5 0 0 1-.86-.08 1.5 1.5 0 0 1-.49-2.45zm3.77 7.27A1 1 0 0 1 11 19H7a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-.29.71M18 2h-6a3 3 0 0 0-3 3v1h3a5 5 0 0 1 5 5v5h1a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcLinkedAccounts.displayName = 'IcLinkedAccounts';
