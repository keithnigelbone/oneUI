import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGrocery = forwardRef<SVGSVGElement, IconComponentProps>(function IcGrocery(
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
            d="M18.71 11.71a1 1 0 0 1-1.42 0L16 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L12 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L8 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L4 10.41V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9.59zm-2-3.42L18 9.59l1-1V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5.59l.29-.3a1 1 0 0 1 1.42 0m-9.42 0a1 1 0 0 1 1.42 0L10 9.59l1.29-1.3a1 1 0 0 1 1.42 0l.29.3V6a4 4 0 1 0-8 0v2.59l1 1z"
          />
    </svg>
  );
});

IcGrocery.displayName = 'IcGrocery';
