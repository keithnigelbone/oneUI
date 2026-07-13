import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBinaryCode = forwardRef<SVGSVGElement, IconComponentProps>(function IcBinaryCode(
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
            d="M7.5 14a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0v-1a1 1 0 0 0-1-1m9 0a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-2.5 4a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5V10h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1h.5V7zm-9 0a.5.5 0 1 1 0-1h1a.5.5 0 0 1 .5.5V10h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H7V7zm3 9a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0zm3.5 2h-2a.5.5 0 0 1 0-1h.5v-3H11a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5V17h.5a.5.5 0 0 1 0 1m1-9a2 2 0 1 1-4 0V8a2 2 0 1 1 4 0zm4.5 7a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0zM12 7a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcBinaryCode.displayName = 'IcBinaryCode';
