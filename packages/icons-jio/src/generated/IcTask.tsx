import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTask = forwardRef<SVGSVGElement, IconComponentProps>(function IcTask(
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
            d="M20 8V6a3 3 0 0 0-3-3h-1.28A2 2 0 0 0 14 2h-4a2 2 0 0 0-1.72 1H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m-2 11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.28A2 2 0 0 0 10 6h4a2 2 0 0 0 1.72-1H17a1 1 0 0 1 1 1v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6zm.71-6.79-3 3a1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 1 1 1.42-1.42l.29.3 2.29-2.3a1.004 1.004 0 1 1 1.42 1.42"
          />
    </svg>
  );
});

IcTask.displayName = 'IcTask';
