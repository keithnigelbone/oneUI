import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcConsumptionLow = forwardRef<SVGSVGElement, IconComponentProps>(function IcConsumptionLow(
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
            d="m16.7 11.88-.41.41a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.13.13C11.79 9.25 8.54 7 5.86 2.49a1 1 0 0 0-1.72 1c3.11 5.2 7.05 7.84 12.56 8.39M7 10H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1m12 7h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1m-6-3h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcConsumptionLow.displayName = 'IcConsumptionLow';
