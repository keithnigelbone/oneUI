import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmoking = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmoking(
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
            d="M19 10H6v6h13a3 3 0 0 0 0-6M2 16h2v-6H2zm9-12a1 1 0 0 0-2 0 1 1 0 0 1-1 1H5a3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1h3a3 3 0 0 0 3-3"
          />
    </svg>
  );
});

IcSmoking.displayName = 'IcSmoking';
