import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAutoRikshaw = forwardRef<SVGSVGElement, IconComponentProps>(function IcAutoRikshaw(
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
            d="M18 5H6.63a3 3 0 0 0-2.94 2.42l-1.63 9A3 3 0 0 0 2 17a3 3 0 0 0 5.82 1h7.36A3 3 0 0 0 21 17V8a3 3 0 0 0-3-3M9 7h6v4h-3a1 1 0 0 0-1 1v4H9zM6.63 7H7v3H5.25l.4-2.2a1 1 0 0 1 .98-.8M5 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m13 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcAutoRikshaw.displayName = 'IcAutoRikshaw';
