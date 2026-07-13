import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMic = forwardRef<SVGSVGElement, IconComponentProps>(function IcMic(
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
            d="M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3m6-5a1 1 0 0 0-1 1v1a5 5 0 1 1-10 0v-1a1 1 0 1 0-2 0v1a7 7 0 1 0 14 0v-1a1 1 0 0 0-1-1m-3 10H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcMic.displayName = 'IcMic';
