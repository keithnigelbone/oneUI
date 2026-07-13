import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDataInOut = forwardRef<SVGSVGElement, IconComponentProps>(function IcDataInOut(
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
            d="M10.29 14.29 8 16.59V6a1 1 0 0 0-2 0v10.59l-2.29-2.3a1.004 1.004 0 1 0-1.42 1.42l4 4a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .219-1.095 1 1 0 0 0-.22-.325 1 1 0 0 0-1.42 0m11.42-6-4-4a1 1 0 0 0-1.42 0l-4 4a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.22L16 7.41V18a1 1 0 1 0 2 0V7.41l2.29 2.3a1.004 1.004 0 0 0 1.42-1.42"
          />
    </svg>
  );
});

IcDataInOut.displayName = 'IcDataInOut';
