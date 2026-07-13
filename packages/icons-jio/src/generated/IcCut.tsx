import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCut = forwardRef<SVGSVGElement, IconComponentProps>(function IcCut(
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
            d="M21 3a1 1 0 0 0-1.44 0L3 19.56A1.018 1.018 0 1 0 4.44 21L21 4.44A1 1 0 0 0 21 3M6 3a3 3 0 0 0-3 3v10.76L16.76 3zm12 18a3 3 0 0 0 3-3V7.24L7.24 21z"
          />
    </svg>
  );
});

IcCut.displayName = 'IcCut';
