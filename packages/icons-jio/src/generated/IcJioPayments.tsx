import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJioPayments = forwardRef<SVGSVGElement, IconComponentProps>(function IcJioPayments(
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
            d="M16 7h4a2 2 0 0 0-.59-1.41l-3-3A2 2 0 0 0 15 2v4a1 1 0 0 0 1 1m-2.12 1.12A3 3 0 0 1 13 6V2H6.5A2.49 2.49 0 0 0 4 4.5v15A2.49 2.49 0 0 0 6.5 22h11a2.49 2.49 0 0 0 2.5-2.5V9h-4a3 3 0 0 1-2.12-.88M8 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
          />
    </svg>
  );
});

IcJioPayments.displayName = 'IcJioPayments';
