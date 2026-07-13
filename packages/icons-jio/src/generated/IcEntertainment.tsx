import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEntertainment = forwardRef<SVGSVGElement, IconComponentProps>(function IcEntertainment(
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
            d="m12.46 8 2.67-4h-3.59L8.87 8zM9.13 4H7a3 3 0 0 0-3 3v1h2.46zM4 17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7H4zM19.29 5.07a3 3 0 0 0-1.79-1L14.87 8H20V7a3 3 0 0 0-.71-1.93"
          />
    </svg>
  );
});

IcEntertainment.displayName = 'IcEntertainment';
