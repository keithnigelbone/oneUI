import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScreenFull = forwardRef<SVGSVGElement, IconComponentProps>(function IcScreenFull(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 7a1 1 0 0 1-2 0v-.59L9.41 16H10a1 1 0 0 1 0 2H7a1 1 0 0 1-.38-.08 1 1 0 0 1-.54-.54A1 1 0 0 1 6 17v-3a1 1 0 1 1 2 0v.59L14.59 8H14a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </svg>
  );
});

IcScreenFull.displayName = 'IcScreenFull';
