import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOtp = forwardRef<SVGSVGElement, IconComponentProps>(function IcOtp(
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
            d="M10 11H8.24l.87-1.5a1 1 0 0 0-1.72-1L6.5 10l-.89-1.5a1 1 0 1 0-1.72 1l.87 1.5H3a1 1 0 1 0 0 2h1.76l-.87 1.5a1 1 0 0 0 .36 1.36.9.9 0 0 0 .5.14 1 1 0 0 0 .86-.5L6.5 14l.89 1.51a1 1 0 0 0 .86.5.9.9 0 0 0 .5-.14 1 1 0 0 0 .36-1.36L8.24 13H10a1 1 0 0 0 0-2m11 0h-1.76l.87-1.5a1 1 0 1 0-1.72-1L17.5 10l-.89-1.5a1 1 0 1 0-1.72 1l.87 1.5H14a1 1 0 1 0 0 2h1.76l-.87 1.5a1 1 0 0 0 .36 1.36.9.9 0 0 0 .5.14 1 1 0 0 0 .86-.5l.89-1.5.89 1.51a1 1 0 0 0 .86.5.9.9 0 0 0 .5-.14 1 1 0 0 0 .36-1.36L19.24 13H21a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcOtp.displayName = 'IcOtp';
