import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInternet = forwardRef<SVGSVGElement, IconComponentProps>(function IcInternet(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18c-.84 0-1.95-1.48-2.55-4h5.1c-.55 2.52-1.71 4-2.55 4m-2.89-6a18.2 18.2 0 0 1 0-4h5.78q.11.997.11 2t-.11 2zM4 12a8.2 8.2 0 0 1 .26-2h2.83C7 10.64 7 11.31 7 12s0 1.36.09 2H4.26A8.2 8.2 0 0 1 4 12m8-8c.84 0 1.95 1.48 2.55 4h-5.1c.6-2.52 1.71-4 2.55-4m4.91 6h2.83a7.8 7.8 0 0 1 0 4h-2.83c.06-.64.09-1.31.09-2s0-1.36-.09-2m2-2h-2.3a12.8 12.8 0 0 0-1-3.15A8.1 8.1 0 0 1 18.92 8zM8.44 4.85A12.8 12.8 0 0 0 7.39 8H5.08a8.1 8.1 0 0 1 3.36-3.15M5.08 16h2.31a12.8 12.8 0 0 0 1 3.15A8.1 8.1 0 0 1 5.08 16m10.48 3.15a12.8 12.8 0 0 0 1-3.15h2.31a8.1 8.1 0 0 1-3.31 3.15"
          />
    </svg>
  );
});

IcInternet.displayName = 'IcInternet';
