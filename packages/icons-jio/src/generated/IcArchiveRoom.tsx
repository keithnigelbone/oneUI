import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArchiveRoom = forwardRef<SVGSVGElement, IconComponentProps>(function IcArchiveRoom(
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
            d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7H5zm5-4h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2M20 2H4a1 1 0 0 0 0 2h1v7h14V4h1a1 1 0 1 0 0-2m-6 6h-4a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcArchiveRoom.displayName = 'IcArchiveRoom';
