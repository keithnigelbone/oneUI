import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPaste = forwardRef<SVGSVGElement, IconComponentProps>(function IcPaste(
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
            d="M19 2h-8a3 3 0 0 0-3 3v3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1h-3v-3a3 3 0 0 0-3-3h-3V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcPaste.displayName = 'IcPaste';
