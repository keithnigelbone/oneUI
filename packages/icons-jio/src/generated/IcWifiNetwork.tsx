import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiNetwork = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiNetwork(
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
            d="M21.6 8.36A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5c.69.005 1.372.155 2 .44l1.42-1.5a2 2 0 0 0 .18-2.58M20 16h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcWifiNetwork.displayName = 'IcWifiNetwork';
