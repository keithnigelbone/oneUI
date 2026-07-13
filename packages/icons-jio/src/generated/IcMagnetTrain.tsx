import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMagnetTrain = forwardRef<SVGSVGElement, IconComponentProps>(function IcMagnetTrain(
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
            d="M8 20H6a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m6-18h-4a6 6 0 0 0-6 6v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a6 6 0 0 0-6-6M7 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm0 10h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcMagnetTrain.displayName = 'IcMagnetTrain';
