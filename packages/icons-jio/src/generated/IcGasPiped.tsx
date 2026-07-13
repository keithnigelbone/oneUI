import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGasPiped = forwardRef<SVGSVGElement, IconComponentProps>(function IcGasPiped(
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
            d="M21 9a1 1 0 0 0-1 1h-3.54A6 6 0 0 0 13 8.09V6h1a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2h1v2.09A6 6 0 0 0 7.54 10H4a1 1 0 0 0-2 0v8a1 1 0 1 0 2 0h3.54a6 6 0 0 0 8.92 0H20a1 1 0 0 0 2 0v-8a1 1 0 0 0-1-1m-9 6.5a1.5 1.5 0 0 1-1.5-1.5v-.08l-1.21-1.21a1.004 1.004 0 0 1 1.42-1.42l1.21 1.22H12a1.5 1.5 0 1 1 0 3z"
          />
    </svg>
  );
});

IcGasPiped.displayName = 'IcGasPiped';
