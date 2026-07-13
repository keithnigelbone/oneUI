import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStroller = forwardRef<SVGSVGElement, IconComponentProps>(function IcStroller(
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
            d="M4 8h8V4a1 1 0 0 0-1-1h-1a7 7 0 0 0-6.45 4.29A.5.5 0 0 0 4 8m3.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M20 6h-2a1 1 0 0 0-1 .76L16.22 10H4a1 1 0 0 0-1 1v1a5 5 0 0 0 5 5h5a5 5 0 0 0 5-5v-.88L18.78 8H20a1 1 0 1 0 0-2m-6.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcStroller.displayName = 'IcStroller';
