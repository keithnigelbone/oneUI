import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiSignInRequired = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiSignInRequired(
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
            d="M18 14a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1m0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3.6-10.64A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44a2 2 0 0 0 2.239.459c.249-.107.474-.263.661-.46l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5 4.9 4.9 0 0 1 2 .44l1.42-1.5a2 2 0 0 0 .18-2.58"
          />
    </svg>
  );
});

IcWifiSignInRequired.displayName = 'IcWifiSignInRequired';
