import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDongleAudio = forwardRef<SVGSVGElement, IconComponentProps>(function IcDongleAudio(
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
            d="M9 2H7a3 3 0 0 0-3 3v2h8V5a3 3 0 0 0-3-3M4 19a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9H4zM19.9 6.57a1.1 1.1 0 0 0-.3-.37 1 1 0 0 0-.43-.2 1 1 0 0 0-.46 0L14 7.44v2.13l4-1.19V13a2 2 0 0 0-1.41 3.42c.27.279.619.467 1 .54a2 2 0 0 0 2.05-.85A2 2 0 0 0 20 15V7a1 1 0 0 0-.1-.43"
          />
    </svg>
  );
});

IcDongleAudio.displayName = 'IcDongleAudio';
