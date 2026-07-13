import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKeyboard = forwardRef<SVGSVGElement, IconComponentProps>(function IcKeyboard(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m8 8h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-4a1 1 0 0 1 0-2h3V8a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcKeyboard.displayName = 'IcKeyboard';
