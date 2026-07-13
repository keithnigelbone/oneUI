import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCablePlug = forwardRef<SVGSVGElement, IconComponentProps>(function IcCablePlug(
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
            d="M18 6h-2V3a1 1 0 0 0-2 0v3h-4V3a1 1 0 0 0-2 0v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h5v4a1 1 0 0 0 2 0v-4h5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcCablePlug.displayName = 'IcCablePlug';
