import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDownloadQueue = forwardRef<SVGSVGElement, IconComponentProps>(function IcDownloadQueue(
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
            d="M21.24 8.17A10 10 0 0 0 9.099 2.427a10 10 0 1 0 12.14 5.743M14 19h-4a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2m1.71-7.29-3 3a1 1 0 0 1-.33.21.94.94 0 0 1-.76 0 1 1 0 0 1-.33-.21l-3-3a1.004 1.004 0 0 1 1.42-1.42l1.29 1.3V6a1 1 0 0 1 2 0v5.59l1.29-1.3a1.004 1.004 0 1 1 1.42 1.42"
          />
    </svg>
  );
});

IcDownloadQueue.displayName = 'IcDownloadQueue';
