import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScreenMinimise = forwardRef<SVGSVGElement, IconComponentProps>(function IcScreenMinimise(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 14a1 1 0 0 1-2 0v-.59l-2.29 2.3a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L7.59 15H7a1 1 0 0 1 0-2h3c.13.002.26.029.38.08a1 1 0 0 1 .54.54c.051.12.078.25.08.38zm7.71-10.29L16.41 9H17a1 1 0 1 1 0 2h-3a1 1 0 0 1-.38-.08 1 1 0 0 1-.54-.54A1 1 0 0 1 13 10V7a1 1 0 0 1 2 0v.59l2.29-2.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </svg>
  );
});

IcScreenMinimise.displayName = 'IcScreenMinimise';
