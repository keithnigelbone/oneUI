import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTicketRaise = forwardRef<SVGSVGElement, IconComponentProps>(function IcTicketRaise(
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
            d="M7 16H6v-1a1 1 0 1 0-2 0v1H3a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 0 0 0-2M19 4H5a3 3 0 0 0-3 3v6a5 5 0 0 1 7 7h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-2 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTicketRaise.displayName = 'IcTicketRaise';
