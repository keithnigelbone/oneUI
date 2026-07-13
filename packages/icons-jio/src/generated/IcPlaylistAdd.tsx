import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlaylistAdd = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlaylistAdd(
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
            d="M4 7h6a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m9 3h2.5v2.5a1 1 0 0 0 2 0V10H20a1 1 0 1 0 0-2h-2.5V5.5a1 1 0 0 0-2 0V8H13a1 1 0 1 0 0 2m-9 3h6a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2m16 4H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcPlaylistAdd.displayName = 'IcPlaylistAdd';
