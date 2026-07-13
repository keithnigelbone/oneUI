import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEntertainmentPlay = forwardRef<SVGSVGElement, IconComponentProps>(function IcEntertainmentPlay(
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
            d="M9.13 3H6a3 3 0 0 0-3 3v1h3.46zm3.33 4 2.67-4h-3.59L8.87 7zm7.66-3.12A3 3 0 0 0 18 3h-.46l-2.67 4H21V6a3 3 0 0 0-.88-2.12M3 18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9H3zm7-5a1 1 0 0 1 .14-.51 1.06 1.06 0 0 1 .39-.37A1 1 0 0 1 11 12a1 1 0 0 1 .49.16l3 2a.9.9 0 0 1 .32.36 1 1 0 0 1 0 .94.9.9 0 0 1-.32.36l-3 2A1 1 0 0 1 11 18a.9.9 0 0 1-.51-.12 1 1 0 0 1-.37-.36A.9.9 0 0 1 10 17z"
          />
    </svg>
  );
});

IcEntertainmentPlay.displayName = 'IcEntertainmentPlay';
