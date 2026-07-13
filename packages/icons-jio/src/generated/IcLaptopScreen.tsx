import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLaptopScreen = forwardRef<SVGSVGElement, IconComponentProps>(function IcLaptopScreen(
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
            d="M5 17h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2m16 1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcLaptopScreen.displayName = 'IcLaptopScreen';
