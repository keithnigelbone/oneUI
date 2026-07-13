import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBathtub = forwardRef<SVGSVGElement, IconComponentProps>(function IcBathtub(
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
            d="M21 10h-3a1 1 0 0 0-1-1V7a3 3 0 0 0-6 0 1 1 0 0 0 2 0 1 1 0 0 1 2 0v2a1 1 0 0 0-1 1H3a1 1 0 0 0 0 2h1v2a4 4 0 0 0 3 3.86V19a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1.14A4 4 0 0 0 20 14v-2h1a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcBathtub.displayName = 'IcBathtub';
