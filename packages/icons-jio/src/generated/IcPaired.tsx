import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPaired = forwardRef<SVGSVGElement, IconComponentProps>(function IcPaired(
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
            d="M20.71 3.29a1 1 0 0 0-1.42 0l-2.46 2.47-.71-.71a3 3 0 0 0-4.24 0l-2 2a1 1 0 0 0 0 1.41l5.66 5.66a1 1 0 0 0 1.41 0l2-2a3 3 0 0 0 0-4.24l-.71-.71 2.47-2.46a1 1 0 0 0 0-1.42M8.46 9.88a1 1 0 0 0-1.41 0l-2 2a3 3 0 0 0 0 4.24l.71.71-2.47 2.46a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2.46-2.47.71.71a3 3 0 0 0 4.24 0l2-2a1 1 0 0 0 0-1.41z"
          />
    </svg>
  );
});

IcPaired.displayName = 'IcPaired';
