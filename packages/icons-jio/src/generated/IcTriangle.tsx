import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTriangle = forwardRef<SVGSVGElement, IconComponentProps>(function IcTriangle(
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
            d="m20.73 16.99-7-12C13.37 4.38 12.71 4 12 4s-1.37.38-1.73.99l-7 12c-.36.62-.36 1.38 0 2s1.02 1 1.73 1h14c.72 0 1.38-.38 1.73-1s.35-1.39 0-2"
          />
    </svg>
  );
});

IcTriangle.displayName = 'IcTriangle';
