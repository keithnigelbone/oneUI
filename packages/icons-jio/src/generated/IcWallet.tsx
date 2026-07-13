import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWallet = forwardRef<SVGSVGElement, IconComponentProps>(function IcWallet(
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
            d="M17 12a2 2 0 0 0 2 2h3v-4h-3a2 2 0 0 0-2 2m2-8H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1h-3a4 4 0 1 1 0-8h3V7a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcWallet.displayName = 'IcWallet';
