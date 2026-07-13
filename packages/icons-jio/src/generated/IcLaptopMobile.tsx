import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLaptopMobile = forwardRef<SVGSVGElement, IconComponentProps>(function IcLaptopMobile(
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
            d="M19 3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8v-7a4 4 0 0 1 4-4h3a3.9 3.9 0 0 1 2 .56V6a3 3 0 0 0-3-3M3 19a1 1 0 0 0 0 2h10.56a3.9 3.9 0 0 1-.56-2zM20 8h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2m-1.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcLaptopMobile.displayName = 'IcLaptopMobile';
