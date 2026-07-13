import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJioFiDongle = forwardRef<SVGSVGElement, IconComponentProps>(function IcJioFiDongle(
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
            d="M13 2h-2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4m1 7a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcJioFiDongle.displayName = 'IcJioFiDongle';
