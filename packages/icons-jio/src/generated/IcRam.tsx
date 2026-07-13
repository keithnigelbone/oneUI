import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRam = forwardRef<SVGSVGElement, IconComponentProps>(function IcRam(
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
            d="M13.5 6h-3a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5M19 9a1 1 0 1 0 0-2h-1V5h1a1 1 0 1 0 0-2h-1.78A3 3 0 0 0 15 2H9a3 3 0 0 0-2.22 1H5a1 1 0 0 0 0 2h1v2H5a1 1 0 0 0 0 2h1v2H5a1 1 0 0 0 0 2h1v2H5a1 1 0 0 0 0 2h1v2H5a1 1 0 0 0 0 2h1.78A3 3 0 0 0 9 22h6a3 3 0 0 0 2.22-1H19a1 1 0 0 0 0-2h-1v-2h1a1 1 0 0 0 0-2h-1v-2h1a1 1 0 0 0 0-2h-1V9zm-3 10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcRam.displayName = 'IcRam';
