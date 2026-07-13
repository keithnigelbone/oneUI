import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRewind = forwardRef<SVGSVGElement, IconComponentProps>(function IcRewind(
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
            d="m6.41 12 6.3-6.29a1 1 0 0 0-.325-1.639 1 1 0 0 0-1.095.219l-7 7a1 1 0 0 0 0 1.42l7 7a1.004 1.004 0 1 0 1.42-1.42zm5 0 6.3-6.29a1 1 0 0 0-.325-1.639 1 1 0 0 0-1.095.219l-7 7a1 1 0 0 0 0 1.42l7 7a1.004 1.004 0 1 0 1.42-1.42z"
          />
    </svg>
  );
});

IcRewind.displayName = 'IcRewind';
