import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDualSim = forwardRef<SVGSVGElement, IconComponentProps>(function IcDualSim(
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
            d="M18 6v10a4 4 0 0 1-4 4H8a2 2 0 0 0 2 2h5a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2m-2 10V4a2 2 0 0 0-2-2H9.79a3 3 0 0 0-2.15.91L4.85 5.78A3 3 0 0 0 4 7.87V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M6 10h2v2H6zm4 6H6.5a.5.5 0 0 1-.5-.5V14h4zm0-6h4v2h-4zm3.5 6H12v-2h2v1.5a.5.5 0 0 1-.5.5"
          />
    </svg>
  );
});

IcDualSim.displayName = 'IcDualSim';
