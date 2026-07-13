import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCowDevice = forwardRef<SVGSVGElement, IconComponentProps>(function IcCowDevice(
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
            d="M2 10v4a1 1 0 0 0 1 1h1V9H3a1 1 0 0 0-1 1m13-4H9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-3 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m9-5h-1v6h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcCowDevice.displayName = 'IcCowDevice';
