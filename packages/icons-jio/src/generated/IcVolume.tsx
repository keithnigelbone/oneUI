import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVolume = forwardRef<SVGSVGElement, IconComponentProps>(function IcVolume(
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
            d="M3 16.38a2 2 0 0 0 1.3 1.87l6.7 2.51v-9.08l-8-3.2zm10-4.73v9.11l6.7-2.51a2 2 0 0 0 1.3-1.87V8.09zm6.7-5.9-7-2.62a2 2 0 0 0-1.4 0l-7 2.62a2 2 0 0 0-.93.72L12 9.92l8.38-3.73a2 2 0 0 0-.68-.44"
          />
    </svg>
  );
});

IcVolume.displayName = 'IcVolume';
