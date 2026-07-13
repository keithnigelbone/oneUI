import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileHorizontal = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileHorizontal(
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
            d="M2 9v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3m18 3a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0"
          />
    </svg>
  );
});

IcMobileHorizontal.displayName = 'IcMobileHorizontal';
