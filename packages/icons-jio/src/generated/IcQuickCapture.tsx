import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcQuickCapture = forwardRef<SVGSVGElement, IconComponentProps>(function IcQuickCapture(
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
            d="m10.88 16.12-2-2a3 3 0 0 1 0-4.24l2-2A3 3 0 0 1 13 7h1V4a2 2 0 0 0-2.26-2l-6 .77A2 2 0 0 0 4 4.78v14.44a2 2 0 0 0 1.74 2l6 .77.26.01a2 2 0 0 0 2-2v-3h-1a3 3 0 0 1-2.12-.88M17 7a1 1 0 0 0 0 2 1 1 0 1 1 0 2h-3.59l.3-.29a1.004 1.004 0 0 0-1.42-1.42l-2 2a1 1 0 0 0-.21.33 1 1 0 0 0 0 .76q.072.186.21.33l2 2a1 1 0 0 0 1.639-.326 1 1 0 0 0-.22-1.094l-.3-.29H17a3 3 0 1 0 0-6"
          />
    </svg>
  );
});

IcQuickCapture.displayName = 'IcQuickCapture';
