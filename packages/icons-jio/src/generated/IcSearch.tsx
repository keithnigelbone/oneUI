import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSearch = forwardRef<SVGSVGElement, IconComponentProps>(function IcSearch(
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
            d="M10.004 2a7 7 0 0 1 5.6 11.19l6.11 6.1a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-6.1-6.11A7 7 0 1 1 10.004 2m0 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10"
          />
    </svg>
  );
});

IcSearch.displayName = 'IcSearch';
