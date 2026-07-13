import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVerticalSwing = forwardRef<SVGSVGElement, IconComponentProps>(function IcVerticalSwing(
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
            d="M10.29 15.29 8 17.59V17a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2h-.59l2.3-2.29a1.004 1.004 0 1 0-1.42-1.42M8 19v-.07zM20 6a6 6 0 1 0 0 12 1 1 0 0 0 1-1V7a1 1 0 0 0-1-1m-9 5H6.41l.3-.29a1.004 1.004 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095l-.3-.29H11a1 1 0 1 0 0-2M9.41 5H10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-.59l2.29 2.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
          />
    </svg>
  );
});

IcVerticalSwing.displayName = 'IcVerticalSwing';
