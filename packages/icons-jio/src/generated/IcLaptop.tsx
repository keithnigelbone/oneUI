import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLaptop = forwardRef<SVGSVGElement, IconComponentProps>(function IcLaptop(
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
            d="M21 18h-2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2m-2.5-2h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5"
          />
    </svg>
  );
});

IcLaptop.displayName = 'IcLaptop';
