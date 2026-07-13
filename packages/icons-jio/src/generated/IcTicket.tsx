import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTicket = forwardRef<SVGSVGElement, IconComponentProps>(function IcTicket(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-7 12a1 1 0 0 1-2 0v-5l-.88.7a1 1 0 0 1-1.24-1.57l2.5-2A1 1 0 0 1 12 9zm5 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTicket.displayName = 'IcTicket';
