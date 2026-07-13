import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHardDisk = forwardRef<SVGSVGElement, IconComponentProps>(function IcHardDisk(
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
            d="M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 4a4 4 0 1 1-1.34 7.75h.05a1.004 1.004 0 1 0-1.42-1.42L9 12.6A4 4 0 0 1 12 6m6 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcHardDisk.displayName = 'IcHardDisk';
