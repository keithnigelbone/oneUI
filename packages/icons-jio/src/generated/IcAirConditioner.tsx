import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAirConditioner = forwardRef<SVGSVGElement, IconComponentProps>(function IcAirConditioner(
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
            d="M12 15a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m-4 0a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 0 0 2 3 3 0 0 0 3-3v-1a1 1 0 0 0-1-1m10 3a1 1 0 0 1-1-1v-1a1 1 0 0 0-2 0v1a3 3 0 0 0 3 3 1 1 0 0 0 0-2m0-14H6a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-1 6H7a1 1 0 0 1 0-2h10a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcAirConditioner.displayName = 'IcAirConditioner';
