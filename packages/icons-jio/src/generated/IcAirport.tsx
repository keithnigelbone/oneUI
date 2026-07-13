import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAirport = forwardRef<SVGSVGElement, IconComponentProps>(function IcAirport(
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
            d="M20.5 3.5a2 2 0 0 0-2.83 0L14.13 7 4.7 5.81a1.5 1.5 0 0 0-1 2.76L9.18 12l-1.41 1.4-3 .27a1.5 1.5 0 0 0-.6 2.8l2.14 1.21 1.21 2.14a1.5 1.5 0 0 0 2.8-.6l.27-3 1.41-1.4 3.42 5.47a1.5 1.5 0 0 0 2.76-1L17 9.87l3.5-3.54a2 2 0 0 0 0-2.83"
          />
    </svg>
  );
});

IcAirport.displayName = 'IcAirport';
