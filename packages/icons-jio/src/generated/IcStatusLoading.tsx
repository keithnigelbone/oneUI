import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStatusLoading = forwardRef<SVGSVGElement, IconComponentProps>(function IcStatusLoading(
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
            d="M4.11 13.24A8 8 0 0 1 4 12a8 8 0 0 1 .11-1.24 1.012 1.012 0 0 0-2-.31 9.3 9.3 0 0 0 0 3.1 1 1 0 0 0 1 .85h.15a1 1 0 0 0 .85-1.16m1.31 3.31a1.001 1.001 0 0 0-1.863.354 1 1 0 0 0 .223.776A10 10 0 0 0 6 20a1 1 0 0 0 1.18.012 1 1 0 0 0 .03-1.602 8 8 0 0 1-1.79-1.86M12 2a10.3 10.3 0 0 0-2 .2 1.02 1.02 0 1 0 .4 2A8 8 0 0 1 12 4a8 8 0 0 1 0 16 8 8 0 0 1-1.61-.16 1.019 1.019 0 1 0-.4 2 10.3 10.3 0 0 0 2 .2A10.02 10.02 0 0 0 12 2M6 4.05a10 10 0 0 0-2.22 2.27A1 1 0 0 0 4 7.71a1 1 0 0 0 1.39-.26 8 8 0 0 1 1.77-1.81A1 1 0 1 0 6 4.05"
          />
    </svg>
  );
});

IcStatusLoading.displayName = 'IcStatusLoading';
