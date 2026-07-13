import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic4GBarThree = forwardRef<SVGSVGElement, IconComponentProps>(function Ic4GBarThree(
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
            d="M6 15a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1m4-4a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0v-8a1 1 0 0 0-1-1m4-4a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1m4 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

Ic4GBarThree.displayName = 'Ic4GBarThree';
