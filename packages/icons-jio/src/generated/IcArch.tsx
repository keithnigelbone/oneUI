import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArch = forwardRef<SVGSVGElement, IconComponentProps>(function IcArch(
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
            d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3A15 15 0 0 0 6 3"
          />
    </svg>
  );
});

IcArch.displayName = 'IcArch';
