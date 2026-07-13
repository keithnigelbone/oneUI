import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFashionWoman = forwardRef<SVGSVGElement, IconComponentProps>(function IcFashionWoman(
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
            d="M7.74 8h8.52a5.32 5.32 0 0 0-.45-6l-1.41.38a1 1 0 0 0-.61.49 2 2 0 0 1-3.58 0 1 1 0 0 0-.61-.49L8.19 2a5.32 5.32 0 0 0-.45 6m8.66 3a3.1 3.1 0 0 1-.4-1H8.05a3.1 3.1 0 0 1-.45 1C6.12 13.09 4 16.28 4 19c0 4 16 4 16 0 0-2.72-2.12-5.91-3.6-8"
          />
    </svg>
  );
});

IcFashionWoman.displayName = 'IcFashionWoman';
