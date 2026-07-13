import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcConsumptionHigh = forwardRef<SVGSVGElement, IconComponentProps>(function IcConsumptionHigh(
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
            d="M13 14h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m-6 3H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1m12-7h-2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1m0-8h-3a1 1 0 1 0 0 2h.63C14.22 6.43 10.12 10 5 10a1 1 0 0 0 0 2c5.87 0 10.37-3.9 13-6.54V6a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcConsumptionHigh.displayName = 'IcConsumptionHigh';
