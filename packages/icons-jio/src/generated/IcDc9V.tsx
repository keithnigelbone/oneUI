import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDc9V = forwardRef<SVGSVGElement, IconComponentProps>(function IcDc9V(
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
            d="M16.92 15.43a6 6 0 1 1 0-6.86 1 1 0 0 0 1.64-1.14A8 8 0 0 0 4.07 11H3a1 1 0 0 0 0 2h1.07a8 8 0 0 0 14.49 3.57 1 1 0 0 0-1.64-1.14M21 11h-5.14a4 4 0 1 0 0 2H21a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcDc9V.displayName = 'IcDc9V';
