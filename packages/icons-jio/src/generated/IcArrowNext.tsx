import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowNext = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowNext(
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
            d="m21.71 11.29-6-6a1.004 1.004 0 1 0-1.42 1.42l4.3 4.29H3a1 1 0 1 0 0 2h15.59l-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l6-6a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcArrowNext.displayName = 'IcArrowNext';
