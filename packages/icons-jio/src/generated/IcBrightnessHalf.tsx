import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBrightnessHalf = forwardRef<SVGSVGElement, IconComponentProps>(function IcBrightnessHalf(
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
            d="M20 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2M7.05 8.46a1 1 0 1 0 1.41-1.41L7.05 5.64a1 1 0 0 0-1.41 1.41zM12 7a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1m5 1.46 1.41-1.41A1 1 0 1 0 17 5.64l-1.46 1.41A1.015 1.015 0 1 0 17 8.46M7 12a1 1 0 0 0-1-1H4a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1m10 3.54A1.033 1.033 0 0 0 15.54 17L17 18.36A1 1 0 1 0 18.36 17zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0 9a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1m-4.95-1.46L5.64 17a1 1 0 1 0 1.41 1.41L8.46 17a1 1 0 1 0-1.41-1.41z"
          />
    </svg>
  );
});

IcBrightnessHalf.displayName = 'IcBrightnessHalf';
