import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFilter = forwardRef<SVGSVGElement, IconComponentProps>(function IcFilter(
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
            d="M17 11H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2m-3 6h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m6-12H4a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcFilter.displayName = 'IcFilter';
