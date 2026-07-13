import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFixedDeposit = forwardRef<SVGSVGElement, IconComponentProps>(function IcFixedDeposit(
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
            d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7-5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 2 2.82V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h10v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.18A3 3 0 0 0 22 15V7a3 3 0 0 0-3-3m-1 8h-2.14a4 4 0 1 1 0-2H18a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFixedDeposit.displayName = 'IcFixedDeposit';
