import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlaylistSuccessful = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlaylistSuccessful(
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
            d="M3.61 6.92q.188.075.39.08h16a1 1 0 0 0 .92-1.39 1 1 0 0 0-.21-.31A1.06 1.06 0 0 0 20 5H4a1.1 1.1 0 0 0-.39.08 1.1 1.1 0 0 0-.31.21 1.1 1.1 0 0 0-.21.31 1 1 0 0 0 0 .78 1 1 0 0 0 .52.54m6.78 10.16A1.1 1.1 0 0 0 10 17H4a1 1 0 0 0-.39 1.92q.188.076.39.08h6q.203-.005.39-.08a1 1 0 0 0 0-1.84m.32-5.79A1 1 0 0 0 10 11H4a1 1 0 0 0-1 1 1.2 1.2 0 0 0 0 .26.5.5 0 0 0 0 .12A1 1 0 0 0 4 13h6a1 1 0 0 0 .92-.62.5.5 0 0 0 0-.12q.055-.125.08-.26a1 1 0 0 0-.29-.71m8.58 1.5-3.79 3.8-1.79-1.8a1.005 1.005 0 0 0-1.42 1.42l2.5 2.5a1 1 0 0 0 1.42 0l4.5-4.5a1.003 1.003 0 0 0-1.094-1.638q-.185.077-.326.218"
          />
    </svg>
  );
});

IcPlaylistSuccessful.displayName = 'IcPlaylistSuccessful';
