import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSpanner = forwardRef<SVGSVGElement, IconComponentProps>(function IcSpanner(
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
            d="m20.12 15.88-5.33-5.33A6 6 0 0 0 15 9a6 6 0 0 0-6-6 6 6 0 0 0-.72.06h-.1a1 1 0 0 0-.82.67 1 1 0 0 0 .24 1l2.64 2.63-2.83 2.88L4.78 7.6a1 1 0 0 0-1-.24 1 1 0 0 0-.67.82v.1A6 6 0 0 0 3 9a6 6 0 0 0 6 6 6 6 0 0 0 1.55-.21l5.33 5.33a3 3 0 0 0 4.24 0 3 3 0 0 0 0-4.24"
          />
    </svg>
  );
});

IcSpanner.displayName = 'IcSpanner';
