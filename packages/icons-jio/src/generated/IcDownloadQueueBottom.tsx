import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDownloadQueueBottom = forwardRef<SVGSVGElement, IconComponentProps>(function IcDownloadQueueBottom(
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
            d="M4 7h6a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m0 6h6a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2m16.21-2.71a1 1 0 0 0-1.42 0l-1.29 1.3V6a1 1 0 0 0-2 0v5.59l-1.29-1.3a1.004 1.004 0 0 0-1.42 1.42l3 3a1 1 0 0 0 1.42 0l3-3a1 1 0 0 0 0-1.42M19 17H4a1 1 0 0 0 0 2h15a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcDownloadQueueBottom.displayName = 'IcDownloadQueueBottom';
