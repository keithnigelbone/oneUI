import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcClear = forwardRef<SVGSVGElement, IconComponentProps>(function IcClear(
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
            d="M16 17H4a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2m4-12H8a1 1 0 0 0 0 2h12a1 1 0 1 0 0-2m-2 6H6a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcClear.displayName = 'IcClear';
