import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCinchCable = forwardRef<SVGSVGElement, IconComponentProps>(function IcCinchCable(
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
            d="M20 20h-1a1 1 0 0 1-1-1v-1a3 3 0 0 0-6 0v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.14A4 4 0 0 0 11 15H3a4 4 0 0 0 3 3.86V19a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1a1 1 0 0 1 2 0v1a3 3 0 0 0 3 3h1a1 1 0 0 0 0-2m-9-10a2 2 0 0 0-1-1.72V7.5a1.51 1.51 0 0 0-1-1.41V5a1 1 0 0 0-1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0-1 1v1.09A1.51 1.51 0 0 0 4 7.5v.78A2 2 0 0 0 3 10v3h8z"
          />
    </svg>
  );
});

IcCinchCable.displayName = 'IcCinchCable';
