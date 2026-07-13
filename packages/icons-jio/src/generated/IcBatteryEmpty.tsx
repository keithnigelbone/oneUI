import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBatteryEmpty = forwardRef<SVGSVGElement, IconComponentProps>(function IcBatteryEmpty(
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
            d="M16 22H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3 2 2 0 0 1 2-2h4a2 2 0 0 1 2 2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3M8 6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1V4h-4v1a1 1 0 0 1-1 1z"
          />
    </svg>
  );
});

IcBatteryEmpty.displayName = 'IcBatteryEmpty';
