import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTruckSide = forwardRef<SVGSVGElement, IconComponentProps>(function IcTruckSide(
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
            d="M2 6v10a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2v-3.53a3.3 3.3 0 0 0-.32-1.34l-1.24-2.47A3 3 0 0 0 17.76 7H16V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2m14 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0m0-8h1.76a1 1 0 0 1 .89.55L19.88 12H16zM6 17a1 1 0 1 1 2 0 1 1 0 0 1-2 0"
          />
    </svg>
  );
});

IcTruckSide.displayName = 'IcTruckSide';
