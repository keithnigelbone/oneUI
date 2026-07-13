import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBatteryEmptyLoading = forwardRef<SVGSVGElement, IconComponentProps>(function IcBatteryEmptyLoading(
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
            d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m1 15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V4h4v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1zm-3-7h-2l1.8-2.4a1 1 0 0 0-1.6-1.2l-3 4a1 1 0 0 0-.09 1 1 1 0 0 0 .89.6h2l-1.8 2.4a1 1 0 0 0 1.6 1.2l3-4A1 1 0 0 0 14 12"
          />
    </svg>
  );
});

IcBatteryEmptyLoading.displayName = 'IcBatteryEmptyLoading';
