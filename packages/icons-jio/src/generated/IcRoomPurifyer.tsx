import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRoomPurifyer = forwardRef<SVGSVGElement, IconComponentProps>(function IcRoomPurifyer(
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
            d="M16 2H8a3 3 0 0 0-3 3v3h14V5a3 3 0 0 0-3-3m-4 4H8a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M5 18a2 2 0 0 0 2 2v1a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1a2 2 0 0 0 2-2v-8H5z"
          />
    </svg>
  );
});

IcRoomPurifyer.displayName = 'IcRoomPurifyer';
