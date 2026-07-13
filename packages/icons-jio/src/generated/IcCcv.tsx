import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCcv = forwardRef<SVGSVGElement, IconComponentProps>(function IcCcv(
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
                d='M20 5H4a2 2 0 00-2 2v2h20V7a2 2 0 00-2-2zM2 17a2 2 0 002 2h16a2 2 0 002-2v-6H2v6zm17-4a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2z'
                fill='currentColor'
              />
    </svg>
  );
});

IcCcv.displayName = 'IcCcv';
