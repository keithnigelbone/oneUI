import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBusSide = forwardRef<SVGSVGElement, IconComponentProps>(function IcBusSide(
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
            d="M21.87 11.38 20.47 6a.6.6 0 0 0 0-.12A3 3 0 0 0 17.65 4H5a3 3 0 0 0-3 3v10a1 1 0 0 0 1 1h.18a3 3 0 0 0 5.64 0h6.36a3 3 0 0 0 5.64 0H21a1 1 0 0 0 1-1v-4.62a3.7 3.7 0 0 0-.13-1M6 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-8H4V7a1 1 0 0 1 1-1h3zm6 0h-4V6h4zm4 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-6-2-2V6h1.65a1 1 0 0 1 .9.58l1.39 5.3V12z"
          />
    </svg>
  );
});

IcBusSide.displayName = 'IcBusSide';
