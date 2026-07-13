import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFrontDoor = forwardRef<SVGSVGElement, IconComponentProps>(function IcFrontDoor(
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
            d="M5 7h14a1 1 0 0 0 .76-1.65A10.23 10.23 0 0 0 12 2a10.23 10.23 0 0 0-7.76 3.35A1 1 0 0 0 5 7m5 2H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1m-2 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m11-7h-5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1m-3 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFrontDoor.displayName = 'IcFrontDoor';
