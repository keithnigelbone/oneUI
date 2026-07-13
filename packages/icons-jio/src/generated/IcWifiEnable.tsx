import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiEnable = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiEnable(
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
            d="M21.6 8.36A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l8-8.44a2 2 0 0 0 .15-2.58"
          />
    </svg>
  );
});

IcWifiEnable.displayName = 'IcWifiEnable';
