import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHands = forwardRef<SVGSVGElement, IconComponentProps>(function IcHands(
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
            d="M10 10a1 1 0 0 0-1 1v3a1 1 0 1 1-2 0V9.91a2 2 0 0 1 .34-1.11l3.49-5.25a1 1 0 0 0-1.66-1.1l-3.5 5.24A4 4 0 0 0 5 9.91V17a5 5 0 0 1-.26 1.58l-.25.76A2 2 0 0 0 6.39 22h1.83a2 2 0 0 0 1.94-1.52l.54-2.16c.2-.795.3-1.61.3-2.43V11a1 1 0 0 0-1-1m9.51 9.37-.25-.76A5 5 0 0 1 19 17V9.91a4 4 0 0 0-.67-2.22l-3.5-5.24a1 1 0 1 0-1.66 1.1l3.49 5.25A2 2 0 0 1 17 9.91V14a1 1 0 0 1-2 0v-3a1 1 0 0 0-2 0v4.89c0 .82.1 1.635.3 2.43l.54 2.16A2 2 0 0 0 15.78 22h1.83a2 2 0 0 0 1.9-2.63"
          />
    </svg>
  );
});

IcHands.displayName = 'IcHands';
