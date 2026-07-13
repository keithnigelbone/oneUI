import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGayser = forwardRef<SVGSVGElement, IconComponentProps>(function IcGayser(
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
            d="M17 2H7a3 3 0 0 0-3 3v3h4.14a4 4 0 0 1 7.72 0H20V5a3 3 0 0 0-3-3m-5 11a4 4 0 0 1-3.86-3H4v7a3 3 0 0 0 3 3h1v1a1 1 0 1 0 2 0v-1h4v1a1 1 0 0 0 2 0v-1h1a3 3 0 0 0 3-3v-7h-4.14A4 4 0 0 1 12 13m2 4h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m0-8a2 2 0 1 0-4 0 2 2 0 0 0 4 0"
          />
    </svg>
  );
});

IcGayser.displayName = 'IcGayser';
