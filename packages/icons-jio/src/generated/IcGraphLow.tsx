import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGraphLow = forwardRef<SVGSVGElement, IconComponentProps>(function IcGraphLow(
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
            d="M7 15H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1M6 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
          />
    </svg>
  );
});

IcGraphLow.displayName = 'IcGraphLow';
