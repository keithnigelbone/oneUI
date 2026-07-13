import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStatusSuccessful = forwardRef<SVGSVGElement, IconComponentProps>(function IcStatusSuccessful(
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
            d="M4.6 7.88a1 1 0 0 0 .82-.43 8 8 0 0 1 1.74-1.81A1 1 0 1 0 6 4.05a10 10 0 0 0-2.22 2.27A1 1 0 0 0 4 7.71a1 1 0 0 0 .6.17m-.49 5.36A8.4 8.4 0 0 1 4 12a8 8 0 0 1 .11-1.24 1.012 1.012 0 0 0-2-.31 9.3 9.3 0 0 0 0 3.1 1 1 0 0 0 1 .85h.15a1 1 0 0 0 .85-1.16M12 2a10.3 10.3 0 0 0-2 .2 1.02 1.02 0 1 0 .4 2A8 8 0 0 1 12 4a8 8 0 0 1 0 16 8 8 0 0 1-1.61-.16 1.019 1.019 0 1 0-.4 2 10.3 10.3 0 0 0 2 .2A10.02 10.02 0 0 0 12 2M5.42 16.55a1.001 1.001 0 0 0-1.863.354 1 1 0 0 0 .223.776A10 10 0 0 0 6 20a1 1 0 0 0 1.18.012 1 1 0 0 0 .03-1.602 8 8 0 0 1-1.79-1.86m1.37-5.26a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0l6-6a1.004 1.004 0 0 0-1.42-1.42l-5.29 5.3-2.29-2.3a1 1 0 0 0-1.42 0"
          />
    </svg>
  );
});

IcStatusSuccessful.displayName = 'IcStatusSuccessful';
