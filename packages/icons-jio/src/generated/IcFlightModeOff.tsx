import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFlightModeOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcFlightModeOff(
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
            d="m3.71 8.57 4.56 2.92 4.61-4.61L4.7 5.81a1.5 1.5 0 0 0-.99 2.76m0 7.47 2.5-2.5-1.43.13A1.5 1.5 0 0 0 3.71 16zM20.5 3.5l-.13-.1.12.11a1 1 0 0 0-1.45 0L3.51 19A1.053 1.053 0 1 0 5 20.49l1.84-1.89.69 1.22a1.5 1.5 0 0 0 2.8-.6l.27-3 1.4-1.4 3.42 5.47a1.5 1.5 0 0 0 2.76-1L17 9.87l3.5-3.54a2 2 0 0 0 0-2.83"
          />
    </svg>
  );
});

IcFlightModeOff.displayName = 'IcFlightModeOff';
