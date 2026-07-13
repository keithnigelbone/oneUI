import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRestaurant = forwardRef<SVGSVGElement, IconComponentProps>(function IcRestaurant(
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
            d="M11 3a1.06 1.06 0 0 0-1 1.11V11H9V4a1 1 0 1 0-2 0v7H6V4.11A1.06 1.06 0 0 0 5 3a1.06 1.06 0 0 0-1 1.11V12a1 1 0 0 0 1 1h2v7a1 1 0 1 0 2 0v-7h2a1 1 0 0 0 1-1V4.11A1.06 1.06 0 0 0 11 3m4 0a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0v-4h3a1 1 0 0 0 1-1V8a5 5 0 0 0-5-5"
          />
    </svg>
  );
});

IcRestaurant.displayName = 'IcRestaurant';
