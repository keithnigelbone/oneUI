import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRecycling = forwardRef<SVGSVGElement, IconComponentProps>(function IcRecycling(
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
            d="M7.23 13.36a1 1 0 0 0 1 .76h.24a1 1 0 0 0 .74-1.2l-.66-2.75a1 1 0 0 0-1.24-.77l-2.75.66A1 1 0 1 0 5 12l.37-.08L2.3 17A2 2 0 0 0 4 20h4a1 1 0 1 0 0-2H4l3.13-5.08zm7.31-4.23L14 9a1.025 1.025 0 1 0-.45 2l2.75.64h.23a1 1 0 0 0 .53-.15 1 1 0 0 0 .44-.62l.64-2.76a1 1 0 1 0-1.95-.45l-.07.3L13.7 4a2 2 0 0 0-3.4 0L8.61 6.69a1 1 0 1 0 1.7 1.05L12 5zM21.7 17l-2.14-3.48a1 1 0 0 0-1.7 1L20 18h-5.59l.3-.29a1.004 1.004 0 1 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.095.219 1 1 0 0 0 .325-.219 1 1 0 0 0 0-1.42l-.3-.29H20a2 2 0 0 0 1.7-3"
          />
    </svg>
  );
});

IcRecycling.displayName = 'IcRecycling';
