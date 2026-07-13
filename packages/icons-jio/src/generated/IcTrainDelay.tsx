import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrainDelay = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrainDelay(
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
            d="M17 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 0 1 2 0zm-8.19-3.06q-.15.053-.31.06H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3.41a7.1 7.1 0 0 1 2-2.15V10a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.08c.694.098 1.37.304 2 .61V10a6 6 0 0 0-4-5.66V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.34A6 6 0 0 0 4 10v9a3 3 0 0 0 3 3h5.11a7 7 0 0 1-1.8-7.06M7 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTrainDelay.displayName = 'IcTrainDelay';
