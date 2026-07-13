import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoversPackers = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoversPackers(
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
            d="M22 14v-1.53a3.3 3.3 0 0 0-.32-1.34l-1.24-2.47A3 3 0 0 0 17.76 7H16V6a2 2 0 0 0-2-2h-2v5a1 1 0 0 1-.62.92.84.84 0 0 1-.38.08 1 1 0 0 1-.71-.29L9 8.41l-1.29 1.3a1 1 0 0 1-1.09.21A1 1 0 0 1 6 9V4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2zM7 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-6V9h1.76a1 1 0 0 1 .89.55L19.88 12z"
          />
    </svg>
  );
});

IcMoversPackers.displayName = 'IcMoversPackers';
