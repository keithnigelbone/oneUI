import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHarddrive = forwardRef<SVGSVGElement, IconComponentProps>(function IcHarddrive(
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
            d="M17 2H7a3 3 0 0 0-3 3v10a4.92 4.92 0 0 1 3-1h10a4.92 4.92 0 0 1 3 1V5a3 3 0 0 0-3-3m0 14H7a3 3 0 0 0 0 6h10a3 3 0 0 0 0-6m0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcHarddrive.displayName = 'IcHarddrive';
