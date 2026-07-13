import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScreenReduce = forwardRef<SVGSVGElement, IconComponentProps>(function IcScreenReduce(
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
            d="M18 13h-2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3m0-10H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6a4.92 4.92 0 0 1-1-3v-2a5 5 0 0 1 5-5h2a4.92 4.92 0 0 1 3 1V6a3 3 0 0 0-3-3m-7 7c-.002.13-.029.26-.08.38a1 1 0 0 1-.54.54c-.12.051-.25.078-.38.08H7a1 1 0 0 1 0-2h.59l-2.3-2.29a1.004 1.004 0 0 1 1.42-1.42L9 7.59V7a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcScreenReduce.displayName = 'IcScreenReduce';
