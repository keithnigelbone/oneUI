import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIncoming = forwardRef<SVGSVGElement, IconComponentProps>(function IcIncoming(
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
            d="M18.29 4.29 6 16.59V9a1 1 0 0 0-2 0v10a1 1 0 0 0 .08.38 1 1 0 0 0 .54.54c.12.051.25.079.38.08h10a1 1 0 0 0 0-2H7.41l12.3-12.29a1.004 1.004 0 0 0-1.42-1.42"
          />
    </svg>
  );
});

IcIncoming.displayName = 'IcIncoming';
