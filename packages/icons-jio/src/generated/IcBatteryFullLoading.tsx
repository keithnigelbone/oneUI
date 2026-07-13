import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBatteryFullLoading = forwardRef<SVGSVGElement, IconComponentProps>(function IcBatteryFullLoading(
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
            d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-1.2 9.6-3 4a.999.999 0 1 1-1.6-1.2L12 14h-2a1 1 0 0 1-.89-.55 1 1 0 0 1 .09-1l3-4a1 1 0 1 1 1.6 1.2L12 12h2a1 1 0 0 1 .8 1.6"
          />
    </svg>
  );
});

IcBatteryFullLoading.displayName = 'IcBatteryFullLoading';
