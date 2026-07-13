import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDualCameraHorizontal = forwardRef<SVGSVGElement, IconComponentProps>(function IcDualCameraHorizontal(
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
            d="M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m8-5H8a6 6 0 1 0 0 12h8a6 6 0 1 0 0-12m-8 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6m8 0a3 3 0 1 1 0-5.999A3 3 0 0 1 16 15m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcDualCameraHorizontal.displayName = 'IcDualCameraHorizontal';
