import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPrint = forwardRef<SVGSVGElement, IconComponentProps>(function IcPrint(
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
            d="M20 6h-1V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-3 14H7v-7h10zm0-14H7V4h10zM9 16h6a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2m0 3h6a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2"
          />
    </svg>
  );
});

IcPrint.displayName = 'IcPrint';
