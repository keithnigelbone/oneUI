import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOsNavBack = forwardRef<SVGSVGElement, IconComponentProps>(function IcOsNavBack(
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
            d="m14.32 3.37-9.97 7.01a1.973 1.973 0 0 0 0 3.23l9.97 7.01c1.33.94 3.18 0 3.18-1.61V4.99c0-1.61-1.85-2.55-3.18-1.61z"
          />
    </svg>
  );
});

IcOsNavBack.displayName = 'IcOsNavBack';
