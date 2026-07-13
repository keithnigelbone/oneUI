import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcQuickPayment = forwardRef<SVGSVGElement, IconComponentProps>(function IcQuickPayment(
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
            d="M10 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2H10zm9-6h-8a1 1 0 0 0-1 1v1h10V8a1 1 0 0 0-1-1M8 13V8a3 3 0 0 1 3-3h4.82A3 3 0 0 0 13 3H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3h-5a3 3 0 0 1-3-3m2 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcQuickPayment.displayName = 'IcQuickPayment';
