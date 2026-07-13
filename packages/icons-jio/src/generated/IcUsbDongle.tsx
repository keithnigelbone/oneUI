import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUsbDongle = forwardRef<SVGSVGElement, IconComponentProps>(function IcUsbDongle(
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
            d="M8 8h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m5-3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm9 5.5H6a1 1 0 0 0-1 1v4a7 7 0 1 0 14 0v-4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcUsbDongle.displayName = 'IcUsbDongle';
