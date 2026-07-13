import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCreatePlaylist = forwardRef<SVGSVGElement, IconComponentProps>(function IcCreatePlaylist(
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
            d="M10 17H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2M4 7h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 7h-2.5v-2.5a1 1 0 0 0-2 0V14H13a1 1 0 0 0 0 2h2.5v2.5a1 1 0 0 0 2 0V16H20a1 1 0 0 0 0-2m-10-3H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCreatePlaylist.displayName = 'IcCreatePlaylist';
