import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSave = forwardRef<SVGSVGElement, IconComponentProps>(function IcSave(
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
            d="M14 11a1 1 0 0 0 1-1V8a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1m6.12-3.88-3.24-3.24A3 3 0 0 0 14.76 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9.24a3 3 0 0 0-.88-2.12M16 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6h8z"
          />
    </svg>
  );
});

IcSave.displayName = 'IcSave';
