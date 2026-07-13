import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCinch = forwardRef<SVGSVGElement, IconComponentProps>(function IcCinch(
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
            d="M11 18.86V21a1 1 0 0 0 2 0v-2.14A4 4 0 0 0 16 15H8a4 4 0 0 0 3 3.86m4-10.58V7.5a1.51 1.51 0 0 0-1-1.41V5a1 1 0 0 0-1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0-1 1v1.09A1.51 1.51 0 0 0 9 7.5v.78A2 2 0 0 0 8 10v3h8v-3a2 2 0 0 0-1-1.72"
          />
    </svg>
  );
});

IcCinch.displayName = 'IcCinch';
