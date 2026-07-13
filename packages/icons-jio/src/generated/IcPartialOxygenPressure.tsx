import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPartialOxygenPressure = forwardRef<SVGSVGElement, IconComponentProps>(function IcPartialOxygenPressure(
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
            d="M14 7c-2.21 0-4 2.02-4 4.5s1.79 4.5 4 4.5 4-2.02 4-4.5S16.21 7 14 7m0 7c-1.1 0-2-1.12-2-2.5S12.9 9 14 9s2 1.12 2 2.5-.9 2.5-2 2.5m7.5 1h-1.45l1.38-1.63c.41-.49.46-1.18.11-1.71-.24-.37-.62-.61-1.06-.65s-.86.1-1.17.41l-.17.17c-.19.2-.19.51 0 .71.2.19.51.19.71 0l.17-.17c.1-.09.23-.13.36-.13.08 0 .22.05.32.2.1.16.09.38-.03.52l-2.08 2.45c-.13.15-.15.36-.07.53s.26.29.45.29h2.53c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zM6 7H4c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-2h1c1.65 0 3-1.35 3-3S7.65 7 6 7m0 4H5V9h1c.55 0 1 .45 1 1s-.45 1-1 1"
          />
    </svg>
  );
});

IcPartialOxygenPressure.displayName = 'IcPartialOxygenPressure';
