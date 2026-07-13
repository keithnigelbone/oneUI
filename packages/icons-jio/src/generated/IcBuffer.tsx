import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBuffer = forwardRef<SVGSVGElement, IconComponentProps>(function IcBuffer(
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
            d="M7.76 14.83 5.64 17a1 1 0 0 0 0 1.41 1 1 0 0 0 .7.3 1 1 0 0 0 .71-.3l2.12-2.12a1 1 0 0 0-1.41-1.41zM8 12a1 1 0 0 0-1-1H4a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1m7.54-2.54a1 1 0 0 0 .7-.29l2.12-2.12A1 1 0 1 0 17 5.64l-2.17 2.12a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.29M7.05 5.64a1 1 0 0 0-1.41 1.41l2.12 2.12a1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41zM20 11h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2m-8 5a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m4.24-1.17a1 1 0 0 0-1.41 1.41L17 18.36a1 1 0 0 0 .71.3 1 1 0 0 0 .7-.3 1 1 0 0 0 0-1.41zM12 3a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcBuffer.displayName = 'IcBuffer';
