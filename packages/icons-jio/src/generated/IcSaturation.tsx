import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSaturation = forwardRef<SVGSVGElement, IconComponentProps>(function IcSaturation(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4 6.69-1.24 3.1A1.91 1.91 0 0 1 13.32 13q-.195.023-.39 0a1.9 1.9 0 0 1-1.36-.57 1.92 1.92 0 0 1 .64-3.15L15.31 8a.5.5 0 0 1 .65.65z"
          />
    </svg>
  );
});

IcSaturation.displayName = 'IcSaturation';
