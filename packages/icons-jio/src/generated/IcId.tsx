import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcId = forwardRef<SVGSVGElement, IconComponentProps>(function IcId(
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
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M8 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8H6a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1m8-3h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcId.displayName = 'IcId';
