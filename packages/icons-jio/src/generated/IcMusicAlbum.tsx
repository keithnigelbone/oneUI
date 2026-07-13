import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMusicAlbum = forwardRef<SVGSVGElement, IconComponentProps>(function IcMusicAlbum(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1 12a2 2 0 1 1-2-2V8.34l-5 1.48V16a2 2 0 1 1-2-2V9.08a1 1 0 0 1 .71-1l7-2.08a1 1 0 0 1 1.194.53A1 1 0 0 1 17 7z"
          />
    </svg>
  );
});

IcMusicAlbum.displayName = 'IcMusicAlbum';
