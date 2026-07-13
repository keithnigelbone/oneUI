import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStabilization = forwardRef<SVGSVGElement, IconComponentProps>(function IcStabilization(
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
            d="M16.67 4.29a5 5 0 0 1 3 3 1 1 0 0 0 .94.67 1 1 0 0 0 .39-.02 1 1 0 0 0 .6-1.27 6.93 6.93 0 0 0-4.26-4.26 1 1 0 1 0-.66 1.88zM3 7.94a1 1 0 0 0 1.29-.61 5 5 0 0 1 3-3 1 1 0 1 0-.66-1.88 6.93 6.93 0 0 0-4.22 4.22A1 1 0 0 0 3 7.94m4.33 11.77a5 5 0 0 1-3-3A1 1 0 0 0 3 16.06a1 1 0 0 0-.6 1.27 6.93 6.93 0 0 0 4.26 4.26q.16.058.33.06a1 1 0 0 0 .33-1.94zM18 15V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3m-6-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4m9 2.06a1 1 0 0 0-1.28.61 5 5 0 0 1-3 3 1 1 0 0 0 .28 1.98q.17-.002.33-.06a6.93 6.93 0 0 0 4.26-4.26 1 1 0 0 0-.59-1.27"
          />
    </svg>
  );
});

IcStabilization.displayName = 'IcStabilization';
