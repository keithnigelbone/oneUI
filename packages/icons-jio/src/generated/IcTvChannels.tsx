import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTvChannels = forwardRef<SVGSVGElement, IconComponentProps>(function IcTvChannels(
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
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m5-14H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-4.92 10.3a1 1 0 0 1-.52.15 1 1 0 0 1-.86-.45 2 2 0 0 0-3.4 0 1.003 1.003 0 1 1-1.71-1.05 4 4 0 0 1 6.82 0 1 1 0 0 1-.33 1.35m3-3a1 1 0 0 1-1.066.131 1 1 0 0 1-.344-.271 6 6 0 0 0-9.3 0 1 1 0 0 1-1.57-1.22 8 8 0 0 1 12.4 0 1 1 0 0 1-.14 1.41z"
          />
    </svg>
  );
});

IcTvChannels.displayName = 'IcTvChannels';
