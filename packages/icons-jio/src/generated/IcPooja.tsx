import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPooja = forwardRef<SVGSVGElement, IconComponentProps>(function IcPooja(
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
            d="M5 15a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2h-1v-4h1a1 1 0 0 0 0-2h-1A6 6 0 1 0 6 9H5a1 1 0 0 0 0 2h1v4zm3-4h8v4H8zm12 8H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcPooja.displayName = 'IcPooja';
