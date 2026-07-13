import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcParking = forwardRef<SVGSVGElement, IconComponentProps>(function IcParking(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 11.5h-3v2a1 1 0 0 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 1 1 0 6"
          />
          <path fill="currentColor" d="M13.5 9.5h-3v2h3a1 1 0 0 0 0-2" />
          <path
            fill="currentColor"
            d="M13.5 9.5h-3v2h3a1 1 0 0 0 0-2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 11.5h-3v2a1 1 0 0 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 1 1 0 6"
          />
    </svg>
  );
});

IcParking.displayName = 'IcParking';
