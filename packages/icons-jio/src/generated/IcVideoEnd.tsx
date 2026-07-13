import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVideoEnd = forwardRef<SVGSVGElement, IconComponentProps>(function IcVideoEnd(
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
            d="m19.6 7.8-2.6 2V9q.023-.255 0-.51L20.49 5a1.055 1.055 0 0 0-1.148-1.719q-.194.08-.342.229L3.51 19A1.053 1.053 0 1 0 5 20.49L7.44 18H14a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2M5 6a3 3 0 0 0-3 3v6a3 3 0 0 0 .77 2l11-11z"
          />
    </svg>
  );
});

IcVideoEnd.displayName = 'IcVideoEnd';
