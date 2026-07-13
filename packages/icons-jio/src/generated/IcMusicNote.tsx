import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMusicNote = forwardRef<SVGSVGElement, IconComponentProps>(function IcMusicNote(
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
            d="M18.56 3.17a1 1 0 0 0-.93-.1l-10 4A1 1 0 0 0 7 8v7.18A3.001 3.001 0 1 0 9 18V8.68l8-3.2v6.7A3.001 3.001 0 1 0 19 15V4a1 1 0 0 0-.44-.83"
          />
    </svg>
  );
});

IcMusicNote.displayName = 'IcMusicNote';
