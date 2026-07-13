import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMovie = forwardRef<SVGSVGElement, IconComponentProps>(function IcMovie(
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
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M5.42 7h1a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2M6.5 17h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m6 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m0-8h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2m6 8h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m0-8h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcMovie.displayName = 'IcMovie';
