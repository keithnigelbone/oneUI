import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEpisodes = forwardRef<SVGSVGElement, IconComponentProps>(function IcEpisodes(
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
            d="M7 4h10a1 1 0 1 0 0-2H7a1 1 0 0 0 0 2M5 8h14a1 1 0 1 0 0-2H5a1 1 0 0 0 0 2m14 2H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcEpisodes.displayName = 'IcEpisodes';
