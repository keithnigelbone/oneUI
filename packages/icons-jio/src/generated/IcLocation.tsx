import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLocation = forwardRef<SVGSVGElement, IconComponentProps>(function IcLocation(
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
                d='M12 2a7.82 7.82 0 00-8 7.6c0 5.08 5.91 11.14 6.59 11.81a2 2 0 002.82 0C14.09 20.74 20 14.68 20 9.6A7.82 7.82 0 0012 2zm0 11a3 3 0 110-6 3 3 0 010 6z'
                fill='currentColor'
              />
    </svg>
  );
});

IcLocation.displayName = 'IcLocation';
