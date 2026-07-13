import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaning56 = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaning56(
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
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 3.56-2.34 6.58-5.56 7.62C16.61 17.79 18 15.07 18 12s-1.39-5.78-3.56-7.62C17.66 5.42 20 8.44 20 12"
          />
    </svg>
  );
});

IcMoonWaning56.displayName = 'IcMoonWaning56';
