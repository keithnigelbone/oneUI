import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMyLocation = forwardRef<SVGSVGElement, IconComponentProps>(function IcMyLocation(
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
                d='M19.32 2.17L3.14 9.29a1.9 1.9 0 00.62 3.64l6.77.54.54 6.77a1.9 1.9 0 003.64.62l7.12-16.18a1.9 1.9 0 00-2.51-2.51z'
                fill='currentColor'
              />
    </svg>
  );
});

IcMyLocation.displayName = 'IcMyLocation';
