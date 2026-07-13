import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDrinks = forwardRef<SVGSVGElement, IconComponentProps>(function IcDrinks(
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
            d="M8 20.33A2 2 0 0 0 10 22h6a2 2 0 0 0 2-1.67L19.36 12H6.64zM21 2h-4a1 1 0 0 0-.95.68L15 6h-5a4 4 0 1 0-4 4h13.69L20 8.33a2 2 0 0 0-1.14-2.15A2 2 0 0 0 18 6h-.95l.67-2H21a1 1 0 1 0 0-2M6.47 6.71A2 2 0 0 0 6 8a2 2 0 1 1 2-2 2 2 0 0 0-1.53.71"
          />
    </svg>
  );
});

IcDrinks.displayName = 'IcDrinks';
