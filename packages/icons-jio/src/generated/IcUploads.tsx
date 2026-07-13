import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUploads = forwardRef<SVGSVGElement, IconComponentProps>(function IcUploads(
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
                d='M2 12a10 10 0 1020 0 10 10 0 00-20 0zm10.71-4.71l3 3a1.002 1.002 0 01-.325 1.639 1 1 0 01-1.095-.219L13 10.41V16a1 1 0 01-2 0v-5.59l-1.29 1.3a1.004 1.004 0 11-1.42-1.42l3-3a1 1 0 01.33-.21 1 1 0 01.76 0 1 1 0 01.33.21z'
                fill='currentColor'
              />
    </svg>
  );
});

IcUploads.displayName = 'IcUploads';
