import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic4GBarNoNetwork = forwardRef<SVGSVGElement, IconComponentProps>(function Ic4GBarNoNetwork(
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
            d="M6 15a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1m4-4a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0v-8a1 1 0 0 0-1-1M7.71 5.29a1 1 0 0 0-1.42 0l-.29.3-.29-.3a1.004 1.004 0 0 0-1.42 1.42l.3.29-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l.29-.3.29.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L7.41 7l.3-.29a1 1 0 0 0 0-1.42M18 3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m-4 4a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

Ic4GBarNoNetwork.displayName = 'Ic4GBarNoNetwork';
