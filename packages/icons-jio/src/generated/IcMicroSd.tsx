import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMicroSd = forwardRef<SVGSVGElement, IconComponentProps>(function IcMicroSd(
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
            d="M16 2h-5.76a3 3 0 0 0-2.12.88L5.88 5.12A3 3 0 0 0 5 7.24V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 5a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcMicroSd.displayName = 'IcMicroSd';
