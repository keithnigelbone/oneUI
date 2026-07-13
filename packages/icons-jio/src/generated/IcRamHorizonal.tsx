import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRamHorizonal = forwardRef<SVGSVGElement, IconComponentProps>(function IcRamHorizonal(
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
            d="M17.5 10h-11a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M21 6.78V5a1 1 0 0 0-2 0v1h-2V5a1 1 0 0 0-2 0v1h-2V5a1 1 0 0 0-2 0v1H9V5a1 1 0 0 0-2 0v1H5V5a1 1 0 0 0-2 0v1.78A3 3 0 0 0 2 9v6a3 3 0 0 0 1 2.22V19a1 1 0 1 0 2 0v-1h2v1a1 1 0 1 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1.78A3 3 0 0 0 22 15V9a3 3 0 0 0-1-2.22M20 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcRamHorizonal.displayName = 'IcRamHorizonal';
