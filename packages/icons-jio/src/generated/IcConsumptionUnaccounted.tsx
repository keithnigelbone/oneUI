import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcConsumptionUnaccounted = forwardRef<SVGSVGElement, IconComponentProps>(function IcConsumptionUnaccounted(
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
            d="M7 15H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m2-9H7l1.8-2.4a1 1 0 1 0-1.6-1.2l-3 4a1 1 0 0 0-.09 1A1 1 0 0 0 5 8h2l-1.8 2.4a1 1 0 0 0 1.6 1.2l3-4a1 1 0 0 0 .09-1A1 1 0 0 0 9 6m4 5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcConsumptionUnaccounted.displayName = 'IcConsumptionUnaccounted';
