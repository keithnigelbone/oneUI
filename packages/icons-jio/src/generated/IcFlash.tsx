import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFlash = forwardRef<SVGSVGElement, IconComponentProps>(function IcFlash(
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
            d="m5.59 12.18 7.7-9.62A1.48 1.48 0 0 1 15.83 4l-2 5.48h2.67a2 2 0 0 1 1.51 3.24l-7.37 8.75A1.48 1.48 0 0 1 8.16 20l1.77-4.6h-2.8a2 2 0 0 1-1.54-3.22"
          />
    </svg>
  );
});

IcFlash.displayName = 'IcFlash';
