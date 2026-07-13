import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGraphTable = forwardRef<SVGSVGElement, IconComponentProps>(function IcGraphTable(
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
            d="M16 17a1 1 0 0 0 1-1V6a1 1 0 0 0-2 0v10a1 1 0 0 0 1 1m-4 0a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1m-4 0a1 1 0 0 0 1-1v-4a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1m12-6a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1m0 8H5V4a1 1 0 0 0-2 0v16a1 1 0 0 0 1 1h16a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcGraphTable.displayName = 'IcGraphTable';
