import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNowPlaying = forwardRef<SVGSVGElement, IconComponentProps>(function IcNowPlaying(
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
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m5-14H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-5.45 7.33-3 2A1 1 0 0 1 10 13.5v-4a1 1 0 0 1 .53-.88 1 1 0 0 1 1 .05l3 2a1 1 0 0 1 0 1.66z"
          />
    </svg>
  );
});

IcNowPlaying.displayName = 'IcNowPlaying';
