import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHospitalBed = forwardRef<SVGSVGElement, IconComponentProps>(function IcHospitalBed(
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
            d="M10 8h9a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-5a3 3 0 0 0-3 3 1 1 0 0 0 1 1M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M18 9H6a3 3 0 0 0-3 3 1 1 0 0 0 1 1h.5v5.39a1.5 1.5 0 1 0 2 0V17h11v1.39a1.5 1.5 0 1 0 2 0V13h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3m-.5 6h-11v-2h11z"
          />
    </svg>
  );
});

IcHospitalBed.displayName = 'IcHospitalBed';
