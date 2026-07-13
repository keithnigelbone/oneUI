import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlaylist = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlaylist(
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
            d="M4 7h9a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m0 6h9a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16.58-7.81a1 1 0 0 0-.9-.14l-3 1A1 1 0 0 0 16 7v8.05a2.5 2.5 0 1 0 2 2.45V8.72L20.32 8A1 1 0 0 0 21 7V6a1 1 0 0 0-.42-.81M10 17H4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcPlaylist.displayName = 'IcPlaylist';
