import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBroadcast = forwardRef<SVGSVGElement, IconComponentProps>(function IcBroadcast(
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
            d="M12 11.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 3a10 10 0 0 0-7.07 17.07 1 1 0 1 0 1.41-1.41 8 8 0 1 1 11.32 0 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0A10 10 0 0 0 12 3m0 4a6 6 0 0 0-6 6 5.93 5.93 0 0 0 1.76 4.24 1 1 0 1 0 1.41-1.41 4 4 0 1 1 5.66 0 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0A5.93 5.93 0 0 0 18 13a6 6 0 0 0-6-6"
          />
    </svg>
  );
});

IcBroadcast.displayName = 'IcBroadcast';
