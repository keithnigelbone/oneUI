import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMeetingRoom = forwardRef<SVGSVGElement, IconComponentProps>(function IcMeetingRoom(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-2 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M7 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m12 8H5a1 1 0 0 1-1-1 3 3 0 0 1 5.5-1.65 3 3 0 0 1 5 0A3 3 0 0 1 20 15a1 1 0 0 1-1 1"
          />
    </svg>
  );
});

IcMeetingRoom.displayName = 'IcMeetingRoom';
