import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMopedDelivery = forwardRef<SVGSVGElement, IconComponentProps>(function IcMopedDelivery(
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
            d="M3 9h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7v2H5V4H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1m17 5.18v-2.35a3 3 0 0 0-.88-2.12L18 8.59V8h1a1 1 0 0 0 1-1V5a1 1 0 0 0-.9-1A2 2 0 0 0 17 6h-2a1 1 0 1 0 0 2h1v4.5a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V11a1 1 0 0 0-1-1H5a3 3 0 0 0-3 3v3a1 1 0 0 0 1 1h1a3 3 0 0 0 6 0h6a3 3 0 1 0 4-2.82M7 18a1 1 0 0 1-1-1h2a1 1 0 0 1-1 1m12 0a1 1 0 0 1-1-1h1a1 1 0 0 0 .85-.5 1 1 0 0 1 .15.5 1 1 0 0 1-1 1"
          />
    </svg>
  );
});

IcMopedDelivery.displayName = 'IcMopedDelivery';
