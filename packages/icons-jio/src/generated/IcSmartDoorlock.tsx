import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmartDoorlock = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmartDoorlock(
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
            d="M19 8h-4V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6h4a2 2 0 0 0 0-4M9 12h3.44a4 4 0 1 1 0-4H9a2 2 0 1 0 0 4"
          />
    </svg>
  );
});

IcSmartDoorlock.displayName = 'IcSmartDoorlock';
