import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcExchange = forwardRef<SVGSVGElement, IconComponentProps>(function IcExchange(
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
            d="M18.71 15.29a1.004 1.004 0 1 0-1.42 1.42l.3.29H7a2 2 0 0 1-2-2 1 1 0 1 0-2 0 4 4 0 0 0 4 4h10.59l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42zM5.29 8.71a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L6.41 7H17a2 2 0 0 1 2 2 1 1 0 0 0 2 0 4 4 0 0 0-4-4H6.41l.3-.29a1.004 1.004 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42z"
          />
    </svg>
  );
});

IcExchange.displayName = 'IcExchange';
