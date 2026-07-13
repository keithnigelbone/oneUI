import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTheaterRoom = forwardRef<SVGSVGElement, IconComponentProps>(function IcTheaterRoom(
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
            d="M6 12h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1m14 2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2M5.5 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M14 18h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m4.5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcTheaterRoom.displayName = 'IcTheaterRoom';
