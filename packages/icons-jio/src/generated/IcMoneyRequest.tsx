import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoneyRequest = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoneyRequest(
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
            d="M19 11a5 5 0 0 1-4.9-6H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a5 5 0 0 1-3 1m-8 0a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 11 16a.9.9 0 0 1-.45-.11l-4-2A1 1 0 0 1 7 12h1a1 1 0 1 0 0-2H6a1 1 0 1 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1 .18 1m5.29-4.29 2 2a1.004 1.004 0 0 0 1.42-1.42l-.3-.29H21a1 1 0 1 0 0-2h-1.59l.3-.29a1.001 1.001 0 0 0-1.094-1.636 1 1 0 0 0-.326.216l-2 2a1 1 0 0 0-.21.33.92.92 0 0 0 0 .76 1 1 0 0 0 .21.33"
          />
    </svg>
  );
});

IcMoneyRequest.displayName = 'IcMoneyRequest';
