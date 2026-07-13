import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUpiNumber = forwardRef<SVGSVGElement, IconComponentProps>(function IcUpiNumber(
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
            d="M18 3H6C4.34 3 3 4.34 3 6v12c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3m-1.5 12.5c0 .55-.45 1-1 1h-7c-.55 0-1-.45-1-1v-7c0-.55.45-1 1-1s1 .45 1 1v6h5v-6c0-.55.45-1 1-1s1 .45 1 1z"
          />
    </svg>
  );
});

IcUpiNumber.displayName = 'IcUpiNumber';
