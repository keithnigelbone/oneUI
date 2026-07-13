import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDisplayLed = forwardRef<SVGSVGElement, IconComponentProps>(function IcDisplayLed(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 2h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2m3 7a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1M8 8a1 1 0 0 1 2 0v2a1 1 0 1 1-2 0zm1 9a1 1 0 0 1-1-1v-2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1m4 2h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2m3-3a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zm0-6a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcDisplayLed.displayName = 'IcDisplayLed';
