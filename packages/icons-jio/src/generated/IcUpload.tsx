import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUpload = forwardRef<SVGSVGElement, IconComponentProps>(function IcUpload(
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
                d='M16 17.998c.55 0 1 .45 1 1s-.45 1-1 1H8c-.55 0-1-.45-1-1s.45-1 1-1h8zM12.01 16.002c-.55 0-1-.45-1-1v-7.59l-2.29 2.29a.997.997 0 01-1.41 0h-.02a.996.996 0 010-1.41l4-4c.2-.19.45-.29.71-.29.26 0 .51.09.71.29l4 4a.996.996 0 11-1.41 1.41l-2.29-2.29v7.59c0 .55-.45 1-1 1z'
                fill='currentColor'
              />
    </svg>
  );
});

IcUpload.displayName = 'IcUpload';
