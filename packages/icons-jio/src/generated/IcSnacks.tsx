import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSnacks = forwardRef<SVGSVGElement, IconComponentProps>(function IcSnacks(
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
            d="M4 21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2H4zm.38-4h15.24L19 15.76V8.24L19.62 7H4.38L5 8.24v7.52zM19 2H5a1 1 0 0 0-1 1v2h16V3a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcSnacks.displayName = 'IcSnacks';
