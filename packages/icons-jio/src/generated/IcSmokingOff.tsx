import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmokingOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmokingOff(
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
            d="M19 10h-3.56l5-5A1.036 1.036 0 0 0 19 3.51L3.51 19A1.054 1.054 0 1 0 5 20.49L9.44 16H19a3 3 0 0 0 0-6M3 9a1 1 0 0 0 1-1 1 1 0 0 1 1-1h3a3 3 0 0 0 3-3 1 1 0 0 0-2 0 1 1 0 0 1-1 1H5a3 3 0 0 0-3 3 1 1 0 0 0 1 1m3 4.76L9.76 10H6zM4 10H2v6h2z"
          />
    </svg>
  );
});

IcSmokingOff.displayName = 'IcSmokingOff';
