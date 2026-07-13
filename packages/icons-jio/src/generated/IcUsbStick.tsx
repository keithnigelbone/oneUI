import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUsbStick = forwardRef<SVGSVGElement, IconComponentProps>(function IcUsbStick(
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
            d="M18 8h-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v5H6a1 1 0 0 0-1 1v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9a1 1 0 0 0-1-1m-7-2.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5zm4 0a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
          />
    </svg>
  );
});

IcUsbStick.displayName = 'IcUsbStick';
