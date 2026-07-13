import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTimezones = forwardRef<SVGSVGElement, IconComponentProps>(function IcTimezones(
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
            d="M17 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-1.5-5a1 1 0 0 1 2 0v.78l.82.27A1 1 0 0 1 19 8.32 1 1 0 0 1 18 9a1.3 1.3 0 0 1-.32 0l-1.5-.5a1 1 0 0 1-.68-.95zM7 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m1 5.5H6.5a1 1 0 0 1-1-1V6a1 1 0 0 1 2 0v.5H8a1 1 0 0 1 0 2m9 4.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8m1 4.5h-.5v.5a1 1 0 0 1-2 0v-1.5a1 1 0 0 1 1-1H18a1 1 0 0 1 0 2M7 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8m1.5 4.5a1 1 0 0 1-.68.95l-1.5.5q-.157.045-.32.05a1 1 0 0 1-.949-1.446 1 1 0 0 1 .579-.504l.82-.27V16a1 1 0 1 1 2 0z"
          />
    </svg>
  );
});

IcTimezones.displayName = 'IcTimezones';
