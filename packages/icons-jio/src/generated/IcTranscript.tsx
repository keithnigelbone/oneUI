import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTranscript = forwardRef<SVGSVGElement, IconComponentProps>(function IcTranscript(
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
            d="M19 4H5C3.34 4 2 5.34 2 7v9.99c0 1.66 1.34 3 3 3h13.99c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3zM5 11h2c.55 0 1 .45 1 1s-.45 1-1 1H5c-.55 0-1-.45-1-1s.45-1 1-1m8 6H5c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1m6 0h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1m0-4h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1"
          />
    </svg>
  );
});

IcTranscript.displayName = 'IcTranscript';
