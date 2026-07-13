import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTruckDelivery = forwardRef<SVGSVGElement, IconComponentProps>(function IcTruckDelivery(
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
            d="M22 14v-1.54a3.06 3.06 0 0 0-.32-1.33l-1.24-2.47A3 3 0 0 0 17.76 7H16V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1h6a1 1 0 0 1 0 2H2v2h3a1 1 0 0 1 0 2H2v3a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2zM7 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-6V9h1.76a1 1 0 0 1 .89.55L19.88 12z"
          />
    </svg>
  );
});

IcTruckDelivery.displayName = 'IcTruckDelivery';
