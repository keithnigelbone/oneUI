import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcError = forwardRef<SVGSVGElement, IconComponentProps>(function IcError(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.71 12.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219L12 13.41l-2.29 2.3a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l2.3-2.29-2.3-2.29a1.004 1.004 0 0 1 1.42-1.42l2.29 2.3 2.29-2.3a1.004 1.004 0 0 1 1.42 1.42L13.41 12z"
          />
    </svg>
  );
});

IcError.displayName = 'IcError';
