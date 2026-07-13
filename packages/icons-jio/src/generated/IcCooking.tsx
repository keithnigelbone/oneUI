import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCooking = forwardRef<SVGSVGElement, IconComponentProps>(function IcCooking(
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
            d="M17 20H7a1 1 0 1 0 0 2h10a1 1 0 0 0 0-2m0-15h-.4a5 5 0 0 0-9.2 0H7a5 5 0 0 0-1 9.9V17a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2.1A5 5 0 0 0 17 5"
          />
    </svg>
  );
});

IcCooking.displayName = 'IcCooking';
