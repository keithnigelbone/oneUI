import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEmergencyServices = forwardRef<SVGSVGElement, IconComponentProps>(function IcEmergencyServices(
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
            d="M7 18h10v-6a5 5 0 0 0-10 0zm3-6h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2m2-6a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1m5.66 1.76.7-.71A1 1 0 1 0 17 5.64l-.71.7a1.004 1.004 0 1 0 1.42 1.42zm-11.32 0a1.004 1.004 0 0 0 1.42-1.42l-.71-.7a1 1 0 0 0-1.41 1.41zM6 12a1 1 0 0 0-1-1H4a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1m14-1h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-2 8H6a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcEmergencyServices.displayName = 'IcEmergencyServices';
