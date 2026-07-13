import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDeviceHistory = forwardRef<SVGSVGElement, IconComponentProps>(function IcDeviceHistory(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 14a1 1 0 0 1 0-2 3 3 0 1 0-3-3.34l.29-.27a1 1 0 0 1 1.41 0 1 1 0 0 1-.05 1.41l-2 1.88a.9.9 0 0 1-.2.13l-.11.07A.9.9 0 0 1 8 15a1 1 0 0 1-.38-.08.4.4 0 0 1-.11-.07 1 1 0 0 1-.22-.14l-2-2a1.003 1.003 0 1 1 1.42-1.42l.33.33A5 5 0 1 1 12 17"
          />
    </svg>
  );
});

IcDeviceHistory.displayName = 'IcDeviceHistory';
