import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowDown = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowDown(
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
            d="M18.71 14.29a1 1 0 0 0-1.42 0L13 18.59V3a1 1 0 1 0-2 0v15.59l-4.29-4.3a1.004 1.004 0 1 0-1.42 1.42l6 6a1 1 0 0 0 1.42 0l6-6a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcArrowDown.displayName = 'IcArrowDown';
