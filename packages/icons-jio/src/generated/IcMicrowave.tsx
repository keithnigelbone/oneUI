import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMicrowave = forwardRef<SVGSVGElement, IconComponentProps>(function IcMicrowave(
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
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3v1a1 1 0 1 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m-4 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcMicrowave.displayName = 'IcMicrowave';
