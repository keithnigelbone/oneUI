import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDongleVideo = forwardRef<SVGSVGElement, IconComponentProps>(function IcDongleVideo(
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
            d="M4 19a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9H4zM9 2H7a3 3 0 0 0-3 3v2h8V5a3 3 0 0 0-3-3m10.6 9.2-4-3a1 1 0 0 0-1-.09A1 1 0 0 0 14 9v6a1 1 0 0 0 .55.89 1 1 0 0 0 1-.09l4-3a1 1 0 0 0 0-1.6z"
          />
    </svg>
  );
});

IcDongleVideo.displayName = 'IcDongleVideo';
