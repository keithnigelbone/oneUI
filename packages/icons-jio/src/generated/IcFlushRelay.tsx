import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFlushRelay = forwardRef<SVGSVGElement, IconComponentProps>(function IcFlushRelay(
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
            d="m20.41 5.34-1.75-1.75A2 2 0 0 0 17.25 3H6.75a2 2 0 0 0-1.41.59L3.59 5.34A2 2 0 0 0 3 6.75V9h18V6.75a2 2 0 0 0-.59-1.41M8 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M3 14.62A2 2 0 0 0 3.59 16L8 20.41a2 2 0 0 0 1.38.59h5.24a2 2 0 0 0 1.38-.59L20.41 16a2 2 0 0 0 .59-1.38V11H3z"
          />
    </svg>
  );
});

IcFlushRelay.displayName = 'IcFlushRelay';
