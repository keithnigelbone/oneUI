import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterPipe = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterPipe(
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
            d="M20 17.28V14a5 5 0 0 0-5-5V8a1 1 0 0 0-1-1h-1V5h1a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2h1v2h-1a1 1 0 0 0-1 1v1H6.72A2 2 0 0 0 5 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2 2 2 0 0 0 1.72-1H14v2.28A2 2 0 0 0 13 19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2 2 2 0 0 0-1-1.72"
          />
    </svg>
  );
});

IcWaterPipe.displayName = 'IcWaterPipe';
