import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRecording = forwardRef<SVGSVGElement, IconComponentProps>(function IcRecording(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-3 11H8a3 3 0 1 1 2.82-2h2.33A3 3 0 1 1 16 15m-8-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcRecording.displayName = 'IcRecording';
