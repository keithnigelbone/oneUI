import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCowDeviceOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcCowDeviceOff(
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
            d="M20.71 4.71a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l3-3A3 3 0 0 0 9 18h6a3 3 0 0 0 3-3V9a3 3 0 0 0-.3-1.29zM12 14a2 2 0 0 1-.51-.07l2.44-2.44q.066.25.07.51a2 2 0 0 1-2 2M9 6a3 3 0 0 0-3 3v4.76L13.76 6zm-5 9V9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm17-6h-1v6h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcCowDeviceOff.displayName = 'IcCowDeviceOff';
