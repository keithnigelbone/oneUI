import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFlag = forwardRef<SVGSVGElement, IconComponentProps>(function IcFlag(
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
            d="m18.48 10 2.11-2.79A2 2 0 0 0 19 4H5V3a1 1 0 0 0-2 0v18a1 1 0 1 0 2 0v-5h14a2 2 0 0 0 1.59-3.21z"
          />
    </svg>
  );
});

IcFlag.displayName = 'IcFlag';
