import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcContacts = forwardRef<SVGSVGElement, IconComponentProps>(function IcContacts(
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
            d="M3 6v12a3 3 0 0 0 3 3h1V3H6a3 3 0 0 0-3 3m15-3H9v18h9a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-3 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8h-4a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1"
          />
    </svg>
  );
});

IcContacts.displayName = 'IcContacts';
