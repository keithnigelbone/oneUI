import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVoucher4G = forwardRef<SVGSVGElement, IconComponentProps>(function IcVoucher4G(
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
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M6 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5-1a1 1 0 0 1-2 0v-2a1 1 0 1 1 2 0zm4 0a1 1 0 0 1-2 0v-4a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcVoucher4G.displayName = 'IcVoucher4G';
