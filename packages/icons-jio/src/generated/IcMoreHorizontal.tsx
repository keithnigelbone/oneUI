import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoreHorizontal = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoreHorizontal(
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
            d="M5.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcMoreHorizontal.displayName = 'IcMoreHorizontal';
