import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCloudy = forwardRef<SVGSVGElement, IconComponentProps>(function IcCloudy(
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
            d="M19.9 11.5a5.002 5.002 0 0 0-4.9-6c-1.67 0-3.15.83-4.06 2.1-.31-.06-.62-.1-.94-.1-2.61 0-4.72 2-4.95 4.55A3.49 3.49 0 0 0 2 15.5C2 17.43 3.57 19 5.5 19H18c2.21 0 4-1.79 4-4 0-1.52-.86-2.82-2.1-3.5"
          />
    </svg>
  );
});

IcCloudy.displayName = 'IcCloudy';
