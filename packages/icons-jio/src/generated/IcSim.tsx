import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSim = forwardRef<SVGSVGElement, IconComponentProps>(function IcSim(
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
            d="M16 2h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M7 12h3v3H7zm5 8H8a1 1 0 0 1-1-1v-2h5zm5-1a1 1 0 0 1-1 1h-2v-3h3zm0-4h-5v-3h5z"
          />
    </svg>
  );
});

IcSim.displayName = 'IcSim';
