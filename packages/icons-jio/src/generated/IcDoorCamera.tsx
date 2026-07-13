import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDoorCamera = forwardRef<SVGSVGElement, IconComponentProps>(function IcDoorCamera(
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
            d="M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3H5zm7-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4-16H8a3 3 0 0 0-3 3v9h14V5a3 3 0 0 0-3-3m-4 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
          />
    </svg>
  );
});

IcDoorCamera.displayName = 'IcDoorCamera';
