import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCropOriginal = forwardRef<SVGSVGElement, IconComponentProps>(function IcCropOriginal(
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
            d="M21 18h-1V6a2 2 0 0 0-2-2H6V3a1 1 0 0 0-2 0v1H3a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m-3-6.91-1.79-1.8a1 1 0 0 0-1.42 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.42 0L6 14.09V6h12zM8.5 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
          />
    </svg>
  );
});

IcCropOriginal.displayName = 'IcCropOriginal';
