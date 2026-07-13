import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileDevices = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileDevices(
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
            d="M16 6h1a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6.56a3.9 3.9 0 0 1-.56-2v-9a4 4 0 0 1 4-4m-6 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m9-11h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2m-1.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcMobileDevices.displayName = 'IcMobileDevices';
