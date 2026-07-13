import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCarpenter = forwardRef<SVGSVGElement, IconComponentProps>(function IcCarpenter(
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
            d="M3.29 16.29a1 1 0 0 0 0 1.42l2 2A1 1 0 0 0 6 20h.16a1 1 0 0 0 .73-.54L7.62 18H9a1 1 0 0 0 .89-.55l.73-1.45H12a1 1 0 0 0 .89-.55l.73-1.45H15a1 1 0 0 0 .97-.79l-4.8-4.8zM21 6.59 18.41 4a2 2 0 0 0-2.82 0l-1.3 1.29-.29.3L12.59 7 14 8.41l.79.8 1.8 1.79a2 2 0 0 0 2.82 0L21 9.41a2 2 0 0 0 0-2.82m-2.29 2.12a1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 1 1 1.42-1.42l1 1a1 1 0 0 1 0 1.42"
          />
    </svg>
  );
});

IcCarpenter.displayName = 'IcCarpenter';
