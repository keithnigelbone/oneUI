import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBarcode = forwardRef<SVGSVGElement, IconComponentProps>(function IcBarcode(
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
            d="M7 20H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2M19 2h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3M8 7a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1M3 8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1m9-1a1 1 0 0 0-1 1v8a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1m9 9a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1m-4 0V8a1 1 0 0 0-2 0v8a1 1 0 0 0 2 0"
          />
    </svg>
  );
});

IcBarcode.displayName = 'IcBarcode';
