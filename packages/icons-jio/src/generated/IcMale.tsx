import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMale = forwardRef<SVGSVGElement, IconComponentProps>(function IcMale(
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
            d="M13 10.09V5.41l2.29 2.3a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-4-4a1 1 0 0 0-1.42 0l-4 4a1.004 1.004 0 1 0 1.42 1.42L11 5.41v4.68a6 6 0 1 0 2 0M12 20a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </svg>
  );
});

IcMale.displayName = 'IcMale';
