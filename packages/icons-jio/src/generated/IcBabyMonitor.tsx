import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBabyMonitor = forwardRef<SVGSVGElement, IconComponentProps>(function IcBabyMonitor(
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
            d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-5a7 7 0 0 0-3 .68V3a1 1 0 0 0-2 0v3a.3.3 0 0 0 0 .09A6.94 6.94 0 0 0 5 11v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a7 7 0 0 0-7-7M9 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6 0h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2m-3-4a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </svg>
  );
});

IcBabyMonitor.displayName = 'IcBabyMonitor';
