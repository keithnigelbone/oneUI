import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSim1 = forwardRef<SVGSVGElement, IconComponentProps>(function IcSim1(
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
            d="M18.12 2.88A3 3 0 0 0 16 2h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M13.5 16a1 1 0 0 1-2 0v-5l-.88.7a1 1 0 0 1-1.24-1.57l2.5-2A1 1 0 0 1 13.5 9z"
          />
    </svg>
  );
});

IcSim1.displayName = 'IcSim1';
