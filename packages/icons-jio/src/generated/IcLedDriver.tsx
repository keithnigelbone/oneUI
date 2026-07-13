import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLedDriver = forwardRef<SVGSVGElement, IconComponentProps>(function IcLedDriver(
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
            d="M21 14h-1.02v-4H21c.55 0 1-.45 1-1s-.45-1-1-1h-1.15c-.36-1.15-1.5-2-2.87-2H6.99c-1.36 0-2.5.85-2.87 2H3c-.55 0-1 .45-1 1s.45 1 1 1h.99v1.01H3c-.55 0-1 .45-1 1s.45 1 1 1h.99V14H3c-.55 0-1 .45-1 1s.45 1 1 1h1.12c.36 1.15 1.5 2 2.87 2h9.99c1.36 0 2.5-.85 2.87-2H21c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcLedDriver.displayName = 'IcLedDriver';
