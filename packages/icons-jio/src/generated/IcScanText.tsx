import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScanText = forwardRef<SVGSVGElement, IconComponentProps>(function IcScanText(
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
            d="M17 7H7a1 1 0 0 0 0 2h10a1 1 0 1 0 0-2m0 4H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2M3 8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1m4 12H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2m6-5H7a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m6-13h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3m2 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcScanText.displayName = 'IcScanText';
