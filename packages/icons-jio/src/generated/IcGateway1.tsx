import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGateway1 = forwardRef<SVGSVGElement, IconComponentProps>(function IcGateway1(
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
            d="M8.4 9.22a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.8 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.2 0M5.78 9a8 8 0 0 1 12.44 0 1 1 0 0 0 .78.37 1 1 0 0 0 .78-1.63 10 10 0 0 0-15.56 0A1.003 1.003 0 1 0 5.78 9m15.34 3.9A3 3 0 0 0 19 12H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a3 3 0 0 0-.88-2.12zM9 17H6a1 1 0 1 1 0-2h3a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcGateway1.displayName = 'IcGateway1';
