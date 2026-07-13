import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScanFace = forwardRef<SVGSVGElement, IconComponentProps>(function IcScanFace(
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
            d="M10.77 14H13a1 1 0 0 0 0-2h-2.23l2.09-3.49a1 1 0 0 0-1.72-1L9.05 11a2 2 0 0 0 1.72 3M7 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2M7 20H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2M7 2H5a3 3 0 0 0-3 3v2a1 1 0 0 0 2 0V5a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2m14 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1M19 2h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3m-4.6 14.2a4.11 4.11 0 0 1-4.8 0 1 1 0 0 0-1.2 1.6 6.45 6.45 0 0 0 3.7 1.2 5.72 5.72 0 0 0 3.5-1.19 1 1 0 1 0-1.2-1.6z"
          />
    </svg>
  );
});

IcScanFace.displayName = 'IcScanFace';
