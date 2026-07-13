import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTicketStatus = forwardRef<SVGSVGElement, IconComponentProps>(function IcTicketStatus(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-6.29 6.71-4 4a1 1 0 0 1-1.42 0l-2-2a1.004 1.004 0 0 1 1.42-1.42L8 12.59l3.29-3.3a1.004 1.004 0 0 1 1.42 1.42M17 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTicketStatus.displayName = 'IcTicketStatus';
