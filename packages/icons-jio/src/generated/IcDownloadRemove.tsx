import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDownloadRemove = forwardRef<SVGSVGElement, IconComponentProps>(function IcDownloadRemove(
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
            d="M16 19H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1M13.41 10l3.29-3.29a.996.996 0 1 0-1.41-1.41L12 8.59 8.71 5.3A.996.996 0 1 0 7.3 6.71L10.59 10 7.3 13.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l3.29-3.29 3.29 3.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41L13.43 10z"
          />
    </svg>
  );
});

IcDownloadRemove.displayName = 'IcDownloadRemove';
