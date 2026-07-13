import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAstrology = forwardRef<SVGSVGElement, IconComponentProps>(function IcAstrology(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1.4 9.29a1 1 0 0 1-1.2-1.6A1.5 1.5 0 1 0 13 9.5V17a1 1 0 0 1-2 0V9.5a1.5 1.5 0 1 0-2.4 1.19 1 1 0 1 1-1.2 1.6A3.49 3.49 0 1 1 12 7.06a3.49 3.49 0 1 1 4.6 5.23"
          />
    </svg>
  );
});

IcAstrology.displayName = 'IcAstrology';
