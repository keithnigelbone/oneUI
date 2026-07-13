import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCrime = forwardRef<SVGSVGElement, IconComponentProps>(function IcCrime(
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
            d="M19.48 13.89v-.05l-.5-3A1 1 0 0 0 18 10V9A6 6 0 1 0 6 9v1a1 1 0 0 0-1 .84l-.5 3v.05a4 4 0 1 0 5 0v-.05l-.5-3A1 1 0 0 0 8 10V9a4 4 0 0 1 8 0v1a1 1 0 0 0-1 .84l-.5 3v.05a4 4 0 1 0 5 0zM9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
          />
    </svg>
  );
});

IcCrime.displayName = 'IcCrime';
