import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBookmarkAdd = forwardRef<SVGSVGElement, IconComponentProps>(function IcBookmarkAdd(
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
            d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 3 1.73l5-2.88 5 2.88a2 2 0 0 0 1 .27 2 2 0 0 0 1.732-1.001A2 2 0 0 0 20 20V4a2 2 0 0 0-2-2m-4 9h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V8a1 1 0 0 1 2 0v1h1a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcBookmarkAdd.displayName = 'IcBookmarkAdd';
