import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSecurityVehicle = forwardRef<SVGSVGElement, IconComponentProps>(function IcSecurityVehicle(
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
            d="M9 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2m11.78 4.16L19.4 7.05a3 3 0 0 0-2.84-2h-.06V4a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1H7.41a3 3 0 0 0-2.87 2.12l-1.33 5.05A2 2 0 0 0 2 14v2a2 2 0 0 0 1 1.72V19a1 1 0 1 0 2 0v-1h14v1a1 1 0 0 0 2 0v-1.28A2 2 0 0 0 22 16v-2a2 2 0 0 0-1.22-1.84M6.71 15.71a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 5 14.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zM15 11a2 2 0 0 0-1.72 1h-2.56a2 2 0 0 0-3.44 0h-2l1.18-4.31a1 1 0 0 1 1-.69h9.15a1 1 0 0 1 .93.63L18.67 12h-2A2 2 0 0 0 15 11m3.71 4.71a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.08-.58 1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zM15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcSecurityVehicle.displayName = 'IcSecurityVehicle';
