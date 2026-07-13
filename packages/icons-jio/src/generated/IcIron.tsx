import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIron = forwardRef<SVGSVGElement, IconComponentProps>(function IcIron(
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
            d="M16 10H6V9a1 1 0 0 1 1-1h6a2 2 0 0 0 0-4H7a5 5 0 0 0-5 5v6a1 1 0 0 0 1 1h19a6 6 0 0 0-6-6M4 19a1 1 0 0 0 1 1h17v-2H4z"
          />
    </svg>
  );
});

IcIron.displayName = 'IcIron';
