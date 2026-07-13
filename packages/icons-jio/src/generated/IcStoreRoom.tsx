import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStoreRoom = forwardRef<SVGSVGElement, IconComponentProps>(function IcStoreRoom(
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
            d="M7 8h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m7 8h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m-7 0h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1M20 3a1 1 0 0 0-1 1v5H5V4a1 1 0 0 0-2 0v16a1 1 0 1 0 2 0v-1h14v1a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m-1 14H5v-6h14z"
          />
    </svg>
  );
});

IcStoreRoom.displayName = 'IcStoreRoom';
