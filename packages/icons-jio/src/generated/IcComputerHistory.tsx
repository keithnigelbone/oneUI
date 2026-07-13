import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcComputerHistory = forwardRef<SVGSVGElement, IconComponentProps>(function IcComputerHistory(
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
            d="M10 17a7 7 0 0 1 .68-3H5V6.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v3.79c.715.226 1.39.564 2 1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5.08a6.6 6.6 0 0 1-.08-1m7-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 0 1 2 0zM9 20a1 1 0 0 0 0 2h3.11a7 7 0 0 1-1.43-2z"
          />
    </svg>
  );
});

IcComputerHistory.displayName = 'IcComputerHistory';
