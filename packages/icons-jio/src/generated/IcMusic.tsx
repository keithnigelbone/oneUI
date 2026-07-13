import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMusic = forwardRef<SVGSVGElement, IconComponentProps>(function IcMusic(
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
            d="M20.19 2.4a2 2 0 0 0-1.76-.31l-8 2.4A2 2 0 0 0 9 6.4v8.15A4 4 0 1 0 11 18V6.4L19 4v8.55A4 4 0 1 0 21 16V4a2 2 0 0 0-.81-1.6"
          />
    </svg>
  );
});

IcMusic.displayName = 'IcMusic';
