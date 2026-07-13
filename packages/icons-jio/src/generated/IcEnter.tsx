import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEnter = forwardRef<SVGSVGElement, IconComponentProps>(function IcEnter(
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
            d="M15.5 5H12a1 1 0 0 0 0 2h3.5a3.5 3.5 0 1 1 0 7H6.41l2.3-2.29a1.004 1.004 0 0 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095L6.41 16h9.09a5.5 5.5 0 0 0 0-11"
          />
    </svg>
  );
});

IcEnter.displayName = 'IcEnter';
