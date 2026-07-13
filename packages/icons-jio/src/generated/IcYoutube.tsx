import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcYoutube = forwardRef<SVGSVGElement, IconComponentProps>(function IcYoutube(
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
                d='M21.58 7.19a2.51 2.51 0 00-1.77-1.77C18.26 5 12 5 12 5s-6.26 0-7.81.42a2.51 2.51 0 00-1.77 1.77A25.83 25.83 0 002 12a25.83 25.83 0 00.42 4.81 2.51 2.51 0 001.77 1.77C5.74 19 12 19 12 19s6.26 0 7.81-.42a2.51 2.51 0 001.77-1.77c.29-1.587.43-3.197.42-4.81.01-1.613-.13-3.223-.42-4.81zM10 15V9l5.19 3L10 15z'
                fill='currentColor'
              />
    </svg>
  );
});

IcYoutube.displayName = 'IcYoutube';
