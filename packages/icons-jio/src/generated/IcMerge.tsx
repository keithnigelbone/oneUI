import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMerge = forwardRef<SVGSVGElement, IconComponentProps>(function IcMerge(
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
            d="M19 20h-1c-2.76 0-5-2.24-5-5V5.41l2.29 2.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-4-4a.996.996 0 0 0-1.41 0l-4.01 4A.996.996 0 1 0 8.7 7.7l2.29-2.29V15c0 2.76-2.24 5-5 5h-1c-.55 0-1 .45-1 1s.45 1 1 1h1c2.55 0 4.78-1.37 6-3.41a6.99 6.99 0 0 0 6 3.41h1c.55 0 1-.45 1-1s-.45-1-1-1z"
          />
    </svg>
  );
});

IcMerge.displayName = 'IcMerge';
